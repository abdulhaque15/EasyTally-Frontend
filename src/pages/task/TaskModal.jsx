import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';

const TaskModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {
  const related_id = location?.pathname?.split("/")?.pop();
  const [userOptions, setUserOptions] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

useEffect(() => {
  if (show) {
    reset({
      name: rowData?.name || "",
      task_amount: rowData?.task_amount || "",
      status: rowData?.status || "New",
      owner_id: rowData?.owner_id || "",
      estimated_time: rowData?.estimated_time || "",
      start_date: rowData?.start_date?.slice(0, 10) || "",
      end_date: rowData?.end_date?.slice(0, 10) || "",
      priority: rowData?.priority || "",
      description: rowData?.description || "",
      related_to : rowData?.related_to || "",
    });
  } else {
    reset();
  }
}, [show]);

  const onSubmit = async (formData) => {
    try {
      if (!rowData?.id && related_id && related_id !== "tasks") {
        formData.related_to = related_id;
      }
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateTask(formData, rowData.id);
        if (response.success) {
          onHide();
          toast.success(response.message);
          setRefreshTable(true);
        }
      } else {
        response = await uvCapitalApi.createTask(formData);
        if (response.success) {
          toast.success(response.message);
          onHide();
        }
      }  
    } catch (error) {
      console.log("Server error-->>", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userResponse = await uvCapitalApi.getListOfUsers();
      if (userResponse.success) {
        setUserOptions(userResponse.data);
      } else {
        setUserOptions([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUserOptions([]);
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
          {rowData?.id ? "Edit Task" : "Add New Task"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>
      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
          >
            <Row className="mb-3">
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Name</span>
                  {errors.name && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.name.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.name || ""}
                  placeholder="Enter Name"
                  size="sm"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  isInvalid={!!errors.name}
                />
              </Col>
              <Col>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.task_amount || ""}
                  placeholder="Enter Amount"
                  size="sm"
                  {...register("task_amount")}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Status</Form.Label>
                 <Form.Select
                  defaultValue={rowData?.status || ""}
                  {...register("status")}
                  size="sm"
                >
                  <option value="">Select status</option>
                  <option value="New">New</option>
                  <option value="In progress">In progress</option>
                  <option value="Approval">Approval</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Owner</Form.Label>
                <Form.Select
                  defaultValue={rowData?.owner_id || ""}
                  size="sm"
                  {...register("owner_id")}
                >
                  <option value="">Select user</option>
                  {userOptions?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Estimated Time</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.estimated_time || ""}
                  placeholder="Enter Estimated Time"
                  size="sm"
                  {...register("estimated_time")}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.start_date?.slice(0, 10) || ""}
                  placeholder="Enter Start Date"
                  size="sm"
                  {...register("start_date")}
                />
              </Col>
              <Col>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.end_date?.slice(0, 10) || ""}
                  placeholder="Enter End Date"
                  size="sm"
                  {...register("end_date")}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  defaultValue={rowData?.priority || ""}
                  {...register("priority")}
                  size="sm"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
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
              type="button"
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

export default TaskModal;
