import React, { useEffect, useState } from "react";
import { Button, Tab, Nav } from "react-bootstrap";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { FiArrowLeft, FiArrowRight, FiDownload } from "react-icons/fi";
import TaskModal from "../pages/task/TaskModal";
import uvCapitalApi from "../api/uvCapitalApi";
import moment from "moment";
import EventModal from "./EventModal";
import NoteModal from "./NoteModal";
import DocumentUploadModal from "./DocumentUploadModal";
import ConfirmationModal from "./ConfirmationModal";
import toast  from 'react-hot-toast';
import { useAuthWrapper } from "../helper/AuthWrapper";

const Activities = ({ relatedToId, permission, refreshTable }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [relatedTaskEventNotesDocs, setRelatedTaskEventNotesDocs] = useState();
  const [activeTab, setActiveTab] = useState('task');
  const [editingRow, setEditingRow] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState();
  const [recordIdToDelete, setRecordIdToDelete] = useState();
  const type = window.location.pathname.split("/")[1];
  const [historyTracking , setHistoryTracking] = useState()
  const { userList } = useAuthWrapper();

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setEditingRow(null);
    fetchRelatedTaskEventsNotes();
  }

  const handleSelect = (selectedKey) => {
    setActiveTab(selectedKey);
  };

  const handleEditClick = (rows) => {
    setShowModal(true);
    setEditingRow(rows);
  };

  const handleDeleteClick = async (id) => {
    setShowConfirmModal(true);
    setRecordIdToDelete(id);
  }

  const handleConfirmedDelete = async () => {
    try {
      if (!recordIdToDelete) return;
      const response = activeTab === "upload"
        ? await uvCapitalApi.deleteAttachmentById(recordIdToDelete)
        : activeTab === "task"
          ? await uvCapitalApi.deleteTaskById(recordIdToDelete)
          : activeTab === "events"
            ? await uvCapitalApi.deletEeventById(recordIdToDelete)
            : await uvCapitalApi.deleteNoteById(recordIdToDelete);

      if (response.success) {
        toast.success(response.message);
        fetchRelatedTaskEventsNotes();
      } else {
        toast.error("Failed to delete related record.");
      }

    } catch (error) {
      console.log('server-error :', error);
      toast.error(error?.response?.data?.message)
    } finally {
      setShowConfirmModal(false);
      setRecordIdToDelete(null);
    }
  }

  //   File Download   //
  const handleDownload = async (filename) => {
    try {
      const response = await uvCapitalApi.downloadFile(filename);

      if (response?.status === 200) {
        const blob = new Blob([response.data]);
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      }


    } catch (error) {
      console.log('server-error :', error);
      toast.error(error?.response?.data?.message);
    }
  };

  const fetchRelatedTaskEventsNotes = async () => {
    try {
      const response = await uvCapitalApi.getRelatedTaskEventNotes(relatedToId);
      if (response.success) {
        setRelatedTaskEventNotesDocs(response?.data[0]);
      } else {
        setRelatedTaskEventNotesDocs([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

    const fetchModuleFieldHistory = async () => {
    try {
      const response = await uvCapitalApi.getListOfModuleFieldHistory(permission?.id, relatedToId);
      if (response.success) {
        setHistoryTracking(response?.data);
      } else {
        setHistoryTracking([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setActiveTab(type === 'lead' ? "history_tracking" : "task");
    fetchModuleFieldHistory();
    fetchRelatedTaskEventsNotes();
  }, [refreshTable]);

  const tasks = relatedTaskEventNotesDocs?.related_to_records?.tasks || [];
  const events = relatedTaskEventNotesDocs?.related_to_records?.events || [];
  const notes = relatedTaskEventNotesDocs?.related_to_records?.notes || [];
  const attachments = relatedTaskEventNotesDocs?.related_to_records?.attachments || [];

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentTasks = tasks.slice(indexOfFirstRow, indexOfLastRow);
  const currentEvents = events.slice(indexOfFirstRow, indexOfLastRow);
  const currentNotes = notes.slice(indexOfFirstRow, indexOfLastRow);
  const currentAttachment = attachments.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(tasks.length / rowsPerPage);
  const totalPagesEvent = Math.ceil(events.length / rowsPerPage);
  const totalPagesNote = Math.ceil(notes.length / rowsPerPage);
  const totalPagesAttachments = Math.ceil(attachments.length / rowsPerPage);

  return (
    <div className="mt-3 border rounded mb-5">
      <Tab.Container activeKey={activeTab}>
        <div className="d-flex justify-content-between align-items-center tabStyle rounded">
          <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelect} className="flex-nowrap me-auto">
            {type === 'lead' &&  <Nav.Item><Nav.Link eventKey="history_tracking">History Tracking</Nav.Link></Nav.Item>}
            <Nav.Item><Nav.Link eventKey="task">Task</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="events">Events</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="notes">Notes</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="upload">Upload</Nav.Link></Nav.Item>
          </Nav>
          {String(activeTab).toLowerCase().trim() !== 'history_tracking' && 
          <Button className="btn btn-light rounded-3 me-3 px-1" title="Add New" size="sm">
            <MdAdd className="fs-5" onClick={handleOpen} />
          </Button>}
        </div>

        <Tab.Content>
          {/* History Tracking Tab*/}
          <Tab.Pane eventKey="history_tracking">
            <div className="detail-h3">
              <div className="table-responsive">
                <table className="table detail-h3 mb-0">
                  <thead>
                    <tr className="text-center" style={{ backgroundColor: "rgb(212 179 124)", color: "white" }}>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Sr No.</th>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Changed By</th>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Field Name</th>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Old Value</th>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>New Value</th>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="data-table-tbody">
                    {historyTracking?.map((history, index) => (
                      <tr key={history.id || index} className="text-center data-table-tr"
                        style={{ backgroundColor: index % 2 === 1 ? "#E9EDF5" : "transparent" }}>
                        <td className="data-table-td">{index + 1}</td>
                        <td className="data-table-td">{userList.find(user => user.id === history.lastmodifiedbyid)?.name}</td>
                        <td className="data-table-td">{history.field_label}</td>
                        <td className="data-table-td">{history.old_value}</td>
                        <td className="data-table-td">{history.new_value}</td>
                        <td className="data-table-td">{history.lastmodifieddate ? moment(history.end_date).format("DD MMM YYYY") : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationFooter
                total={tasks.length}
                indexOfFirstRow={indexOfFirstRow}
                indexOfLastRow={indexOfLastRow}
                currentPage={currentPage}
                totalPages={totalPages}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          </Tab.Pane>
          {/* TASKS TAB */}
          <Tab.Pane eventKey="task">
            <div className="detail-h3">
              <div className="table-responsive">
                <table className="table detail-h3 mb-0">
                  <thead>
                    <tr className="text-center" style={{ backgroundColor: "rgb(212 179 124)", color: "white" }}>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Sr No.</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Task</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Created Date</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Completion Date</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Status</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="data-table-tbody">
                    {currentTasks?.map((task, index) => (
                      <tr key={task.id || index} className="text-center data-table-tr"
                        style={{ backgroundColor: index % 2 === 1 ? "#E9EDF5" : "transparent" }}>
                        <td className="data-table-td">{index + 1}</td>
                        <td className="data-table-td">{task.name}</td>
                        <td className="data-table-td">{task.createddate ? moment(task.createddate).format("DD MMM YYYY") : ""}</td>
                        <td className="data-table-td">{task.end_date ? moment(task.end_date).format("DD MMM YYYY") : ""}</td>
                        <td className="data-table-td"><span className="pill-successe">{task.status}</span></td>
                        <td className="data-table-td">
                          <button className="btn btn-sm me-2 border-dark" onClick={() => handleEditClick(task)}><MdEdit /></button>
                          <button className="btn btn-sm border-dark" onClick={() => handleDeleteClick(task?.id)}><MdDelete className="text-danger" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationFooter
                total={tasks.length}
                indexOfFirstRow={indexOfFirstRow}
                indexOfLastRow={indexOfLastRow}
                currentPage={currentPage}
                totalPages={totalPages}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          </Tab.Pane>

          {/* EVENTS TAB */}
          <Tab.Pane eventKey="events">
            <div className="detail-h3">
              <div className="table-responsive">
                <table className="table detail-h3 mb-0">
                  <thead>
                    <tr className="text-center" style={{ backgroundColor: "rgb(212 179 124)", color: "white" }}>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Sr No.</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Title</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Total Members</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Owner</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Status</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Action </th>
                    </tr>
                  </thead>
                  <tbody className="data-table-tbody">
                    {currentEvents?.map((event, index) => (
                      <tr key={event.id || index} className="text-center data-table-tr"
                        style={{ backgroundColor: index % 2 === 1 ? "#E9EDF5" : "transparent" }}>
                        <td className="data-table-td">{index + 1}</td>
                        <td className="data-table-td">{event.subject}</td>
                        <td className="data-table-td">{event.total_event_member}</td>
                        <td className="data-table-td">{event.owner_id}</td>
                        <td className="data-table-td"><span className="pill-successe text-capitalize">{event?.status || 'Default'}</span></td>
                        <td className="data-table-td">
                          <button className="btn btn-sm me-2 border-dark" onClick={() => handleEditClick(event)}><MdEdit /></button>
                          <button className="btn btn-sm border-dark" onClick={() => handleDeleteClick(event?.id)}><MdDelete className="text-danger" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationFooter
                total={events.length}
                indexOfFirstRow={indexOfFirstRow}
                indexOfLastRow={indexOfLastRow}
                currentPage={currentPage}
                totalPages={totalPagesEvent}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          </Tab.Pane>

          {/* NOTES TAB */}
          <Tab.Pane eventKey="notes">
            <div className="detail-h3">
              <div className="table-responsive">
                <table className="table detail-h3 mb-0">
                  <thead>
                    <tr className="text-center" style={{ backgroundColor: "rgb(212 179 124)", color: "white" }}>
                      <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Sr No.</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Title</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Description</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Status</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Created Date</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="data-table-tbody">
                    {currentNotes?.map((note, index) => (

                      <tr key={note.id || index} className="text-center data-table-tr"
                        style={{ backgroundColor: index % 2 === 1 ? "#E9EDF5" : "transparent" }}>
                        <td className="data-table-td">{index + 1}</td>
                        <td className="data-table-td">{note.title}</td>
                        <td className="data-table-td">{note.description}</td>
                        <td className="data-table-td"><span className="pill-successe">{note.status ?? "No Status"}</span></td>
                        <td className="data-table-td">{note.createddate}</td>
                        <td className="data-table-td">
                          <button className="btn btn-sm me-2 border-dark" onClick={() => handleEditClick(note)}><MdEdit /></button>
                          <button className="btn btn-sm border-dark" onClick={() => handleDeleteClick(note?.id)}><MdDelete className="text-danger" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationFooter
                total={notes.length}
                indexOfFirstRow={indexOfFirstRow}
                indexOfLastRow={indexOfLastRow}
                currentPage={currentPage}
                totalPages={totalPagesNote}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                rowsPerPage={rowsPerPage}
              />
            </div>
          </Tab.Pane>

          {/* UPLOAD TAB */}
          <Tab.Pane eventKey="upload">
            <div className="table-responsive">
              <table className="table detail-h3 mb-0">
                <thead>
                  <tr className="text-center" style={{ backgroundColor: "rgb(212 179 124)", color: "white" }}>
                    <th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Sr No.</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Title</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Created Date</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>File</th><th style={{ backgroundColor: '#EBEFF0', color: 'black' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="data-table-tbody">
                  {
                    currentAttachment?.map((attachment, index) => (
                      <tr
                        key={attachment.id || index}
                        className="text-center data-table-tr"
                        style={{
                          backgroundColor:
                            index % 2 === 1 ? "#E9EDF5" : "transparent",
                        }}
                      >
                        <td className="data-table-td">{index + 1}</td>
                        <td className="data-table-td">{attachment.file_name?.split('.')[0]}</td>

                        <td className="data-table-td">{attachment.createddate}</td>
                        <td className="data-table-td" role="button" onClick={() => handleDownload(attachment.file_name)}>
                          <span className="fs-5 p-1 fw-bold rounded" title="Download"><FiDownload /></span>
                        </td>
                        <td className="data-table-td">
                          <button className="btn btn-sm me-2 border-dark" title="Edit" onClick={() => handleEditClick(attachment)}>
                            <MdEdit className="fs-5" />
                          </button>
                          <button className="btn btn-sm border-dark" title="Delete" onClick={() => handleDeleteClick(attachment.id)}>
                            <MdDelete className="fs-5 text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            <PaginationFooter
              total={attachments.length}
              indexOfFirstRow={indexOfFirstRow}
              indexOfLastRow={indexOfLastRow}
              currentPage={currentPage}
              totalPages={totalPagesAttachments}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              rowsPerPage={rowsPerPage}
            />

          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* <TaskModal show={showModal} onHide={handleClose} /> */}
      {
        showModal && <>
          {activeTab === "task" && <TaskModal show={showModal} onHide={handleClose} rowData={editingRow} />}
          {activeTab === "events" && <EventModal show={showModal} onHide={handleClose} rowData={editingRow} />}
          {activeTab === "notes" && <NoteModal show={showModal} onHide={handleClose} rowData={editingRow} />}
          {activeTab === "upload" && <DocumentUploadModal show={showModal} onHide={handleClose} rowData={editingRow} />}
        </>
      }

      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedDelete}
        title={'Delete ' + (activeTab === 'upload' ? 'Attachment' : activeTab)}
        message={
          'Are you sure you want to delete this ' +
          (activeTab === 'upload' ? 'Attachment' : activeTab) +
          ' ?'
        }
        confirmText="Delete"
        cancelText="Cancel"
      />

    </div>
  );
};

const PaginationFooter = ({
  total,
  indexOfFirstRow,
  indexOfLastRow,
  currentPage,
  totalPages,
  setRowsPerPage,
  setCurrentPage,
  rowsPerPage
}) => (
  <div className="justify-content-between align-items-center px-3 py-2 d-flex" style={{ backgroundColor: "var(--primary-color)" }}>
    <div className="me-auto">
      <small className="">
        {total === 0 ? 0 : indexOfFirstRow + 1}-{Math.min(indexOfLastRow, total)} of {total}
      </small>
    </div>
    <div className="d-flex align-items-center">
      <div className="btn-group me-2">
        <button type="button" className="btn btn-sm">Rows per page:</button>
        <button type="button" className="btn btn-sm dropdown-toggle dropdown-toggle-split border-0" data-bs-toggle="dropdown">
          <span className="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul className="dropdown-menu detail-h3" style={{ minWidth: "auto", width: "50px" }}>
          {[5, 10, 20]?.map(num => (
            <li key={num}>
              <button className={`dropdown-item detail-h3 ${rowsPerPage === num ? "active" : ""}`} onClick={() => {
                setRowsPerPage(num);
                setCurrentPage(1);
              }}>
                {num}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn btn-sm btn-light me-1 rounded-3 border border-dark"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}>
        <FiArrowLeft />
      </button>
      <span className="mx-1">{currentPage}/{totalPages}</span>
      <button className="btn btn-sm btn-light rounded-3 border border-dark"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}>
        <FiArrowRight />
      </button>
    </div>
  </div>
);

export default Activities;
