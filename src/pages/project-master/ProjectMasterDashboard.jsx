import { Fragment, useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { FaCompass } from 'react-icons/fa'
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { useNavigate } from 'react-router-dom';
import { useSortableSearchableData } from '../../helper/GlobalHelper';
import { Container } from 'react-bootstrap';
import DataTable from '../../components/DataTable';
import ChangeOwnerModal from '../../components/ChangeOwnerModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Oval } from 'react-loader-spinner';

const ProjectMasterDashboard = () => {

  const [loading, setLoading] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { permissions, userList } = useAuthWrapper();

  const oppData = [
    {
      "id": "1a2b3c4d-1234-5678-90ab-abcdef123456",
      "name": "Website Redesign",
      "account_id": "b3e1a2c3-4567-8901-bcde-abcdef123456",
      "close_date": "2025-08-15T17:00:00Z",
      "Status": "Negotiation",
      "amount": 12000.50,
      "probablity(%)": 70.0,
      "type": "New Business",
      "lead_source": "Referral",
      "next_step": "Finalize proposal",
      "owner_id": "c4d5e6f7-8910-1121-3141-abcdef123456",
      "description": "Redesign of the company’s website to improve UX.",
      "forecast_category": "Best Case",
      "stage_duration": 12,
      "is_closed": false,
      "is_won": false,
      "createbyid": "5e6f7g8h-9101-1121-3141-abcdef123456",
      "createddate": "2025-07-20T10:30:00Z",
      "lastmodifiedbyid": "7g8h9i0j-1234-5678-90ab-abcdef123456",
      "lastmodifieddate": "2025-07-23T15:45:00Z"
    },
    {
      "id": "2b3c4d5e-2345-6789-01ab-bcdefa234567",
      "name": "CRM Upgrade",
      "account_id": "a4b5c6d7-5678-9012-cdef-bcdefa234567",
      "close_date": "2025-09-01T13:00:00Z",
      "Status": "Proposal Sent",
      "amount": 25000.00,
      "probablity(%)": 60.0,
      "type": "Upsell",
      "lead_source": "Email Campaign",
      "next_step": "Client Review",
      "owner_id": "d5e6f7g8-9012-1234-d567-bcdefa234567",
      "description": "Upgrade CRM system with automation features.",
      "forecast_category": "Commit",
      "stage_duration": 15,
      "is_closed": false,
      "is_won": false,
      "createbyid": "8h9i0j1k-2345-6789-01ab-bcdefa234567",
      "createddate": "2025-07-18T09:15:00Z",
      "lastmodifiedbyid": "0j1k2l3m-3456-7890-12ab-bcdefa234567",
      "lastmodifieddate": "2025-07-23T14:00:00Z"
    },
    {
      "id": "3c4d5e6f-3456-7890-12ab-cdefab345678",
      "name": "Cloud Migration",
      "account_id": "c6d7e8f9-6789-0123-def0-cdefab345678",
      "close_date": "2025-10-10T12:00:00Z",
      "Status": "Qualified",
      "amount": 45000.75,
      "probablity(%)": 50.0,
      "type": "Existing Business",
      "lead_source": "Web",
      "next_step": "Schedule demo",
      "owner_id": "e7f8g9h0-1234-5678-9012-cdefab345678",
      "description": "Migrate infrastructure to AWS cloud.",
      "forecast_category": "Pipeline",
      "stage_duration": 10,
      "is_closed": false,
      "is_won": false,
      "createbyid": "1k2l3m4n-4567-8901-23cd-cdefab345678",
      "createddate": "2025-07-17T08:45:00Z",
      "lastmodifiedbyid": "2l3m4n5o-5678-9012-34de-cdefab345678",
      "lastmodifieddate": "2025-07-22T13:20:00Z"
    },
    {
      "id": "4d5e6f7g-4567-8901-23cd-defabc456789",
      "name": "Mobile App Development",
      "account_id": "e8f9g0h1-7890-1234-ef01-defabc456789",
      "close_date": "2025-08-25T11:00:00Z",
      "Status": "In Discussion",
      "amount": 18000.00,
      "probablity(%)": 65.0,
      "type": "New Business",
      "lead_source": "Social Media",
      "next_step": "Technical Evaluation",
      "owner_id": "f9g0h1i2-2345-6789-0123-defabc456789",
      "description": "Build a cross-platform mobile application.",
      "forecast_category": "Best Case",
      "stage_duration": 8,
      "is_closed": false,
      "is_won": false,
      "createbyid": "3m4n5o6p-6789-0123-45ef-defabc456789",
      "createddate": "2025-07-19T10:20:00Z",
      "lastmodifiedbyid": "4n5o6p7q-7890-1234-56f0-defabc456789",
      "lastmodifieddate": "2025-07-23T12:50:00Z"
    },
    {
      "id": "5e6f7g8h-5678-9012-34de-efabcd567890",
      "name": "E-Commerce Integration",
      "account_id": "f0g1h2i3-8901-2345-f123-efabcd567890",
      "close_date": "2025-09-10T14:00:00Z",
      "Status": "Closed Won",
      "amount": 32000.00,
      "probablity(%)": 100.0,
      "type": "Existing Business",
      "lead_source": "Partner",
      "next_step": "Implementation",
      "owner_id": "g1h2i3j4-3456-7890-12ab-efabcd567890",
      "description": "Integrate with Shopify and WooCommerce.",
      "forecast_category": "Commit",
      "stage_duration": 20,
      "is_closed": true,
      "is_won": true,
      "createbyid": "5o6p7q8r-8901-2345-67g1-efabcd567890",
      "createddate": "2025-07-10T11:40:00Z",
      "lastmodifiedbyid": "6p7q8r9s-9012-3456-78h2-efabcd567890",
      "lastmodifieddate": "2025-07-21T09:30:00Z"
    },
    {
      "id": "6f7g8h9i-6789-0123-45ef-fabcde678901",
      "name": "Security Audit",
      "account_id": "g2h3i4j5-9012-3456-g234-fabcde678901",
      "close_date": "2025-08-30T10:00:00Z",
      "Status": "Closed Lost",
      "amount": 10000.00,
      "probablity(%)": 0.0,
      "type": "New Business",
      "lead_source": "Phone Inquiry",
      "next_step": "N/A",
      "owner_id": "h3i4j5k6-4567-8901-23cd-fabcde678901",
      "description": "Security audit for compliance certification.",
      "forecast_category": "Omitted",
      "stage_duration": 5,
      "is_closed": true,
      "is_won": false,
      "createbyid": "7q8r9s0t-0123-4567-89i3-fabcde678901",
      "createddate": "2025-07-12T13:00:00Z",
      "lastmodifiedbyid": "8r9s0t1u-1234-5678-90j4-fabcde678901",
      "lastmodifieddate": "2025-07-20T08:15:00Z"
    },
    {
      "id": "7g8h9i0j-7890-1234-56f0-gabcdef789012",
      "name": "Training Program",
      "account_id": "h4i5j6k7-0123-4567-h345-gabcdef789012",
      "close_date": "2025-09-20T16:00:00Z",
      "Status": "Qualified",
      "amount": 15000.00,
      "probablity(%)": 55.0,
      "type": "New Business",
      "lead_source": "Advertisement",
      "next_step": "Budget approval",
      "owner_id": "i5j6k7l8-5678-9012-34de-gabcdef789012",
      "description": "Corporate training program for 50 employees.",
      "forecast_category": "Pipeline",
      "stage_duration": 7,
      "is_closed": false,
      "is_won": false,
      "createbyid": "9s0t1u2v-2345-6789-01ab-gabcdef789012",
      "createddate": "2025-07-11T15:10:00Z",
      "lastmodifiedbyid": "0t1u2v3w-3456-7890-12ab-gabcdef789012",
      "lastmodifieddate": "2025-07-22T10:55:00Z"
    }
  ]

  const handleNameClick = (row) => {
    navigate(`/project_master/view/${row.id}`, {
      state: { type: "project_master", rowData: row }
    });
  };

const tableHeaders = [
  { key: "name", show: true, label: "Name", sortable: true },
  { key: "account_id", show: false, label: "Account", sortable: false },
  { key: "close_date", show: true, label: "Close Date", sortable: true },
  { key: "Status", show: true, label: "Stage", sortable: true },
  { key: "amount", show: true, label: "Amount", sortable: true },
  { key: "probablity(%)", show: true, label: "Probability (%)", sortable: true },
  { key: "type", show: true, label: "Type", sortable: true },
  { key: "lead_source", show: true, label: "Lead Source", sortable: false },
  { key: "next_step", show: false, label: "Next Step", sortable: false },
  { key: "owner_id", show: false, label: "Owner", sortable: false },
  { key: "description", show: false, label: "Description", sortable: false },
  { key: "forecast_category", show: false, label: "Forecast Category", sortable: false },
  { key: "stage_duration", show: false, label: "Stage Duration", sortable: true },
  { key: "is_closed", show: false, label: "Is Closed", sortable: false },
  { key: "is_won", show: false, label: "Is Won", sortable: false },
  { key: "createbyid", show: false, label: "Created By", sortable: false },
  { key: "createddate", show: false, label: "Created Date", sortable: true },
  { key: "lastmodifiedbyid", show: false, label: "Last Modified By", sortable: false },
  { key: "lastmodifieddate", show: false, label: "Last Modified Date", sortable: true }
];

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };
  const { setSearchText, sortConfig, toggleSort, filteredData } =
    useSortableSearchableData(oppData);
  return (
    <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Project Master"} icon={<FaCompass />} />
        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
            {permissions?.project_master?.create && (
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={handleOpen}
              >
                Add New Company
              </button>
            )}
            {permissions?.project_master?.owner && (
           <button
            className="btn change-owner-btn mx-2 rounded-3 border-0"
            onClick={handleOwnerOpen}
          >
            Change Owner
          </button>
            )}
          </Container>
        )}
        {!location.pathname.includes("view") ? (
          <Container>
            <Container className="px-3 px-md-4 mt-2">
              <DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                handleNameClick={handleNameClick}
                onSearchChange={setSearchText}
                type="Project Master"
                onSelectRows={handleSelectedRows}
                // onDelete={confirmDeleteAccount}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                permission={permissions?.project_master}
              />
            </Container>
           
            <ChangeOwnerModal
              selectedRows={selectedRows}
              show={showOwnerModal}
              onHide={handleOwnerClose}
              type="project_master"
              setRefreshTable={setRefreshTable}
            />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              // onConfirm={handleConfirmedDelete}
              title="Delete Project Master"
              message="Are you sure you want to delete this project master?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
        ) : (
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.project_master}
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
  )
}

export default ProjectMasterDashboard