import React, { useState, useCallback } from 'react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

export const useConfirmation = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
    onConfirm: () => {}
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
        onConfirm: () => resolve(true)
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmationComponent = useCallback(() => (
    <ConfirmationModal
      isOpen={modalState.isOpen}
      onClose={hideConfirmation}
      onConfirm={modalState.onConfirm}
      title={modalState.title}
      message={modalState.message}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      variant={modalState.variant}
    />
  ), [modalState, hideConfirmation]);

  return {
    showConfirmation,
    ConfirmationComponent
  };
};

// Funciones de conveniencia para diferentes tipos de confirmación
export const useDeleteConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const confirmDelete = useCallback((itemName = 'este elemento') => {
    return showConfirmation({
      title: 'Eliminar elemento',
      message: `¿Está seguro de eliminar ${itemName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
  }, [showConfirmation]);

  return { confirmDelete, ConfirmationComponent };
};

export const useActionConfirmation = () => {
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const confirmAction = useCallback((action, description) => {
    return showConfirmation({
      title: `Confirmar ${action}`,
      message: description,
      confirmText: action,
      cancelText: 'Cancelar',
      variant: 'warning'
    });
  }, [showConfirmation]);

  return { confirmAction, ConfirmationComponent };
};
