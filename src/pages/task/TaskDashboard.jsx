import React, { Fragment, useEffect, useState } from "react";
import ModuleHeader from "../../components/ModuleHeader";
import { Container } from "react-bootstrap";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import TaskModal from "./TaskModal";
import ChangeOwnerModal from "../../components/ChangeOwnerModal";
import uvCapitalApi from "../../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import { FaTasks } from "react-icons/fa";
import DetailPage from "../../components/DetailPage";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import TwoStageToggle from "../../components/TwoStageToggle";
import KenbenView from "../../components/KenbenView";

const TaskDashboard = () => {

  const navigate = useNavigate();
  const [taskDetails, setTaskDetails] = useState();
  const [showModal, setShowModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { permissions, settingPermissions } = useAuthWrapper();
  const [currentViewStage, setCurrentViewState] = useState(0);
  const [systemSetting, setSystemSetting] = useState();

  useEffect(() => {
  if (settingPermissions) {
      const kenbanSettings = settingPermissions["Ken-ban View Setting"];
      const setting = kenbanSettings?.find(
      item => item.module_id === permissions?.task?.id
      );
      setSystemSetting(setting?.is_activate);
  }
  }, [settingPermissions, permissions?.task?.id]);

  useEffect(() => {
    fetchLead();
    setRefreshTable(false);
  }, [showModal, refreshTable, navigate]);

  const fetchLead = async () => {
    const userResponse = await uvCapitalApi.getListOfUsers();
    const usersMap = {};
    if (userResponse.success) {
      userResponse.data.forEach((user) => {
        usersMap[user.id] = user.name;
      });
    }
    const contactResponse = await uvCapitalApi.getListOfTasks();
    if (contactResponse.success) {
      const updatedContacts = contactResponse.data.map((contact) => ({
        ...contact,
        owner_name: usersMap[contact.owner_id] || "",
        createdby: usersMap[contact.createdbyid] || "",
        lastmodifiedby: usersMap[contact.lastmodifiedbyid] || "",
      }));
      setTaskDetails(updatedContacts);
    } else {
      setTaskDetails([]);
    }
  };

  const tableHeaders = [
    { key: "name", show: true, label: "Name", sortable: true, kenben: true },
    { key: "task_amount", show: true, label: "Amount", kenben: true },
    { key: "status", show: true, label: "Status" },
    { key: "proposal_id", show: false, label: "Proposal" },
    { key: "estimated_time", show: true, label: "Estimated Time" },
    { key: "start_date", show: true, label: "Start Date", sortable: true, kenben: true},
    { key: "end_date", show: true, label: "End Date", sortable: true, kenben: true },
    { key: "priority", show: true, label: "Priority", sortable: true, kenben: true },
    { key: "owner_name", show: true, label: "Owner", sortable: true },
    { key: "description", show: false, label: "Description", sortable: true },
  ];

   const kenbanHeaders = tableHeaders.filter(header => header.kenben);

  const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(taskDetails);

  // const handleNameClick = (row) => {
  //   navigate(`/tasks/view/${row.id}`, { state: { rowData: row } });
  // };
  const handleNameClick = (row) => {
    navigate(`/tasks/view/${row.id}`, {
      state: { type: "tasks", rowData: row }
    });
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const confirmDeleteTask = (id) => {
    setTaskToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await uvCapitalApi.deleteTaskById(taskToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchLead();
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setTaskToDelete(null);
    }
  };

  return (
    <Fragment>
      <ModuleHeader header={"Tasks"} icon={<FaTasks />} />

      {
        !location.pathname.includes('view') &&
        <Container className="d-flex justify-content-end">
          {systemSetting && <TwoStageToggle 
            setCurrentState={setCurrentViewState}
            currentState={currentViewStage}
            />}
          <button className="btn created-record-btn mx-2 rounded-3 border-0" onClick={handleOpen}>Add Task Proposal</button>
          {permissions?.task?.owner && <button className="btn change-owner-btn mx-2 rounded-3 border-0" onClick={handleOwnerOpen}>Change Owner</button>}
        </Container>
      }

      {
        !location.pathname.includes('view') ?
          <Container>
            <Container className="px-3 px-md-4 mt-2">
              {currentViewStage == 0 ? (<DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                handleNameClick={handleNameClick}
                onSearchChange={setSearchText}
                type="Tasks"
                onSelectRows={handleSelectedRows}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                onDelete={confirmDeleteTask}
                permission={permissions?.task}
              /> 
            ) : (
              <KenbenView data={filteredData} permission={permissions?.contact} headers={kenbanHeaders} type="Tasks" onDelete={confirmDeleteTask} setRefreshTable={setRefreshTable}/>
            )}
            </Container>
            <TaskModal show={showModal} onHide={handleClose} setRefreshTable={setRefreshTable} />
            <ChangeOwnerModal selectedRows={selectedRows} show={showOwnerModal} onHide={handleOwnerClose} setRefreshTable={setRefreshTable} type="task" />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Task"
              message="Are you sure you want to delete this Task?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
          : <DetailPage refreshTable={refreshTable} setRefreshTable={setRefreshTable} permission={permissions?.task} type="Task" />
      }
    </Fragment>
  );
};

export default TaskDashboard;
