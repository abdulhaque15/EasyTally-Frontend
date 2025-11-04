import uvCapitalApi from '../../api/uvCapitalApi';
import DataTable from "../../components/DataTable";
import Badge from 'react-bootstrap/Badge';
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card, Modal, Table } from "react-bootstrap";
import { BiSolidCategoryAlt,BiShoppingBag, BiSolidCopyAlt, BiSolidBookContent } from "react-icons/bi";
import { useAuthWrapper } from '../../helper/AuthWrapper';
import { useSortableSearchableData } from "../../helper/GlobalHelper";
//import './assets/index.css';

const StockItemDashboard = () => {
    const navigate = useNavigate();
    const [stockItemsData, setStockItemsData] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const { permissions, settingPermissions } = useAuthWrapper();
    const [showFilters, setShowFilters] = useState(false);

    const [units, setUnits] = useState("");
    const [parentGroup, setParentGroup] = useState("");
    const [gstApplicable, setGSTApplicable] = useState("");
    const [isTaxable, setIsTaxable] = useState("");
    const [rateMin, setRateMin] = useState("");
    const [rateMax, setRateMix] = useState("");
    const [filteredResults, setfilteredResults] = useState([]);

    const [inventoryHistoryData, setInventoryHistoryData] = useState([]);
    const [purchaseInventoryHistoryData, setPurchaseInventoryHistoryData] = useState([]);
    const [saleInventoryHistoryData, setSaleInventoryHistoryData] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    
    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(stockItemsData);
    const clearAllFilters = () => {
        setUnits("");
        setParentGroup("");
        setGSTApplicable("");
        setIsTaxable("");
        setRateMin("");
        setRateMix("");
    };

    function additionalFilter(filteredData){
        const unitValue = (units || "").toString().trim().toLowerCase();
        if (unitValue && unitValue.length > 0) {
            filteredData = filteredData.filter((row) =>
            (row?.units__c || "").toString().toLowerCase().includes(unitValue));
        }

        const parentGroupValue = (parentGroup || "").toString().trim().toLowerCase();
        if (parentGroupValue && parentGroupValue.length > 0) {
            filteredData = filteredData.filter((row) =>
                (row?.parent_group__c || "").toString().toLowerCase().includes(parentGroupValue)
            );
        }

        const gstApplicableValue = (gstApplicable || "").toString().trim().toLowerCase();
        if (gstApplicableValue && gstApplicableValue.length > 0) {
            filteredData = filteredData.filter((row) =>
                (row?.gst_applicable__c || "").toString().trim().toLowerCase() === gstApplicableValue
            );
        }

        const isTaxableValue = (isTaxable || "").toString().trim().toLowerCase();
        if (isTaxableValue && isTaxableValue.length > 0) {
            filteredData = filteredData.filter((row) =>
                (row?.is_taxable__c || "").toString().trim().toLowerCase() === isTaxableValue
            );
        }
        const minValue = parseFloat(rateMin);
        const maxValue = parseFloat(rateMax);
        if (!isNaN(minValue) || !isNaN(maxValue)) {
            filteredData = filteredData.filter((row) => {
                const rate = parseFloat(row?.rate__c) || 0;
                if (!isNaN(minValue) && !isNaN(maxValue)) {
                    return rate >= minValue && rate <= maxValue;
                } else if (!isNaN(minValue)) {
                    return rate >= minValue;
                } else if (!isNaN(maxValue)) {
                    return rate <= maxValue;
                }
                return true;
            });
        }   
        return filteredData;
    }

    useEffect(()=>{
        setfilteredResults(additionalFilter(filteredData));
    },[filteredData, units, parentGroup,gstApplicable, isTaxable, rateMin, rateMax]);

    const goToLedgers = () => {
        navigate(`/ledgers`, {
            state: { type: "Ledger" }
        });
    };
    const goToStockItems = () => {
        navigate(`/stockItem`, {
            state: { type: "stockItem" }
        });
    };

    const goToVoucher = () => {
        navigate(`/vouchers`, {
            state: { type: "vouchers" }
        });
    };

    const goToOrder = () => {
        navigate(`/orders`, {
            state: { type: "orders" }
        });
    };

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    useEffect(() => {
        if (settingPermissions) {
            const kenbanSettings = settingPermissions["Ken-ban View Setting"];
            kenbanSettings?.find(
                item => item.module_id === permissions?.stock_items?.id
            );
        }
    }, [settingPermissions, permissions?.stock_items?.id]);

    const tableHeaders = [
        { key: "name", show: true, label: "Name", sortable: true },
        { key: "rate__c", show: true, label: "Rate", sortable: true },
        { key: "units__c", show: true, label: "Units", sortable: true },
        { key: "parent_group__c", show: true, label: "Parent Gropu", sortable: true },
        { key: "gst_applicable__c", show: true, label: "GST Applicable ", sortable: true },
        { key: "is_taxable__c", show: true, label: "Is Taxable", sortable: true },
        { key: "closing_amount__c", show: false, label: "Closing Amount", sortable: true },
        { key: "closing_quantity__c", show: false, label: "Closing Quanitity", sortable: true },
        { key: "gst_applicable_from__c", show: false, label: "GST Applicablen From", sortable: true },
        { key: "legacy_alterid__c", show: false, label: "Legacy Legacy Alterid", sortable: true },
        { key: "legacy_guid__c", show: false, label: "Legacy Guid", sortable: true },        
        { key: "master_id__c", show: false, label: "Master Id", sortable: true },
        { key: "company_id__c", show: false, label: "Company Id", sortable: true },
        { key: "opening_amount__c", show: false, label: "Opening Amount", sortable: true },
        { key: "opening_quantity__c", show: false, label: "Opening Quantity", sortable: true }
    ];

    useEffect(() => {
        setRefreshTable(false);
        getAllStockItem();
    }, [refreshTable]);

    const handleViewInventory = async (stockItemId) => {
        setShowModal(true);
        const response = await uvCapitalApi.getInventoryHistory(stockItemId);
        if (response?.data) {
            const saleData = response.data.filter(item => item.voucher_type === 'Sales');
            const purchaseData = response.data.filter(item => item.voucher_type === 'Purchase');

            setSaleInventoryHistoryData(saleData);
            setPurchaseInventoryHistoryData(purchaseData);
        } else {
            setSaleInventoryHistoryData([]);
            setPurchaseInventoryHistoryData([]);
            console.warn('No inventory data found');
        }
    }

    const getAllStockItem= async () => {
        const response = await uvCapitalApi.getListOfStockItems();
        if (response?.data) setStockItemsData(response?.data);
        else setStockItemsData([])
    }

    return (
        <Fragment>
            <div style={{ position: "relative" }}>
                <div className="bg-light border-bottom py-4 px-4">
                    <Container>
                        <Row>
                            <Col>
                                <div className="d-flex gap-2 nav-button-menu">
                                    <Button className="nav-button" onClick={goToLedgers}>
                                        <BiSolidBookContent fontSize={17}/>
                                        Ledgers
                                    </Button>
                                    <Button className="nav-button" onClick={goToStockItems} style={{background: 'linear-gradient(135deg,#17a2b8,#138496)'}}>
                                        <BiSolidCategoryAlt fontSize={17} />
                                        Stock Items
                                    </Button>
                                    <Button className="nav-button" onClick={goToVoucher} style={{background: 'linear-gradient(135deg,#ffc107,#e0a800)'}}>
                                        <BiSolidCopyAlt fontSize={17} />
                                        Vouchers
                                    </Button>
                                    <Button className="nav-button" onClick={goToOrder}>
                                        <BiShoppingBag fontSize={17} />
                                        Orders
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    {!location.pathname.includes("view") && (
                        <div className="card mt-4 shadow-sm ">
                            <div className="card-header d-flex justify-content-between align-items-center p-3">
                                <h5 className="mb-0">Stock Items</h5>
                                <div className="d-flex gap-2">
                                    <Button className="nav-button" onClick={toggleFilters} style={{background: '#fff', height: '37px', color: '#555555ff'}}>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path>
                                        </svg>
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                    </Button>
                                    <Button className="nav-button" style={{background: 'linear-gradient(135deg, #17a2b8, #138496)', height: '37px'}}>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="export-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                                        </svg>
                                        Export
                                    </Button>
                                    {permissions?.stock_items?.create && (
                                        <button
                                            className="btn created-record-btn rounded-3 border-0"
                                            onClick={handleOpen}
                                        >
                                            Add New Ledger
                                        </button>
                                    )}
                                </div>
                            </div>
                            {units.length > 0 && (
                                <div className="py-4 px-4">
                                    <span className="fw-bold me-2">Active Filters:</span>
                                    {units && (
                                        <Badge bg="info" className="me-2">
                                        State: {units} <span style={{ cursor: "pointer" }} onClick={() => setUnits("")}> × </span>
                                        </Badge>
                                    )}
                                </div>
                            )}   
                            {showFilters && (
                                <div className="py-4 px-4">
                                    <Card>
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold">Filters</span>
                                            <Button variant="outline-danger" size="sm" onClick={clearAllFilters}>
                                                Clear All
                                            </Button>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="g-3">
                                                <Col md={2}>
                                                    <Form.Label>Units</Form.Label>
                                                    <select className="filter-input" value={units} onChange={(e) => setUnits(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value="NOS">NOS</option>
                                                        <option value="Pcs">Pcs.</option>
                                                        <option value="pkt">pkt</option>
                                                        <option value="kg">kg</option>
                                                        <option value="Ltr">Ltr.</option>
                                                        <option value="ml">ml</option>
                                                        <option value="PAC">PAC</option>
                                                        <option value="Rim">Rim</option>
                                                        <option value="Roll">Roll</option>
                                                        <option value="sheet">sheet</option>
                                                        <option value="th">th</option>
                                                        <option value="Tin">th</option>
                                                        <option value="UNT">UNT</option>
                                                        <option value="BAG">BAG</option>
                                                        <option value="b.ltr">b.ltr</option>
                                                        <option value="BOX">BOX</option>
                                                    </select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Parent Group</Form.Label>
                                                    <input type="text" placeholder="Parent Group" className="filter-input" value={parentGroup} onChange={(e) => setParentGroup(e.target.value)} />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>GST Applicable</Form.Label>
                                                    <select className="filter-input" value={gstApplicable} onChange={(e) => setGSTApplicable(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Is Taxable</Form.Label>
                                                    <select className="filter-input" value={isTaxable} onChange={(e) => setIsTaxable(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Rate Min</Form.Label>
                                                    <input type="number" placeholder="Rate Min" className="filter-input" value={rateMin} onChange={(e) => setRateMin(e.target.value)}/>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Rate Max</Form.Label>
                                                    <input  type="number" placeholder="Rate Max" className="filter-input" value={rateMax} onChange={(e) => setRateMix(e.target.value)} />
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </div>
                            )}
                            <div className="card-body px-4">
                                <div className="mt-3" >
                                    <DataTable
                                        tableHeaders={tableHeaders}
                                        tableData={filteredResults}
                                        sortConfig={sortConfig}
                                        toggleSort={toggleSort}
                                        //handleNameClick={handleNameClick}
                                        onSearchChange={setSearchText}
                                        type="Ledger"
                                        setRefreshTable={setRefreshTable}
                                        //onDelete={confirmDeleteLategory}
                                        refreshTable={refreshTable}
                                        permission={permissions?.stock_items}
                                        showInventory={handleViewInventory}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>                  
            </div>
            <Modal show={showModal} onClick={handleClose} size="xl">
                <Modal.Header style={{height: '100%'}}>
                    <div className="d-flex align-items-center">
                        <div className="modal-icon me-3">
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" style={{color: "#15a362"}} xmlns="http://www.w3.org/2000/svg">
                                <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
                            </svg>
                        </div>
                        <div>
                            <h5 className="modal-title mb-0">Inventory History</h5>
                            <small className="text-dark">AC</small>
                        </div>
                    </div>
                    <button type="button" className="btn-close"></button>
                </Modal.Header>
                <Modal.Body >
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                <span className="fw-medium">Current Stock:</span>
                                <span className="badge bg-primary">2</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                <span className="fw-medium">Stock Amount:</span>
                                <span className="badge bg-success">₹43053.13</span>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <h6 className="mb-3">Purchase Transactions</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th className="date-column">Date</th>
                                            <th className="quantity-column">Quantity</th>
                                            <th className="rate-column">Rate</th>
                                            <th className="amount-column">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {purchaseInventoryHistoryData.length > 0 ? (
                                        purchaseInventoryHistoryData.map((entry, index) => (
                                        <tr key={index}>
                                            <td className="date-column">
                                            {entry.voucher_date
                                                ? new Date(entry.voucher_date).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : 'N/A'}
                                            </td>
                                            <td className="quantity-column">{entry.quantity__c || '0'}</td>
                                            <td className="rate-column">₹{entry.rate__c ? entry.rate__c.toFixed(2) : '0.00'}</td>
                                            <td className="amount-column">₹{Math.abs(entry.amount__c || 0).toFixed(2)}</td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                        <td colSpan="4" className="text-center">
                                            <strong>No Purchase Data Available</strong>
                                        </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h6 className="mb-3">Sales Transactions</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th className="date-column">Date</th>
                                            <th className="quantity-column">Quantity</th>
                                            <th className="rate-column">Rate</th>
                                            <th className="amount-column">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {saleInventoryHistoryData.length > 0 ? (
                                        saleInventoryHistoryData.map((entry, index) => (
                                        <tr key={index}>
                                            <td className="date-column">
                                            {entry.voucher_date
                                                ? new Date(entry.voucher_date).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : 'N/A'}
                                            </td>
                                            <td className="quantity-column">{entry.quantity__c || '0'}</td>
                                            <td className="rate-column">₹{entry.rate__c ? entry.rate__c.toFixed(2) : '0.00'}</td>
                                            <td className="amount-column">₹{Math.abs(entry.amount__c || 0).toFixed(2)}</td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                        <td colSpan="4" className="text-center">
                                            <strong>No Purchase Data Available</strong>
                                        </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" onClick={handleClose} class="btn btn-secondary"><i className="fas fa-times me-1"></i>Close</button>
                </Modal.Footer>
            </Modal>
            
        </Fragment>
    );
};
export default StockItemDashboard;