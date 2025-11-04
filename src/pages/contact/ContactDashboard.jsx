import React, { Fragment, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import ContactModal from "./ContactModal";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import ModuleHeader from "../../components/ModuleHeader";
import ChangeOwnerModal from "../../components/ChangeOwnerModal";
import DetailPage from "../../components/DetailPage";
import uvCapitalApi from "../../api/uvCapitalApi";
import { Oval } from "react-loader-spinner";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { BiSolidPhoneCall } from "react-icons/bi";
import KenbenView from "../../components/KenbenView";
import TwoStageToggle from "../../components/TwoStageToggle";

const ContactDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [contactDetails, setContactDetails] = useState();
  const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(contactDetails);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const { permissions, userList, settingPermissions } = useAuthWrapper();
  const [currentViewStage, setCurrentViewState] = useState(0);
  const [systemSetting, setSystemSetting] = useState();

  useEffect(() => {
  if (settingPermissions) {
      const kenbanSettings = settingPermissions["Ken-ban View Setting"];
      const setting = kenbanSettings?.find(
      item => item.module_id === permissions?.contact?.id
      );
      setSystemSetting(setting?.is_activate);
  }
  }, [settingPermissions, permissions?.contact?.id]);

  const handleNameClick = (row) => {
    navigate(`/contact/view/${row.id}`, {
      state: { type: "contact", rowData: row }
    });
  };

  const tableHeaders = [
    { key: "name", show: true, label: "Name", sortable: true, kenben: true },
    { key: "phone", show: true, label: "Phone", kenben: false },
    { key: "email", show: true, label: "Email", kenben: true },
    { key: "fax", show: true, label: "Fax", kenben: false },
    { key: "birthday", show: true, label: "Birthday", kenben: false },
    { key: "account_name", show: false, label: "Company Name", kenben: true },
    { key: "city", show: false, label: "City", kenben: false },
    { key: "country", show: false, label: "Country", kenben: false },
    { key: "createdby", show: false, label: "Created by", kenben: false },
    { key: "createddate", show: false, label: "Created Date", kenben: false },
    { key: "home_phone", show: false, label: "Home Phone", kenben: false },
    { key: "lastmodifiedby", show: false, label: "Last Modified by", kenben: false },
    { key: "lastmodifieddate", show: false, label: "Last Modified Date", kenben: false },
    { key: "mobile", show: false, label: "Mobile", kenben: false },
    { key: "other_phone", show: false, label: "Other Phone", kenben: false },
    { key: "owner_id", show: false, label: "Owner", kenben: false },
    { key: "referredby", show: false, label: "Referred by", kenben: false },
    { key: "state", show: false, label: "State", kenben: false },
    { key: "street", show: false, label: "Street", kenben: false },
    { key: "title", show: false, label: "Title", kenben: false },
    { key: "zip_code", show: false, label: "Zip Code", kenben: false },
    { key: "description", show: false, label: "Description", kenben: false },
    { key: "type", show: false, label: "Type", kenben: false },
    { key: "contact_person", show: false, label: "Contact Person", kenben: true },
    { key: "currency", show: false, label: "Currency", kenben: false },
    { key: "payment_term", show: false, label: "Description", kenben: true },
    { key: "egcg_term", show: false, label: "Payment Term", kenben: true },
    { key: "policy_no", show: false, label: "Description", kenben: true },
    { key: "policy_expiry_date", show: false, label: "Policy Expiry Date", kenben: false },
    { key: "buying_agent", show: false, label: "Buying Agent", kenben: false },
    { key: "status", show: false, label: "Status", kenben: false },
    { key: "billing_street", show: false, label: "Billing Street", kenben: false },
    { key: "billing_city", show: false, label: "Billing City", kenben: false },
    { key: "billing_state", show: false, label: "Billing State", kenben: false },
    { key: "billing_country", show: false, label: "Billing Country", kenben: false },
    { key: "shipping_street", show: false, label: "Shipping Street", kenben: false },
    { key: "shipping_city", show: false, label: "Shipping City", kenben: false },
    { key: "shipping_state", show: false, label: "Shipping State", kenben: false },
    { key: "shipping_country", show: false, label: "Shipping Country", kenben: false },
  ];

  const kenbanHeaders = tableHeaders.filter(header => header.kenben);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const confirmDeleteContact = (id) => {
    setContactToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!contactToDelete) return;
    try {
      const res = await uvCapitalApi.deleteContact(contactToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchContacts();
      } else {
        toast.error("Failed to delete contact.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setContactToDelete(null);
    }
  };

  useEffect(() => {
    fetchContacts();
    setRefreshTable(false);
  }, [showModal, refreshTable, navigate]);

  const fetchContacts = async () => {
    setLoading(true);
    const usersMap = {};
    userList?.forEach((user) => {
      usersMap[user.id] = user.name;
    });

    const accountResponse = await uvCapitalApi.getListOfAccounts();
    const accountsMap = {};
    if (accountResponse.success) {
      accountResponse.data.forEach((account) => {
        accountsMap[account.id] = account.name;
      });
    }
    const contactResponse = await uvCapitalApi.getListOfContacts();
    if (contactResponse.success) {
      const updatedContacts = contactResponse.data.map((contact) => ({
        ...contact,
        owner_id: usersMap[contact.owner_id] || "",
        createdby: usersMap[contact.createdbyid] || "",
        lastmodifiedby: usersMap[contact.lastmodifiedbyid] || "",
        account_name: accountsMap[contact.account_id] || "",
      }));
      setContactDetails(updatedContacts);
    } else {
      setContactDetails([]);
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Contact Master"} icon={<BiSolidPhoneCall />} />

        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
           {systemSetting && <TwoStageToggle 
            setCurrentState={setCurrentViewState}
            currentState={currentViewStage}
            />}
            {permissions?.contact?.create && (
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={handleOpen}
              >
                Add New Contact
              </button>
            )}
            {permissions?.contact?.owner && (
              <button
                className="btn change-owner-btn mx-2 rounded-3 border-0"
                onClick={handleOwnerOpen}
                style={{ visibility: currentViewStage === 1 ? "hidden" : "visible" }}
              >
                Change Owner
              </button>
            )}
          </Container>
        )}

        {!location.pathname.includes("view") ? (
          <Container>
            <Container className="px-3 px-md-4 mt-2">
              {currentViewStage == 0 ? (
               <DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                handleNameClick={handleNameClick}
                onSearchChange={setSearchText}
                type="Contact"
                onSelectRows={handleSelectedRows}
                onDelete={confirmDeleteContact}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                permission={permissions?.contact}
              />
             ) : (
              <KenbenView data={filteredData} permission={permissions?.contact} headers={kenbanHeaders} type="Contact" onDelete={confirmDeleteContact} setRefreshTable={setRefreshTable}/>
             )}
            </Container>
            <ContactModal
              show={showModal}
              onHide={handleClose}
              setRefreshTable={setRefreshTable}
            />
            <ChangeOwnerModal
              selectedRows={selectedRows}
              show={showOwnerModal}
              onHide={handleOwnerClose}
              type="contact"
              setRefreshTable={setRefreshTable}
            />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Contact"
              message="Are you sure you want to delete this Contact?"
              confirmText="Delete"
              cancelText="Cancel"
            />
            
          </Container>

        ) : (
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.contact}
            type="Contact"
          />
        )}
        {loading && (
          <div className="overlay-loader">
            <Oval
              visible={true}
              height={80}
              width={80}
              color="rgb(212 179 124)"
              secondaryColor="rgb(212 179 124)"
              ariaLabel="oval-loading"
            />
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default ContactDashboard;
