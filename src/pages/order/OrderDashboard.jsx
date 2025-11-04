import uvCapitalApi from '../../api/uvCapitalApi';
import DataTable from "../../components/DataTable";
import toast from 'react-hot-toast'; 
import DetailPage from '../../components/DetailPage';
import Badge from 'react-bootstrap/Badge';
import ConfirmationModal from '../../components/ConfirmationModal';
import './index.css';

import { Fragment, useEffect, useState } from "react";
import { FaPlus } from 'react-icons/fa';
import { BiSolidCategoryAlt,BiShoppingBag, BiSolidCopyAlt, BiSolidBookContent } from "react-icons/bi";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Dropdown, Card, Modal } from "react-bootstrap";
import { useAuthWrapper } from '../../helper/AuthWrapper';
import { useSortableSearchableData } from "../../helper/GlobalHelper";

const OrderDashboard = ({ onNewOrderClick, onEditClick  }) => {
    const [orderDate, setOrderData] = useState([]);
    const [ledgerNames, setLedgerNames] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const { permissions, settingPermissions } = useAuthWrapper();
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeatilsModal, setShowDeatilsModal] = useState(false); 
    const [orderDetailData, setOrderDetailData ] = useState([]);
    const [orderOLIDetailData, setOrderOLIDetailData ] = useState([]); 
    const navigate = useNavigate();

    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(orderDate);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [partyLedger, setPartyLedger] = useState("");
    const [orderType, setOrderType] = useState("");
    const [filteredResults, setfilteredResults] = useState([]);

    const clearAllFilters = () => {
        setStartDate("");    
        setEndDate("");
        setPartyLedger("");
        setOrderType(""); 
    };

    const getActiveFilterCount = () => {
        let count = 0;

        if (showFilters.startDate) count++;
        if (showFilters.endDate) count++;
        if (showFilters.partyLedger) count++;
        if (showFilters.orderType) count++;

        return count;
    };

    function additionalFilter(filteredData){ 

        const typeValue = (orderType || "").toString().trim().toLowerCase();
        if (typeValue && typeValue.length > 0) {
            filteredData = filteredData.filter((row) =>
            (row?.type__c || "").toString().toLowerCase().includes(typeValue));
        }

        const partyLedgerValue = (partyLedger || "").toString().trim().toLowerCase();
        if (partyLedgerValue && partyLedgerValue.length > 0) {
            filteredData = filteredData.filter((row) =>
                (row?.ledger_name || "").toString().toLowerCase().includes(partyLedgerValue)
            );
        }

        if (startDate || endDate) {
            filteredData = filteredData.filter((row) => {
                if (!row.order_date__c) return false;

                const recordDateObj = new Date(row.order_date__c);
                if (isNaN(recordDateObj)) return false;

                const localDate = new Date(recordDateObj.getTime() - recordDateObj.getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0];


                // Ensure startDate and endDate are in 'YYYY-MM-DD' format
                if (startDate && endDate) {
                    return localDate >= startDate && localDate <= endDate;
                } else if (startDate) {
                    return localDate >= startDate;
                } else if (endDate) {
                    return localDate <= endDate;
                }
                return true; 
            });
            
        } 
        return filteredData;
    }

    useEffect(()=>{
        setfilteredResults(additionalFilter(filteredData));
    },[filteredData, orderType, partyLedger, startDate, endDate]);

    const handleClose = () => {
        setShowModal(false); 
        setShowDeatilsModal(false);
    } 

    useEffect(() => { 
        setRefreshTable(false);
        getAllOrder(); 
    }, [showModal, refreshTable]);

    const getAllOrder= async () => {
        const response = await uvCapitalApi.getListOfOrder();
        if (response?.data) setOrderData(response?.data);
        else setOrderData([])

        const extractedLedgerNames = response.data.map((order) => order.ledger_name).filter((value, index, self) => self.indexOf(value) === index);
        setLedgerNames(extractedLedgerNames); 
    }

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

    const handleNameClick = async (record) => {
        setShowDeatilsModal(true);
        const orderResponse = await uvCapitalApi.getOrderDetailDataById(record?.id); 
        const orderOLIResponse = await uvCapitalApi.getOrderOLIDetailById(record?.id); 
        setOrderDetailData(orderResponse?.data?.[0] ?? []);
        setOrderOLIDetailData(orderOLIResponse?.data ?? []);
    }

    const confirmDeleteOrder = (id) => {
        setOrderToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmedDelete = async () => {
        if (!orderToDelete) return;
        try {
            const res = await uvCapitalApi.deleteOrder(orderToDelete);
            if (res.success) {
                toast.success(res?.message);
                getAllOrder();
            } else {
                toast.error("Failed to delete Order.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        } finally {
            setShowConfirmModal(false);
            setOrderToDelete(null);
        }
    };

    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    useEffect(() => {
        if (settingPermissions) {
            const kenbanSettings = settingPermissions["Ken-ban View Setting"];
            kenbanSettings?.find(
                item => item.module_id === permissions?.order?.id
            );
        }
    }, [settingPermissions, permissions?.order?.id]);

    const tableHeaders = [
        { key: "name", show: true, label: "Order Number", sortable: true },
        { key: "ledger_name", show: true, label: "Party Ledget", sortable: true },
        { key: "order_date__c", show:true , label: "Order Date", sortable: true },
        { key: "type__c", show: true, label: "Type", sortable: true },
        { key: "status__c", show: true, label: "Status", sortable: true },
        { key: "total_amount__c", show: true, label: "Total Amount", sortable: true },
        { key: "tally_sync__c", show: true, label: "Tally Sync", sortable: true },
        { key: "sales_ledger_name", show: false, label: "Sales Purchase Ledger", sortable: true },
        { key: "financial_year__c", show: false, label: "Company Finalcial Year", sortable: true },
        { key: "created_date", show: false, label: "Created Date", sortable: true }
    ];
    
    
    
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
                                <h5 className="mb-0">Order</h5>
                                <div className="d-flex gap-2">
                                    <Button className="nav-button" onClick={toggleFilters} style={{background: '#fff', height: '37px', color: '#555555ff'}}>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"></path>
                                        </svg>
                                        {showFilters ? "Hide Filters" : "Show Filters"}
                                        {getActiveFilterCount() > 0 && (
                                            <span style={{ marginLeft: "6px", color: "#17a2b8", fontWeight: "600" }}>
                                            ({getActiveFilterCount()})
                                            </span>
                                        )}
                                    </Button>
                                    <Button className="nav-button" style={{background: 'linear-gradient(135deg, #17a2b8, #138496)', height: '37px'}}>
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="export-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
                                        </svg>
                                        Export
                                    </Button>
                                    {permissions?.orders?.create && (
                                        <button className="nav-button" onClick={onNewOrderClick} style={{height: '37px'}}> <FaPlus /> Add New Order </button>
                                    )}
                                    
                                </div>
                            </div> 
                            {(startDate || endDate || partyLedger || orderType) && (
                                <div className="py-4 px-4">
                                    <span className="fw-bold me-2">Active Filters:</span> 

                                    {startDate && (
                                        <Badge bg="info" className="me-2">
                                        From: {startDate} <span style={{ cursor: "pointer" }} onClick={() => setStartDate("")}> × </span>
                                        </Badge>
                                    )}

                                    {endDate && (
                                        <Badge bg="info" className="me-2">
                                        To: {endDate} <span style={{ cursor: "pointer" }} onClick={() => setEndDate("")}> × </span>
                                        </Badge>
                                    )} 

                                    {partyLedger && (
                                        <Badge bg="info" className="me-2">
                                        Party: {partyLedger} <span style={{ cursor: "pointer" }} onClick={() => setPartyLedger("")}> × </span>
                                        </Badge>
                                    )}

                                    {orderType && (
                                        <Badge bg="info" className="me-2">
                                        Type: {orderType} <span style={{ cursor: "pointer" }} onClick={() => setOrderType("")}> × </span>
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
                                                <Col md={3}>
                                                    <Form.Label>Start Date</Form.Label>
                                                    <input  type="date" className="filter-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label>End Date</Form.Label>
                                                    <input  type="date" className="filter-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label>Party Ledger</Form.Label>
                                                    <select className="filter-input" value={partyLedger} onChange={(e) => setPartyLedger(e.target.value)}>
                                                        <option value="">All Ledgers</option>
                                                        {ledgerNames.map((ledger) => (
                                                            <option key={ledger} value={ledger}>
                                                                {ledger}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Col> 
                                                <Col md={3}>
                                                    <Form.Label>Type</Form.Label>
                                                    <select className="filter-input" value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                                                        <option value="">All Type</option>
                                                        <option value="Sales">Sales</option>
                                                        <option value="Purchase">Purchase</option>
                                                        <option value="Invoice">Invoice</option> 
                                                    </select>
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
                                        handleNameClick={handleNameClick}
                                        onSearchChange={setSearchText}
                                        type="Order"
                                        setRefreshTable={setRefreshTable}
                                        onDelete={confirmDeleteOrder}
                                        refreshTable={refreshTable}
                                        permission={permissions?.orders}
                                        onEditClick={onEditClick}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!location.pathname.includes("view") ? (
                        <Container>
                            <ConfirmationModal
                                show={showConfirmModal}
                                onHide={() => setShowConfirmModal(false)}
                                onConfirm={handleConfirmedDelete}
                                title="Delete Order"
                                message="Are you sure you want to delete this Order?"
                                confirmText="Delete"
                                cancelText="Cancel"
                            />
                        </Container>
                    ) : ( 
                        <DetailPage
                            refreshTable={refreshTable}
                            setRefreshTable={setRefreshTable}
                            permission={permissions?.orders}
                            type="Order"
                        /> 
                    )}
                </div>
            </div>
            <Modal show={showDeatilsModal} size="lg">
                <Modal.Header style={{height: '100%'}}>
                    <div className="d-flex align-items-center">
                        <div className="modal-icon me-3">
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="em" width="1em" style={{color: "#15a362"}} xmlns="http://www.w3.org/2000/svg">
                                <path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path>
                            </svg>
                        </div>
                        <div>
                            <h5 className="modal-title mb-0">{orderDetailData.name}</h5>
                            <small className="text-dark">Order Details</small>
                        </div>
                    </div>
                    <button type="button" onClick={handleClose} className="btn-close"></button>
                </Modal.Header>
                <Modal.Body >
                    <div className='details-section mb-3'>
                        <h6 class="section-title"><i class="fas fa-info-circle me-2"></i>Basic Information</h6>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Name</label>
                                    <div class="detail-value-compact">{orderDetailData.name}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Total Amount</label>
                                    <div class="detail-value-compact">{orderDetailData.total_amount__c}</div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Order Date</label>
                                    <div class="detail-value-compact">{orderDetailData.order_date__c}</div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Type</label>
                                    <div class="detail-value-compact">{orderDetailData.type__c}</div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Status</label>
                                    <div class="detail-value-compact">{orderDetailData.status__c}</div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Party Ledger</label>
                                    <div class="detail-value-compact">{orderDetailData.ledger_name}</div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Sales Ledger</label>
                                    <div className="detail-value-compact">
                                        {orderDetailData.sales_ledger_name ? orderDetailData.sales_ledger_name : "No Sales Ledger"}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div class="detail-item-compact">
                                    <label class="detail-label-compact">Tally Sync</label>
                                    <div className="detail-value-compact">
                                        {orderDetailData.tally_sync__c ? orderDetailData.tally_sync__c : "No Tally Sync"}
                                    </div> 
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='details-section mb-3'>
                        <h6 class="section-title"><i class="fas fa-info-circle me-2"></i>Order Line Items</h6>
                        <div className="OLI-details-section row mt-3">
                            <div className="table-responsive">
                                <table className="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>Item/Ledger</th>
                                            <th>Quantity</th>
                                            <th>Rate</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {orderOLIDetailData.map((item, index) => (
                                        <tr key={item.id || index}>
                                        <td>
                                            {item.stock_item_name || item.ledger_name || 'Unknown'}
                                        </td>
                                        <td>{item.quantity__c || '-'}</td>
                                        <td>₹{parseFloat(item.rate__c || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <span className="fw-bold text-success">
                                            ₹{parseFloat(item.amount__c || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        </tr>
                                    ))}
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
export default OrderDashboard; 