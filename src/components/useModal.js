import { useState, useCallback } from 'react';

const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showModal = useCallback(({
    title,
    message,
    type = 'info',
    onConfirm = null,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Utility functions for common modal types
  const showSuccess = useCallback((message, title = 'Success') => {
  showModal({
    title,
    message,
    type: 'success',
    confirmText: 'OK',
    onConfirm: () => {
      window.location.reload(); // ✅ reloads the page after OK click
    },
  });
}, [showModal]);

  const showError = useCallback((message, title = 'Error') => {
    showModal({ title, message, type: 'error' });
  }, [showModal]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showModal({ title, message, type: 'warning' });
  }, [showModal]);

  const showInfo = useCallback((message, title = 'Information') => {
    showModal({ title, message, type: 'info' });
  }, [showModal]);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm') => {
    showModal({
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true
    });
  }, [showModal]);

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};

export default useModal;
