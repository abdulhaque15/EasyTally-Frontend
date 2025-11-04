import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../../helper/AuthWrapper";

const OpportunityModal = ({ show, onHide, rowData = {}, setRefreshTable }) => {
    
  const [accountList, setAccountList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [status, setStatus] = useState();
  const { permissions, userList } = useAuthWrapper();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    fetchModuleStatus();
    if (show) {
      reset({
        name: rowData?.name || "",
        owner_id: rowData?.owner_id || null,
        contact_id: rowData?.contact_id || null,
        contact_person: rowData?.contact_person || "",
        country: rowData?.country || "",
        currency: rowData?.currency || "",
        product: rowData?.product || "",
        buying_agent: rowData?.buying_agent || null,
        opportunity_id: rowData?.opportunity_id || null,
        start_date: rowData?.start_date?.slice(0, 10) || null,
        sales_user: rowData?.sales_user || "",
        status: rowData?.status || "",
        type: rowData?.type || "",
        lead_source: rowData?.lead_source || "",
        stage_duration: rowData?.stage_duration || "",
        amount: rowData?.amount || "",
        probability: rowData?.probability || "",
        forecast_category: rowData?.forecast_category || "",
        close_date: rowData?.close_date?.slice(0, 10) || null,
        is_closed: rowData?.is_closed || "",
        is_won: rowData?.is_won || "",
        account_id: rowData?.account_id || null,
        next_step: rowData?.next_step || "",     
        description: rowData?.description || "",
      });

      const selectedContact = contactList.find(
        (contact) => contact.id === rowData?.contact_id
      );
      if (selectedContact) {
        setValue("contact_id", selectedContact.contact_id || "");
        setValue("country", selectedContact.country || "");
        setValue("currency", selectedContact.currency || "");
      }
    }
  }, [show]);

  const onSubmit = async (formData) => {
    console.log('formData' , formData)
    try {
      let response;
      if (rowData?.id) {
        response = await uvCapitalApi.updateOpportunity(rowData.id, formData);
        toast.success(response?.message);
        setRefreshTable(true);
      } else {
        response = await uvCapitalApi.createOpportunityRecord(formData);
        toast.success(response?.message);
      }
      onHide();
    } catch (error) {
      console.error("Error saving partner:", error);
      toast.error("Something went wrong while saving the partner.");
    }
  };

  useEffect(() => {
    (async () => {
      let accountResponse = await uvCapitalApi.getListOfAccounts();
      if (accountResponse.success) {
        setAccountList(accountResponse.data);
      } else {
        setAccountList([]);
      }
      let contactResponse = await uvCapitalApi.getListOfContacts();
      if (contactResponse.success) {
        setContactList(contactResponse.data);
      } else {
        setContactList([]);
      }
    })();
  }, []);

        const fetchModuleStatus = async () => {
        const response = await uvCapitalApi.getListOfModuleStatus(permissions?.opportunity?.id);
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
          {rowData?.id ? "Edit Opportunity" : "Add New Opportunity"}
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
                <Form.Label>Owner</Form.Label>
                 <Form.Select
                  defaultValue={rowData?.owner_id || ""}
                  {...register("owner_id")}
                  size="sm"
                >
                  <option value="">Select</option>
                  {userList?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
             <Row className="mb-3">
              <Col>
                <Form.Label>Buyer Name</Form.Label>
                <Form.Select
                    {...register("contact_id")}
                    defaultValue={rowData?.contact_id || ""}
                    onChange={(e) => {
                      const buyerId = e.target.value;
                      setValue("contact_id", buyerId);
                      const selectedContact = contactList.find(
                        (contact) => contact.id === buyerId
                      );
                      if (selectedContact) {
                        setValue("contact_person", selectedContact.contact_person || "");
                        setValue("country", selectedContact.country || "");
                        setValue("currency", selectedContact.currency || "");
                      }
                    }}
                    size="sm"
                  >
                  <option value="">Select</option>
                  {contactList?.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Contact Person</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter contact person"
                  size="sm"
                  {...register("contact_person")}
                />
              </Col>
            </Row>
             <Row className="mb-3">
              <Col>
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.country || ""}
                  placeholder="Enter country"
                  size="sm"
                  {...register("country")}
                />
              </Col>
               <Col>
                <Form.Label>Currency</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.currency || ""}
                  placeholder="Enter Currency"
                  size="sm"
                  {...register("currency")}
                />
              </Col>
            </Row>
             <Row className="mb-3">
              <Col>
                <Form.Label>Buying Agent</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.buying_agent || ""}
                  placeholder="Enter buying agent"
                  size="sm"
                  {...register("buying_agent")}
                />
              </Col>
              <Col>
                <Form.Label>Sales User</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.sales_user || ""}
                  placeholder="Enter sales user"
                  size="sm"
                  {...register("sales_user")}
                />
              </Col>
            </Row>
            
            <Row className="mb-3">
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
                <Form.Label>Type</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.type || ""}
                  placeholder="Enter Type"
                  size="sm"
                  {...register("type")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                <Form.Label>Lead Source</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.lead_source || ""}
                  placeholder="Enter lead source"
                  size="sm"
                  {...register("lead_source")}
                />
              </Col>
              <Col>
                <Form.Label>Stage Duration</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.stage_duration || ""}
                  placeholder="Enter stage duration"
                  size="sm"
                  {...register("stage_duration")}
                />
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.amount || ""}
                  placeholder="Enter amount"
                  size="sm"
                  {...register("amount")}
                />
              </Col>
              <Col>
                <Form.Label>Probability</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.probability || null}
                  size="sm"
                  {...register("probability")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.start_date?.slice(0, 10) || ""}
                  placeholder="Enter start date"
                  size="sm"
                  {...register("start_date")}
                />
              </Col>
              <Col>
                <Form.Label>Close Date</Form.Label>
                <Form.Control
                  type="date"
                  defaultValue={rowData?.close_date?.slice(0, 10) || ""}
                  placeholder="Enter close date"
                  size="sm"
                  {...register("close_date")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
                <Col className="d-flex align-items-center gap-2">
                    <Form.Check
                    type="checkbox"
                    id="is_closed"
                    label="Is Closed"
                    {...register("is_closed")}
                    defaultChecked={rowData?.is_closed === true || rowData?.is_closed === "true"}
                    />
                </Col>
                <Col className="d-flex align-items-center gap-2">
                    <Form.Check
                    type="checkbox"
                    id="is_won"
                    label="Is Won"
                    {...register("is_won")}
                    defaultChecked={rowData?.is_won === true || rowData?.is_won === "true"}
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col>
                <Form.Label>Company Master</Form.Label>
                <Form.Select
                  defaultValue={rowData?.account_id || ""}
                  {...register("account_id")}
                  size="sm"
                >
                  <option value="">Select</option>
                  {accountList?.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Next Step</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.next_step || ""}
                  placeholder="Enter next step"
                  size="sm"
                  {...register("next_step")}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Forecast Category</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.forecast_category || ""}
                  placeholder="Enter forecast category"
                  size="sm"
                  {...register("forecast_category")}
                />
              </Col>
              <Col>
                <Form.Label>Product</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={rowData?.product || ""}
                  placeholder="Enter product"
                  size="sm"
                  {...register("product")}
                />
              </Col>
            </Row>
             <Row className="mb-3">
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
export default OpportunityModal
