import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const CloudinaryTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testCloudinaryConnection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8085/api/images/cloudinary-test');
      setResult(response.data);
      console.log('Cloudinary test response:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unknown error occurred');
      console.error('Cloudinary test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>Cloudinary Connection Test</Card.Header>
      <Card.Body>
        <p>
          Test the connection to Cloudinary by clicking the button below. This will verify 
          if your Cloudinary configuration is working correctly.
        </p>
        
        <Button 
          variant="primary" 
          onClick={testCloudinaryConnection} 
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Testing...</span>
            </>
          ) : (
            'Test Cloudinary Connection'
          )}
        </Button>

        {result && (
          <div className="mt-3">
            <Alert variant={result.success ? 'success' : 'warning'}>
              <h5>Test Results:</h5>
              <p>{result.message || (result.success ? 'Connection successful!' : 'Connection failed')}</p>
              {result.testImageUrl && (
                <div>
                  <p>Test image uploaded successfully:</p>
                  <img 
                    src={result.testImageUrl} 
                    alt="Test Upload" 
                    style={{ maxWidth: '100px', border: '1px solid #ddd' }} 
                  />
                </div>
              )}
              <pre className="mt-2" style={{ fontSize: '0.8rem' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Alert>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mt-3">
            <h5>Error:</h5>
            <p>{error}</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default CloudinaryTest; 