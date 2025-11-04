import uvCapitalApi from '../../api/uvCapitalApi';
import DataTable from "../../components/DataTable";
import LedgersModal from "./LedgersModal";
import ConfirmationModal from '../../components/ConfirmationModal';
import DetailPage from '../../components/DetailPage';
import './index.css';
import Select, { components } from "react-select";
import Badge from 'react-bootstrap/Badge';
import toast from 'react-hot-toast';
import { BiSolidCategoryAlt,BiShoppingBag, BiSolidCopyAlt, BiSolidBookContent } from "react-icons/bi";
import { Fragment, useEffect, useState } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useSortableSearchableData } from "../../helper/GlobalHelper";
import { useAuthWrapper } from '../../helper/AuthWrapper';

const LedgersDashboard = () => {
    const [ledgersData, setLedgersData] = useState([]);
    const [refreshTable, setRefreshTable] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const { permissions, settingPermissions } = useAuthWrapper();
    const [showFilters, setShowFilters] = useState(false);
    const [ledgersToDelete, setLedgersToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const navigate = useNavigate();
    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const [parentGroups, setParentGroups] = useState([]);
    const [stateText, setStateText] = useState("");
    const [closingBalanceType, setClosingBalanceType] = useState("all");
    const [closingBalanceMin, setClosingBalanceMin] = useState("");
    const [closingBalanceMax, setClosingBalanceMax] = useState("");
    const [filteredResults, setfilteredResults] = useState([]);

    useEffect(() => {
        if (settingPermissions) {
            const kenbanSettings = settingPermissions["Ken-ban View Setting"];
            kenbanSettings?.find(
                item => item.module_id === permissions?.ledgers?.id
            );
        }
    }, [settingPermissions, permissions?.ledgers?.id]);

    const tableHeaders = [
        { key: "name", show: true, label: "Name", sortable: true },
        { key: "closing_balance__c", show: true, label: "Closing Balance", sortable: true },
        { key: "parent_group__c", show: true, label: "Parent Group", sortable: true },
        { key: "state__c", show: true, label: "State", sortable: true },
        { key: "legacy_alterid__c", show: true, label: "Legacy Alterid", sortable: true },
        { key: "company_name", show: false, label: "Company Name", sortable: true },
        { key: "legacy_guid__c", show: false, label: "Legacy Guid", sortable: true },
        { key: "master_id__c", show: false, label: "Master Id", sortable: true },
        { key: "full_name__c", show: false, label: "Full Name", sortable: true },
        { key: "company_id__c", show: false, label: "Full Name", sortable: true }
    ];

    const getAllLedgers= async () => {
        const response = await uvCapitalApi.getListOfLedgers();
        if (response?.data) setLedgersData(response?.data);
        else setLedgersData([])
    }

    useEffect(() => {
        setRefreshTable(false);
        getAllLedgers();
    }, [showModal, refreshTable]);

    const handleNameClick = (row) => {
        navigate(`/ledgers/view/${row.id}`, {
            state: { type: "Ledger", rowData: row }
        });
    };

    const { setSearchText, sortConfig, toggleSort, filteredData } = useSortableSearchableData(ledgersData);
    function additionalFilter(filteredData){
        const effectiveParentGroups = (parentGroups && parentGroups.length > 0)
            ? parentGroups
            : null;
        if (effectiveParentGroups && effectiveParentGroups.length > 0) {
            const selectedGroups = new Set(
            effectiveParentGroups
                .filter((pg) => pg && (pg.value || pg.label))
                .map((pg) => (pg.value || pg.label).toString().toLowerCase())
            );

            filteredData = filteredData.filter((row) => {
            const groupValue = (row?.parent_group__c || "").toString().toLowerCase();
            return selectedGroups.has(groupValue);
            });
        }

        const stateText1 = (stateText || "").toString().trim().toLowerCase();
        if (stateText1 && stateText1.length > 0) {
            filteredData = filteredData.filter((row) =>
            (row?.state__c || "").toString().toLowerCase().includes(stateText1));
        }

        const balanceType = (closingBalanceType || "").toString().toLowerCase();
        const minRaw = closingBalanceMin;
        const maxRaw = closingBalanceMax;
        
        if (balanceType || minRaw !== undefined || maxRaw !== undefined) {
            filteredData = filteredData.filter((row) => {
            const raw = row?.closing_balance__c;
            const normalized = typeof raw === "string" ? raw.replace(/[\,\s]/g, "").replace(/[^0-9.-]/g, "") : raw;
            const numericBalance = Number(normalized);

            if (Number.isNaN(numericBalance)) {
                if (minRaw !== undefined && minRaw !== "") return false;
                if (maxRaw !== undefined && maxRaw !== "") return false;
                if (balanceType === "positive" || balanceType === "negative" || balanceType === "zero") return false;
                return true;
            }

            if (balanceType === "positive" && !(numericBalance > 0)) return false;
            if (balanceType === "negative" && !(numericBalance < 0)) return false;
            if (balanceType === "zero" && !(numericBalance === 0)) return false;

            const minBln = (minRaw === undefined || minRaw === "" || numericBalance >= Number(minRaw));
            const maxBln = (maxRaw === undefined || maxRaw === "" || numericBalance <= Number(maxRaw));

            return minBln && maxBln;
            });
        }

        return filteredData;
    }
    
    useEffect(()=>{
        setfilteredResults(additionalFilter(filteredData));
    },[filteredData, parentGroups, stateText,closingBalanceType, closingBalanceMin, closingBalanceMax]);

    const confirmDeleteLategory = (id) => {
        setLedgersToDelete(id);
        setShowConfirmModal(true);
    };
    const handleConfirmedDelete = async () => {
        if (!ledgersToDelete) return;
        try {
            const res = await uvCapitalApi.deleteLedgers(ledgersToDelete);
            if (res.success) {
                toast.success(res?.message);
                getAllLedgers();
            } else {
                toast.error("Failed to delete Ledgers.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
        } finally {
            setShowConfirmModal(false);
            setLedgersToDelete(null);
        }
    };

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

    const clearAllFilters = () => {
        setParentGroups([]);    
        setStateText("");
        setClosingBalanceType("all");
        setClosingBalanceMin("");
        setClosingBalanceMax("");
    };

    const Option = (props) => {
        return (
            <components.Option {...props}>
            <input
                type="checkbox"
                checked={props.isSelected}
                onChange={() => null}
                style={{ marginRight: 8 }}
            />
            <label>{props.label}</label>
            </components.Option>
        );
    };

    const parentGroupOptions = [
        { value: "Homeopathic Packing Material GST", label: "Homeopathic Packing Material GST" },
        { value: "Current Liabilities", label: "Current Liabilities" },
        { value: "Machinery Exp", label: "Machinery Exp" },
        { value: "Bank Accounts", label: "Bank Accounts" },
        { value: "Stock-in-hand", label: "Stock-in-hand" },
        { value: "Primary", label: "Primary" },
        { value: "Jaipur Office Exp.", label: "Jaipur Office Exp." },
        { value: "Sales Accounts", label: "Sales Accounts" },
        { value: "Purchase Accounts", label: "Purchase Accounts" },
        { value: "Indirect Expenses", label: "Indirect Expenses" },
        { value: "Current Assets", label: "Current Assets" },
        { value: "Jaipur Transportation", label: "Jaipur Transportation" },
        { value: "Capital Account", label: "Capital Account" },
        { value: "Ayurvedic Raw Material GST", label: "Ayurvedic Raw Material GST" },
        { value: "Ajmer Fuel Expenses", label: "Ajmer Fuel Expenses" },
        { value: "Direct Expenses", label: "Direct Expenses" },
        { value: "Ajmer  Telephone Expenses", label: "Ajmer  Telephone Expenses" },
        { value: "Cash-in-hand", label: "Cash-in-hand" },
        { value: "Duties & Taxes", label: "Duties & Taxes" },
        { value: "Homeopathic Packing Material", label: "Homeopathic Packing Material" },
        { value: "Jaipur Machinery", label: "Jaipur Machinery" },
        { value: "Jaipur Factory Fuel Expenses", label: "Jaipur Factory Fuel Expenses" },
        { value: "Ajmer Transportation", label: "Ajmer Transportation" },
        { value: "Homeopathic Raw Material", label: "Homeopathic Raw Material" },
        { value: "Sundry Creditors", label: "Sundry Creditors" },
        { value: "Ayurvedic Packing Material GST", label: "Ayurvedic Packing Material GST" },
        { value: "Sundry Debtors", label: "Sundry Debtors" }
    ];

    const handleRemoveParentGroup = (groupToRemove) => {
        setParentGroups(prev => prev.filter(group => group.value !== groupToRemove.value));
    };

    const getActiveFilterCount = () => {
        let count = 0;

        if (showFilters.search) count++;
        if (showFilters.parentGroups && showFilters.parentGroups.length > 0) count++;
        if (showFilters.leadStatus && showFilters.leadStatus.length > 0) count++;
        if (showFilters.pipeline_id) count++;
        if (showFilters.createddate) count++;
        if (showFilters.stateText) count++;
        if (showFilters.closingBalanceType && showFilters.closingBalanceType !== "all") count++;
        if (showFilters.closingBalanceMin) count++;
        if (showFilters.closingBalanceMax) count++;

        return count;
    };
    
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
                                <h5 className="mb-0">Ledgers</h5>
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
                                    {permissions?.ledgers?.create && (
                                        <button
                                            className="btn created-record-btn rounded-3 border-0"
                                            onClick={handleOpen}
                                        >
                                            Add New Ledger
                                        </button>
                                    )}
                                </div>
                            </div>
                            {parentGroups.length > 0 && (
                                <div className="py-4 px-4">
                                    <span className="fw-bold me-2">Active Filters:</span>
                                    {parentGroups.map((group, index) => (
                                        <Badge bg="info" className="me-2" key={index}>
                                            Parent: {group.label} <span style={{ cursor: "pointer" }} onClick={() => handleRemoveParentGroup(group)}> × </span>
                                        </Badge>
                                    ))}

                                    {stateText && (
                                        <Badge bg="info" className="me-2">
                                        State: {stateText} <span style={{ cursor: "pointer" }} onClick={() => setStateText("")}> × </span>
                                        </Badge>
                                    )}

                                    {closingBalanceType !== "all" && (
                                        <Badge bg="info" className="me-2">
                                        Balance: {closingBalanceType.toLowerCase()} <span style={{ cursor: "pointer" }} onClick={() => setClosingBalanceType("all")}> × </span>
                                        </Badge>
                                    )}

                                    {(closingBalanceMin || closingBalanceMax) && (
                                        <Badge bg="info" className="me-2">
                                        Range: {closingBalanceMin || 0} - {closingBalanceMax || "∞"} <span style={{ cursor: "pointer" }} onClick={() => { setClosingBalanceMin(""); setClosingBalanceMax(""); }}> × </span>
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
                                                <Form.Label>Parent Group</Form.Label>
                                                <Select
                                                    options={parentGroupOptions}
                                                    isMulti
                                                    value={parentGroups}
                                                    placeholder="Select parent groups..."
                                                    classNamePrefix="select"
                                                    menuPortalTarget={document.body} 
                                                    onChange={(selected) => {
                                                        setParentGroups(selected || []);
                                                    }}
                                                    styles={{
                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        option: (provided) => ({
                                                            ...provided,
                                                            fontSize: "13px",
                                                        }),
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            fontSize: "13px",
                                                            borderColor: state.isFocused ? "#17a2b8" : provided.borderColor,
                                                            boxShadow: state.isFocused ? "0 0 0 1px #17a2b8" : provided.boxShadow,
                                                        })                                                    
                                                    }}
                                                    components={{ Option }}
                                                />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>State</Form.Label>
                                                <input type="text" placeholder="Search State" className="filter-input" value={stateText} onChange={(e) => setStateText(e.target.value)} />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Closing Balance Type</Form.Label>
                                                <select className="filter-input" value={closingBalanceType} onChange={(e) => setClosingBalanceType(e.target.value)}>
                                                    <option value="all">All</option>
                                                    <option value="positive">Positive</option>
                                                    <option value="negative">Negative</option>
                                                    <option value="zero">Zero</option>
                                                </select>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Closing Balance Min</Form.Label>
                                                <input type="number" placeholder="Min Balance" className="filter-input" value={closingBalanceMin} onChange={(e) => setClosingBalanceMin(e.target.value)}/>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Closing Balance Max</Form.Label>
                                                <input  type="number" placeholder="Max Balance" className="filter-input" value={closingBalanceMax} onChange={(e) => setClosingBalanceMax(e.target.value)} />
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
                                        type="Ledger"
                                        setRefreshTable={setRefreshTable}
                                        onDelete={confirmDeleteLategory}
                                        refreshTable={refreshTable}
                                        permission={permissions?.ledgers}
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
                                title="Delete Ledgers"
                                message="Are you sure you want to delete this Ledgers?"
                                confirmText="Delete"
                                cancelText="Cancel"
                            />
                            <LedgersModal
                                show={showModal}
                                onHide={handleClose}
                                setRefreshTable={setRefreshTable}
                            />
                        </Container>
                    ) : ( 
                        <DetailPage
                            refreshTable={refreshTable}
                            setRefreshTable={setRefreshTable}
                            permission={permissions?.ledgers}
                            type="Ledger"
                        /> 
                    )}
                </div>
            </div>
        </Fragment>
    );
};
export default LedgersDashboard;