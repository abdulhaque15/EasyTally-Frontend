import uvCapitalApi from '../../api/uvCapitalApi';
import DataTable from "../../components/DataTable";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { BiSolidCategoryAlt,BiShoppingBag, BiSolidCopyAlt, BiSolidBookContent } from "react-icons/bi";
import { useAuthWrapper } from '../../helper/AuthWrapper';
import { useSortableSearchableData } from "../../helper/GlobalHelper";

const VoucherDashboard = () => {
    const [voucherData, setVoucherData] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const { permissions, settingPermissions } = useAuthWrapper();
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(voucherData);

    const [voucherType, setVoucherType] = useState(""); 
    const [partyLedger, setPartyLedger] = useState("");
    const [amountMin, setAmountMin] = useState("");
    const [amountMix, setAmountMix] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [filteredResults, setfilteredResults] = useState([]);

    const clearAllFilters = () => {
        setVoucherType("");
        setPartyLedger("");
        setAmountMin("");
        setAmountMix("");
        setDateFrom("");
        setDateTo("");
    };

    function additionalFilter(filteredData){

        const typeValue = (voucherType || "").toString().trim().toLowerCase();
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

        const amtMinValue = parseFloat(amountMin);
        const amtMixValue = parseFloat(amountMix);

        if (!isNaN(amtMinValue) || !isNaN(amtMixValue)) {
            filteredData = filteredData.filter((row) => {
                const amt = parseFloat(row?.amount__c) || 0;

                if (!isNaN(amtMinValue) && !isNaN(amtMixValue)) {
                    return amt >= amtMinValue && amt <= amtMixValue;
                } else if (!isNaN(amtMinValue)) {
                    return amt >= amtMinValue;
                } else if (!isNaN(amtMixValue)) {
                    return amt <= amtMixValue;
                }
                return true;
            });
        }

        if (dateFrom || dateTo) {
            filteredData = filteredData.filter((row) => {
                if (!row.date__c) return false;

                const recordDateObj = new Date(row.date__c);
                if (isNaN(recordDateObj)) return false;

                const localDate = new Date(recordDateObj.getTime() - recordDateObj.getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0];


                // Ensure dateFrom and dateTo are in 'YYYY-MM-DD' format
                if (dateFrom && dateTo) {
                    return localDate >= dateFrom && localDate <= dateTo;
                } else if (dateFrom) {
                    return localDate >= dateFrom;
                } else if (dateTo) {
                    return localDate <= dateTo;
                }
                return true; 
            });
            
        } 
        return filteredData;
    }

    useEffect(()=>{
        setfilteredResults(additionalFilter(filteredData));
    },[filteredData, voucherType, partyLedger,amountMin, amountMix, dateFrom, dateTo]);
    
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

    useEffect(() => {
        setRefreshTable(false);
        getAllVoucher();
    }, [refreshTable]);

    const getAllVoucher= async () => {
        const response = await uvCapitalApi.getListOfVoucher();
        if (response?.data) setVoucherData(response?.data);
        else setVoucherData([])
    }
    const toggleFilters = () => {
        setShowFilters((prev) => !prev);
    };

    useEffect(() => {
        if (settingPermissions) {
            const kenbanSettings = settingPermissions["Ken-ban View Setting"];
            kenbanSettings?.find(
                item => item.module_id === permissions?.vouchers?.id
            );
        }
    }, [settingPermissions, permissions?.vouchers?.id]);

    const tableHeaders = [
        { key: "name", show: true, label: "Voucher Number", sortable: true },
        { key: "ledger_name", show: true, label: "Party Ledger", sortable: true },
        { key: "amount__c", show: true, label: "Amount", sortable: true },
        { key: "date__c", show: true, label: "Date", sortable: true },
        { key: "type__c", show: true, label: "Type", sortable: true },
        { key: "status__c", show: true, label: "Tally Status", sortable: true },
        { key: "order__c", show: true, label: "Order", sortable: true },
        { key: "reference_number__c", show: true, label: "Reference", sortable: true },
        { key: "legacy_guid__c", show: false, label: "Legacy Guid", sortable: true },
        { key: "financial_year__c", show: false, label: "Company Financial Year", sortable: true },
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
                                <h5 className="mb-0">Voucher</h5>
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
                                    {permissions?.voucher?.create && (
                                        <button
                                            className="btn created-record-btn rounded-3 border-0"
                                            onClick={handleOpen}
                                        >
                                            Add New Ledger
                                        </button>
                                    )}
                                    
                                </div>
                            </div> 
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
                                                    <Form.Label>Type</Form.Label>
                                                    <select className="filter-input" value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                                                        <option value="">All</option>
                                                        <option value="Receipt">Receipt</option>
                                                        <option value="Payment">Payment</option>
                                                        <option value="Journal">Journal</option>
                                                        <option value="Sales">Sales</option>
                                                        <option value="Purchase">Purchase</option>
                                                        <option value="Contra">Contra</option>
                                                        <option value="Credit Note">Credit Note</option>
                                                        <option value="Debit Note">Debit Note</option>
                                                    </select>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Party Ledger</Form.Label>
                                                    <input type="text" placeholder="Party Ledger" className="filter-input" value={partyLedger} onChange={(e) => setPartyLedger(e.target.value)} />
                                                </Col>
                                                
                                                <Col md={2}>
                                                    <Form.Label>Amount Min</Form.Label>
                                                    <input type="number" placeholder="Amount Min" className="filter-input" value={amountMin} onChange={(e) => setAmountMin(e.target.value)}/>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Amount Max</Form.Label>
                                                    <input  type="number" placeholder="Amount Max" className="filter-input" value={amountMix} onChange={(e) => setAmountMix(e.target.value)} />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Date From</Form.Label>
                                                    <input  type="date" className="filter-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Label>Date To</Form.Label>
                                                    <input  type="date" className="filter-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
                                        permission={permissions?.vouchers}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>                  
            </div>
        </Fragment>
    );
};
export default VoucherDashboard;