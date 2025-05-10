# Server Scripts

This directory contains utility scripts for server-side operations that are typically executed directly via Node.js rather than as part of the web API.

## Available Scripts

### GEKO XML Import

**Script:** `import-geko-xml.js`

This script imports product data from the GEKO XML file directly into the database. It's designed for one-time use when you need to populate the database with the product catalog.

**Usage:**
```bash
# Using the default XML file (geko_products_en.xml in project root)
node src/scripts/import-geko-xml.js

# Specify a custom XML file path
node src/scripts/import-geko-xml.js path/to/custom-geko-file.xml
```

**Features:**
- Parses the GEKO XML format using the `GekoXmlParser` utility
- Processes all entity types: Products, Categories, Producers, Units, Variants, Stocks, Prices, and Images
- Uses database transactions to ensure data integrity
- Provides detailed logging and error reporting
- Records import health statistics through `SyncHealthService`

**Example Output:**
```
[INFO] Starting GEKO XML import from file: geko_products_en.xml
[INFO] File size: 15.32 MB, Last modified: Wed Apr 26 2023 12:51:02 GMT+0200
[INFO] Successfully read file with size: 16058493 bytes
[INFO] Parsing XML with 8155 products...
[INFO] Starting database transaction for import...
[INFO] Importing 235 categories...
[INFO] Importing 47 producers...
[INFO] Importing 3 units...
[INFO] Importing 8155 products...
[INFO] Importing 8155 variants...
[INFO] Importing 8155 stock records...
[INFO] Importing 16310 price records...
[INFO] Importing 31195 images...
[INFO] Database transaction committed successfully
[INFO] === Import Summary ===
[INFO] Categories: 235
[INFO] Producers: 47
[INFO] Units: 3
[INFO] Products: 8155
[INFO] Variants: 8155
[INFO] Stocks: 8155
[INFO] Prices: 16310
[INFO] Images: 31195
[INFO] GEKO XML import completed successfully!
```

## Running Scripts

For optimal performance with large XML files, we recommend running these scripts with increased memory limits using the provided helper scripts:

### On Linux/MacOS:

```bash
# Using the shell script
./run-geko-import.sh

# With custom options
./run-geko-import.sh -f path/to/custom-geko-file.xml -m 8192
```

Options:
- `-f, --file PATH`: Specify XML file path (default: `../../geko_products_en.xml`)
- `-m, --memory SIZE`: Specify memory limit in MB (default: 4096)
- `-h, --help`: Show help message

### On Windows:

```cmd
# Using the batch file
run-geko-import.bat

# With custom options
run-geko-import.bat -f path\to\custom-geko-file.xml -m 8192
```

Options:
- `-f, --file PATH`: Specify XML file path (default: `..\..\geko_products_en.xml`)
- `-m, --memory SIZE`: Specify memory limit in MB (default: 4096)
- `-h, --help`: Show help message

### Running Manually:

If you prefer to run the script directly:

```bash
# Linux/MacOS
NODE_OPTIONS="--max-old-space-size=4096" node src/scripts/import-geko-xml.js

# Windows
set NODE_OPTIONS=--max-old-space-size=4096
node src/scripts/import-geko-xml.js
```

This allocates 4GB of memory to the Node.js process, which helps when parsing large XML files.

# GEKO XML Import Script

This directory contains scripts for importing XML product data from GEKO into the database.

## Performance-Optimized Import Script

The `direct-import-xml.js` script is a performance-optimized solution for importing large XML product catalogs into the database. The script connects directly to the database using environment variables and processes the XML data in batches for efficient memory usage and faster processing.

### Key Optimizations

1. **Increased Batch Size**: Products, variants, prices, and images are processed in batches of 500 records (up from 10), significantly reducing the number of database operations.

2. **Memory Management**: 
   - XML data is released from memory immediately after parsing
   - Explicit garbage collection hints help free memory during processing
   - Products are processed in chunks of 1,000 to prevent memory exhaustion
   - Objects are cleared after use to help garbage collection

3. **Database Connection Optimization**:
   - Increased connection pool size (max: 10)
   - Longer timeouts for batch operations (120s)
   - Explicit SSL configuration for Neon PostgreSQL

4. **Performance Monitoring**:
   - Detailed timing measurements for each operation
   - Batch progress reporting
   - Import summary showing total counts

5. **Error Handling**:
   - Transaction-based import with rollback on failure
   - Batch-level error handling to continue processing despite failures in individual batches
   - Proper error reporting with stack traces

6. **Data Structure Optimization**:
   - Maps and lookup tables for faster entity relationship processing
   - Sets for efficient duplicate detection
   - Pre-filtering of existing records before database operations

### Usage

Run the script from the command line with the path to the XML file as an argument:

