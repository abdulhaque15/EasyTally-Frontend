import React, { useEffect } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../api/uvCapitalApi";
import toast  from 'react-hot-toast';

const DocumentUploadModal = ({ show, onHide, rowData = {} }) => {
    const related_id = location.pathname.split("/").pop();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

   useEffect(() => {
  if (show) {
    reset({
      related_to: rowData?.related_to || "",
      title: rowData?.title || "" 
    });
  }
}, [show, rowData, reset]);

const onSubmit = async (data) => {
  try {
    const formData = new FormData();
    formData.append("related_to", related_id);
    formData.append("title", data.title || "");

    if (data.file && data.file.length > 0) {
      formData.append("file", data.file[0]);
    }

    const response = rowData?.id
      ? await uvCapitalApi.updateRelatedAttachment(formData, rowData.id)
      : await uvCapitalApi.createRelatedAttachment(formData);

    if (response.success) {
      toast.success(response.message);
      setTimeout(() => {
        onHide();
      }, 100);
    }
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error(error?.response?.data?.message);
  }
};


    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            backdrop="static"
            scrollable
        >
            <Modal.Header>
                <Modal.Title className="detail-h1">
                    {rowData?.id ? "Edit Attachment" : "Add New Attachment"}
                </Modal.Title>
                <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
            </Modal.Header>
            <Modal.Body className="detail-h3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label className="d-flex justify-content-between align-items-center">
                                    <span>Select File</span>
                                    {errors.file && (
                                        <span
                                            className="text-danger ms-2"
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {errors.file.message}
                                        </span>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    defaultValue={rowData?.file || ""}
                                    placeholder="Enter Title"
                                    size="sm"
                                    {...register("file", {
                                        required: "File is required",
                                    })}
                                    isInvalid={!!errors.file}
                                />
                            </Col>
                        </Row>
                        {rowData?.id && rowData?.file_name}
                    </div>

                    <Modal.Footer style={{ position: "sticky" }}>
                        <button
                            onClick={onHide}
                            className="model-btn-cancel rounded border-0 py-1"
                        >
                            Cancel
                        </button>
                        <button
                            className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
                            type="submit"
                        >
                            Save
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default DocumentUploadModal;