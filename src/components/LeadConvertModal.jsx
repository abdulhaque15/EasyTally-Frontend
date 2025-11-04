import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button   } from "react-bootstrap";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../api/uvCapitalApi";
import AccountModal from "../pages/account/AccountModal";
import ContactModal from "../pages/contact/ContactModal";
import { useParams } from "react-router-dom";
import toast  from 'react-hot-toast';


const LeadConvertModal = ({ show, onHide, refreshDetail, setRefreshDetail }) => {
  const { id } = useParams();
  const [newAccountChecked, setNewAccountChecked] = useState(false);
  const [newContactChecked, setNewContactChecked] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newContact, setNewContact] = useState("");
  const [leadRecord, setLeadRecord] = useState();
  const [accountList, setAccountList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (show) {
      setNewAccountChecked(false);
      setNewContactChecked(false);
      setSelectedAccount("");
      setSelectedContact("");
      setNewAccount("");
      setNewContact("");
      fetchData();
    }
  }, [show]);

  const fetchData = async () => {
    try {
      const leadResponse = await uvCapitalApi.getLeadById(id);
      const accountResponse = await uvCapitalApi.getListOfAccounts();
      const contactResponse = await uvCapitalApi.getListOfContacts();
      setLeadRecord(leadResponse?.data[0]?.related_data?.lead);
      setAccountList(accountResponse?.data || []);
      setContactList(contactResponse?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = async () => {
    let accountData = null;
    let contactData = null;

    if (newAccountChecked && newAccount) {
      accountData = newAccount;
    } else if (!newAccountChecked && selectedAccount) {
      accountData = accountList.find(acc => acc.id === selectedAccount) || null;
    }

    if (newContactChecked && newContact) {
      contactData = newContact;
    } else if (!newContactChecked && selectedContact) {
      contactData = contactList.find(c => c.id === selectedContact) || null;
    }

    const updatedLeadRecord = {
      ...leadRecord,
      lead_status: "Converted"
    };
    
    const payload = {
      lead: updatedLeadRecord,
      account: accountData,
      contact: contactData
    };

  try {
    const response = await uvCapitalApi.laedConvertlead(payload);
    toast.success(response?.message);
    setRefreshDetail(!refreshDetail);
  } catch (error) {
    toast.error("Error converting lead.");
    console.error("Error converting lead:", error);
  }
onHide();
  };

  const isSaveDisabled = (!newAccountChecked && !selectedAccount) ||  (!newContactChecked && !selectedContact);

  return (
    <>
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      scrollable
    >
      <Modal.Header>
        <Modal.Title className="detail-h1">Lead Convert</Modal.Title>
        <FaWindowClose onClick={onHide} className="fs-5 ms-auto icon-default" />
      </Modal.Header>

     <Modal.Body className="detail-h3">
        <Form>
          <Row className="mb-3">
            <Col md={12} className="d-flex align-items-center">
              {/* Left - Checkbox */}
              <div className="me-3">
                <Form.Check
                  type="checkbox"
                  label="Create New Account"
                  checked={newAccountChecked}
                  // onChange={(e) => setNewAccountChecked(e.target.checked)}
                  onChange={(e) => {
                    setNewAccountChecked(e.target.checked);
                    if (e.target.checked) {
                      setSelectedAccount("");
                    } else {
                      setNewAccount("");
                    }
                  }}
                />
              </div>

              {/* Center - Input */}
              <div className="flex-grow-1 d-flex justify-content-center">
                {newAccount && (
                  <Form.Control
                    type="text"
                    value={newAccount?.name || ""}
                    disabled
                    size="sm"
                    style={{ maxWidth: "250px" }}
                  />
                )}
              </div>

              {/* Right - Button */}
              <div className="ms-3">
                <Button
                  className="btn model-btn-save rounded-3 border-0 px-5"
                  disabled={!newAccountChecked}
                  onClick={() => setShowAccountModal(true)}
                >
                  New Account
                </Button>
              </div>
            </Col>

            <Col md={12} className="d-flex align-items-center pt-2">
            <div className="me-3">
              <Form.Check
                type="checkbox"
                label="Create New Contact"
                checked={newContactChecked}
                // onChange={(e) => setNewContactChecked(e.target.checked)}
                onChange={(e) => {
                  setNewContactChecked(e.target.checked);
                  if (e.target.checked) {
                    setSelectedContact("");
                  } else {
                    setNewContact("");
                  }
                }}
              />
            </div>
            <div className="flex-grow-1 d-flex justify-content-center">
              {newContact && (
                <Form.Control
                  type="text"
                  value={`${newContact?.first_name || ""} ${newContact?.last_name || ""}`}
                  disabled
                  size="sm"
                  className="mx-2"
                  style={{ maxWidth: "250px" }}
                />
              )}
            </div>
            <div className="ms-3">
              <Button
                className="btn model-btn-save rounded-3 border-0 px-5"
                disabled={!newContactChecked}
                onClick={() => setShowContactModal(true)}
              >
                New Contact
              </Button>
            </div>  
            </Col>
          </Row>

          <hr />

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Choose Existing Account</Form.Label>
              <Form.Select
                value={selectedAccount}
                size="sm"
                onChange={(e) => setSelectedAccount(e.target.value)}
                disabled={newAccountChecked}
              >
                <option value="">Select Account</option>
                {accountList?.map((acc) => (
                  <option key={acc?.id} value={acc?.id}>
                    {acc?.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Choose Existing Contact</Form.Label>
              <Form.Select
                value={selectedContact}
                size="sm"
                onChange={(e) => setSelectedContact(e.target.value)}
                disabled={newContactChecked}
              >
                <option value="">Select Contact</option>
                {contactList?.map((contact) => (
                  <option key={contact?.id} value={contact?.id}>
                    {contact?.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onHide}
          className="model-btn-cancel rounded border-0 py-1"
        >
          Cancel
        </button>
        <button
          className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5" onClick={handleSave} disabled={isSaveDisabled}
        >
          Save
        </button>
      </Modal.Footer>
    </Modal>

      {showAccountModal && (
        <AccountModal
          show={showAccountModal}
          onHide={() => setShowAccountModal(false)}
          onAccountCreated={(createdAccount) => {
            setAccountList((prev) => [...prev, createdAccount]);
            setNewAccount(createdAccount);
            setNewAccountChecked(true);
            setSelectedAccount("");
          }}
        />
      )}
      {showContactModal && (
        <ContactModal
          show={showContactModal}
          onHide={() => setShowContactModal(false)}
          onContactCreated={(createdContact) => {
            setContactList((prev) => [...prev, createdContact]);
            setNewContact(createdContact);
            setNewContactChecked(true);
            setSelectedContact("");
          }}
        />
      )}
    </>
  );
};

export default LeadConvertModal
