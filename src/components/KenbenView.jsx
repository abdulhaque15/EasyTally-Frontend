import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { GrView } from "react-icons/gr";
import { MdDelete, MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";
import { GlobalEditModal } from "../helper/GlobalHelper";

const KenbenView = ({ data, permission, headers, type, onDelete, setRefreshTable }) => {

  const [statusArray, setStatusArray] = useState([]);
  const [editData, setEditData] = useState(null);


  useEffect(() => {
    if (Array.isArray(data)) {
      const grouped = data.reduce((acc, record) => {
        console.log('record', record)
        const status = record.status || record.lead_status || 'No Status';
        if (!acc[status]) acc[status] = [];
        acc[status].push(record);
        return acc;
      }, {});

      const combinedArray = Object.entries(grouped).map(
        ([status, records]) => ({
          status,
          records,
        })
      );

      const filteredArray = combinedArray.filter(
        (item) => item.status !== "No Status"
      );


      setStatusArray(
        filteredArray.sort((a, b) => a.status.localeCompare(b.status))
      );
    }
  }, [data]);

  const handleOpen = (modalType, record) => {
    setEditData(record);
  };

  const handleClose = () => {
    setEditData(null);
  };

  return (
    <>

      <div className="detail-h3 pt-3">
        <Row className="table-row-section d-flex flex-nowrap">
          {statusArray?.map((item, index) => (
            <Col key={index} lg={3} style={{ minWidth: "300px" }}>
              <Card>
                <Card.Header
                  className="kenben-view-header d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--secondary-color)"
                        : "var(--primary-color)",
                    color:
                      index % 2 === 0
                        ? "var(--highlight-color)"
                        : "var(--dark-color)",
                    cursor: "pointer",
                  }}
                >
                  <span>
                    {item.status?.charAt(0).toUpperCase() +
                      item.status?.slice(1).toLowerCase()}
                  </span>

                  <span className="badge text-bg-light">
                    {item?.records !== null ? item?.records?.length : 0}
                  </span>
                </Card.Header>
                <Card.Body>
                  {item.records?.map((record, key) => (
                    <Card className="mt-2" key={key}>
                      <Card.Body>
                        <Row>
                          <Col className="d-flex flex-column text-truncate">
                            {headers?.map((header) => {
                              const value = record[header.key];
                              if (header.key === "name") {
                                return (
                                  <span key={header.key}>
                                    {header.label} :{" "}
                                    <Link className="fw-bold" to={`view/${record.id}`}>
                                      {value || ""}
                                    </Link>
                                  </span>
                                );
                              }

                              return (
                                <span key={header.key}>
                                  {header.label} : {value || ""}
                                </span>
                              );
                            })}
                          </Col>
                        </Row>
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-end">
                        <Row className="d-flex justify-content-between align-items-center">
                          <Col lg={4}>
                            {permission.viewAll && <Link
                              to={`view/${record.id}`}
                              className="text-dark"
                            >
                              <GrView className="icon-default fs-4 p-1 border border-secondary rounded-pill" />
                            </Link>}
                          </Col>
                          {permission.update && <Col lg={4}>
                            <MdEdit
                              className="icon-default fs-4 p-1 border border-secondary rounded-pill"
                              onClick={() => handleOpen("edit", record)}
                            />
                          </Col>}
                          {permission.delete && <Col lg={4}>
                            <MdDelete className="icon-default fs-4 p-1 border border-secondary rounded-pill text-danger" onClick={() => onDelete?.(record.id)} />
                          </Col>}
                        </Row>
                      </Card.Footer>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <GlobalEditModal
          type={type}
          show={!!editData}
          onHide={handleClose}
          rowData={editData}
          setRefreshTable={setRefreshTable}
        />

      </div>
    </>
  );
};

export default KenbenView;
