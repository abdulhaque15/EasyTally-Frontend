import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../../helper/AuthWrapper";

const ProductModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {
    
  const [categoryList, setCategoryList] = useState([]);
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
        name: rowData?.name || "",
        category_id: rowData?.category_id || null,
        size: rowData?.size || 0,
        unit: rowData?.unit || "",
        product_code: rowData?.product_code || "",
        is_tax_inclusive: rowData?.is_tax_inclusive || false,
        tax: rowData?.tax || 0,
        tax_type: rowData?.tax_type || "",
        actual_price: rowData?.actual_price || 0,
        selling_price: rowData?.selling_price || 0,
        status: rowData?.status || "",
        image_url: rowData?.image_url || "",
        expiry_date: rowData?.expiry_date?.slice(0, 10) || null,
        is_featured: rowData?.is_featured || false,
        description: rowData?.description || "",
      });
    }
  }, [show]);

      const fetchModuleStatus = async () => {
      const response = await uvCapitalApi.getListOfModuleStatus(permissions?.product?.id);
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
    try {
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateProduct(rowData.id, formData);
        toast.success(response?.message);
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createProduct(formData);
        toast.success(response?.message);
      }
      onHide();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong while saving the product.");
    }
  };

  useEffect(() => {
    (async () => {
      let categoryResponse = await uvCapitalApi.getListOfCategories();
      if (categoryResponse.success) {
        setCategoryList(categoryResponse.data);
      } else {
        setCategoryList([]);
      }
    })();
  }, []);

  console.log('rowData' , rowData)

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
          {rowData?.id ? "Edit Product" : "Add New Product"}
        </Modal.Title>
        <FaWindowClose onClick={onHide} className="fs-5 ms-auto icon-default" />
      </Modal.Header>

      <Modal.Body className="detail-h3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}
          >
            <Row
              lg={12}
              sm={12}
              xs={12}
              className="ps-3 py-2 mb-3 section-header"
            >
              INFORMATION
            </Row>
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
                  placeholder="Name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  isInvalid={!!errors.name}
                  defaultValue={rowData?.name || ""}
                  size="sm"
                />
              </Col>
              <Col>
                <Form.Label>Category</Form.Label>
                 <Form.Select
                  defaultValue={rowData?.category_id || ""}
                  {...register("category_id")}
                  size="sm"
                >
                  <option value="">Select</option>
                  {categoryList?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
             <Row className="mb-3">
              <Col>
                <Form.Label>Size</Form.Label>
                <Form.Control
                  type="number"
                  defaultValue={rowData?.size || ""}
                  placeholder="Enter size"
                  size="sm"
                  {...register("size")}
                />
              </Col>
               <Col>
                <Form.Label>Unit</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.unit || ""}
                  placeholder="Enter unit"
                  size="sm"
                  {...register("unit")}
                />
              </Col>
            </Row>
             <Row className="mb-3">
              <Col className="d-flex align-items-center gap-2">
                    <Form.Check
                    type="checkbox"
                    id="is_tax_inclusive"
                    label="IS Tax Inclusive"
                    {...register("is_tax_inclusive")}
                    defaultChecked={rowData?.is_tax_inclusive === true || rowData?.is_tax_inclusive === "true"}
                    />
                </Col>
                 <Col className="d-flex align-items-center gap-2">
                    <Form.Check
                    type="checkbox"
                    id="is_featured"
                    label="Is Featured"
                    {...register("is_featured")}
                    defaultChecked={rowData?.is_featured === true || rowData?.is_featured === "true"}
                    />
                </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Label>Tax</Form.Label>
                <Form.Control
                  type="number"
                  defaultValue={rowData?.tax || ""}
                  placeholder="Enter Tax"
                  size="sm"
                  {...register("tax")}
                />
              </Col>
              <Col>
                <Form.Label>Tax Type</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.tax_type || ""}
                  placeholder="Enter Tax Type"
                  size="sm"
                  {...register("tax_type")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                <Form.Label>Actual Price</Form.Label>
                <Form.Control
                  type="number"
                  defaultValue={rowData?.actual_price || ""}
                  placeholder="Enter Actual Price"
                  size="sm"
                  {...register("actual_price")}
                />
              </Col>
              <Col>
                <Form.Label>Selling Price</Form.Label>
                <Form.Control
                  type="number"
                  defaultValue={rowData?.selling_price || ""}
                  placeholder="Enter Selling Price"
                  size="sm"
                  {...register("selling_price")}
                />
              </Col>
            </Row>
            <Row className="mb-4">
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
              <Col>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.image_url || ""}
                  placeholder="Enter Image UR"
                  size="sm"
                  {...register("image_url")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.expiry_date?.slice(0, 10) || null}
                  size="sm"
                  {...register("expiry_date")}
                />
              </Col>
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
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
              type="submit"
              disabled={!isDirty}
            >
              Save
            </button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
export default ProductModal
