---
trigger: always_on
description: 
globs: 
---
# GEKO API Integration and XML Data Processing

This rule documents the standard patterns for integrating with the GEKO API and processing XML product catalog data in the AliTools B2B E-commerce platform.

## GEKO API Integration Architecture

- **Key Components:**
  - **GekoDataService**: Service for fetching data from GEKO API, transforming XML, and persisting to database 
  - **XmlParser**: Utility for parsing and transforming XML data to match database schema
  - **SyncHealthService**: Service for monitoring and tracking synchronization health
  - **GEKO API Controller**: Endpoints for manual sync and sync status management

- **File References:**
  - [geko-data-service.js](mdc:server/src/services/geko-data-service.js) - Core service for GEKO API integration
  - [xml-parser.js](mdc:server/src/utils/xml-parser.js) - XML parsing and transformation utility
  - [sync-health-service.js](mdc:server/src/services/sync-health-service.js) - Sync health monitoring
  - [geko-api.controller.js](mdc:server/src/controllers/geko-api.controller.js) - API endpoints
  - [geko-api.routes.js](mdc:server/src/routes/geko-api.routes.js) - Route definitions
  - [app-config.js](mdc:server/src/config/app-config.js) - Configuration including GEKO API settings

## XML Data Processing Workflow

1. **Fetch XML Data**
   - Request XML from GEKO API endpoint with proper authentication
   - Implement retry mechanism for transient failures
   - Track request stats (size, duration)

2. **Parse XML**
   - Use xml2js for initial parsing with configured options
   - Handle encoding issues and special characters
   - Implement error handling and logging

3. **Transform Data**
   - Map XML schema to database models
   - Extract all entity types: Products, Categories, Producers, Units, Variants, Stocks, Prices, Images
   - Validate data (e.g., EAN codes, URLs, required fields)
   - Apply business rules and defaults

4. **Database Persistence**
   - Use database transactions to ensure atomicity
   - Implement upsert operations to handle new and existing records
   - Track entity counts and processing time
   - Provide detailed error reporting

5. **Health Monitoring**
   - Track sync operations with start/end times and duration
   - Record error counts and details
   - Monitor memory usage and performance
   - Implement alerts for failed or degraded syncs

## XML Structure and Mapping

The XML structure from GEKO API follows this pattern:

```xml
<geko>
  <products>
    <product>
      <code>PRODUCT_CODE</code>
      <ean>PRODUCT_EAN</ean>
      <category>
        <id>CATEGORY_ID</id>
        <name>CATEGORY_NAME</name>
        <path>CATEGORY_PATH</path>
        <parent_id>PARENT_CATEGORY_ID</parent_id>
      </category>
      <producer>
        <name>PRODUCER_NAME</name>
        <description>PRODUCER_DESCRIPTION</description>
        <website>PRODUCER_WEBSITE</website>
      </producer>
      <unit>UNIT_CODE</unit>
      <description>
        <name>PRODUCT_NAME</name>
        <short>SHORT_DESCRIPTION</short>
        <long>LONG_DESCRIPTION</long>
      </description>
      <vat>23</vat>
      <variants>
        <variant>
          <code>VARIANT_CODE</code>
          <weight>1.5</weight>
          <gross_weight>1.7</gross_weight>
          <stock>
            <quantity>100</quantity>
            <available>true</available>
            <min_order_quantity>1</min_order_quantity>
          </stock>
          <prices>
            <price>
              <amount>19.99</amount>
              <currency>EUR</currency>
              <type>retail</type>
            </price>
            <price>
              <amount>16.99</amount>
              <currency>EUR</currency>
              <type>wholesale</type>
            </price>
          </prices>
        </variant>
      </variants>
      <images>
        <image>
          <url>https://example.com/image1.jpg</url>
          <is_main>true</is_main>
          <order>1</order>
        </image>
        <image>
          <url>https://example.com/image2.jpg</url>
          <is_main>false</is_main>
          <order>2</order>
        </image>
      </images>
    </product>
    <!-- More products -->
  </products>
</geko>
```

## Database Models Mapping

XML elements map to database models as follows:

- **Product**: Base product information (`code`, `name`, `description`, `ean`, etc.)
- **Category**: Product categories (`id`, `name`, `path`, `parent_id`)
- **Producer**: Product manufacturers (`name`, `description`, `website`)
- **Unit**: Units of measure (`id`, `name`)
- **Variant**: Product variants (`code`, `product_id`, `weight`, `gross_weight`)
- **Stock**: Inventory information (`variant_id`, `quantity`, `available`, `min_order_quantity`)
- **Price**: Different price types (`variant_id`, `amount`, `currency`, `type`)
- **Image**: Product images (`product_id`, `url`, `is_main`, `order`)

## Configuration

