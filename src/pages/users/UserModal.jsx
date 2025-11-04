import React, { useEffect, useState} from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../../helper/AuthWrapper";

const UserModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {

  const [group, setGroup] = useState();
  const [status, setStatus] = useState();
  const { permissions } = useAuthWrapper();

  useEffect(() => {
    (async () => {
      let response = await uvCapitalApi.getListOfPermissions();
      if (response.success) {
        setGroup(response.data);
      } else {
        setGroup([]);
      }
    })()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    fetchModuleStatus();
    if (show) {
      reset({
        name: rowData?.name || "",
        email: rowData?.email || "",
        password: rowData?.password || "",
        status: rowData?.status || "",
        role_name: rowData?.role_name || "",
        group_id: rowData?.group_id || "",
        company_id: rowData?.company_id || "",
        description: rowData?.description || "",
      });
    }
  }, [show]);

   const fetchModuleStatus = async () => {
        const response = await uvCapitalApi.getListOfModuleStatus(permissions?.product?.id);
        if (response?.success && Array.isArray(response?.data)) {
        const formatted = response.data
        .filter((item) => item?.status)
        .map((item) => ({
          id: item.id,
          status: item.status?.trim(),
        }));
          setStatus(formatted);
        } else {
          setStatus([]);
        }
      }

  const onSubmit = async (formData) => {
    try {
          if (rowData?.id) {
            await uvCapitalApi.updateUser(
              rowData.id,
              formData
            );
            setRefreshTable(true);
            toast.success("Permission group updated successfully");
          } else {
            await uvCapitalApi.createUser(formData);
            toast.success("Permission group created successfully");
          }
          onHide();
        } catch (error) {
          console.error("Error:", error);
          toast.error("Something went wrong");
        }
    onHide();
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
          {rowData?.id ? "Edit User" : "Add New User"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5"/>
      </Modal.Header>
      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>
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
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Status</span>
                  {errors.status && (
                    <span
                      className="text-danger ms-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {errors.status.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Select
                    size="sm"
                    {...register("status", {
                      required: "Status is required",
                    })}
                    isInvalid={!!errors.status}
                  >
                  <option value="">Select status</option>
                  {status?.map((status) => (
                  <option key={status?.id} value={status?.status}>
                    {status?.status}
                  </option>
                  ))}
                </Form.Select>
             </Col>
             
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  defaultValue={rowData?.email || ""}
                  placeholder="Enter email"
                  size="sm"
                  {...register("email")}
                />
              </Col>
              {!rowData?.id && (<>
              <Col>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  defaultValue={rowData?.password || ""}
                  placeholder="Enter password"
                  size="sm"
                  {...register("password")}
                />
              </Col></>)}
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Role Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.role_name || ""}
                  placeholder="Enter Role Name"
                  size="sm"
                  {...register("role_name")}
                />
              </Col>
               <Col>
                <Form.Label>Group</Form.Label>
                <Form.Select
                  size="sm"
                  {...register("group_id", { required: "Group is required" })}
                  defaultValue={rowData?.group_id || ""}
                >
                  <option value="">Select Group</option>
                  {group?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              {/* <Col>
                <Form.Label>Compony</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.company_id || ""}
                  placeholder="Enter Compony"
                  size="sm"
                  {...register("company_id")}
                />
              </Col> */}
             <Col>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
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
};
export default UserModal