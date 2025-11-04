import React, { Fragment, useEffect, useState } from 'react'
import uvCapitalApi from '../../api/uvCapitalApi'
import ModuleHeader from '../../components/ModuleHeader';
import { BiSolidCategoryAlt } from "react-icons/bi";
import { Container } from 'react-bootstrap';
import DataTable from '../../components/DataTable';
import { useAuthWrapper } from '../../helper/AuthWrapper';
import { useSortableSearchableData } from '../../helper/GlobalHelper';
import CategoryModal from './CategoryModal ';
import DetailPage from '../../components/DetailPage';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Oval } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import TwoStageToggle from '../../components/TwoStageToggle';
import KenbenView from '../../components/KenbenView';

const CategoryDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [listOfCategory, setListOfCategory] = useState();
    const [showModal, setShowModal] = useState(false);
    const { permissions, settingPermissions } = useAuthWrapper();
    const [refreshTable, setRefreshTable] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const navigate = useNavigate();
    const [currentViewStage, setCurrentViewState] = useState(0);
    const [systemSetting, setSystemSetting] = useState();

    useEffect(() => {
    if (settingPermissions) {
        const kenbanSettings = settingPermissions["Ken-ban View Setting"];
        const setting = kenbanSettings?.find(
        item => item.module_id === permissions?.category?.id
        );
        setSystemSetting(setting?.is_activate);
    }
    }, [settingPermissions, permissions?.category?.id]);

    const getAllProductCategories = async () => {
        setLoading(true);
        const response = await uvCapitalApi.getListOfCategories();
        if (response?.data) setListOfCategory(response?.data);
        else setListOfCategory([])
        setLoading(false);
    }
    useEffect(() => {
        setRefreshTable(false);
        getAllProductCategories();
    }, [showModal, refreshTable])

    const handleNameClick = (row) => {
        navigate(`/category_master/view/${row.id}`, {
            state: { type: "category", rowData: row }
        });
    };

    const confirmDeleteCategory = (id) => {
        setCategoryToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmedDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const res = await uvCapitalApi.deleteCategory(categoryToDelete);
            if (res.success) {
                toast.success(res?.message);
                getAllProductCategories();
            } else {
                toast.error("Failed to delete Category.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        } finally {
            setShowConfirmModal(false);
            setCategoryToDelete(null);
        }
    };

    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(listOfCategory);

    const tableHeaders = [
        { key: "name", show: true, label: "Category Name", sortable: true, kenben: true },
        { key: "description", show: true, label: "Description", sortable: false, kenben: true },
        { key: "status", show: true, label: "Status", sortable: true },
        { key: "createddate", show: false, label: "Created Date", sortable: true, kenben: true },
        { key: "lastmodifieddate", show: false, label: "Last Modified Date", sortable: true },
        { key: "createdbyid", show: false, label: "Created By", sortable: false },
        { key: "lastmodifiedbyid", show: false, label: "Last Modified By", sortable: false }
    ];

     const kenbanHeaders = tableHeaders.filter(header => header.kenben);

    return (
        <Fragment>
            <div style={{ position: "relative" }}>
                <ModuleHeader header={"Category Master"} icon={<BiSolidCategoryAlt />} />

                {!location.pathname.includes("view") && (
                    <Container className="d-flex justify-content-end">
                        {systemSetting && <TwoStageToggle 
                            setCurrentState={setCurrentViewState}
                            currentState={currentViewStage}
                            />}
                        {permissions?.category?.create && (
                            <button
                                className="btn created-record-btn mx-2 rounded-3 border-0"
                                onClick={handleOpen}
                            >
                                Add New Category
                            </button>
                        )}
                    </Container>
                )}

                {!location.pathname.includes("view") ? (
                    <Container>
                        <Container className="px-3 px-md-4 mt-2">
                            {currentViewStage == 0 ? (<DataTable
                                tableHeaders={tableHeaders}
                                tableData={filteredData}
                                sortConfig={sortConfig}
                                toggleSort={toggleSort}
                                handleNameClick={handleNameClick}
                                onSearchChange={setSearchText}
                                type="Category"
                                onDelete={confirmDeleteCategory}
                                setRefreshTable={setRefreshTable}
                                refreshTable={refreshTable}
                                permission={permissions?.category}
                            />
                            ) : (
                            <KenbenView data={filteredData} permission={permissions?.contact} headers={kenbanHeaders} type="Category" onDelete={confirmDeleteCategory} setRefreshTable={setRefreshTable}/>
                            )}
                        </Container>
                        <CategoryModal
                            show={showModal}
                            onHide={handleClose}
                            setRefreshTable={setRefreshTable}
                        />
                        <ConfirmationModal
                            show={showConfirmModal}
                            onHide={() => setShowConfirmModal(false)}
                            onConfirm={handleConfirmedDelete}
                            title="Delete Category"
                            message="Are you sure you want to delete this Category?"
                            confirmText="Delete"
                            cancelText="Cancel"
                        />
                    </Container>
                ) : (
                    <DetailPage
                        refreshTable={refreshTable}
                        setRefreshTable={setRefreshTable}
                        permission={permissions?.category}
                        type="Category"
                    />)}
                {loading && (
                    <div className="overlay-loader">
                        <Oval
                            visible={true}
                            height={80}
                            width={80}
                            color="var(--secondary-color)"
                            secondaryColor="var(--primary-color)"
                            ariaLabel="oval-loading"
                        />
                    </div>
                )}
                <CategoryModal show={showModal} onHide={handleClose} />
            </div>
        </Fragment>
    )
}

export default CategoryDashboard