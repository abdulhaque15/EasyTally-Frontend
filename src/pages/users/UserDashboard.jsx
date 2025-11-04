import { Fragment, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import { useSortableSearchableData } from "../../helper/GlobalHelper"
import ModuleHeader from "../../components/ModuleHeader";
import ChangeOwnerModal from "../../components/ChangeOwnerModal";
import UserModal from "./UserModal";
import uvCapitalApi from "../../api/uvCapitalApi";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import DetailPage from "../../components/DetailPage";
import { FaUser } from "react-icons/fa";
import TwoStageToggle from "../../components/TwoStageToggle";
import KenbenView from "../../components/KenbenView";

const UserDashboard = () => {
  const [userDetails, setUserDetails] = useState();
  const {
    setSearchText,
    sortConfig,
    toggleSort,
    filteredData,
  } = useSortableSearchableData(userDetails);

  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const { permissions, fetchPermissions, settingPermissions } = useAuthWrapper();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [refreshTable, setRefreshTable] = useState(false);
  const [currentViewStage, setCurrentViewState] = useState(0);  
  const [systemSetting, setSystemSetting] = useState();

useEffect(() => {
  if (settingPermissions) {
    const kenbanSettings = settingPermissions["Ken-ban View Setting"];
    const setting = kenbanSettings?.find(
      item => item.module_id === permissions?.user_management?.id
    );
    setSystemSetting(setting?.is_activate);
  }
}, [settingPermissions, permissions?.user_management?.id]);

  const handleNameClick = (row) => {
    navigate(`/users/view/${row.id}`, {
      state: { type: "users", rowData: row }
    });
  };

  const tableHeaders = [
    { key: "name", label: "Name", show: true, sortable: true, kenben: true },
    { key: "email", label: "Email", show: true, sortable: true, kenben: true },
    { key: "status", label: "Is Status", show: true, sortable: true },
    { key: "role_name", label: "Role Name", show: true, sortable: true, kenben: true },
    { key: "group_name", label: "Group", show: true, sortable: true, kenben: true },
  ];

  const kenbanHeaders = tableHeaders.filter(header => header.kenben);

  const fetchUsers = async () => {
    try {
      const [userRes, groupRes] = await Promise.all([
        uvCapitalApi.getListOfUsers(),
        uvCapitalApi.getListOfPermissions(),
      ]);

      if (userRes.success && groupRes.success) {
        const enrichedUsers = userRes.data.map(user => {
          const groupObj = groupRes.data.find(g => g.id === user.group_id);
          return {
            ...user,
            group_name: groupObj?.name || "",
          };
        });
        setUserDetails(enrichedUsers);
      } else {
        setUserDetails([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUserDetails([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    setRefreshTable(false);
  }, [showModal, refreshTable, navigate]);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const confirmDeleteUser = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmedDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await uvCapitalApi.deleteUserById(userToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchUsers();
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  /**
   * @Description : This method handle System Admin login as user
   */
  const handleLoginAsUser = async (user_id) => {
    try {
      const response = await uvCapitalApi.loginAsUser(user_id);
      console.log('response login as user :', response);
      localStorage.removeItem('token');
      // const t = localStorage.getItem('token');
      // console.log('token after remove', t);
      localStorage.setItem('token', response?.data?.token);
      // const T = localStorage.getItem('token');
      // console.log('token after set', T);
      await fetchPermissions();
      navigate('/');
    } catch (error) {
      console.log('server error login as user :', error);
    }
  }

  return (
    <Fragment>
      <ModuleHeader header={"Users"} icon={<FaUser />} />
      {
        !location.pathname.includes('view') &&
        <Container className="d-flex justify-content-end">
          {systemSetting && 
          <TwoStageToggle
            setCurrentState={setCurrentViewState}
            currentState={currentViewStage}
          />}
          {permissions?.user_management?.create && (<button className="btn created-record-btn mx-2 rounded-3 border-0" onClick={handleOpen}>Add New User</button>)}
          {permissions?.user_management?.owner && (<button className="btn change-owner-btn mx-2 rounded-3 border-0" onClick={handleOwnerOpen}>Change Owner</button>)}
        </Container>
      }
      {
        !location.pathname.includes('view') ?
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
                type="Users"
                onSelectRows={handleSelectedRows}
                onDelete={confirmDeleteUser}
                permission={permissions?.user_management}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                onLoginAsUser={handleLoginAsUser}
              />
               ) : (
              <KenbenView data={filteredData} permission={permissions?.user_management} headers={kenbanHeaders} type="Users" onDelete={confirmDeleteUser} setRefreshTable={setRefreshTable}/>
             )}
            </Container>
            <UserModal show={showModal} onHide={handleClose} setRefreshTable={setRefreshTable} />
            <ChangeOwnerModal selectedRows={selectedRows} show={showOwnerModal} onHide={handleOwnerClose} type="user" setRefreshTable={setRefreshTable}/>
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete User"
              message="Are you sure you want to delete this User?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
          :
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.user_management}
            type="User"
          />
      }
    </Fragment>
  );
};

export default UserDashboard