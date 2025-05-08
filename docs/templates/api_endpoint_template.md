# API Endpoint: [ENDPOINT_PATH]

## Overview
Brief description of what this endpoint does and its purpose in the system.

**URL:** `[HTTP_METHOD] /api/[VERSION]/[ENDPOINT_PATH]`

**Controller:** `[ControllerName]`

**Route File:** `[path/to/route/file.js]`

## Authentication
- **Required:** [Yes/No]
- **Roles:** [Admin/User/Guest/etc.]
- **Token Type:** [JWT/API Key/Session]

## Request Parameters

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | string | Yes | Description of the parameter |
| `param2` | integer | No | Description of the parameter |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filter` | string | No | `all` | Filter results by specific criteria |
| `page` | integer | No | `1` | Page number for pagination |
| `limit` | integer | No | `20` | Number of items per page |
| `sort` | string | No | `created_at` | Field to sort by |
| `order` | string | No | `desc` | Sort order (asc/desc) |

### Request Body
```json
{
  "property1": "string (required) - Description of property1",
  "property2": 123 (optional) - Description of property2",
  "object1": {
    "nestedProperty1": "string (required) - Description of nestedProperty1"
  },
  "array1": [
    {
      "arrayItem1": "string (required) - Description of arrayItem1"
    }
  ]
}
```

## Response

### Success Response
**Code:** `200 OK` (or appropriate success code)

**Content Example:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "property1": "value1",
    "property2": 123,
    "createdAt": "2023-06-15T14:30:00Z",
    "updatedAt": "2023-06-15T14:30:00Z"
  },
  "message": "Operation successful"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": {
    "property1": "Property1 is required"
  }
}
```

#### 401 Unauthorized
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Authentication required to access this resource"
}
```

#### 403 Forbidden
```json
{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

#### 404 Not Found
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "The requested resource was not found"
}
```

#### 500 Internal Server Error
```json
{
  "status": "error",
  "code": "SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

## Examples

### cURL
```bash
curl -X [METHOD] \
  https://api.alitools.com/v1/[ENDPOINT_PATH] \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [TOKEN]' \
  -d '{
    "property1": "value1",
    "property2": 123
  }'
```

### JavaScript (Axios)
```javascript
import axios from 'axios';

const makeRequest = async () => {
  try {
    const response = await axios({
      method: '[METHOD]',
      url: 'https://api.alitools.com/v1/[ENDPOINT_PATH]',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer [TOKEN]'
      },
      data: {
        property1: 'value1',
        property2: 123
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

## Notes
- Any important notes about using this endpoint
- Rate limiting considerations
- Caching behavior
- Pagination details
- Special error cases
- Related endpoints

## Changelog
| Date | Change |
|------|--------|
| YYYY-MM-DD | Initial implementation |
| YYYY-MM-DD | Added new parameter `paramName` |
| YYYY-MM-DD | Changed response format | 