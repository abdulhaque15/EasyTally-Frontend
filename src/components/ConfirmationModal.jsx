import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaWindowClose } from "react-icons/fa";

const ConfirmationModal = ({ show, onHide, onConfirm, title = "Confirm", message = "Are you sure?", confirmText = "Yes", cancelText = "Cancel" }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header >
        <Modal.Title>{title}</Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>

      <Modal.Body>
        {message}
      </Modal.Body>

      <Modal.Footer>
        <button
              onClick={onHide}
              type="button"
              className="model-btn-cancel rounded border-0 py-1" 
            >
              {cancelText}
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit" onClick={onConfirm}
            >
              {confirmText}
            </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
