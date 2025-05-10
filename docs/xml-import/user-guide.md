# XML Import User Guide

## Overview

The XML Import feature allows administrators to upload and process GEKO XML product files directly through the admin interface. This guide provides detailed instructions for using the XML import system, understanding the import process, and troubleshooting common issues.

## Table of Contents

1. [Requirements](#requirements)
2. [Accessing the Import Tool](#accessing-the-import-tool)
3. [Uploading XML Files](#uploading-xml-files)
4. [Monitoring Import Progress](#monitoring-import-progress)
5. [Understanding Import Results](#understanding-import-results)
6. [Working with Import History](#working-with-import-history)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)
8. [Security Considerations](#security-considerations)
9. [Technical Reference](#technical-reference)

## Requirements

Before using the XML Import feature, ensure you have:

- **Admin privileges** on the AliTools B2B platform
- Valid GEKO XML file(s) in the correct format
- Web browser with JavaScript enabled
- Sufficient disk space for storing uploaded files temporarily
- Stable internet connection (especially for large files)

**File Requirements:**
- File format: XML (text/xml, application/xml)
- Maximum file size: 50MB
- Encoding: UTF-8
- Must conform to GEKO XML schema structure

## Accessing the Import Tool

1. Log in to the AliTools B2B Admin Panel
2. Navigate to the **Products** section in the main navigation
3. Select **XML Import** from the dropdown menu
4. You will be directed to the XML Import interface

The XML Import page is divided into several sections:

- Upload area (top section)
- Import guidelines
- Import history table (bottom section)

![XML Import Page Screenshot]

## Uploading XML Files

### Step 1: Prepare Your XML File

Ensure your XML file meets the requirements listed above and includes all mandatory elements. For the full XML schema reference, see the [Technical Reference](#technical-reference) section.

### Step 2: Upload the File

1. Click the upload area or drag your XML file directly into the designated drop zone
2. The file will be validated for format and size
3. If validation passes, you will see a confirmation with the file name and size
4. Click the **Import** button to begin processing

![Upload Process Screenshot]

### Step 3: Confirm Import

A confirmation dialog will appear:

1. Review the file details
2. Select import options if available (e.g., skip images)
3. Click **Confirm** to start the import process

The system will upload the file and queue it for processing. For large files, the upload may take some time depending on your internet connection.

## Monitoring Import Progress

Once the import process begins:

1. A progress indicator will show the status of the import
2. The indicator includes:
   - Percentage complete
   - Current processing stage
   - Elapsed time
   - Cancel button for stopping the process

![Import Progress Screenshot]

**Note:** You can navigate away from the page without interrupting the import process. The import will continue in the background.

## Understanding Import Results

When the import is complete, a results summary will be displayed:

- **Success:** Green check mark with summary statistics
- **Partial Success:** Yellow warning icon with details about successful and failed records
- **Failed:** Red error icon with error details

The summary includes:
- Total products processed
- Products imported successfully
- Products updated
- Products skipped or failed
- Warnings or errors encountered

![Import Results Screenshot]

For detailed import logs, click the **View Details** button.

## Working with Import History

The Import History table shows all previous import attempts, their status, and results:

### Features

- **Filtering:** Filter by filename, date range, or status
- **Sorting:** Sort by any column (click column headers)
- **Search:** Search for specific imports
- **Actions:** View details, download logs, or cancel running imports

### Status Indicators

- **Processing:** Blue spinner icon - import in progress
- **Completed:** Green check mark - import completed successfully
- **Failed:** Red X icon - import failed
- **Cancelled:** Orange icon - import was cancelled
- **Queued:** Gray clock icon - import waiting to start

![Import History Screenshot]

### Viewing Details

Click the **Details** icon next to any import to view:

- Complete import statistics
- Processing time and duration
- Error logs (if any)
- Product-level success/failure details

## Troubleshooting Common Issues

### File Upload Failures

| Issue | Possible Solution |
|---|---|
| "File too large" error | Split the XML file into smaller parts (under 50MB each) |
| "Invalid XML format" error | Check the file with an XML validator to ensure proper formatting |
| "Upload timeout" error | Try uploading during off-peak hours or with a more stable connection |
| Browser freezes during upload | Try a different browser or update your current browser |

### Processing Errors

| Issue | Possible Solution |
|---|---|
| "Missing required fields" error | Ensure all mandatory fields are present in your XML |
| "Invalid product codes" error | Check for duplicate or invalid product codes |
| "Database constraint violation" | Usually caused by duplicate unique fields or invalid references |
| Import stuck at a specific percentage | Check server logs for specific errors at that stage |

### Authentication Issues

| Issue | Possible Solution |
|---|---|
| "Unauthorized" error | Verify you have admin privileges |
| "Session expired" error | Log in again and retry the upload |
| Rate limit exceeded | Wait until the rate limit window resets (typically 15 minutes) |

## Security Considerations

The XML Import feature includes several security measures:

- **Rate limiting:** Maximum 10 uploads per 15-minute window
- **Authentication:** Only administrators can access the import function
- **Validation:** Strict file type and content validation
- **Audit logging:** All upload attempts are logged for security review
- **Input sanitization:** XML content is sanitized before processing

## Technical Reference

### XML Schema Structure

The GEKO XML file must follow this general structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<geko>
  <products>
    <product>
      <code>PRODUCT_CODE</code> <!-- Required, unique -->
      <ean>PRODUCT_EAN</ean> <!-- Optional -->
      <category>
        <id>CATEGORY_ID</id> <!-- Required -->
        <name>CATEGORY_NAME</name> <!-- Required -->
        <path>CATEGORY_PATH</path> <!-- Optional -->
        <parent_id>PARENT_CATEGORY_ID</parent_id> <!-- Optional -->
      </category>
      <producer>
        <name>PRODUCER_NAME</name> <!-- Required -->
      </producer>
      <unit>UNIT_CODE</unit> <!-- Required -->
      <description>
        <name>PRODUCT_NAME</name> <!-- Required -->
        <short>SHORT_DESCRIPTION</short> <!-- Optional -->
        <long>LONG_DESCRIPTION</long> <!-- Optional -->
      </description>
      <variants>
        <!-- At least one variant is required -->
        <variant>
          <code>VARIANT_CODE</code> <!-- Required, unique -->
          <stock>
            <quantity>100</quantity> <!-- Required -->
            <available>true</available> <!-- Optional -->
          </stock>
          <prices>
            <!-- At least one price is required -->
            <price>
              <amount>19.99</amount> <!-- Required -->
              <currency>EUR</currency> <!-- Required -->
              <type>retail</type> <!-- Required -->
            </price>
          </prices>
        </variant>
      </variants>
      <!-- Optional elements -->
      <images>...</images>
      <documents>...</documents>
      <properties>...</properties>
    </product>
    <!-- More products -->
  </products>
</geko>
```

### API Endpoints

The XML Import feature uses the following API endpoints:

- `POST /api/upload/xml` - Upload and process XML file
- `GET /api/upload/jobs` - List all import jobs
- `GET /api/upload/jobs/:jobId` - Get specific job status
- `DELETE /api/upload/jobs/:jobId` - Cancel a running job

For more technical details, refer to the [API Documentation](../api/endpoints/upload.md).

---

*This guide was last updated on [DATE]* 