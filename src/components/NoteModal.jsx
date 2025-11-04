import React, { useEffect } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../api/uvCapitalApi";
import toast  from 'react-hot-toast';

const NoteModal = ({ show, onHide, rowData = {} }) => {
    
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
                title: rowData?.title || "",
                description: rowData?.description || "",
            });
        }
    }, [show]);

    const onSubmit = async (formData) => {
        try {
            formData.related_to = related_id;
            const response = rowData?.id
                ? await uvCapitalApi.updateNote(formData, rowData?.id)
                : await uvCapitalApi.createNote(formData);

            if (response.success) {
                toast.success(response?.message);
                reset();
                setTimeout(() => {
                    onHide()
                }, 1000);
            }

        } catch (error) {
            console.log('server-error :', error);
            const errorMessage = error?.response?.data?.message || "Something went wrong while saving the note.";
            toast.error(errorMessage);
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
                    {rowData?.id ? "Edit Note" : "Add New Note"}
                </Modal.Title>
                <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
            </Modal.Header>
            <Modal.Body className="detail-h3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label className="d-flex justify-content-between align-items-center">
                                    <span>Title</span>
                                    {errors.title && (
                                        <span
                                            className="text-danger ms-2"
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {errors.title.message}
                                        </span>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={rowData?.title || ""}
                                    placeholder="Enter Title"
                                    size="sm"
                                    {...register("title", {
                                        required: "Title is required",
                                    })}
                                    isInvalid={!!errors.title}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    defaultValue={rowData?.description || ""}
                                    placeholder="Enter Description"
                                    size="sm"
                                    {...register("description")}
                                />
                            </Col>
                        </Row>

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
    );
}

export default NoteModal