import React, { useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { FaWindowClose } from "react-icons/fa";
import uvCapitalApi from "../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../helper/AuthWrapper";
import Select from "react-select";

const ChangeOwnerModal = ({ selectedRows, show, onHide, type, setRefreshTable }) => {

  const [selectOwner, setSelectedOwner] = useState(null);
  const { userList } = useAuthWrapper();

const handleSave = async () => {
  try {
    const moduleType = type?.toLowerCase();
    const recordIds = selectedRows.map((row) => row.id);

    const response = await uvCapitalApi.updateModuleOwners(
      moduleType,
      selectOwner?.value,
      recordIds
    );

    if (response.success) {
      for (const row of selectedRows) {
        const oldOwnerName = row.owner_name || "Previous Owner";
        const notificationPayload = {
          name: `${type} Assigned`,
          description: `${type} ${row?.name || row?.id} has been assigned to <b>${selectOwner?.label}</b> by <b>${oldOwnerName}</b>.`,
          user_id: selectOwner?.value,
          type: "unread",
          status: "active",
          record_id: row.id,
        };
        await uvCapitalApi.createNotifications(notificationPayload);
      }

      toast.success("Owner has been changed successfully!");
      onHide();
      setRefreshTable(true);
    } else {
      toast.warn(response.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to change owner");
  }
};

  const options = userList?.map((user) => ({
    value: user.id,
    label: user.name,
    image: user.file_name,
  }));

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
        <Modal.Title className="detail-h1">Change Owner</Modal.Title>
        <FaWindowClose onClick={onHide} className="fs-5 ms-auto icon-default" />
      </Modal.Header>

      <Modal.Body className="detail-h3">
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Label>List Of Users</Form.Label>
             <Select
                options={options}
                value={selectOwner}
                onChange={(selectedOption) => setSelectedOwner(selectedOption)}
                placeholder="Select User"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  menu: base => ({ ...base, zIndex: 9999 }),
                }}
                formatOptionLabel={(user) => (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                        src={user.image}
                        alt={user.label}
                        width="30"
                        height="30"
                        style={{ borderRadius: "50%" }}
                        onError={(e) => { e.target.src = "/default-avatar.png"; }}
                      />
                    <span>{user.label}</span>
                  </div>
                )}
              />

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
          className="btn model-btn-save mx-2 rounded-3 border-0 mb-2 px-5"
          onClick={handleSave}
          disabled={!selectOwner || selectedRows.length === 0}
        >
          Save
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeOwnerModal;
