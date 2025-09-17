import { useState, useCallback, useMemo } from 'react';
import { UserFormData } from '../services/userService';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface UseUserFormValidationProps {
  isEditing: boolean;
  existingEmails?: string[];
}

interface UseUserFormValidationReturn {
  errors: ValidationError[];
  validateField: (field: keyof UserFormData, value: any, formData?: Partial<UserFormData>) => ValidationError[];
  validateForm: (formData: UserFormData) => ValidationError[];
  clearErrors: () => void;
  clearFieldErrors: (field: keyof UserFormData) => void;
  hasErrors: boolean;
  hasFieldError: (field: keyof UserFormData) => boolean;
  getFieldErrors: (field: keyof UserFormData) => ValidationError[];
}

export const useUserFormValidation = ({ 
  isEditing, 
  existingEmails = [] 
}: UseUserFormValidationProps): UseUserFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateEmail = useCallback((email: string): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    
    if (!email.trim()) {
      fieldErrors.push({
        field: 'email',
        message: 'El email es requerido',
        severity: 'error'
      });
      return fieldErrors;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fieldErrors.push({
        field: 'email',
        message: 'El formato del email no es válido',
        severity: 'error'
      });
    }

    // Validación de longitud
    if (email.length > 255) {
      fieldErrors.push({
        field: 'email',
        message: 'El email no puede exceder 255 caracteres',
        severity: 'error'
      });
    }

    // Verificar si el email ya existe (solo para usuarios nuevos)
    if (!isEditing && existingEmails.includes(email.toLowerCase())) {
      fieldErrors.push({
        field: 'email',
        message: 'Este email ya está registrado en el sistema',
        severity: 'error'
      });
    }

    // Sugerencias adicionales
    const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1];
    if (domain && !commonDomains.includes(domain) && domain.includes('.')) {
      const typos = [
        { wrong: 'gmial.com', correct: 'gmail.com' },
        { wrong: 'gmai.com', correct: 'gmail.com' },
        { wrong: 'hotmial.com', correct: 'hotmail.com' },
        { wrong: 'yahooo.com', correct: 'yahoo.com' }
      ];
      
      const typo = typos.find(t => t.wrong === domain);
      if (typo) {
        fieldErrors.push({
          field: 'email',
          message: `¿Quisiste decir "${email.replace(typo.wrong, typo.correct)}"?`,
          severity: 'warning'
        });
      }
    }

    return fieldErrors;
  }, [isEditing, existingEmails]);

  const validatePassword = useCallback((password: string): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    
    // Para usuarios existentes, la contraseña es opcional
    if (isEditing && !password) {
      fieldErrors.push({
        field: 'password',
        message: 'Si dejas este campo vacío, se mantendrá la contraseña actual',
        severity: 'info'
      });
      return fieldErrors;
    }

    // Para usuarios nuevos, la contraseña es obligatoria
    if (!isEditing && !password) {
      fieldErrors.push({
        field: 'password',
        message: 'La contraseña es requerida para usuarios nuevos',
        severity: 'error'
      });
      return fieldErrors;
    }

    // Validaciones de fortaleza solo si hay contraseña
    if (password) {
      if (password.length < 8) {
        fieldErrors.push({
          field: 'password',
          message: 'La contraseña debe tener al menos 8 caracteres',
          severity: 'error'
        });
      }

      if (password.length > 128) {
        fieldErrors.push({
          field: 'password',
          message: 'La contraseña no puede exceder 128 caracteres',
          severity: 'error'
        });
      }

      const validationChecks = [
        { regex: /[A-Z]/, message: 'Incluye al menos una letra mayúscula' },
        { regex: /[a-z]/, message: 'Incluye al menos una letra minúscula' },
        { regex: /\d/, message: 'Incluye al menos un número' },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'Incluye al menos un carácter especial' }
      ];

      const failedChecks = validationChecks.filter(check => !check.regex.test(password));
      
      if (failedChecks.length > 2) {
        fieldErrors.push({
          field: 'password',
          message: 'La contraseña es muy débil. ' + failedChecks.map(c => c.message.toLowerCase()).join(', '),
          severity: 'error'
        });
      } else if (failedChecks.length > 0) {
        fieldErrors.push({
          field: 'password',
          message: 'Para mayor seguridad: ' + failedChecks.map(c => c.message.toLowerCase()).join(', '),
          severity: 'warning'
        });
      }

      // Verificar contraseñas comunes
      const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
      ];
      
      if (commonPasswords.includes(password.toLowerCase())) {
        fieldErrors.push({
          field: 'password',
          message: 'Esta contraseña es muy común y fácil de adivinar',
          severity: 'error'
        });
      }

      // Verificar patrones secuenciales
      const hasSequentialNumbers = /123|234|345|456|567|678|789|890/.test(password);
      const hasSequentialLetters = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password);
      
      if (hasSequentialNumbers || hasSequentialLetters) {
        fieldErrors.push({
          field: 'password',
          message: 'Evita usar secuencias obvias de números o letras',
          severity: 'warning'
        });
      }
    }

    return fieldErrors;
  }, [isEditing]);

  const validateName = useCallback((name: string, fieldName: string): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    const fieldLabel = fieldName === 'nombre' ? 'nombre' : 'apellidos';
    
    if (!name.trim()) {
      fieldErrors.push({
        field: fieldName,
        message: `El ${fieldLabel} es requerido`,
        severity: 'error'
      });
      return fieldErrors;
    }

    if (name.length < 2) {
      fieldErrors.push({
        field: fieldName,
        message: `El ${fieldLabel} debe tener al menos 2 caracteres`,
        severity: 'error'
      });
    }

    if (name.length > 50) {
      fieldErrors.push({
        field: fieldName,
        message: `El ${fieldLabel} no puede exceder 50 caracteres`,
        severity: 'error'
      });
    }

    // Verificar caracteres válidos (solo letras, espacios, acentos y algunos caracteres especiales)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/;
    if (!nameRegex.test(name)) {
      fieldErrors.push({
        field: fieldName,
        message: `El ${fieldLabel} solo puede contener letras, espacios, guiones y apostrofes`,
        severity: 'error'
      });
    }

    // Verificar que no sean solo espacios
    if (name.trim().length === 0) {
      fieldErrors.push({
        field: fieldName,
        message: `El ${fieldLabel} no puede estar vacío`,
        severity: 'error'
      });
    }

    return fieldErrors;
  }, []);

  const validateRole = useCallback((role: string): ValidationError[] => {
    const fieldErrors: ValidationError[] = [];
    const validRoles = ['viewer', 'editor', 'admin'];
    
    if (!role) {
      fieldErrors.push({
        field: 'role',
        message: 'El rol es requerido',
        severity: 'error'
      });
      return fieldErrors;
    }

    if (!validRoles.includes(role)) {
      fieldErrors.push({
        field: 'role',
        message: 'El rol seleccionado no es válido',
        severity: 'error'
      });
    }

    return fieldErrors;
  }, []);

  const validateField = useCallback((
    field: keyof UserFormData, 
    value: any, 
    formData?: Partial<UserFormData>
  ): ValidationError[] => {
    switch (field) {
      case 'email':
        return validateEmail(value as string);
      case 'password':
        return validatePassword(value as string);
      case 'nombre':
        return validateName(value as string, 'nombre');
      case 'apellidos':
        return validateName(value as string, 'apellidos');
      case 'role':
        return validateRole(value as string);
      default:
        return [];
    }
  }, [validateEmail, validatePassword, validateName, validateRole]);

  const validateForm = useCallback((formData: UserFormData): ValidationError[] => {
    const allErrors: ValidationError[] = [];
    
    // Validar todos los campos
    (Object.keys(formData) as (keyof UserFormData)[]).forEach(field => {
      const fieldErrors = validateField(field, formData[field], formData);
      allErrors.push(...fieldErrors);
    });

    // Validaciones adicionales que requieren múltiples campos
    if (formData.nombre && formData.apellidos) {
      const fullName = `${formData.nombre} ${formData.apellidos}`.trim();
      if (fullName.length > 100) {
        allErrors.push({
          field: 'apellidos',
          message: 'El nombre completo no puede exceder 100 caracteres',
          severity: 'error'
        });
      }
    }

    setErrors(allErrors);
    return allErrors;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldErrors = useCallback((field: keyof UserFormData) => {
    setErrors(prevErrors => prevErrors.filter(error => error.field !== field));
  }, []);

  const hasErrors = useMemo(() => 
    errors.some(error => error.severity === 'error'), 
    [errors]
  );

  const hasFieldError = useCallback((field: keyof UserFormData) => 
    errors.some(error => error.field === field && error.severity === 'error'),
    [errors]
  );

  const getFieldErrors = useCallback((field: keyof UserFormData) => 
    errors.filter(error => error.field === field),
    [errors]
  );

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldErrors,
    hasErrors,
    hasFieldError,
    getFieldErrors
  };
};
