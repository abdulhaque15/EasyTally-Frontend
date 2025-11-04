import React, { Fragment, useEffect, useState } from "react";
import ModuleHeader from "../../components/ModuleHeader";
import { Container } from "react-bootstrap";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import PermissionModal from "./PermissionModal";
import PermissionDetail from "./PermissionDetail";
import uvCapitalApi from "../../api/uvCapitalApi";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { FaBan } from "react-icons/fa";
import ConfirmationModal from "../../components/ConfirmationModal";
import toast  from 'react-hot-toast';

const PermissionDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [permissionDetails, setPermissionDetails] = useState();
  const [refreshTable, setRefreshTable] = useState(false);
  const { permissions } = useAuthWrapper();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState(null);
  
  useEffect(() => {
      fatchPermission();
      setRefreshTable(false);
  }, [showModal, refreshTable, navigate])

const fatchPermission = async () => {
  let response = await uvCapitalApi.getListOfUsersWithPermissions();

  if (response.success) {
    const formattedData = response.data.map(item => ({
      ...item,
      status: item.status ? 'Active' : 'Inactive',
    }));
    setPermissionDetails(formattedData);
  } else {
    setPermissionDetails([]);
  }
};

  const tableHeaders = [
    { key: "name", show: true, label: "Group Name", sortable: true },
    { key: "total_members", show: true, label: "Total Members" },
    { key: "status", show: true, label: "Status" },
    { key: "description", show: false, label: "Description", sortable: true },
  ];

  const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(permissionDetails);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

 const handleNameClick = (row) => {
  console.log('row' , row)
    navigate(`/permissions/view/${row.id}`, { state: { rowData: row } });
  };
  
    const confirmDeletePermission = (id) => {
      setPermissionToDelete(id);
      setShowConfirmModal(true);
    };
  
    const handleConfirmedDelete = async () => {
      if (!permissionToDelete) return;
      try {
        const res = await uvCapitalApi.deletePermissions(permissionToDelete);
        if (res.success) {
          toast.success(res?.message);
          fatchPermission();
        } else {
          toast.error("Failed to delete Permission.");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred.");
      } finally {
        setShowConfirmModal(false);
        setPermissionToDelete(null);
      }
    };

  return (
    <Fragment>
      <ModuleHeader header={"Group Permission"} icon={<FaBan />} />

      {!location.pathname.includes("view") && (
        <Container className="d-flex justify-content-end">
          <button
            className="btn created-record-btn mx-2 rounded-3 border-0"
            onClick={handleOpen}
          >
            Add New Group
          </button>
        </Container>
      )}

      {
        !location.pathname.includes("view") ? (
          <Container>
            <Container className="px-3 px-md-4 mt-2">
              <DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                handleNameClick={handleNameClick}
                onSearchChange={setSearchText}
                type="Permission"
                onDelete={confirmDeletePermission}
                setRefreshTable={setRefreshTable}
                permission={permissions?.permissions}
              />
            </Container>
            <PermissionModal show={showModal} onHide={handleClose} setRefreshTable={setRefreshTable}/>
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Permission"
              message="Are you sure you want to delete this permission?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
        ) : (
          <PermissionDetail refreshTable={refreshTable} setRefreshTable={setRefreshTable} permission={permissions?.permissions}/>
        )

      }
    </Fragment>
  );
};

export default PermissionDashboard;