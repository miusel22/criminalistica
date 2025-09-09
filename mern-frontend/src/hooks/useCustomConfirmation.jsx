import React, { useState, useCallback } from 'react';
import CustomConfirmationModal from '../components/ui/CustomConfirmationModal';
import { UserService } from '../services/userService';

export const useCustomConfirmation = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
    userInfo: null,
    warningMessage: null,
    isDestructive: false,
    onConfirm: () => {},
    onCancel: null
  });

  const showConfirmation = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Confirmar acción',
        message: options.message || '¿Está seguro de que desea continuar?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'danger',
        userInfo: options.userInfo || null,
        warningMessage: options.warningMessage || null,
        isDestructive: options.isDestructive || false,
        onConfirm: () => resolve(true),
        onCancel: options.onCancel ? () => {
          options.onCancel();
          resolve(false);
        } : () => resolve(false)
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmationComponent = useCallback(() => (
    <CustomConfirmationModal
      isOpen={modalState.isOpen}
      onClose={() => {
        if (modalState.onCancel) modalState.onCancel();
        hideConfirmation();
      }}
      onConfirm={modalState.onConfirm}
      onCancel={modalState.onCancel}
      title={modalState.title}
      message={modalState.message}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      variant={modalState.variant}
      userInfo={modalState.userInfo}
      warningMessage={modalState.warningMessage}
      isDestructive={modalState.isDestructive}
    />
  ), [modalState, hideConfirmation]);

  return {
    showConfirmation,
    ConfirmationComponent
  };
};

// Hook especializado para eliminación de usuarios
export const useDeleteUserConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmDeleteUser = useCallback((user) => {
    const userName = UserService.getFullName ? UserService.getFullName(user) : 
      (user.fullName || `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.email);

    return showConfirmation({
      title: 'Eliminar Usuario',
      message: '¿Estás completamente seguro de que deseas eliminar este usuario del sistema?',
      confirmText: 'Eliminar Usuario',
      cancelText: 'Cancelar',
      variant: 'delete',
      isDestructive: true,
      userInfo: {
        name: userName,
        email: user.email,
        role: user.role
      },
      warningMessage: 'Esta acción no se puede deshacer. Todos los datos asociados a este usuario se perderán permanentemente.'
    });
  }, [showConfirmation]);

  return { confirmDeleteUser, ConfirmationComponent };
};

// Hook especializado para activar/desactivar usuarios
export const useToggleUserStatusConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmToggleUserStatus = useCallback((user) => {
    const userName = UserService.getFullName ? UserService.getFullName(user) : 
      (user.fullName || `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.email);
    const isActive = user.isActive;
    const action = isActive ? 'desactivar' : 'activar';
    const actionCapitalized = isActive ? 'Desactivar' : 'Activar';

    return showConfirmation({
      title: `${actionCapitalized} Usuario`,
      message: `¿Estás seguro de que deseas ${action} este usuario?`,
      confirmText: `${actionCapitalized} Usuario`,
      cancelText: 'Cancelar',
      variant: isActive ? 'deactivate' : 'success',
      isDestructive: isActive,
      userInfo: {
        name: userName,
        email: user.email,
        role: user.role
      },
      warningMessage: isActive 
        ? 'El usuario no podrá acceder al sistema hasta que sea reactivado.'
        : 'El usuario podrá acceder al sistema nuevamente.'
    });
  }, [showConfirmation]);

  return { confirmToggleUserStatus, ConfirmationComponent };
};

// Hook especializado para acciones críticas del sistema
export const useCriticalActionConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmCriticalAction = useCallback((options) => {
    return showConfirmation({
      title: options.title || 'Acción Crítica',
      message: options.message || 'Esta acción puede tener consecuencias importantes en el sistema.',
      confirmText: options.confirmText || 'Continuar',
      cancelText: 'Cancelar',
      variant: 'critical',
      isDestructive: true,
      warningMessage: options.warningMessage || 'Por favor, asegúrate de que comprendes las implicaciones antes de continuar.',
      ...options
    });
  }, [showConfirmation]);

  return { confirmCriticalAction, ConfirmationComponent };
};

// Hook especializado para acciones de administrador
export const useAdminActionConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmAdminAction = useCallback((options) => {
    return showConfirmation({
      title: options.title || 'Acción de Administrador',
      message: options.message || '¿Estás seguro de realizar esta acción administrativa?',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'warning',
      warningMessage: 'Esta acción requiere privilegios de administrador.',
      ...options
    });
  }, [showConfirmation]);

  return { confirmAdminAction, ConfirmationComponent };
};

