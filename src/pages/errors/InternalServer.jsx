import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const InternalServer = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Row className="w-75 mt-5">
        <Col className="mt-5">
          <Card>
            <Card.Title>
              <p className="text-center" style={{ fontSize: "150px", color: "red" }}>500</p>
            </Card.Title>
            <Card.Body>
              <p className="text-center fw-bold fs-4">Oops! Something went wrong on our end.</p>
              <Row>
                <Col lg={12} className="d-flex justify-content-center">
                  <Link to={"/login"} className='btn btn-lg internal-btn-secondary' style={{backgroundColor : "red !important"}}>Go To Login</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InternalServer;