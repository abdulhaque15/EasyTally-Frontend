import { useEffect } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi"; 
import toast  from 'react-hot-toast';

const LedgersModal = ({ show, onHide,rowData = {}, setRefreshTable }) => {  
  const {register, handleSubmit, formState: { errors, isDirty }, reset} = useForm();

  useEffect(() => {    
    if (show) {
      reset({
        id: rowData?.id || "",
        name: rowData?.name || "",
        company_id__c: rowData?.company_id__c || "",
        state__c: rowData?.state__c || "",
        closing_balance__c: rowData?.closing_balance__c || "",
        legacy_alterid__c: rowData?.legacy_alterid__c || "",
        master_id__c: rowData?.master_id__c || ""
      });
    }
  }, [show]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
    };
  
    try {
      let response;        
      if (rowData?.id) {
        response = await uvCapitalApi.updateLedger(rowData.id, payload);
        toast.success(response?.message || "Ledger updated successfully");
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createLedger(payload);
        toast.success(response?.message || "Ledger created successfully");
      }
      onHide();
    } catch (error) {
      console.error("Error saving ledger:", error);
      toast.error("Something went wrong while saving the ledger.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header>
          <Modal.Title className="detail-h1">
            {rowData?.id ? "Edit Ledger" : "Add New Ledger"}
          </Modal.Title>
          <FaWindowClose onClick={onHide} className="ms-auto icon-default fs-5" />
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "1rem" }}>
            <Row lg={12} sm={12} xs={12} className="ps-3 py-2 mb-3 section-header">
              LEDGER INFORMATION
            </Row>
            <Row>
              <Col md={6}>
                <Form.Label className="d-flex justify-content-between align-items-center">
                  <span>Name</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Ledger Name"
                  size="sm"
                  {...register("name", {
                    required: "Ledger name is required",
                  })}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Col>

              <Col md={6}>
                  <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>Company Name</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    {...register("company_id__c")}
                  >
                    <option value="">Select Company</option>
                    <option value="7ea40b5e-a7b4-42a2-b0a7-ccb702b0677c">UV Capital</option>
                  </Form.Select>
                </Col>
              </Row>
              <Row className="mt-3">
                {/* 3) State (picklist) */}
                <Col md={6}>
                  <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>State</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    {...register("state__c")}
                  >
                    <option value="">Select State</option>
                    <option value="UP">Uttar Pradesh</option>
                    <option value="DL">Delhi</option>
                    <option value="MH">Maharashtra</option>
                    <option value="RJ">Rajasthan</option>
                    <option value="TN">Tamil Nadu</option>
                    {/* aur states yaha add kar sakte ho */}
                  </Form.Select>
                </Col>

                {/* 4) Closing Balance (number, not required) */}
                <Col md={6}>
                  <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>Closing Balance</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Enter Closing Balance"
                    size="sm"
                    {...register("closing_balance__c")}
                  />
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>Legacy Alterid</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Legacy Alterid"
                    size="sm"
                    {...register("legacy_alterid__c")}
                  />
                </Col>
                {/* 5) Master Id (text, not required) */}
                <Col md={6}>
                  <Form.Label className="d-flex justify-content-between align-items-center">
                    <span>Master Id</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Master Id"
                    size="sm"
                    {...register("master_id__c")}
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
export default LedgersModal;