// Hook especializado para confirmaciones de éxito
export const useSuccessConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmSuccess = useCallback((options) => {
    return showConfirmation({
      title: options.title || 'Operación Exitosa',
      message: options.message || 'La operación se completó correctamente.',
      confirmText: options.confirmText || 'Entendido',
      cancelText: options.cancelText,
      variant: 'success',
      showCancel: options.showCancel || false,
      isDestructive: false,
      ...options
    });
  }, [showConfirmation]);

  return { confirmSuccess, ConfirmationComponent };
};

// Hook especializado para información
export const useInfoConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const showInfo = useCallback((options) => {
    return showConfirmation({
      title: options.title || 'Información',
      message: options.message || 'Información del sistema.',
      confirmText: options.confirmText || 'Entendido',
      cancelText: options.cancelText,
      variant: 'info',
      showCancel: options.showCancel || false,
      isDestructive: false,
      ...options
    });
  }, [showConfirmation]);

  return { showInfo, ConfirmationComponent };
};

// Hook especializado para eliminación de indiciados
export const useDeleteIndiciadoConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmDeleteIndiciado = useCallback((indiciado) => {
    const indiciadoName = indiciado.nombre || indiciado.fullName || `${indiciado.nombres || ''} ${indiciado.apellidos || ''}`.trim() || 'Indiciado';

    return showConfirmation({
      title: 'Eliminar Indiciado',
      message: '¿Estás completamente seguro de que deseas eliminar este indiciado del sistema?',
      confirmText: 'Eliminar Indiciado',
      cancelText: 'Cancelar',
      variant: 'delete',
      isDestructive: true,
      userInfo: {
        name: indiciadoName,
        email: indiciado.cedula ? `Cédula: ${indiciado.cedula}` : 'Sin cédula registrada',
        role: 'indiciado'
      },
      warningMessage: 'Esta acción no se puede deshacer. Todos los datos, documentos y registros asociados a este indiciado se perderán permanentemente.'
    });
  }, [showConfirmation]);

  return { confirmDeleteIndiciado, ConfirmationComponent };
};

// Hook especializado para eliminación de vehículos
export const useDeleteVehiculoConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmDeleteVehiculo = useCallback((vehiculo) => {
    const vehiculoName = vehiculo.placa || vehiculo.numero_placa || 'Vehículo sin placa';
    const vehiculoInfo = `${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.año || ''}`.trim() || 'Información no disponible';

    return showConfirmation({
      title: 'Eliminar Vehículo',
      message: '¿Estás completamente seguro de que deseas eliminar este vehículo del sistema?',
      confirmText: 'Eliminar Vehículo',
      cancelText: 'Cancelar',
      variant: 'delete',
      isDestructive: true,
      userInfo: {
        name: `Placa: ${vehiculoName}`,
        email: vehiculoInfo,
        role: 'vehiculo'
      },
      warningMessage: 'Esta acción no se puede deshacer. Todos los documentos y registros asociados a este vehículo se perderán permanentemente.'
    });
  }, [showConfirmation]);

  return { confirmDeleteVehiculo, ConfirmationComponent };
};

// Hook especializado para eliminación de sectores
export const useDeleteSectorConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmDeleteSector = useCallback((sector, subsectorsCount = 0, indiciadosCount = 0, vehiculosCount = 0) => {
    const sectorName = sector.nombre || sector.name || 'Sector sin nombre';
    const hasContent = subsectorsCount > 0 || indiciadosCount > 0 || vehiculosCount > 0;
    
    let contentWarning = '';
    if (hasContent) {
      const items = [];
      if (subsectorsCount > 0) items.push(`${subsectorsCount} subsector${subsectorsCount > 1 ? 'es' : ''}`);
      if (indiciadosCount > 0) items.push(`${indiciadosCount} indiciado${indiciadosCount > 1 ? 's' : ''}`);
      if (vehiculosCount > 0) items.push(`${vehiculosCount} vehículo${vehiculosCount > 1 ? 's' : ''}`);
      contentWarning = `Este sector contiene ${items.join(', ')}. Todos estos elementos también se eliminarán.`;
    }

    return showConfirmation({
      title: 'Eliminar Sector',
      message: hasContent 
        ? '¡ATENCIÓN! Este sector contiene elementos. ¿Estás seguro de eliminarlo junto con todo su contenido?'
        : '¿Estás seguro de que deseas eliminar este sector?',
      confirmText: 'Eliminar Sector',
      cancelText: 'Cancelar',
      variant: hasContent ? 'critical' : 'delete',
      isDestructive: true,
      userInfo: {
        name: sectorName,
        email: sector.descripcion || 'Sin descripción',
        role: 'sector'
      },
      warningMessage: hasContent 
        ? `${contentWarning} Esta acción no se puede deshacer.`
        : 'Esta acción no se puede deshacer.'
    });
  }, [showConfirmation]);

  return { confirmDeleteSector, ConfirmationComponent };
};

