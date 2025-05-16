---
trigger: manual
description:
globs:
---
# Database Storage Management Patterns

This rule documents the standard patterns for managing database storage limitations in the AliTools B2B E-commerce platform, specifically addressing the constraints of the Neon PostgreSQL Free plan.

## Overview

The application uses Neon PostgreSQL's Free tier which has strict storage limitations:
- 0.5 GB total storage limit
- Current usage: ~0.69 GB (exceeding the limit)

This rule defines how to implement and use storage management tools to ensure the application can function effectively within these constraints.

## Key Components/Architecture

- **Main Components:**
  - **storage-management.js**: Core script containing monitoring, cleanup, backup, and restore functionality
  - **GekoImportService**: XML import service with integrated storage checks
  - **Backup System**: JSON-based backup and restore functionality
  - **Storage Monitoring**: Tools to check database size and table sizes

- **File References:**
  - [storage-management.js](mdc:server/src/scripts/storage-management.js) - Core storage management implementation
  - [geko-import-service.js](mdc:server/src/services/geko-import-service.js) - Import service with storage checks
  - [storage-limitations.md](mdc:docs/database/storage-limitations.md) - Comprehensive documentation

## Implementation Patterns

### 1. Storage Monitoring

```javascript
// ✅ DO: Implement regular storage checks before operations
import { getDatabaseStorageInfo } from '../scripts/storage-management.js';

async function beforeOperation() {
  const storageInfo = await getDatabaseStorageInfo();
  console.log(`Current storage: ${storageInfo.currentSizeGB.toFixed(2)} GB (${storageInfo.percentOfLimit.toFixed(1)}%)`);
  
  if (storageInfo.status === 'critical') {
    throw new Error('Storage limit exceeded, operation aborted');
  }
}

// ❌ DON'T: Proceed with data operations without checking storage
async function riskyOperation() {
  // Directly importing without checking available space
  await importLargeDataset(); // Potentially dangerous if near storage limit
}
```

### 2. Integrating Storage Checks with Import Operations

```javascript
// ✅ DO: Integrate storage checks with import operations
import { checkAndManageStorage } from '../scripts/storage-management.js';

async function importData(data, options = {}) {
  // Check storage before proceeding
  const storageCheck = await checkAndManageStorage({
    preventImportOnCritical: true
  });
  
  if (!storageCheck.canProceed) {
    return {
      success: false,
      error: 'STORAGE_LIMIT_EXCEEDED',
      message: storageCheck.message
    };
  }
  
  // Proceed with import if storage is available
  return await performImport(data, options);
}

// ❌ DON'T: Bypass storage checks
async function unsafeImport(data) {
  // Directly proceeding with import without storage check
  return await performImport(data);
}
```

### 3. Implementing Cleanup

```javascript
// ✅ DO: Use configurable cleanup with backup
import { cleanupDatabase } from '../scripts/storage-management.js';

async function performCleanup() {
  const cleanupResult = await cleanupDatabase({
    keepProductCount: 200,          // Retain 200 most recent products
    purgeImages: true,              // Remove all images
    truncateDescriptions: true,     // Truncate long descriptions
    maxDescriptionLength: 200,      // Maximum description length
    backupBeforeCleanup: true       // Create backup before cleanup
  });
  
  console.log(`Freed ${cleanupResult.spaceFreed.megabytes.toFixed(2)} MB`);
  return cleanupResult;
}

// ❌ DON'T: Use hard-coded cleanup options
async function hardcodedCleanup() {
  // Hard-coded values without configurability
  await sequelize.query('DELETE FROM images');
  await sequelize.query('DELETE FROM products WHERE updated_at < NOW() - INTERVAL \'30 days\'');
}
```

### 4. Backup & Restore Implementation

```javascript
// ✅ DO: Implement selective backup and restore
import { backupTables, restoreBackup } from '../scripts/storage-management.js';

async function manageDatabaseContent() {
  // Backup only essential tables
  const backupPath = await backupTables(['categories', 'producers', 'units']);
  console.log(`Backup created at: ${backupPath}`);
  
  // Cleanup database
  await cleanupDatabase();
  
  // Restore only if needed
  if (needsRestore) {
    const restoreResult = await restoreBackup(backupPath);
    console.log(`Restored ${restoreResult.recordsRestored} records`);
  }
}

// ❌ DON'T: Use database dumps for this purpose
function pgDumpBackup() {
  // Avoid using pg_dump for this specific use case
  // pg_dump is great for full backups but not for selective data management
  execSync('pg_dump -U username -d database > backup.sql');
}
```

### 5. Storage-Aware Import Options

