/**
 * File Upload Integration Tests
 * 
 * These tests verify the complete file upload and processing workflow
 * including actual file uploads, database interactions, and job management.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../src/app.js';
import importJobService from '../../src/services/import-job.service.js';

// Use __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to test XML file
const TEST_XML_PATH = path.join(__dirname, '../fixtures/test-products.xml');

// Create test XML file if it doesn't exist
beforeAll(() => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  
  // Create fixtures directory if it doesn't exist
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  // Create a simple test XML file
  if (!fs.existsSync(TEST_XML_PATH)) {
    const testXml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <geko>
        <products>
          <product>
            <code>TEST001</code>
            <ean>1234567890123</ean>
            <category>
              <id>cat-1</id>
              <name>Test Category</name>
              <path>Test/Category</path>
            </category>
            <producer>
              <name>Test Producer</name>
            </producer>
            <unit>PC</unit>
            <description>
              <name>Test Product</name>
              <short>Short description</short>
              <long>Long detailed description</long>
            </description>
            <vat>23</vat>
            <variants>
              <variant>
                <code>VAR001</code>
                <weight>1.5</weight>
                <stock>
                  <quantity>100</quantity>
                  <available>true</available>
                </stock>
                <prices>
                  <price>
                    <amount>19.99</amount>
                    <currency>EUR</currency>
                    <type>retail</type>
                  </price>
                </prices>
              </variant>
            </variants>
            <images>
              <image>
                <url>https://example.com/image1.jpg</url>
                <is_main>true</is_main>
              </image>
            </images>
          </product>
        </products>
      </geko>
    `;
    
    fs.writeFileSync(TEST_XML_PATH, testXml.trim());
  }
});

describe('File Upload Integration', () => {
  // This test should be run in a test environment
  // with a test database connection to avoid affecting production data
  describe('XML File Upload and Processing', () => {
    it('should upload XML file and create an import job', async () => {
      // Verify test file exists
      expect(fs.existsSync(TEST_XML_PATH)).toBe(true);
      
      // Upload the test file
      const response = await request(app)
        .post('/api/upload/xml')
        .attach('xmlFile', TEST_XML_PATH)
        .expect(200);
      
      // Verify response
      expect(response.body.success).toBe(true);
      expect(response.body.jobId).toBeDefined();
      
      // Store job ID for subsequent tests
      const jobId = response.body.jobId;
      
      // Wait for job to start processing (give it a short time)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check job status
      const statusResponse = await request(app)
        .get(`/api/upload/jobs/${jobId}`)
        .expect(200);
      
      // Verify job is being processed
      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.job).toBeDefined();
      expect(['created', 'processing']).toContain(statusResponse.body.job.status);
      
      // Wait for processing to complete (would normally use polling)
      // For test purposes, we'll just wait a few seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Final status check
      const finalStatusResponse = await request(app)
        .get(`/api/upload/jobs/${jobId}`)
        .expect(200);
      
      // Job might be completed or still processing, depending on timing
      expect(finalStatusResponse.body.success).toBe(true);
      
      // List all jobs
      const listResponse = await request(app)
        .get('/api/upload/jobs')
        .expect(200);
      
      // Verify jobs are listed
      expect(listResponse.body.success).toBe(true);
      expect(Array.isArray(listResponse.body.jobs)).toBe(true);
      expect(listResponse.body.jobs.some(job => job.id === jobId)).toBe(true);
    }, 15000); // Increase timeout to allow for processing
    
    it('should reject non-XML files', async () => {
      // Create a temporary non-XML file
      const tempFilePath = path.join(__dirname, '../fixtures/invalid.txt');
      fs.writeFileSync(tempFilePath, 'This is not an XML file');
      
      // Try to upload non-XML file
      const response = await request(app)
        .post('/api/upload/xml')
        .attach('xmlFile', tempFilePath)
        .expect(400);
      
      // Verify rejection
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only XML files are allowed');
      
      // Clean up
      fs.unlinkSync(tempFilePath);
    });
    
    it('should cancel a running job', async () => {
      // Upload file to create a job
      const response = await request(app)
        .post('/api/upload/xml')
        .attach('xmlFile', TEST_XML_PATH)
        .expect(200);
      
      const jobId = response.body.jobId;
      
      // Try to cancel the job
      const cancelResponse = await request(app)
        .delete(`/api/upload/jobs/${jobId}`)
        .expect(200);
      
      // Verify cancellation
      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.message).toContain('cancelled');
      
      // Check job status
      const statusResponse = await request(app)
        .get(`/api/upload/jobs/${jobId}`)
        .expect(200);
      
      // Verify job is cancelled
      expect(statusResponse.body.job.status).toBe('cancelled');
    });
  });
});

// Clean up
afterAll(() => {
  // Optionally remove test files
  // fs.unlinkSync(TEST_XML_PATH);
}); 