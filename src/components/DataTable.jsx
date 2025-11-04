import React, { useEffect, useState } from "react";
import { Row, Col, Form, Dropdown, Button } from "react-bootstrap";
import { GlobalEditModal } from "../helper/GlobalHelper";
import { FaFilter, FaSortUp, FaSortDown } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { FiArrowLeft, FiArrowRight, FiUserCheck } from "react-icons/fi";
import { IoSettingsSharp } from "react-icons/io5";
import moment from "moment";
import { useLocation } from "react-router-dom";
import {jwtDecode} from 'jwt-decode';
import uvCapitalApi from "../api/uvCapitalApi";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../helper/AuthWrapper";

const DataTable = ({
  tableHeaders = [], tableData = [], sortConfig, toggleSort, handleNameClick, onSearchChange, type, globalModalUpdateAction, onSelectRows, onDelete, setRefreshTable, refreshTable, permission = {}, onLoginAsUser, showInventory, onEditClick 
}) => {

  const currentLoedInUser = jwtDecode(localStorage.getItem("token"));
  const [editData, setEditData] = useState(null);
  const [ viewInventory, setViewInventory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [headersState, setHeadersState] = useState(tableHeaders);
  const [searchableHeaders, setSearchableHeaders] = useState([]);
  const { refreshSettingPermissions } = useAuthWrapper();

  useEffect(() => {
    const visibleHeaders = headersState.filter((h) => h.show);
    setSearchableHeaders((prev) =>
      prev.filter((key) => visibleHeaders.some((h) => h.key === key))
    );
  }, [headersState]);

  const [filters, setFilters] = useState({
    leadStatus: [],
    pipeline_id: "",
    createddate: "",
    search: "",
  });
  const location = useLocation(); 
  let stateName = location?.pathname?.replace('/', '').toUpperCase() || 'DEFAULT STATE';
  const handleEdit = (row) => {
    setEditData(row);
  };

  const handleUpdateModalData = (updatedData, message) => {
    setEditData(null);
    globalModalUpdateAction(message);
  };

  const handleClose = () => {
    setEditData(null);
  };

  const filteredRows = tableData.filter((row) => { 
    let matchesSearch = true;
    if (searchableHeaders.length > 0 && filters.search) {
      matchesSearch = searchableHeaders.some((key) =>
        (row[key] || "")
          .toString()
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      );
    }

    const matchesStatus =
      filters.leadStatus.length === 0 ||
      filters.leadStatus.includes(row.lead_status);
    const matchesPipeline =
      !filters.pipeline_id ||
      row.pipeline_id?.toString() === filters.pipeline_id.toString();
    const matchesDate =
      !filters.createddate ||
      row.createddate?.slice(0, 10) === filters.createddate;
    return matchesSearch && matchesStatus && matchesPipeline && matchesDate;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (refreshTable) {
      setSelectedRows([]);
      if (onSelectRows) onSelectRows([]);
    }
  }, [refreshTable]);

  const handleSelectAll = (e) => {
    let rows = [];
    if (e.target.checked) {
      rows = currentRows;
    }
    setSelectedRows(rows);
    if (onSelectRows) onSelectRows(rows);
  };

  const handleRowSelect = (row) => {
    let updatedRows = [];
    if (selectedRows.find((r) => r.id === row.id)) {
      updatedRows = selectedRows.filter((r) => r.id !== row.id);
    } else {
      updatedRows = [...selectedRows, row];
    }
    setSelectedRows(updatedRows);
    if (onSelectRows) onSelectRows(updatedRows);
  };

  const areAllRowsSelected = currentRows.length > 0 && currentRows.every((row) => selectedRows.some((r) => r.id === row.id));

const handleSystemSetting = async (row) => {
  setRefreshTable(false);
  const updatedRow = {...row};
  updatedRow.is_activate = !row.is_activate;
  delete updatedRow.createdbyid;
  delete updatedRow.createddate;
  delete updatedRow.setting_id;
  delete updatedRow.setting_name;
  delete updatedRow.lastmodifiedbyid;
  delete updatedRow.lastmodifieddate;
  delete updatedRow.module_name;
  delete updatedRow.description;
  delete updatedRow.module_id;

  if (updatedRow) {
    const response = await uvCapitalApi.updateSetttingPermission(updatedRow);
    setRefreshTable(true);
    toast.success(response?.message);
    refreshSettingPermissions();
  }
};

  return (
    <>
      <div className="detail-h3">
        <Row className="align-items-center table-search-section">
          <Col md="auto">
            <Dropdown>
              <Dropdown.Toggle
                as="button"
                className="border rounded px-2 py-1 text-sm bg-white"
              >
                <FaFilter />
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="p-2 detail-h3"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  minWidth: "150px",
                }}
              >
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="check-all"
                    checked={searchableHeaders.length === 0}
                    onChange={() => setSearchableHeaders([])}
                  />
                  <label
                    className="form-check-label fw-bold"
                    htmlFor="check-all"
                  >
                    All
                  </label>
                </div>

                {headersState
                  .filter((header) => header.show)
                  .map((header, idx) => (
                    <div key={idx} className="form-check mb-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={header.key}
                        id={`check-${header.key}`}
                        checked={searchableHeaders.includes(header.key)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          setSearchableHeaders((prev) =>
                            checked
                              ? [...prev, value]
                              : prev.filter((key) => key !== value)
                          );
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`check-${header.key}`}
                      >
                        {header.label}
                      </label>
                    </div>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={3}>
            <input
              type="text"
              placeholder="Search..."
              className="form-control bg-white w-100 h-25"
              value={filters.search}
              onChange={(e) => {
                const value = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  search: value,
                }));
                onSearchChange(value);
                // if (searchableHeaders.length === 0) {
                //   onSearchChange(value);
                // }
              }}
            />
          </Col>
          <Col md={2}>
              <span className="rounded-pill border px-3 py-2" style={{ background: 'linear-gradient(90deg, #e6f0ff 0%, #f0e6ff 100%)' }}>
              <strong className="me-2">{tableData?.length || 0}</strong> {stateName}
            </span>
          </Col>

          <Col md="auto" className="ms-auto position-relative">
            <Dropdown align="end" container="body">
              <Dropdown.Toggle as="span" className="icon-default">
                <IoSettingsSharp className="fs-5 icon-default" />
              </Dropdown.Toggle>
              <Dropdown.Menu
                className="p-2 detail-h3"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  width: "200px",
                }}
              >
                {headersState?.map((head, index) => {
                  const totalChecked = headersState?.filter(
                    (h) => h.show
                  )?.length;
                  const isChecked = head.show;
                  return (
                    <Form.Check
                      key={head.key}
                      type="checkbox"
                      id={`col-${head.key}`}
                      label={head.label}
                      checked={isChecked}
                      onChange={() => {
                        const updatedHeaders = [...headersState];
                        if (isChecked && totalChecked <= 5) return;
                        if (!isChecked && totalChecked >= 10) return;
                        updatedHeaders[index].show = !isChecked;
                        setHeadersState(updatedHeaders);
                      }}
                    />
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md="auto" className="position-relative">
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Show: {rowsPerPage}
                </button>

                <ul
                  className="dropdown-menu"
                  style={{ minWidth: "auto", width: "80px" }}
                >
                  {[5, 10, 20, 50].map((num) => (
                    <li key={num}>
                      <button
                        className={`dropdown-item ${rowsPerPage === num ? "active" : ""}`}
                        onClick={() => {
                          setCurrentPage(1);
                          setRowsPerPage(num);
                        }}
                      >
                        {num}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
          </Col>
        </Row>  

        {/* 1140px */}
        <Row className="table-responsive table-row-section">
          <div className="p-0 m-0" style={{ overflowX: "auto", width: "100%" }}>
            <table className="table table-bordered table-hover mb-0 data-table">
              <thead className="data-table-thead">
                <tr className="text-left text-sm text-gray-700 data-table-tr">
                  {/* <th className="icon-default data-table-th">
                    <Form.Check
                      type="checkbox"
                      checked={areAllRowsSelected}
                      onChange={handleSelectAll}
                    />
                  </th> */}
                  {headersState
                    ?.filter((head) => head.show)
                    ?.map((head, index) => (
                      <th key={index} className="icon-default data-table-th">
                        {head.label}
                        {head.sortable && (
                          <div
                            className="d-inline-flex flex-column icon-default"
                            onClick={() => toggleSort(head.key)}
                          >
                            <FaSortUp
                              style={{ display: "block", marginBottom: "-6px" }}
                              className={`${sortConfig.key === head.key &&
                                sortConfig.direction === "asc"
                                ? "text-dark"
                                : "text-muted"
                                }`}
                            />
                            <FaSortDown
                              style={{ display: "block", marginTop: "-6px" }}
                              className={`${sortConfig.key === head.key &&
                                sortConfig.direction === "desc"
                                ? "text-dark"
                                : "text-muted"
                                }`}
                            />
                          </div>
                        )}
                      </th>
                    ))}
                  <th className="data-table-th">{(permission?.update || permission?.delete) ? 'Action' : "Action"}</th>
                </tr>
              </thead>

              <tbody className="data-table-tbody">
                {currentRows?.length > 0 ? (
                   currentRows?.map((row, idx) => (
                    <tr
                      className="data-table-tr"
                      key={row.id || idx}
                      style={{
                        backgroundColor:
                          idx % 2 === 1 ? "#f8f9fa" : "transparent",
                      }}
                    >
                      {/* <td
                        className="data-table-td"
                        style={{
                          backgroundColor:
                            idx % 2 === 1 ? "#f8f9fa" : "transparent",
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows.some((r) => r.id === row.id)}
                          onChange={() => handleRowSelect(row)}
                        />
                      </td> */}

                      {headersState
                        ?.filter((head) => head.show)
                        ?.map((head, i) => (
                          <td
                            className="data-table-td"
                            key={head.key}
                            style={{
                              backgroundColor:
                                idx % 2 === 1 ? "#f8f9fa" : "transparent",
                            }}
                          >
                            {i === 0 ? (
                              <span
                                className="text-primary icon-default"
                                onClick={() => handleNameClick?.(row)}
                              >
                                {row[head.key]}
                              </span>
                            ) : head.key === "name" ? (
                              <span
                                className="text-primary icon-default" 
                                onClick={() => handleNameClick?.(row)}
                              >
                                {row[head.key]}
                              </span>
                            ) : head.key === "subject" || head.key === "description" ? (
                                <span className="d-inline-block text-truncate" style={{maxWidth : '150px'}} title={row[head.key]}>
                                  {row[head.key]}
                                </span>
                              
                            ) : head.key === "status" ||
                              head.key === "lead_status" ? (
                              (() => {
                                const rawValue = (row[head.key] || "").toString();
                                const key = rawValue.toLowerCase();

                                const colorMap = {
                                  active: {
                                    bg: "rgb(180 235 180 / 57%)",
                                    text: "rgb(25 135 84 / 77%)",
                                  },
                                  inactive: {
                                    bg: "rgb(220 53 69 / 18%)",
                                    text: "rgb(219 14 33 / 65%)",
                                  },
                                  "attempted to contact": {
                                    bg: "rgb(13 110 253 / 13%)",
                                    text: "rgb(13, 110, 253)",
                                  },
                                  "contact in future": {
                                    bg: "rgb(255 193 7 / 18%)",
                                    text: "rgb(209 158 4)",
                                  },
                                  contacted: {
                                    bg: "rgb(180 235 180 / 57%)",
                                    text: "rgb(25 135 84 / 77%)",
                                  },
                                  "junk lead": {
                                    bg: "rgb(168 170 172 / 65%)",
                                    text: "rgb(118 123 129)",
                                  },
                                  "lost lead": {
                                    bg: "rgb(220 53 69 / 18%)",
                                    text: "rgb(219 14 33 / 65%)",
                                  },
                                  "not contacted": {
                                    bg: "rgb(13 202 240 / 14%)",
                                    text: "rgb(13 202 240)",
                                  },
                                  "pre-qualified": {
                                    bg: "rgb(180 235 180 / 57%)",
                                    text: "rgb(25 135 84 / 77%)",
                                  },
                                  "not qualified": {
                                    bg: "rgb(220 53 69 / 18%)",
                                    text: "rgb(219 14 33 / 65%)",
                                  },
                                };

                                const color = colorMap[key] || {
                                  bg: "#dee2e6",
                                  text: "#000",
                                };

                                return (
                                  <span
                                    className="badge rounded-pill detail-h3 w-100"
                                    style={{
                                      backgroundColor: color.bg,
                                      color: color.text,
                                    }}
                                  >
                                    {rawValue}
                                  </span>
                                );
                              })()
                            ) : head.key === "is_activate" ? (
                              //  NEW: Status Button rendering
                              
                            <Button
                                className={`w-100 ${row?.is_activate ? "system-setting-btn-active" : "system-setting-btn-inactive"}`}
                                onClick={() => handleSystemSetting?.(row)} 
                              > 
                                {row?.is_activate ? "Active" : "Inactive"}
                              </Button>
                            ) : head.key === "rate" ||
                              head.key === "balance" ||
                              head.key === "deposit" ? (
                              <span
                                style={
                                  head.key === "balance"
                                    ? {
                                      color:
                                        row[head.key] < 0 ? "red" : "green",
                                    }
                                    : {}
                                }
                              >
                                ${row[head.key]?.toFixed(2)}
                                <br />
                                <small>CAD</small>
                              </span>
                            ) : (typeof row[head.key] === "string" &&
                              head.key.toLowerCase().includes("date")) ||
                              head.key.toLowerCase().includes("birthday") ? (
                              <span>
                                {row[head.key] ? moment(row[head.key]).format("DD MMM YYYY") : ""}
                              </span>
                            ) : (
                              row[head.key]
                            )}
                          </td>
                        ))}
                      <td
                        className="data-table-td"
                        style={{
                          backgroundColor: idx % 2 === 1 ? "#f8f9fa" : "transparent",
                        }}
                      >
                        {permission.update && (
                          <button
                            className="btn btn-sm me-2"
                            onClick={() => onEditClick ? onEditClick(row): handleEdit(row)}
                            title="Edit"
                          >
                            <MdEdit className="fs-5" />
                          </button>
                        )}

                        {permission.delete && location.pathname !== "/settings" && (
                          <button
                            className="btn btn-sm"
                            title="Delete"
                            onClick={() => onDelete?.(row.id)}
                          >
                            <MdDelete className="fs-5 text-danger" />
                          </button>
                        )}

                        {currentLoedInUser?.user?.group_name === "SYSTEM ADMIN" && location.pathname === "/stockItem" &&(
                          <button
                            className="btn btn-outline-info btn-sm"
                            title="Login as user"
                            onClick={() => showInventory(row.id)}
                          >
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M496 384H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v336c0 17.67 14.33 32 32 32h464c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zM464 96H345.94c-21.38 0-32.09 25.85-16.97 40.97l32.4 32.4L288 242.75l-73.37-73.37c-12.5-12.5-32.76-12.5-45.25 0l-68.69 68.69c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L192 237.25l73.37 73.37c12.5 12.5 32.76 12.5 45.25 0l96-96 32.4 32.4c15.12 15.12 40.97 4.41 40.97-16.97V112c.01-8.84-7.15-16-15.99-16z"></path></svg>
                          </button>
                        )}
                        

                        {currentLoedInUser?.user?.group_name === "SYSTEM ADMIN" && location.pathname === "/users" &&(
                          <button
                            className="btn btn-sm"
                            title="Login as user"
                          >
                            <FiUserCheck size={20} className="text-primary" />
                          </button>
                          )}
                      </td>

                      {/* <td
                        className="data-table-td"
                        style={{
                          backgroundColor:
                            idx % 2 === 1 ? "#E9EDF5" : "transparent",
                        }}
                      >
                        <button
                          className="btn btn-sm me-2"
                          onClick={() => handleEdit(row)}
                          title="Edit"
                        >
                          <MdEdit className="fs-5" />
                        </button>
                        {location.pathname !== "/settings" && (
                          <button
                            className="btn btn-sm"
                            title="Delete"
                            onClick={() => onDelete?.(row.id)}
                          >
                            <MdDelete className="fs-5 text-danger" />
                          </button>
                        )}
                      </td> */}
                    </tr>
                   ))
                ) : (
                  <tr>
                    <td colSpan={headersState.filter(h => h.show).length + 2} className="py-3">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Row>

        <Row
          className="justify-content-between align-items-center px-3 py-2 mb-5"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Col xs="auto">
            <small className="text-muted">
              {indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, filteredRows?.length)} of{" "}
              {filteredRows?.length}
            </small>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            <div className="btn-group">
              {/*<button type="button" className="btn btn-sm">
                Rows per page: 
              </button>
              <button
                type="button"
                className="btn btn-sm dropdown-toggle dropdown-toggle-split border-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="visually-hidden">Toggle Dropdown</span>
              </button>
              
               <ul
                className="dropdown-menu detail-h3"
                style={{ minWidth: "auto", width: "50px" }}
              >
                {[5, 10, 20, 50]?.map((num) => (
                  <li key={num}>
                    <button
                      className={`dropdown-item detail-h3 ${rowsPerPage === num ? "active" : ""
                        }`}
                      onClick={() => {
                        setCurrentPage(1);
                        setRowsPerPage(num);
                      }}
                    >
                      {num}
                    </button>
                  </li>
                ))}
              </ul> */}
              
            </div>

            <button
              className="btn btn-sm btn-light me-1 rounded-3 border border-dark"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FiArrowLeft />
            </button>
            <span className="mx-1 text-muted">
              {currentPage}/{Math.ceil(filteredRows?.length / rowsPerPage)}
            </span>
            <button
              className="btn btn-sm btn-light rounded-3 border border-dark"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredRows.length / rowsPerPage)
                  )
                )
              }
              disabled={
                currentPage === Math.ceil(filteredRows?.length / rowsPerPage)
              }
            >
              <FiArrowRight />
            </button>
          </Col>
        </Row>
      </div>
      <GlobalEditModal
        type={type}
        show={!!editData}
        onHide={handleClose}
        rowData={editData}
        updateModalData={handleUpdateModalData}
        setRefreshTable={setRefreshTable}
      />
      
    </>
  );
};

export default DataTable;