// Hook especializado para eliminación de subsectores
export const useDeleteSubsectorConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmDeleteSubsector = useCallback((subsector, indiciadosCount = 0, vehiculosCount = 0) => {
    const subsectorName = subsector.nombre || subsector.name || 'Subsector sin nombre';
    const hasContent = indiciadosCount > 0 || vehiculosCount > 0;
    
    let contentWarning = '';
    if (hasContent) {
      const items = [];
      if (indiciadosCount > 0) items.push(`${indiciadosCount} indiciado${indiciadosCount > 1 ? 's' : ''}`);
      if (vehiculosCount > 0) items.push(`${vehiculosCount} vehículo${vehiculosCount > 1 ? 's' : ''}`);
      contentWarning = `Este subsector contiene ${items.join(' y ')}. Todos estos elementos también se eliminarán.`;
    }

    return showConfirmation({
      title: 'Eliminar Subsector',
      message: hasContent 
        ? '¡ATENCIÓN! Este subsector contiene elementos. ¿Estás seguro de eliminarlo junto con todo su contenido?'
        : '¿Estás seguro de que deseas eliminar este subsector?',
      confirmText: 'Eliminar Subsector',
      cancelText: 'Cancelar',
      variant: hasContent ? 'critical' : 'delete',
      isDestructive: true,
      userInfo: {
        name: subsectorName,
        email: subsector.descripcion || 'Sin descripción',
        role: 'subsector'
      },
      warningMessage: hasContent 
        ? `${contentWarning} Esta acción no se puede deshacer.`
        : 'Esta acción no se puede deshacer.'
    });
  }, [showConfirmation]);

  return { confirmDeleteSubsector, ConfirmationComponent };
};

// Hook especializado para confirmación de actualizaciones de usuarios
export const useUpdateUserConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmUpdateUser = useCallback((user, changes) => {
    const userName = UserService.getFullName ? UserService.getFullName(user) : 
      (user.fullName || `${user.nombre || ''} ${user.apellidos || ''}`.trim() || user.email);

    // Detectar cambios importantes
    const importantChanges = [];
    if (changes.role && changes.role !== user.role) {
      importantChanges.push(`Rol: ${user.role} → ${changes.role}`);
    }
    if (changes.isActive !== undefined && changes.isActive !== user.isActive) {
      importantChanges.push(`Estado: ${user.isActive ? 'Activo' : 'Inactivo'} → ${changes.isActive ? 'Activo' : 'Inactivo'}`);
    }
    if (changes.email && changes.email !== user.email) {
      importantChanges.push(`Email: ${user.email} → ${changes.email}`);
    }

    return showConfirmation({
      title: 'Confirmar Actualización de Usuario',
      message: '¿Estás seguro de que deseas guardar estos cambios?',
      confirmText: 'Guardar Cambios',
      cancelText: 'Cancelar',
      variant: importantChanges.length > 0 ? 'warning' : 'info',
      isDestructive: false,
      userInfo: {
        name: userName,
        email: changes.email || user.email,
        role: changes.role || user.role
      },
      warningMessage: importantChanges.length > 0 ? 
        `Cambios importantes:\n• ${importantChanges.join('\n• ')}` : 
        null
    });
  }, [showConfirmation]);

  return { confirmUpdateUser, ConfirmationComponent };
};

