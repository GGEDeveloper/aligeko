# GEKO API Integration

## Overview

The GEKO API Integration is a critical component of the AliTools B2B E-commerce platform that synchronizes product catalog data between the GEKO ERP system and our application. This integration enables real-time product information, inventory management, and pricing synchronization.

This documentation covers both the API-based synchronization and the XML file upload functionality for manual data imports.

## Integration Architecture

The GEKO integration follows a service-oriented architecture with several key components:

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  GEKO API    │      │  Integration │      │  Database    │
│  Controller  │◄────►│  Services    │◄────►│  Models      │
└──────────────┘      └──────────────┘      └──────────────┘
       ▲                     ▲                    ▲
       │                     │                    │
       ▼                     ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  API Routes  │      │  XML Parser  │      │  Sync Health │
│              │      │  Utility     │      │  Monitor     │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Core Components

- **GekoDataService**: Service for fetching data from GEKO API, transforming XML, and persisting to the database
- **XmlParser**: Utility for parsing and transforming XML data to match database schema
- **SyncHealthService**: Service for monitoring and tracking synchronization health
- **GEKO API Controller**: Endpoints for manual sync and sync status management

### Key Files

- **Controller**: `server/src/controllers/geko-api.controller.js`
- **Service**: `server/src/services/geko-data-service.js`
- **Parser**: `server/src/utils/xml-parser.js`
- **Routes**: `server/src/routes/geko-api.routes.js`
- **Health**: `server/src/services/sync-health-service.js`
- **Models**: `server/src/models/product.model.js`, `server/src/models/category.model.js`

## API Synchronization Process

The synchronization process follows these steps:

1. **Request Data**: GekoDataService makes HTTP requests to the GEKO API
2. **Parse Response**: XML data is received and passed to the XmlParser
3. **Transform Data**: Parser converts XML structure to match our database schema
4. **Database Operations**: Transformed data is used to create/update database records
5. **Health Monitoring**: SyncHealthService tracks the success/failure of each sync

### Configuration

The GEKO API integration requires the following configuration parameters in `server/src/config/app-config.js`:

```javascript
// GEKO API Configuration
export const GEKO_API_CONFIG = {
  baseUrl: process.env.GEKO_API_URL || 'https://api.geko.com/v1',
  username: process.env.GEKO_API_USERNAME,
  password: process.env.GEKO_API_PASSWORD,
  timeout: process.env.GEKO_API_TIMEOUT || 30000, // 30 seconds
  syncInterval: process.env.GEKO_SYNC_INTERVAL || 3600000, // 1 hour
};
```

## XML File Upload Functionality

### Overview

The XML file upload feature allows administrators to manually upload XML product data files. This feature is useful when:

1. Direct API access is temporarily unavailable
2. Historical product data needs to be imported
3. Test data needs to be loaded into the system

### Implementation

The XML upload functionality consists of:

1. **File Upload Endpoint**: Secure endpoint with authentication and validation
2. **File Processing Service**: Component for handling uploaded files
3. **Admin UI Integration**: Interface in the admin panel for file upload

### Upload Process Flow

1. Administrator navigates to the Product Management section in the Admin Panel
2. User selects the "Import Products" option
3. User uploads an XML file through the provided interface
4. System validates the file format and size
5. System processes the XML file using the same parser as the API integration
6. System displays processing results (success, errors, products imported)

## XML Format

The XML format expected by the GEKO integration follows a specific structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<geko>
  <products>
    <product>
      <code>AB12345</code>
      <ean>5901234123457</ean>
      <category>
        <id>hand-tools</id>
        <name>Hand Tools</name>
        <path>Tools/Hand Tools</path>
        <parent_id>tools</parent_id>
      </category>
      <producer>
        <name>AliTools</name>
        <description>Premium tool manufacturer</description>
        <website>https://alitools.com</website>
      </producer>
      <name>Premium Screwdriver Set</name>
      <description>Set of 5 premium screwdrivers with ergonomic handles</description>
      <price>
        <retail>19.99</retail>
        <wholesale>14.99</wholesale>
        <distributor>12.99</distributor>
      </price>
      <inventory>
        <quantity>250</quantity>
        <status>in_stock</status>
        <warehouse>main</warehouse>
      </inventory>
      <attributes>
        <attribute>
          <name>color</name>
          <value>red</value>
        </attribute>
        <attribute>
          <name>material</name>
          <value>steel</value>
        </attribute>
      </attributes>
      <images>
        <image>
          <url>https://alitools.com/images/products/AB12345_1.jpg</url>
          <type>main</type>
        </image>
        <image>
          <url>https://alitools.com/images/products/AB12345_2.jpg</url>
          <type>gallery</type>
        </image>
      </images>
    </product>
    <!-- Additional products -->
  </products>