- **Environment Variables:**
  ```
  # GEKO API Configuration
  GEKO_API_URL=https://api.geko.com/products
  GEKO_API_USERNAME=your_username
  GEKO_API_PASSWORD=your_password
  GEKO_API_SYNC_INTERVAL=30  # minutes
  GEKO_API_RETRY_ATTEMPTS=3
  GEKO_API_RETRY_DELAY_MS=5000
  
  # Sync Health Monitoring
  SYNC_HEALTH_ALERTS_ENABLED=true
  SYNC_HEALTH_ALERT_THRESHOLD=3
  SYNC_HEALTH_EMAIL_TO=admin@example.com
  ```

## Scheduled Sync Implementation

Scheduled sync uses a cron-like job scheduler:

```javascript
// ✅ DO: Implement robust scheduling with error handling
static scheduleSync(apiUrl, intervalMinutes = 30) {
  const cronExpression = `*/${intervalMinutes} * * * *`; // Every X minutes
  
  const task = cron.schedule(cronExpression, async () => {
    logger.info(`Running scheduled GEKO API sync with URL: ${apiUrl}`);
    
    try {
      await this.runManualSync(apiUrl);
      logger.info('Scheduled GEKO API sync completed successfully');
    } catch (error) {
      logger.error(`Scheduled GEKO API sync failed: ${error.message}`);
    }
  });
  
  task.start();
  
  return {
    task,
    expression: cronExpression,
    intervalMinutes
  };
}

// ❌ DON'T: Use simple setInterval without error handling
// setInterval(async () => {
//   await this.runManualSync(apiUrl); // Unhandled promise rejection
// }, intervalMinutes * 60 * 1000);
```

## XML File Upload for Manual Data Import

In addition to scheduled API sync, implement manual file upload for XML data:

```javascript
// ✅ DO: Validate and process uploads securely
static async processUploadedXmlFile(filePath, options = {}) {
  try {
    // Track health
    const tracking = SyncHealthService.startSyncTracking('file_upload', filePath);
    
    // Read XML file
    const xmlData = fs.readFileSync(filePath, 'utf8');
    
    // Process XML data with standard flow
    const stats = await this.processXmlData(xmlData, tracking);
    
    // Record success
    await SyncHealthService.finishSyncTracking(tracking, 'success', xmlData.length);
    
    return {
      success: true,
      duration: (new Date() - tracking.startTime) / 1000,
      stats
    };
  } catch (error) {
    // Log error
    logger.error(`Error processing uploaded XML file: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ❌ DON'T: Process uploaded files without validation
