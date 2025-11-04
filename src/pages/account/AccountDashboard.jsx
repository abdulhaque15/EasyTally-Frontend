import { Fragment, useEffect, useState } from "react";
import { Container, ToggleButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AccountModal from "./AccountModal";
import DataTable from "../../components/DataTable";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import ChangeOwnerModal from "../../components/ChangeOwnerModal";
import DetailPage from "../../components/DetailPage";
import uvCapitalApi from "../../api/uvCapitalApi";
import { Oval } from "react-loader-spinner";
import ModuleHeader from "../../components/ModuleHeader";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaInfoCircle } from "react-icons/fa";

const AccountDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState();
  const [refreshTable, setRefreshTable] = useState(false);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const { permissions, userList } = useAuthWrapper();
  // const [currentViewStage, setCurrentViewState] = useState(0);

  const handleNameClick = (row) => {
    navigate(`/account/view/${row.id}`, {
      state: { type: "account_master", rowData: row }
    });
  };

  const tableHeaders = [
    { key: "name", show: true, label: "Name", sortable: true },
    { key: "organization_name", show: true, label: "Organization Name", sortable: true },
    { key: "gst_details", show: true, label: "GST Details", sortable: true },
    { key: "cin_no", show: true, label: "CIN No." , sortable: true },
    { key: "currency", show: false, label: "Currency", sortable: true },
    { key: "website", show: false, label: "Website", sortable: true },
    { key: "phone", show: true, label: "Phone", sortable: true },
    { key: "email", show: true, label: "Email", sortable: true },
    { key: "fax", show: false, label: "Fax", sortable: true },
    { key: "type", show: false, label: "Type", sortable: true },
    { key: "description", show: false, label: "Description" },
    { key: "city", show: false, label: "City", sortable: true},
    { key: "country", show: false, label: "Country", sortable: true },
    { key: "createdby", show: false, label: "Created By" },
    { key: "createddate", show: false, label: "Created Date", sortable: true },
    { key: "lastmodifiedby", show: false, label: "Last Modified By" },
    { key: "lastmodifieddate", show: false, label: "Last Modified Date", sortable: true, },
    { key: "owner_name", show: false, label: "Owner", sortable: true },
    { key: "block", show: false, label: "Block", sortable: true},
    { key: "street", show: false, label: "Street" },
    { key: "landmark", show: false, label: "Landmark" },
    { key: "area", show: false, label: "Area" },
    { key: "state", show: false, label: "State" },
    { key: "website", show: false, label: "Website" },
    { key: "zip_code", show: false, label: "ZIP Code" },
  ];

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);

  const handleSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const confirmDeleteAccount = (id) => {
    setAccountToDelete(id);
    setShowConfirmModal(true);
  };

  // const fetchKenBenView = async () => {
  //   try {
  //     const res = await uvCapitalApi.getKenbenViewDetails(permissions?.contact?.id);
  //     console.log(res);
  //   } catch (error) {
  //     console.log("ERRRR : " , error);
  //     toast.error("An error occured");
  //   }
  // }

  const handleConfirmedDelete = async () => {
    if (!accountToDelete) return;
    try {
      const res = await uvCapitalApi.deleteAccount(accountToDelete);
      if (res.success) {
        toast.success(res?.message);
        fetchAccounts();
      } else {
        toast.error("Failed to delete Account.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setShowConfirmModal(false);
      setAccountToDelete(null);
    }
  };

  useEffect(() => {
    fetchAccounts();
    setRefreshTable(false);
    // fetchKenBenView();
  }, [showModal, refreshTable, navigate]);

  const fetchAccounts = async () => {
    setLoading(true);
    const usersMap = {};
    userList?.forEach((user) => {
      usersMap[user.id] = user.name;
    });
    const accountResponse = await uvCapitalApi.getListOfAccounts();
    if (accountResponse.success) {
      const updatedAccount = accountResponse.data.map((account) => ({
        ...account,
        owner_name: usersMap[account.owner_id] || "",
        createdby: usersMap[account.createdbyid] || "",
        lastmodifiedby: usersMap[account.lastmodifiedbyid] || "",
      }));
      setAccountDetails(updatedAccount);
    } else {
      setAccountDetails([]);
    }
    setLoading(false);
  };

  const { setSearchText, sortConfig, toggleSort, filteredData } =
    useSortableSearchableData(accountDetails);

  return (
    <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Account Master"} icon={<HiBuildingOffice2 />} />
        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
            {permissions?.account?.create && (
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={handleOpen}
              >
                Add New Account
              </button>
            )}
            {permissions?.account?.owner && (
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
                type="Account"
                onSelectRows={handleSelectedRows}
                onDelete={confirmDeleteAccount}
                setRefreshTable={setRefreshTable}
                refreshTable={refreshTable}
                permission={permissions?.account}
              />
            </Container>
            <AccountModal
              show={showModal}
              onHide={handleClose}
              setRefreshTable={setRefreshTable}
            />
            <ChangeOwnerModal
              selectedRows={selectedRows}
              show={showOwnerModal}
              onHide={handleOwnerClose}
              type="account"
              setRefreshTable={setRefreshTable}
            />
            <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Account"
              message="Are you sure you want to delete this Account?"
              confirmText="Delete"
              cancelText="Cancel"
            />
          </Container>
        ) : (
          <DetailPage
            refreshTable={refreshTable}
            setRefreshTable={setRefreshTable}
            permission={permissions?.account}
            type="Account"
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
export default AccountDashboard;
