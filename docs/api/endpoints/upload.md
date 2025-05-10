# Upload API Endpoints

This documentation covers the API endpoints related to file uploads and import operations in the AliTools B2B platform.

## Base URL

All endpoints are relative to the base API URL:

```
https://api.alitools.io/v1
```

## Authentication

All endpoints require authentication. Send a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Upload XML File

Upload and process an XML file containing product data.

```
POST /upload/xml
```

#### Request

**Content-Type:** `multipart/form-data`

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| xmlFile | File | Yes | The XML file to upload (max 50MB) |
| skipImages | Boolean | No | If true, image processing will be skipped (default: false) |

**Example Request:**

```bash
curl -X POST https://api.alitools.io/v1/upload/xml \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "xmlFile=@/path/to/products.xml" \
  -F "skipImages=true"
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "File uploaded successfully and queued for processing",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid file or parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `413 Payload Too Large` - File exceeds size limit
- `429 Too Many Requests` - Rate limit exceeded

### List Import Jobs

Get a list of all XML import jobs.

```
GET /upload/jobs
```

#### Request

**Parameters:** None

**Example Request:**

```bash
curl -X GET https://api.alitools.io/v1/upload/jobs \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "jobs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "progress": 100,
      "created": "2025-05-15T10:30:00Z",
      "updated": "2025-05-15T10:35:45Z",
      "completed": "2025-05-15T10:35:45Z",
      "filename": "products.xml",
      "fileSize": 1048576
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "status": "processing",
      "progress": 45,
      "created": "2025-05-15T11:20:00Z",
      "updated": "2025-05-15T11:22:15Z",
      "completed": null,
      "filename": "products-update.xml",
      "fileSize": 2097152
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions

### Get Job Status

Get detailed status information for a specific import job.

```
GET /upload/jobs/:jobId
```

#### Request

**URL Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| jobId | String | Yes | The ID of the import job |

**Example Request:**

```bash
curl -X GET https://api.alitools.io/v1/upload/jobs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "job": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "progress": 100,
    "created": "2025-05-15T10:30:00Z",
    "updated": "2025-05-15T10:35:45Z",
    "completed": "2025-05-15T10:35:45Z",
    "filename": "products.xml",
    "fileSize": 1048576,
    "error": null,
    "result": {
      "totalProducts": 150,
      "importedProducts": 148,
      "skippedProducts": 2,
      "errors": [
        {
          "code": "INVALID_EAN",
          "productCode": "PROD123",
          "message": "Invalid EAN code format"
        }
      ]
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Job not found

### Cancel Import Job

Cancel a running import job.

```
DELETE /upload/jobs/:jobId
```

#### Request

**URL Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| jobId | String | Yes | The ID of the import job to cancel |

**Example Request:**

```bash
curl -X DELETE https://api.alitools.io/v1/upload/jobs/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <your_jwt_token>"
```

#### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Job 550e8400-e29b-41d4-a716-446655440001 has been cancelled"
}
```

**Error Responses:**

- `400 Bad Request` - Job cannot be cancelled (completed/failed)
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Job not found

## Rate Limiting

The upload endpoints are subject to rate limiting:

- XML file uploads: 10 requests per 15-minute window
- Job status/list/cancel operations: 100 requests per minute

When a rate limit is exceeded, the API will respond with a `429 Too Many Requests` status code.

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

For validation errors, additional details may be provided:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "xmlFile",
      "message": "File is required"
    }
  ]
}
```

## Webhook Notifications

For long-running imports, you can register webhooks to receive notifications when jobs are completed:

1. Register a webhook URL in your account settings
2. When jobs complete, a POST request will be sent to your webhook with job details

Example webhook payload:

```json
{
  "event": "import.completed",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "timestamp": "2025-05-15T10:35:45Z",
  "result": {
    "totalProducts": 150,
    "importedProducts": 148,
    "skippedProducts": 2
  }
}
```

---

*Last updated: [DATE]*