// const xmlData = fs.readFileSync(req.file.path, 'utf8');
// await processXmlData(xmlData); // No error handling or security checks
```

## Resolving XML Schema Differences

When the XML schema from GEKO API changes:

```javascript
// ✅ DO: Use flexible parsing with reasonable defaults
static _processCategory(product, transformedData) {
  // Handle different XML structures
  const categoryData = product.category || {};
  const categoryId = categoryData.id || 
                    (categoryData.name ? categoryData.name.toLowerCase().replace(/\s+/g, '-') : null) ||
                    'uncategorized';
  
  if (!transformedData.categories.has(categoryId)) {
    transformedData.categories.set(categoryId, {
      id: categoryId,
      name: categoryData.name || categoryId,
      path: categoryData.path || categoryId,
      parent_id: categoryData.parent_id || null,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  
  return categoryId;
}

// ❌ DON'T: Use rigid parsing that breaks when XML structure changes
// const categoryId = product.category.id;  // Breaks if category is missing
```

## Error Handling and Partial Success

Handle partial success scenarios with robust error handling:

```javascript
// ✅ DO: Continue processing despite individual entity errors
static async _insertDataToDatabase(data, transaction, tracking = null) {
  const stats = { /* ... */ };
  
  // Insert categories
  if (data.categories && data.categories.length > 0) {
    for (const category of data.categories) {
      try {
        await Category.upsert(category, { transaction });
        stats.categories++;
      } catch (error) {
        SyncHealthService.recordError(
          tracking, 
          'DB_INSERT_CATEGORY', 
          `Error inserting category ${category.id}: ${error.message}`,
          { category }
        );
        logger.error(`Error inserting category ${category.id}: ${error.message}`);
        // Continue processing other categories
      }
    }
  }
  
  // Similarly for other entities...
  
  return stats;
}

// ❌ DON'T: Let single entity failures stop the entire process
// for (const category of data.categories) {
//   await Category.upsert(category, { transaction });  // No try/catch
// }
```

## API Endpoint Examples

- **Run Manual Sync**: `POST /api/geko/sync/manual`
- **Start Scheduled Sync**: `POST /api/geko/sync/scheduled/start`
- **Stop Scheduled Sync**: `POST /api/geko/sync/scheduled/stop`
- **Get Sync Status**: `GET /api/geko/sync/scheduled/status`
- **Get Sync Health**: `GET /api/geko/sync/health`
- **Get Sync Statistics**: `GET /api/geko/sync/stats`
- **Upload XML File**: `POST /api/geko/sync/upload` (multipart/form-data)

## Performance Optimization Patterns

The following patterns have been established for optimizing XML import performance, especially for large datasets:

### Batch Processing

- **✅ DO: Use large batch sizes for database operations**
  ```javascript
  const BATCH_SIZE = 500; // Optimal for most operations
  
  for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
    const batch = transformedData.products.slice(i, i + BATCH_SIZE);
    await models.Product.bulkCreate(batch, { 
      transaction,
      returning: true // Get back the inserted records with IDs
    });
    console.log(`Imported batch ${i+1} to ${Math.min(i+BATCH_SIZE, transformedData.products.length)}`);
  }
  ```

- **❌ DON'T: Use small batch sizes that cause excessive database round-trips**
  ```javascript
  // Less efficient - too many database round-trips
  const BATCH_SIZE = 10; 
  ```

### Memory Management

- **✅ DO: Release large data structures when no longer needed**
  ```javascript
  // Free memory after parsing
  xmlData = null;
  jsonData = null;
  global.gc && global.gc(); // Trigger garbage collection if available
  ```

- **✅ DO: Process large collections in chunks**
  ```javascript
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < productsArray.length; i += CHUNK_SIZE) {
    const chunk = productsArray.slice(i, i + CHUNK_SIZE);
    // Process chunk...
    chunk.length = 0; // Clear chunk after processing
    global.gc && global.gc();
  }
  ```

- **❌ DON'T: Keep entire dataset in memory after processing**
  ```javascript
  // Bad practice - keeps full data in memory
  const result = await parseXml(xmlData);
  // Use result...
  // xmlData still in memory unnecessarily
  ```

### Database Connection Optimization

- **✅ DO: Configure connection pools appropriately**
  ```javascript
  sequelize = new Sequelize(process.env.NEON_DB_URL, {
    // ...other options
    pool: {
      max: 10,        // Increased for better concurrency
      min: 0,
      idle: 20000,    // Increased idle timeout (ms)
      acquire: 120000 // Increased timeout for batch operations (ms)
    }
  });
  ```

- **✅ DO: Use transactions with proper error handling**
  ```javascript
  const transaction = await sequelize.transaction();
  try {
    // Import operations
    await transaction.commit();
  } catch (error) {
    // Log error details
    console.error(`Import failed: ${error.message}`);
    await transaction.rollback();
  }
  ```

### Performance Monitoring

- **✅ DO: Add detailed timing measurements**
  ```javascript
  console.time('Operation name');
  // ... operation code
  console.timeEnd('Operation name');
  ```

- **✅ DO: Track and report per-entity metrics**
  ```javascript
  console.log(`Imported ${transformedData.categories.length} categories`);
  console.log(`Imported ${transformedData.products.length} products`);
  console.log(`Imported ${transformedData.variants.length} variants`);
  // etc.
  ```

### Efficient Data Structures

- **✅ DO: Use Maps for quick lookups**
  ```javascript
  // Create map of product code to ID for faster lookups
  const productCodeToId = {};
  createdProducts.forEach(product => {
    productCodeToId[product.code] = product.id;
  });
  
  // Later, lookup is O(1) instead of O(n)
  const productId = productCodeToId[variant.code];
  ```

- **✅ DO: Use Sets to track existing items efficiently**
  ```javascript
  const existingProducerNames = new Set();
  existingProducers.forEach(producer => existingProducerNames.add(producer.name));
  
  // Fast checking for duplicates
  if (!existingProducerNames.has(producerName)) {
    // Insert new producer
  }
  ```

### Error Handling

- **✅ DO: Implement batch-level error handling**
  ```javascript
  try {
    await models.Product.bulkCreate(productBulkData, { transaction });
  } catch (error) {
    console.error(`Error importing product batch ${i+1}-${Math.min(i+BATCH_SIZE, products.length)}:`, error.message);
    // Continue with next batch instead of failing entire import
  }
  ```

- **✅ DO: Provide detailed error reporting**
  ```javascript
  console.error('========================================');
  console.error(`XML IMPORT FAILED: ${error.message}`);
  console.error('========================================');
  console.error(error.stack);
  ```

### Performance Results

Comparison of performance before and after optimization for importing 8,155 products:

| Operation | Before Optimization | After Optimization | Improvement |
|-----------|---------------------|-------------------|-------------|
| XML Parsing | ~5s | ~2s | 60% faster |
| Database Import | ~20-25s | ~8s | 65-70% faster |
| Total Time | ~30s | ~10.5s | 65% faster |
| Memory Usage | High (frequent GC pauses) | Lower (controlled GC) | More stable |

## Testing Strategy

1. **Unit Tests**:
   - Test XML parsing with sample files
   - Test transformation logic with edge cases
   - Mock API responses for service tests

2. **Integration Tests**:
   - Test database persistence with real database
   - Test scheduled sync with mocked API
   - Test error handling and retry logic

3. **End-to-End Tests**:
   - Test with sample XML file upload
   - Verify database state after sync
   - Check health monitoring and alerts

## Monitoring and Alerts

- Track sync operations with `SyncHealth` model
- Monitor performance metrics (duration, memory usage)
- Send email alerts for failed syncs
- Provide admin dashboard for sync health visualization

## Security Considerations

- Store API credentials in environment variables
- Validate XML data before processing to prevent XXE attacks
- Use SSL for API connections
- Implement rate limiting for manual sync endpoints