```javascript
// ✅ DO: Adapt import behavior based on storage status
async function adaptiveImport(xmlData) {
  const storageInfo = await getDatabaseStorageInfo();
  
  // Configure options based on storage status
  const importOptions = {
    skipImages: storageInfo.status !== 'ok',
    limitProductCount: storageInfo.status === 'warning' ? 300 : 
                     (storageInfo.status === 'critical' ? 100 : null),
    truncateDescriptions: storageInfo.status !== 'ok',
    maxDescriptionLength: storageInfo.status === 'warning' ? 500 : 200
  };
  
  return await importXmlData(xmlData, importOptions);
}

// ❌ DON'T: Use fixed import options regardless of storage status
async function fixedOptionsImport(xmlData) {
  // Same options regardless of storage state
  const options = { skipImages: false, limitProductCount: null };
  return await importXmlData(xmlData, options);
}
```

## Configuration Options

```javascript
// Storage check configuration
const storageCheckOptions = {
  warningThresholdPercent: 80,       // Warning at 80% of limit
  criticalThresholdPercent: 95,      // Critical at 95% of limit
  autoCleanupOnWarning: false,       // Don't auto-cleanup on warning
  autoCleanupOnCritical: true,       // Auto-cleanup on critical
  preventImportOnCritical: true,     // Prevent import when critical
  backupBeforeCleanup: true          // Create backup before cleanup
};

// Cleanup configuration
const cleanupOptions = {
  keepProductCount: 200,             // Products to keep
  keepDays: 30,                      // Days of history to keep
  purgeImages: true,                 // Whether to remove all images
  truncateDescriptions: false,       // Whether to truncate long text
  maxDescriptionLength: 200,         // Max length if truncating
  vacuumAfterCleanup: true,          // Run VACUUM after cleanup
  backupBeforeCleanup: true,         // Backup before cleanup
  backupTablesOnly: ['categories', 'producers', 'units'] // Tables to backup
};
```

## Common Issues and Solutions

| Issue | Solution |
|----|----|
| Database exceeds storage limit | Run cleanup with appropriate options, consider temporary removal of images |
| Import fails due to storage limit | Check storage before import, enable automatic cleanup, use selective import |
| Need to preserve specific data during cleanup | Use backup and restore for essential tables before cleanup |
| Import speed reduced by storage checks | Cache storage status for a brief period instead of checking before every operation |
| Uncertain how much data can be imported | Calculate: (0.5GB - current size) / avg_product_size to estimate capacity |

## Best Practices

1. **Always check storage before large operations**:
   - Use `checkAndManageStorage()` before imports or bulk operations
   - Configure appropriate thresholds and actions

2. **Use selective backups for critical data**:
   - Categories, producers, and units are usually small but important
   - Full backups can be large; be selective about what to backup

3. **Implement proper cleanup lifecycle**:
   - Create targeted backup first
   - Execute cleanup with appropriate options
   - Verify storage improvement
   - Execute VACUUM to reclaim space

4. **Storage monitoring integration**:
   - Add storage check to admin dashboard
   - Implement scheduled monitoring
   - Set up alerts for reaching thresholds

5. **Import strategies**:
   - Use sample data subsets for development
   - Implement progressive loading for large datasets
   - Consider data rotation instead of accumulation

## Testing Approach

```javascript
// Example test pattern
describe('Storage Management Tests', () => {
  it('should check database storage info', async () => {
    const info = await getDatabaseStorageInfo();
    expect(info).toHaveProperty('currentSizeGB');
    expect(info).toHaveProperty('status');
  });
  
  it('should prevent operations in critical storage state', async () => {
    // Mock critical storage state
    jest.spyOn(storageModule, 'getDatabaseStorageInfo').mockResolvedValue({
      currentSizeGB: 0.55,
      status: 'critical',
      limit: { gb: 0.5 }
    });
    
    const check = await checkAndManageStorage({ preventImportOnCritical: true });
    expect(check.canProceed).toBe(false);
  });
});
```

## Related Rules

- [error_tracking.mdc](mdc:.cursor/rules/error_tracking.mdc) - Error tracking and resolution
- [geko_xml_integration.mdc](mdc:.cursor/rules/geko_xml_integration.mdc) - XML data integration patterns
- [deployment.mdc](mdc:.cursor/rules/deployment.mdc) - Deployment configurations

## External References

- [Neon PostgreSQL Documentation](mdc:https://neon.tech/docs/introduction) - Official Neon database documentation
- [Neon Free Tier Limitations](mdc:https://neon.tech/docs/introduction/free-tier) - Details on Neon's free tier constraints

---

*Last updated: 2025-05-11*