```bash
node src/scripts/direct-import-xml.js "path/to/your/xml/file.xml"
```

For large XML files, increase the Node.js memory limit:

```bash
node --max-old-space-size=4096 src/scripts/direct-import-xml.js "path/to/your/xml/file.xml"
```

### Environment Variables

The script requires the following environment variables in your `.env` file:

```
NODE_ENV=production
NEON_DB_URL=postgres://username:password@hostname:port/database?sslmode=require
```

### Performance Results

Testing with a 35MB XML file containing 8,155 products:
- XML Parsing Time: ~2 seconds
- Database Import Time: ~8 seconds
- Total Execution Time: ~10.5 seconds

This represents a significant performance improvement over the previous implementation, with approximately 65% faster import time.

### Data Mapping

The script maps XML data to the following database tables:
- `products`: Basic product information
- `categories`: Product categories
- `producers`: Product manufacturers
- `units`: Units of measurement
- `variants`: Product variants
- `prices`: Product pricing information
- `images`: Product images

## Performance Comparison Utility

The `compare-import-time.js` script helps analyze and compare the performance of different XML import runs.

### Usage

```bash
node src/scripts/compare-import-time.js --file1=log1.txt --file2=log2.txt --name1="Before" --name2="After" --output=comparison.txt
```

Options:
- `--file1`: Path to the first import log file
- `--file2`: Path to the second import log file
- `--name1`: Name for the first import (default: "Before")
- `--name2`: Name for the second import (default: "After")
- `--output`: Path to save the comparison report (default: prints to console)

### Output Example

```
======== Import Performance Comparison ========

Data Size:
Products: 8155 (Before) vs 8155 (After)
Variants: 8155 (Before) vs 8155 (After)

Timing Comparison:
XML Parsing: 5.12s → 2.05s (60.0% faster)
Category Import: 0.895s → 0.312s (65.1% faster)
Producer Import: 0.432s → 0.158s (63.4% faster)
Unit Import: 0.126s → 0.047s (62.7% faster)
Product Import: 11.45s → 3.87s (66.2% faster)
Variant Import: 9.87s → 3.21s (67.5% faster)
Price Import: 7.65s → 2.31s (69.8% faster)
Image Import: 10.23s → 3.45s (66.3% faster)
Total Import Time: 29.75s → 10.53s (64.6% faster)
Total Execution Time: 30.12s → 10.86s (63.9% faster)

======== Summary ========
Overall Performance Change: 64.6% improvement
Absolute Time Saved: 19.22 seconds per import
```

### Features
- Extracts timing data from import log files
- Calculates percentage improvements for each operation
- Provides a summary of overall performance changes
- Handles cases where only one log file is available
- Can output to a file for documentation

## Future Improvements

Potential areas for further optimization:
- Parallel processing of different entity types
- Streaming XML parsing for even larger files
- Upsert operations for incremental updates
- Better handling of duplicate records
- Index optimization based on query patterns

## Available Scripts (XML Data Import)

### Full Import Process

**Script:** `run-all-imports.js`

This script orchestrates the complete import process by running all import scripts in the correct order to maintain data integrity and relationships.

**Usage:**
```bash
# Using the default XML file (geko_products_en.xml in project root)
node src/scripts/run-all-imports.js

# Specify a custom XML file path
node src/scripts/run-all-imports.js path/to/custom-geko-file.xml
```

**Import Process:**
1. Base data: products, categories, producers, units, variants
2. Stock data: inventory levels and availability
3. Prices and Images: product pricing and visual assets

### Base Data Import

**Script:** `direct-import-xml.js`

This script imports the core product data from the GEKO XML file into the database. It's optimized for performance with large datasets.

**Usage:**
```bash
node src/scripts/direct-import-xml.js [xml-file-path]
```

**Features:**
- Imports products, categories, producers, units, and variants
- Uses optimized batch processing (500 records per batch)
- Implements memory management and garbage collection hints
- Provides detailed performance timing

### Stock Data Import

**Script:** `import-stocks.js`

This script imports inventory/stock data from the GEKO XML file to complement product data already in the database.

**Usage:**
```bash
node src/scripts/import-stocks.js [xml-file-path]
```

**Features:**
- Extracts and imports stock information for variants
- Handles quantity, availability, and minimum order quantities
- Uses the same performance optimizations as the base import

### Prices and Images Import

**Script:** `import-prices-images.js`

This script imports prices and images data from the GEKO XML file to complement product data already in the database.

**Usage:**
```bash
node src/scripts/import-prices-images.js [xml-file-path]
```

**Features:**
- Processes both price data (retail, wholesale) for variants
- Imports product images with main/secondary classification
- Preserves proper relationships with products and variants 