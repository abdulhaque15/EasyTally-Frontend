import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaQuestionCircle, FaTimes } from 'react-icons/fa';
import './Modal.css';


const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="modal-icon success" />;
      case 'warning':
        return <FaExclamationTriangle className="modal-icon warning" />;
      case 'error':
        return <FaExclamationTriangle className="modal-icon error" />;
      case 'confirm':
        return <FaQuestionCircle className="modal-icon confirm" />;
      default:
        return <FaInfoCircle className="modal-icon info" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container" data-type={type}>
        <div className="modal-header modal-header-popup">
          <div className="modal-title-section">
            {getIcon()}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {showCancel && (
            <button 
              className="modal-btn modal-btn-secondary" 
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn modal-btn-primary modal-btn-${type}`} 
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
