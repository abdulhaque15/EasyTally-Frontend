import { Container } from "react-bootstrap";
import ModuleHeader from "../../components/ModuleHeader";
import { FaProductHunt } from "react-icons/fa6";
import TwoStageToggle from "../../components/TwoStageToggle";
import { Fragment, useEffect, useState } from "react";
import uvCapitalApi from "../../api/uvCapitalApi";
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import KenbenView from "../../components/KenbenView";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import DetailPage from "../../components/DetailPage";
import { Oval } from "react-loader-spinner";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";
import ProductModal from "./ProductModal";

const ProductDashboard = () => {
    const navigate = useNavigate();
    const { permissions, userList, settingPermissions } = useAuthWrapper();
    const [listOfProducts, setListOfProducts] = useState();
    const [showModal, setShowModal] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);
    const [currentViewStage, setCurrentViewState] = useState(0);
    const [productToDelete, setProductToDelete] = useState();
    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [systemSetting, setSystemSetting] = useState();

    useEffect(() => {
    if (settingPermissions) {
        const kenbanSettings = settingPermissions["Ken-ban View Setting"];
        const setting = kenbanSettings?.find(
        item => item.module_id === permissions?.product?.id
        );
        setSystemSetting(setting?.is_activate);
    }
    }, [settingPermissions, permissions?.product?.id]);

    const handleNameClick = (row) => {
        navigate(`/product_master/view/${row.id}`, {
            state: { type: "product_master", rowData: row }
        });
    };

    useEffect(() => {
        getListOfProducts();
        setRefreshTable(false);
    }, [showModal, refreshTable, navigate])

    const getListOfProducts = async () => {
    setLoading(true);
    const usersMap = {};
    userList?.forEach((user) => {
        usersMap[user.id] = user.name;
    });
    const categoryResponse = await uvCapitalApi.getListOfCategories();
        const categoryMap = {};
        if (categoryResponse.success) {
            categoryResponse.data.forEach((category) => {
            categoryMap[category.id] = category.name;
            });
        }
    const produchResponse = await uvCapitalApi.getListOfProducts();
    if (produchResponse.success) {
        const updatedOpp = produchResponse.data.map((product) => ({
        ...product,
        owner_name: usersMap[product.owner_id] || "",
        createdby: usersMap[product.createdbyid] || "",
        lastmodifiedby: usersMap[product.lastmodifiedbyid] || "",
        category_name: categoryMap[product.category_id] || "",
        }));
        setListOfProducts(updatedOpp);
    } else {
        setListOfProducts([]);
    }
    setLoading(false);
    };

    const productTableHeaders = [
        { key: "name", show: true, label: "Product Name", sortable: true, kenben: true },
        { key: "category_name", show: true, label: "Category", sortable: true, kenben: true },
        { key: "size", show: true, label: "Size", sortable: true, kenben: true },
        { key: "unit", show: true, label: "Unit", sortable: true, kenben: true },
        { key: "description", show: false, label: "Description", sortable: false, kenben: true },
        { key: "product_code", show: true, label: "Product Code", sortable: true, kenben: true },
        { key: "is_tax_inclusive", show: false, label: "Tax Inclusive", sortable: false, kenben: true },
        { key: "tax", show: false, label: "Tax (%)", sortable: true, kenben: true },
        { key: "tax_type", show: false, label: "Tax Type", sortable: false, kenben: true },
        { key: "actual_price", show: true, label: "Actual Price", sortable: true, kenben: true },
        { key: "selling_price", show: true, label: "Selling Price", sortable: true, kenben: true },
        { key: "status", show: true, label: "Status", sortable: true, kenben: true },
        { key: "image_url", show: false, label: "Image", sortable: false, kenben: false },
        { key: "expiry_date", show: true, label: "Expiry Date", sortable: true, kenben: false },
        { key: "is_featured", show: false, label: "Featured", sortable: false, kenben: false },
        { key: "createddate", show: false, label: "Created Date", sortable: true, kenben: false },
        { key: "createdby", show: false, label: "Created By", sortable: false, kenben: false },
        { key: "lastmodifieddate", show: false, label: "Last Modified Date", sortable: true, kenben: false },
        { key: "lastmodifiedby", show: false, label: "Last Modified By", sortable: false, kenben: false }
    ];

    const kenbenHeaders = productTableHeaders.filter(header => header.kenben);

    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(listOfProducts);

    const confirmDeleteProduct = (id) => {
        setProductToDelete(id);
        setShowConfirmModal(true);
    }

      const handleConfirmedDelete = async () => {
        if (!productToDelete) return;
        try {
          const res = await uvCapitalApi.deleteProduct(productToDelete);
          if (res.success) {
            toast.success(res?.message);
            getListOfProducts();
          } else {
            toast.error("Failed to delete product.");
          }
        } catch (err) {
          console.error(err);
          toast.error("An error occurred.");
        } finally {
          setShowConfirmModal(false);
          setProductToDelete(null);
        }
      };

    return (
        <Fragment>
            <div style={{ position: "relative" }}>
                <ModuleHeader header={"Product Master"} icon={<FaProductHunt />} />
                {!location.pathname.includes("view") && (
                    <Container className="d-flex justify-content-end">
                       {systemSetting && <TwoStageToggle
                            setCurrentState={setCurrentViewState}
                            currentState={currentViewStage}
                        />}
                        {permissions?.product?.create && (
                            <button
                                className="btn created-record-btn mx-2 rounded-3 border-0"
                                onClick={handleOpen}
                            >
                                Add New Product
                            </button>
                        )}
                    </Container>
                )}
                {!location.pathname.includes("view") ? (
                    <Container>
                        <Container className="px-3 px-md-4 mt-2">
                            {currentViewStage == 0 ? (
                                <DataTable
                                    tableHeaders={productTableHeaders}
                                    tableData={filteredData}
                                    sortConfig={sortConfig}
                                    toggleSort={toggleSort}
                                    handleNameClick={handleNameClick}
                                    onSearchChange={setSearchText}
                                    type="Product"
                                    onDelete={confirmDeleteProduct}
                                    setRefreshTable={setRefreshTable}
                                    refreshTable={refreshTable}
                                    permission={permissions?.product}
                                />
                            ) : (
                                <KenbenView data={filteredData} permission={permissions?.product} headers={kenbenHeaders} type="Product" onDelete={confirmDeleteProduct} setRefreshTable={setRefreshTable} />
                            )}
                        </Container>
                        <ProductModal
                            show={showModal}
                            onHide={handleClose}
                            setRefreshTable={setRefreshTable}
                        />
                        <ConfirmationModal
                            show={showConfirmModal}
                            onHide={() => setShowConfirmModal(false)}
                            onConfirm={handleConfirmedDelete}
                            title="Delete Product"
                            message="Are you sure you want to delete this Product?"
                            confirmText="Delete"
                            cancelText="Cancel"
                            />
                    </Container>
                ) : (
                    <DetailPage
                        refreshTable={refreshTable}
                        setRefreshTable={setRefreshTable}
                        permission={permissions?.product}
                        type="Product"
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

export default ProductDashboard;
