import React, { useEffect } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../api/uvCapitalApi";
import toast  from 'react-hot-toast';

const EventModal = ({ show, onHide, rowData = {} }) => {
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
                related_to: rowData?.related_to || null,
                subject: rowData?.subject || "",
                event_schedule_by: rowData?.event_schedule_by || "",
                total_event_member: rowData?.total_event_member || 0,
                schedule_date_time: rowData?.schedule_date_time || null,
                start_date_time: rowData?.start_date_time || null,
                end_date_time: rowData?.end_date_time || null,
                status: rowData?.status || "New"
            });
        }
    }, [show]);

    const onSubmit = async (formData) => {
        try {
            formData.related_to = related_id;
            const response = rowData?.id
                ? await uvCapitalApi.updateEvent(formData, rowData?.id)
                : await uvCapitalApi.createEevnt(formData);
            if (response.success) {
                toast.success(response.message);
                onHide();
            }
        } catch (error) {
            console.log('server-error :', error);
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
                    {rowData?.id ? "Edit Event" : "Add New Event"}
                </Modal.Title>
                <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
            </Modal.Header>
            <Modal.Body className="detail-h3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label className="d-flex justify-content-between align-items-center">
                                    <span>Subject</span>
                                    {errors.subject && (
                                        <span
                                            className="text-danger ms-2"
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            {errors.subject.message}
                                        </span>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={rowData?.subject || ""}
                                    placeholder="Enter Name"
                                    size="sm"
                                    {...register("subject", {
                                        required: "Subject is required",
                                    })}
                                    isInvalid={!!errors.subject}
                                />
                            </Col>
                            <Col>
                                <Form.Label>Scheduled By</Form.Label>
                                <Form.Select {...register("event_schedule_by")} size="sm">
                                    <option value="">Select Schduled By</option>
                                    <option value="system admin">System Admin</option>
                                    <option value="admin">Admin</option>
                                </Form.Select>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col lg={6}>
                                <Form.Label>Scheduled Date Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    defaultValue={rowData?.schedule_date_time || ""}
                                    placeholder="Enter End Date"
                                    size="sm"
                                    {...register("schedule_date_time")}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Start Date Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    defaultValue={rowData?.start_date_time || ""}
                                    placeholder="Enter Start Date"
                                    size="sm"
                                    {...register("start_date_time")}
                                />
                            </Col>
                            <Col>
                                <Form.Label>End Date Time</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    defaultValue={rowData?.end_date_time || ""}
                                    placeholder="Enter End Date"
                                    size="sm"
                                    {...register("end_date_time")}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Total Event Memebr</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={rowData?.total_event_member || ""}
                                    placeholder="Enter event member"
                                    size="sm"
                                    {...register("total_event_member")}
                                />
                            </Col>
                            <Col>
                                <Form.Label>Status</Form.Label>
                                <Form.Select {...register("status")} size="sm">
                                    <option value="">Select Status</option>
                                    <option value="new">New</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="completed">Completed</option>
                                </Form.Select>
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
};

export default EventModal