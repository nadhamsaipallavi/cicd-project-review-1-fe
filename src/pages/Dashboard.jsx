import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CloudinaryTest from '../components/cloudinary-test/CloudinaryTest';

function Dashboard() {
  return (
    <Container fluid className="dashboard-container">
      <Row className="g-3 mb-4">
        <Col md={12} lg={6}>
          {/* System Health Check */}
          <CloudinaryTest />
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard; 