</geko>
```

For a complete example, see `docs/geko-xml-format.xml`.

## Error Handling

The GEKO integration implements robust error handling with several strategies:

1. **Retry Logic**: Failed API requests are retried with exponential backoff
2. **Partial Processing**: System processes as many valid products as possible even if some fail
3. **Detailed Logging**: All errors are logged with context for troubleshooting
4. **Health Reporting**: SyncHealthService provides metrics on sync success/failure rates

### Common Errors

| Error | Description | Resolution |
|-------|-------------|------------|
| Authentication Failed | GEKO API credentials are invalid | Verify credentials in environment variables |
| Connection Timeout | GEKO API is not responding | Check network connectivity and GEKO API status |
| Invalid XML Format | XML structure does not match expected schema | Validate XML against the schema before upload |
| Duplicate Product | Product with same code already exists | Use update functionality instead of create |

## API Endpoints

### `GET /api/v1/geko/sync-status`

Gets the current synchronization status and health metrics.

**Authentication Required**: Yes (Admin)

**Response:**
```json
{
  "status": "success",
  "data": {
    "lastSync": "2023-06-15T14:30:00Z",
    "nextScheduledSync": "2023-06-15T15:30:00Z",
    "syncHealth": {
      "successRate": 98.5,
      "totalProducts": 1250,
      "failedProducts": 18,
      "averageSyncTime": 45.2
    }
  }
}
```

### `POST /api/v1/geko/sync`

Triggers a manual synchronization with the GEKO API.

**Authentication Required**: Yes (Admin)

**Response:**
```json
{
  "status": "success",
  "message": "Synchronization started",
  "data": {
    "syncId": "sync-2023-06-15-143012",
    "estimatedCompletionTime": "2023-06-15T14:35:00Z"
  }
}
```

### `POST /api/v1/geko/upload`

Uploads and processes an XML file with product data.

**Authentication Required**: Yes (Admin)

**Request**: Multipart form data with `file` field containing the XML file.

**Response:**
```json
{
  "status": "success",
  "message": "File processed successfully",
  "data": {
    "totalProducts": 150,
    "createdProducts": 120,
    "updatedProducts": 25,
    "failedProducts": 5,
    "errors": [
      {
        "productCode": "XY12345",
        "error": "Invalid product category"
      }
    ]
  }
}
```

## Security Considerations

- **Authentication**: All GEKO API routes require admin authentication
- **Input Validation**: XML files are validated before processing
- **Rate Limiting**: API endpoints have rate limits to prevent abuse
- **File Size Limits**: XML file uploads are limited to 10MB
- **Content Type Verification**: Only XML files are accepted

## Testing

### Unit Tests

The GEKO integration includes comprehensive unit tests:

- Parser tests: `server/tests/unit/utils/xml-parser.test.js`
- Service tests: `server/tests/unit/services/geko-data-service.test.js`
- Controller tests: `server/tests/unit/controllers/geko-api.controller.test.js`

### Integration Tests

Integration tests cover the full synchronization flow:

- API integration tests: `server/tests/integration/geko-api.test.js`
- Database integration tests: `server/tests/integration/geko-database.test.js`

## Monitoring and Maintenance

### Health Dashboard

The Admin Panel includes a GEKO Sync Health Dashboard that displays:

- Sync success/failure rates
- Last successful synchronization
- Next scheduled synchronization
- Error trends and patterns
- Product update statistics

### Scheduled Tasks

- **Automatic Sync**: System automatically synchronizes with GEKO API on a configurable schedule
- **Health Check**: Regular health checks verify GEKO API availability
- **Log Rotation**: Sync logs are rotated and archived for historical reference

## Future Improvements

- **Real-time Webhooks**: Implement webhook support for real-time product updates
- **Differential Sync**: Only fetch and update changed products
- **Enhanced Validation**: More comprehensive XML schema validation
- **Parallel Processing**: Process large XML files in parallel for better performance
- **Excel Import**: Support for Excel file imports with automatic conversion to XML

## Related Documentation

- [Product Catalog](../features/product-catalog.md)
- [Admin Dashboard](../user-guides/admin/dashboard.md)
- [Database Schema](../database/schema.md#product-tables)
- [XML Upload Task](task_023.txt) 