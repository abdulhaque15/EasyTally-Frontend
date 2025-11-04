import { Fragment, useEffect, useState } from 'react'
import ModuleHeader from '../../components/ModuleHeader'
import { FaCrown } from 'react-icons/fa'
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { useNavigate } from 'react-router-dom';
import { useSortableSearchableData } from '../../helper/GlobalHelper';
import { Container } from 'react-bootstrap';
import DataTable from '../../components/DataTable';
import ChangeOwnerModal from '../../components/ChangeOwnerModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Oval } from 'react-loader-spinner';
import uvCapitalApi from '../../api/uvCapitalApi';
import { toast } from 'react-toastify';
import OpportunityModal from './OpportunityModal';
import DetailPage from '../../components/DetailPage';
import TwoStageToggle from "../../components/TwoStageToggle";
import KenbenView from '../../components/KenbenView';

const OpportunityDashboard = () => {

  const [oppData, setOppData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { permissions, userList, settingPermissions } = useAuthWrapper();
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [currentViewStage, setCurrentViewState] = useState(0);
  const [systemSetting, setSystemSetting] = useState();

  useEffect(() => {
  if (settingPermissions) {
      const kenbanSettings = settingPermissions["Ken-ban View Setting"];
      const setting = kenbanSettings?.find(
      item => item.module_id === permissions?.opportunity?.id
      );
      setSystemSetting(setting?.is_activate);
  }
  }, [settingPermissions, permissions?.opportunity?.id]);

  const handleNameClick = (row) => {
    navigate(`/opportunity/view/${row.id}`, {
      state: { type: "opportunity", rowData: row }
    });
  };

  const tableHeaders = [
  { key: "name", show: true, label: "Name", sortable: true, kenben: true},
  { key: "status", show: true, label: "Status", sortable: true, kenben: true},
  { key: "account_name", show: false, label: "Company Master", sortable: false, kenben: false},
  { key: "close_date", show: true, label: "Close Date", sortable: true, kenben: false},
  { key: "stage_duration", show: true, label: "Stage", sortable: true, kenben: false},
  { key: "amount", show: true, label: "Amount", sortable: true, kenben: true},
  { key: "probability", show: true, label: "Probability (%)", sortable: true, kenben: true},
  { key: "type", show: true, label: "Type", sortable: true, kenben: true},
  { key: "lead_source", show: true, label: "Lead Source", sortable: false, kenben: true},
  { key: "next_step", show: false, label: "Next Step", sortable: false, kenben: false},
  { key: "owner_name", show: false, label: "Owner", sortable: false, kenben: false},
  { key: "description", show: false, label: "Description", sortable: false, kenben: false},
  { key: "forecast_category", show: false, label: "Forecast Category", sortable: false, kenben: false},
  { key: "country", show: false, label: "Country", sortable: true, kenben: false},
  { key: "is_closed", show: false, label: "Is Closed", sortable: false, kenben: false},
  { key: "is_won", show: false, label: "Is Won", sortable: false, kenben: false},
  { key: "createdby", show: false, label: "Created By", sortable: false, kenben: false},
  { key: "createddate", show: false, label: "Created Date", sortable: true, kenben: false},
  { key: "lastmodifiedby", show: false, label: "Last Modified By", sortable: false, kenben: false},
  { key: "lastmodifieddate", show: false, label: "Last Modified Date", sortable: true, kenben: false }
];

const kenbenHeaders = tableHeaders.filter(header => header.kenben);


  useEffect(() => {
    fetchOpportunity();
    setRefreshTable(false);
  }, [showModal, refreshTable, navigate]);

  const fetchOpportunity = async () => {
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
    const oppResponse = await uvCapitalApi.getListOfOpportunity();
    if (oppResponse.success) {
      const updatedOpp = oppResponse.data.map((opp) => ({
        ...opp,
        owner_name: usersMap[opp.owner_id] || "",
        createdby: usersMap[opp.createdbyid] || "",
        lastmodifiedby: usersMap[opp.lastmodifiedbyid] || "",
        account_name: accountsMap[opp.account_id] || "",
      }));
      setOppData(updatedOpp);
    } else {
      setOppData([]);
    }
    setLoading(false);
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };
  const { setSearchText, sortConfig, toggleSort, filteredData } =
    useSortableSearchableData(oppData);

  const confirmDeleteOpportunity = (id) => {
    setOpportunityToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!opportunityToDelete) return;
    try {
      const res = await uvCapitalApi.deleteOpportunity(opportunityToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchOpportunity();
      } else {
        toast.error("Failed to delete opportunity.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setOpportunityToDelete(null);
    }
  };

  return (
    <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Opportunity"} icon={<FaCrown />} />
        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
           {systemSetting && <TwoStageToggle 
            setCurrentState={setCurrentViewState}
            currentState={currentViewStage}
            />}
            {permissions?.opportunity?.create && (
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={handleOpen}
              >
                Add New Opportunity
              </button>
            )}
            {permissions?.opportunity?.owner && (
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
                type="Opportunity"
                onSelectRows={handleSelectedRows}
                onDelete={confirmDeleteOpportunity}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                permission={permissions?.opportunity}
              />)
            :
            (<KenbenView data={filteredData} permission={permissions?.opportunity} headers={kenbenHeaders} type="Opportunity" onDelete={confirmDeleteOpportunity} setRefreshTable={setRefreshTable} />)}
            </Container>
           <OpportunityModal
              show={showModal}
              onHide={handleClose}
              setRefreshTable={setRefreshTable}
            />
            <ChangeOwnerModal
              selectedRows={selectedRows}
              show={showOwnerModal}
              onHide={handleOwnerClose}
              type="deal"
              setRefreshTable={setRefreshTable}
            />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Opportunity"
              message="Are you sure you want to delete this Opportunity?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
        ) : (
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.opportunity}
            type="Opportunity"
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

export default OpportunityDashboard
