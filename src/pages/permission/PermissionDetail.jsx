import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Tab,
  Accordion,
  Container,
  Nav,
  Card,
  Table,
  Form,
} from "react-bootstrap";
import { Navigate, useParams } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import PermissionModal from "./PermissionModal";
import uvCapitalApi from "../../api/uvCapitalApi";
import Activities from "../../components/Activities";
import toast  from 'react-hot-toast';
import ConfirmationModal from "../../components/ConfirmationModal";

const PermissionDetail = ({ refreshTable, setRefreshTable, permission = {}  }) => {
  const { id } = useParams();
  // const rowData = location.state?.rowData;
  const [permissionDetails, setPermissionDetails] = useState();
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
      const [showConfirmModal, setShowConfirmModal] = useState(false);
      const [permissionToDelete, setPermissionToDelete] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      const response = await uvCapitalApi.getListOfGroupsPermissionsById(id);
      setPermissionDetails(response.success ? response.data[0] : {});
    };
    fetchPermissions();
  }, [id, refreshTable]);

      const confirmDeletePermission = (id) => {
        setPermissionToDelete(id);
        setShowConfirmModal(true);
      };
    
      const handleConfirmedDelete = async () => {
        if (!permissionToDelete) return;
        try {
          const res = await uvCapitalApi.deletePermissions(permissionToDelete);
          if (res.success) {
            toast.success(res?.message);
            Navigate(`/permissions`);
          } else {
            toast.error("Failed to delete Permission.");
          }
        } catch (err) {
          console.error(err);
          toast.error("An error occurred.");
        } finally {
          setShowConfirmModal(false);
          setPermissionToDelete(null);
        }
      };

  return (
    <Container>
      <div className="container mb-5 ">
        <div>
          <Tab.Container defaultActiveKey="details">
            <div className="d-flex justify-content-between align-items-center tabStyle rounded">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="details">Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="related">Related</Nav.Link>
                </Nav.Item>
              </Nav>
              <div>
                {permission.update && (<Button
                  className="btn btn-sm btn-light rounded-3 me-2 px-1"
                  title="Edit"
                  size="sm"
                  onClick={handleOpen}
                >
                  <MdEdit className="fs-5" />
                </Button>)}
                {permission.delete && (<Button
                  className="btn btn-light rounded-3 me-2 px-1"
                  title="Delete"
                  size="sm"
                  onClick={() => confirmDeletePermission(id)}
                >
                  <MdDelete className="fs-5" />
                </Button>)}
                {permission.owner && (<Button
                  className="btn btn-light rounded-3 me-3 px-1"
                  title="Change Owner"
                  size="sm"
                >
                  <AiOutlineUsergroupAdd className="fs-5" />
                </Button>)}
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
                    <Accordion.Header className="border border-2 ">
                      About:
                    </Accordion.Header>
                    <Accordion.Body>
                      <Container>
                        <Row className="my-3">
                          <Col className="border-bottom me-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Group Name:</strong>
                              </Col>
                              <Col>{permissionDetails?.name}</Col>
                            </Row>
                          </Col>
                          <Col className="border-bottom ms-5">
                            <Row>
                              <Col>
                                {" "}
                                <strong>Total Members:</strong>
                              </Col>
                              <Col>{permissionDetails?.total_members}</Col>
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
                              <Col>{permissionDetails?.description}</Col>
                            </Row>
                          </Col>
                          <Col className=" ms-5"></Col>
                        </Row>
                      </Container>
                    </Accordion.Body>
                  </Accordion.Item>
                 
                  <Accordion.Item eventKey="1">
                    <Accordion.Header className="border border-2 ">
                      Module Permission:
                    </Accordion.Header>
                    <Accordion.Body>
                      <Container>
                        <Table
                          responsive
                          bordered
                          className="text-center align-middle"
                        >
                          <thead>
                            <tr>
                              <th>Module Name</th>
                              <th>View Records</th>
                              <th>View</th>
                              <th>Create</th>
                              <th>Edit</th>
                              <th>Delete</th>
                              <th>Owner</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              permissionDetails?.modules || {}
                            )?.map(([moduleKey, permissions]) => (
                              <tr key={moduleKey}>
                                <td className="text-start">{moduleKey}</td>
                                <td>
                                  {permissions.view_all ? "✔️" : "❌"}
                                </td>
                                <td>{permissions.tab_view ? "✔️" : "❌"}</td>
                                <td>{permissions.create ? "✔️" : "❌"}</td>
                                <td>{permissions.edit ? "✔️" : "❌"}</td>
                                <td>{permissions.delete ? "✔️" : "❌"}</td>
                                <td>{permissions.owner ? "✔️" : "❌"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Container>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Tab.Pane>
              <Tab.Pane eventKey="related">
                <Accordion
                  defaultActiveKey={["0"]}
                  alwaysOpen
                  className="detail-h2 detail-h3"
                >
                  <Accordion.Item eventKey="0">
                    <Accordion.Header className="border border-2 ">
                      Users:
                    </Accordion.Header>
                    <Accordion.Body>
                      
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
        <Activities relatedToId={id} />
      </div>
      <PermissionModal
        show={showModal}
        onHide={handleClose}
        rowData={permissionDetails}
        setRefreshTable={setRefreshTable}
      />
       <ConfirmationModal
              show={showConfirmModal}
              onHide={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmedDelete}
              title="Delete Permission"
              message="Are you sure you want to delete this permission?"
              confirmText="Delete"
              cancelText="Cancel"
            />
    </Container>
  );
};
export default PermissionDetail;