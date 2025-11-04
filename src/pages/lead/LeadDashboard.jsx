import { Container, Button } from "react-bootstrap";
import { Fragment, useEffect, useState } from "react";
import ModuleHeader from "../../components/ModuleHeader";
import DataTable from "../../components/DataTable";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import LeadModal from "./LeadModal";
import { Outlet, useNavigate } from "react-router-dom";
import DetailPage from "../../components/DetailPage";
import uvCapitalApi from "../../api/uvCapitalApi";
import ChangeOwnerModal from "../../components/ChangeOwnerModal";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import { tableHeaders } from "../../helper/Constraints";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { FaInfoCircle } from "react-icons/fa";
import TwoStageToggle from "../../components/TwoStageToggle";
import KenbenView from "../../components/KenbenView";
import { Oval } from "react-loader-spinner";

const LeadDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [leadDetails, setLeadDetails] = useState();
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [formMode, setFormMode] = useState("edit");
  const [refreshTable, setRefreshTable] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(leadDetails);
  const [currentViewStage, setCurrentViewState] = useState(0);
  const { permissions, settingPermissions } = useAuthWrapper();
  const [systemSetting, setSystemSetting] = useState();
  const [refreshDetail, setRefreshDetail] = useState(false);

   const kenbanHeaders = tableHeaders.filter(header => header.kenben);

  useEffect(() => {
  if (settingPermissions) {
      const kenbanSettings = settingPermissions["Ken-ban View Setting"];
      const setting = kenbanSettings?.find(
      item => item.module_id === permissions?.lead?.id
      );
      setSystemSetting(setting?.is_activate);
  }
  }, [settingPermissions, permissions?.lead?.id]);

  const fetchLeads = async () => {
    setLoading(true);
    const userResponse = await uvCapitalApi.getListOfUsers();
    const usersMap = {};
    if (userResponse.success) {
      userResponse.data.forEach((user) => {
        usersMap[user.id] = user.name;
      });
    }

    const leadResponse = await uvCapitalApi.getListOfLeads();
    if (leadResponse.success) {
      const updatedLead = leadResponse?.data?.map((lead) => ({
        ...lead,
        owner_name: usersMap[lead?.owner_id] || "",
        createdby: usersMap[lead?.createdbyid] || "",
        lastmodifiedby: usersMap[lead?.lastmodifiedbyid] || "",
      }));
      setLeadDetails(updatedLead);
    } else {
      setLeadDetails([]);
    }
    setLoading(false);
  };

  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);
  const handleSelectedRows = (rows) => setSelectedRows(rows);
  const handleClose = () => setShowModal(false);



  const handleNameClick = (row) => {
    navigate(`/lead/view/${row.id}`, {
      state: { type: "Lead", rowData: row }
    });
  };

  const handleOpen = (mode) => {
    setFormMode(mode), setShowModal(true);
  };


  const confirmDeleteLead = (id) => {
    setLeadToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!leadToDelete) return;
    try {
      const res = await uvCapitalApi.deleteLead(leadToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchLeads();
      } else {
        toast.error("Failed to delete lead.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setLeadToDelete(null);
    }
  };

  useEffect(() => {
    fetchLeads();
    setRefreshTable(false);
  }, [showModal, refreshTable, navigate]);

  return (
    <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Lead"} refreshDetail={refreshDetail} setRefreshDetail={setRefreshDetail} icon={<FaInfoCircle />} />
        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
            {systemSetting && <TwoStageToggle 
              setCurrentState={setCurrentViewState}
              currentState={currentViewStage}
              />}
            {permissions?.lead?.create && (
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={() => handleOpen("create")}
              >
                Add New Lead
              </button>
            )}
            {permissions?.lead?.owner && (
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
              {currentViewStage == 0 ? (
                <DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                handleNameClick={handleNameClick}
                onSearchChange={setSearchText}
                type="Lead"
                onSelectRows={handleSelectedRows}
                setRefreshTable={setRefreshTable}
                onDelete={confirmDeleteLead}
                refreshTable={refreshTable}
                permission={permissions?.lead}
              />
              ) : (
                <KenbenView data={filteredData} permission={permissions?.contact} headers={kenbanHeaders} type="Lead" onDelete={confirmDeleteLead} setRefreshTable={setRefreshTable}/>
              )}
            </Container>

            <LeadModal
              show={showModal}
              onHide={handleClose}
              mode={formMode}
              setRefreshTable={setRefreshTable}
            />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Lead"
              message="Are you sure you want to delete this lead ?"
              confirmText="Delete"
              cancelText="Cancel"
            />
            <Outlet />
          </Container>
        ) : (
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.lead}
            type="Lead"
            refreshDetail={refreshDetail} 
          />
        )}
        <ChangeOwnerModal
          selectedRows={selectedRows}
          show={showOwnerModal}
          onHide={handleOwnerClose}
          type="lead"
          setSelectedRows={setSelectedRows}
          setRefreshTable={setRefreshTable}
        />
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

export default LeadDashboard;