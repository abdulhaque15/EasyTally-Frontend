import React, { useEffect, useState } from 'react'
import {
  Button,
  Col,
  Row,
  Tab,
  Accordion,
  Container,
  Nav,
} from "react-bootstrap";
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Activities from '../../components/Activities'
import { MdEdit, MdDelete  } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import TaskModal from './TaskModal';
import uvCapitalApi from '../../api/uvCapitalApi';
import ConfirmationModal from '../../components/ConfirmationModal';
import toast  from 'react-hot-toast';
import ChangeOwnerModal from '../../components/ChangeOwnerModal';
import moment from "moment";

const TaskDetail = ({ refreshTable, setRefreshTable }) => {

  const location = useLocation();
  const rowData = location.state?.rowData;
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const [taskDetails, setTaskDetails] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showOwnerModal, setOwnerShowModal] = useState(false);
  const handleOwnerOpen = () => setOwnerShowModal(true);
  const handleOwnerClose = () => setOwnerShowModal(false);
  const [owners, setOwners] = useState([]);

    useEffect(() => {
      (async () => {
        let respone = await uvCapitalApi.getListOfTasksById(id);
        if(respone.success){
          
          setTaskDetails(respone.data[0])
        }else{
          setTaskDetails([])
        }
      })()
    }, [rowData, id, refreshTable])

      useEffect(() => {
        const fetchData = async () => {
          const response = await uvCapitalApi.getListOfUsers();
          if (response.success && response.data) {
            setOwners(response.data);
          } else {
            setOwners(null);
          }
        };
        fetchData();
      }, []);

        const confirmDeleteTask = (id) => {
          setTaskToDelete(id);
          setShowConfirmModal(true);
        };
      
        const handleConfirmedDelete = async () => {
          if (!taskToDelete) return;
          try {
            const res = await uvCapitalApi.deleteTaskById(taskToDelete);
            if (res.success) {
              toast.success(res?.message);
              navigate(`/tasks/`);
            } else {
              toast.error("Failed to delete account.");
            }
          } catch (err) {
            console.error(err);
            toast.error("An error occurred.");
          } finally {
            setShowConfirmModal(false);
            setTaskToDelete(null);
          }
        };

  return (
    <Container>
      <div className="container mb-5 ">
       <div>
          <Tab.Container defaultActiveKey="details">
            <div className="d-flex justify-content-between align-items-center tabStyle rounded-top">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="details">Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="related">Related</Nav.Link>
                </Nav.Item>
              </Nav>
              <div>
                <Button className="btn btn-sm btn-light rounded-3 me-2 px-1" title="Edit" size="sm" onClick={handleOpen} >
                  <MdEdit className="fs-5" /> 
                </Button>
                <Button className="btn btn-light rounded-3 me-2 px-1" title="Delete" size="sm" onClick={() => confirmDeleteTask(id)}>
                  <MdDelete className="fs-5" /> 
                </Button>
                <Button className="btn btn-light rounded-3 me-3 px-1" title="Change Owner" size="sm" onClick={handleOwnerOpen}><AiOutlineUsergroupAdd className="fs-5" /></Button>
              </div>
            </div>
            <Tab.Content>
              <Tab.Pane eventKey="details">
                <Accordion
                  defaultActiveKey={["0"]}
                  alwaysOpen
                  className="detail-h2 detail-h3"
                >
                  <Accordion.Item eventKey="0">
                    <Accordion.Header className="border border-2 ">About:</Accordion.Header>
                    <Accordion.Body>
                      <Container>
                        <Row className="my-3">
                          <Col className="border-bottom me-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Name:</strong>
                              </Col>
                              <Col>{taskDetails?.name}</Col>
                            </Row>
                          </Col>
                          <Col className="border-bottom ms-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Owner:</strong>
                              </Col>
                              <Col>{owners?.find((o) => o.id === taskDetails?.owner_id)?.name || ""}</Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row className="my-3">
                            <Col className="border-bottom me-5 ">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Status:</strong>
                              </Col>
                              <Col>{taskDetails?.status}</Col>
                            </Row>
                          </Col>
                          <Col className="border-bottom ms-5">
                          <Row>
                              <Col>
                                {" "}
                                <strong>Priority:</strong>
                              </Col>
                              <Col>{taskDetails?.priority}</Col>
                            </Row>
                           
                          </Col>
                        </Row>
                       
                      
                        <Row className="my-3">
                          <Col className="border-bottom me-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Start Date:</strong>
                              </Col>
                              <Col>
                                {moment(taskDetails?.start_date).format(
                                  "DD MMM YYYY"
                                )}
                              </Col>
                            </Row>
                          </Col>
                          <Col className="border-bottom ms-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>End Date:</strong>
                              </Col>
                              <Col>
                                {moment(taskDetails?.end_date).format(
                                  "DD MMM YYYY"
                                )}
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                       <Row className="my-3">
                          <Col className="border-bottom me-5">
                             <Row>
                              <Col>
                                {" "}
                                <strong>Amount:</strong>
                              </Col>
                              <Col>{taskDetails?.task_amount}</Col>
                            </Row>
                          </Col>
                          <Col className="border-bottom ms-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Estimated Time:</strong>
                              </Col>
                              <Col>{taskDetails?.estimated_time}</Col>
                            </Row>
                          </Col>
                        </Row>
                        <Row className="my-3">
                          <Col className="border-bottom me-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Description:</strong>
                              </Col>
                              <Col>{taskDetails?.description}</Col>
                            </Row>
                          </Col>
                           <Col className=" ms-5">
                           
                          </Col>
                        </Row>
                      </Container>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Tab.Pane>
              <Tab.Pane eventKey="related">Related content here</Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
        <Activities relatedToId={id} />
      </div>    
      <TaskModal show={showModal} onHide={handleClose} rowData={taskDetails} setRefreshTable={setRefreshTable} />
      <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Task"
              message="Are you sure you want to delete this task?"
              confirmText="Delete"
              cancelText="Cancel"
            />
      <ChangeOwnerModal
        selectedRows={[taskDetails]}
        show={showOwnerModal}
        onHide={handleOwnerClose}
        type="task"
        setRefreshTable={setRefreshTable}
      />
    </Container>
  )
}

export default TaskDetail
