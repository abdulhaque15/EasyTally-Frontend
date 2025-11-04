import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import toast  from 'react-hot-toast';
import uvCapitalApi from "../../api/uvCapitalApi"; 
import { useAuthWrapper } from "../../helper/AuthWrapper";

const CategoryModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {
    const [status, setStatus] = useState();
    const { permissions } = useAuthWrapper();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm();

  useEffect(() => {
    fetchModuleStatus();
    if (show) {
      reset({
        id: rowData?.id || "",
        name: rowData?.name || "",
        status: rowData?.status || "Active",
        description: rowData?.description || "",
      });
    }
  }, [show]);

      const fetchModuleStatus = async () => {
        const response = await uvCapitalApi.getListOfModuleStatus(permissions?.category?.id);
        if (response?.success && Array.isArray(response?.data)) {
        const formatted = response.data
        .filter((item) => item?.isactive)
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
    const payload = {
      ...formData,
    };

    try {
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateCategory(rowData.id, payload);
        toast.success(response?.message || "Category updated successfully");
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createCategory(payload);
        toast.success(response?.message || "Category created successfully");
      }
      onHide();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Something went wrong while saving the category.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header>
        <Modal.Title className="detail-h1">
          {rowData?.id ? "Edit Category" : "Add New Category"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>

      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>
            <Row lg={12} sm={12} xs={12} className="ps-3 py-2 mb-3 section-header">
              CATEGORY INFORMATION
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Name</span>
                  {errors.name && (
                    <span className="text-danger ms-2" style={{ whiteSpace: "nowrap" }}>
                      {errors.name.message}
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Category Name"
                  size="sm"
                  {...register("name", {
                    required: "Category name is required",
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
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
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
              type="button"
              className="model-btn-cancel rounded border-0 py-1"
            >
              Cancel
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit"
              disabled={!isDirty}
            >
              {rowData?.id ? "Update" : "Save"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;