// Hook especializado para confirmación de actualizaciones de indiciados
export const useUpdateIndiciadoConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmUpdateIndiciado = useCallback((indiciado, isCreating = false) => {
    const indiciadoName = indiciado.nombre || indiciado.fullName || 
      `${indiciado.nombres || ''} ${indiciado.apellidos || ''}`.trim() || 'Indiciado';

    return showConfirmation({
      title: isCreating ? 'Confirmar Creación de Indiciado' : 'Confirmar Actualización de Indiciado',
      message: isCreating ? 
        '¿Estás seguro de que deseas crear este nuevo indiciado?' : 
        '¿Estás seguro de que deseas guardar los cambios realizados?',
      confirmText: isCreating ? 'Crear Indiciado' : 'Guardar Cambios',
      cancelText: 'Cancelar',
      variant: 'info',
      isDestructive: false,
      userInfo: {
        name: indiciadoName,
        email: indiciado.cedula ? `Cédula: ${indiciado.cedula}` : 'Sin cédula registrada',
        role: 'indiciado'
      },
      warningMessage: isCreating ? 
        'Una vez creado, el indiciado será agregado al sistema.' : 
        'Los cambios se aplicarán inmediatamente.'
    });
  }, [showConfirmation]);

  return { confirmUpdateIndiciado, ConfirmationComponent };
};

// Hook especializado para confirmación de actualizaciones de vehículos
export const useUpdateVehiculoConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmUpdateVehiculo = useCallback((vehiculo, isCreating = false) => {
    const vehiculoName = vehiculo.placa || vehiculo.numero_placa || 'Vehículo sin placa';
    const vehiculoInfo = `${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.año || ''}`.trim() || 'Información no disponible';

    return showConfirmation({
      title: isCreating ? 'Confirmar Creación de Vehículo' : 'Confirmar Actualización de Vehículo',
      message: isCreating ? 
        '¿Estás seguro de que deseas crear este nuevo vehículo?' : 
        '¿Estás seguro de que deseas guardar los cambios realizados?',
      confirmText: isCreating ? 'Crear Vehículo' : 'Guardar Cambios',
      cancelText: 'Cancelar',
      variant: 'info',
      isDestructive: false,
      userInfo: {
        name: `Placa: ${vehiculoName}`,
        email: vehiculoInfo,
        role: 'vehiculo'
      },
      warningMessage: isCreating ? 
        'Una vez creado, el vehículo será agregado al sistema.' : 
        'Los cambios se aplicarán inmediatamente.'
    });
  }, [showConfirmation]);

  return { confirmUpdateVehiculo, ConfirmationComponent };
};

// Hook especializado para confirmación de actualizaciones de sectores
export const useUpdateSectorConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmUpdateSector = useCallback((sector, isCreating = false) => {
    const sectorName = sector.nombre || sector.name || 'Sector sin nombre';

    return showConfirmation({
      title: isCreating ? 'Confirmar Creación de Sector' : 'Confirmar Actualización de Sector',
      message: isCreating ? 
        '¿Estás seguro de que deseas crear este nuevo sector?' : 
        '¿Estás seguro de que deseas guardar los cambios realizados?',
      confirmText: isCreating ? 'Crear Sector' : 'Guardar Cambios',
      cancelText: 'Cancelar',
      variant: 'info',
      isDestructive: false,
      userInfo: {
        name: sectorName,
        email: sector.descripcion || 'Sin descripción',
        role: 'sector'
      },
      warningMessage: isCreating ? 
        'Una vez creado, el sector estará disponible para agregar subsectores.' : 
        'Los cambios se aplicarán inmediatamente.'
    });
  }, [showConfirmation]);

  return { confirmUpdateSector, ConfirmationComponent };
};

// Hook especializado para confirmación de actualizaciones de subsectores
export const useUpdateSubsectorConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useCustomConfirmation();

  const confirmUpdateSubsector = useCallback((subsector, isCreating = false) => {
    const subsectorName = subsector.nombre || subsector.name || 'Subsector sin nombre';

    return showConfirmation({
      title: isCreating ? 'Confirmar Creación de Subsector' : 'Confirmar Actualización de Subsector',
      message: isCreating ? 
        '¿Estás seguro de que deseas crear este nuevo subsector?' : 
        '¿Estás seguro de que deseas guardar los cambios realizados?',
      confirmText: isCreating ? 'Crear Subsector' : 'Guardar Cambios',
      cancelText: 'Cancelar',
      variant: 'info',
      isDestructive: false,
      userInfo: {
        name: subsectorName,
        email: subsector.descripcion || 'Sin descripción',
        role: 'subsector'
      },
      warningMessage: isCreating ? 
        'Una vez creado, el subsector estará disponible para agregar indiciados y vehículos.' : 
        'Los cambios se aplicarán inmediatamente.'
    });
  }, [showConfirmation]);

  return { confirmUpdateSubsector, ConfirmationComponent };
};

export default useCustomConfirmation;