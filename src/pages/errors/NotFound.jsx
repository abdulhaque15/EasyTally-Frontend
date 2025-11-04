import React from 'react'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <Container className='d-flex justify-content-center align-items-center'>
      <Row className='w-75 mt-5'>
        <Col className='mt-5'>
          <Card>
            <Card.Title>
              <p className='text-center' style={{ fontSize: "150px", color: "var(--primary-color)" }}> 404</p>
            </Card.Title>
            <Card.Body>
              <p className='text-center fw-bold fs-4'>Oops! The page your are looking for is not here.</p>
              <Row>
                <Col lg={12} className='d-flex justify-content-center'>
                  <Link to={"/login"} className='btn btn-lg custom-btn-secondary'>Go To Login</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound