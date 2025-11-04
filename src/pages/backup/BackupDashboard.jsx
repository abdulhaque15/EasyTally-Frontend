import React, { Fragment, useEffect, useState } from 'react';
import ModuleHeader from '../../components/ModuleHeader';
import { toast } from 'react-toastify';
import { useAuthWrapper } from "../../helper/AuthWrapper";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import DataTable from '../../components/DataTable';
import uvCapitalApi from '../../api/uvCapitalApi';
import { Container } from 'react-bootstrap';

const BackupDashboard = () => {
  const [loading, setLoading] = useState(false);
const { permissions } = useAuthWrapper();
const [backupDetails, setBackupDetails] = useState();
const [refreshTable, setRefreshTable] = useState(false);

const handleBackup = async () => {
  try {
    setLoading(true);
    const response = await uvCapitalApi.generateBackup();

    if (response && response?.data) {
      const blob = new Blob([response?.data], { type: 'application/sql' });
      const disposition = response?.headers['content-disposition'];
      const match = disposition && disposition.match(/filename="?(.+?)"?$/);
      const filename = match ? match[1] : 'backup.sql';

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Backup downloaded successfully.");
    } else {
      toast.error("Failed to generate backup.");
    }
  } catch (error) {
    console.error("backup-error", error);
    toast.error("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  const tableHeaders = [
    { key: "name", show: true, label: "Name", sortable: true },
    { key: "createddate", show: true, label: "Date" },
    { key: "createdbyid", show: true, label: "Created by" },
  ];

    const { setSearchText, sortConfig, toggleSort, filteredData } =
      useSortableSearchableData(backupDetails);

    useEffect(() => {
        fatchBackupData();
    }, [refreshTable])
  
    const fatchBackupData = async () => {
      let response = await uvCapitalApi.getListOfBackup();
        if (response.success) {
          setBackupDetails(response.data);
        } else {
          setBackupDetails([]);
        }
    }

  return (
     <Fragment>
      <div style={{ position: "relative" }}>
        <ModuleHeader header={"Backup"} />
        {!location.pathname.includes("view") && (
          <Container className="d-flex justify-content-end">
              <button
                className="btn created-record-btn mx-2 rounded-3 border-0"
                onClick={handleBackup}
              >
                {loading ? "Creating Backup..." : "Create Backup"}
              </button>
          </Container>
        )}

          <Container>
            <Container className="px-3 px-md-4 mt-2">
              <DataTable
                tableHeaders={tableHeaders}
                tableData={filteredData}
                sortConfig={sortConfig}
                toggleSort={toggleSort}
                onSearchChange={setSearchText}
                type="Backup"
                permission={permissions?.backup}
                setRefreshTable={setRefreshTable}
              />
            </Container>
           
          </Container>
     
      </div>
    </Fragment>
  );
};

export default BackupDashboard;
