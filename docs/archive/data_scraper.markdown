# XML Data Scraping and Import Process

This document describes the process of extracting data from XML files provided by the GEKO API and importing it into the PostgreSQL database for the **Ali Tools B2B E-commerce** project.

---

## 1. General Workflow

1. **XML Parsing**:
   - Use the `xml.etree.ElementTree` library in Python to parse XML files.
   - Extract data from elements such as `<product>`, `<category>`, `<producer>`, `<unit>`, `<sizes>`, `<stock>`, `<prices>`, and `<images>`.
2. **Transformation**:
   - Map XML fields to the columns of tables defined in `docs/database_schema.md`.
   - Normalize data:
     - Remove unnecessary whitespace (trim).
     - Convert data types (e.g., strings to numbers).
     - Escape HTML content in fields like `<description_long>` to prevent code injection.
   - Validate formats (e.g., EAN with regex, valid URLs).
3. **PostgreSQL Insertion**:
   - Use Sequelize for batch insertions or parameterized SQL queries for security.
   - Apply `ON CONFLICT DO NOTHING` to avoid duplicates in tables like `products` and `categories`.
   - Populate `created_at` and `updated_at` columns using timestamps from the XML (if available) or `CURRENT_TIMESTAMP` otherwise.
   - Log parsing or insertion errors using the Winston library, as specified in `rules.backend.logging`.

## 2. Implementation

- **Tools**:
  - **Python**: For XML parsing with `xml.etree.ElementTree`.
  - **Node.js**: For backend integration via Sequelize.
  - **Sequelize**: ORM for PostgreSQL insertions.
  - **Winston**: For logging errors and events.
- **Code Example**:
  ```python
  import xml.etree.ElementTree as ET
  import logging
  from datetime import datetime
  from sequelize import Sequelize, Model, DataTypes

  # Logger setup
  logger = logging.getLogger('xml_parser')
  logger.setLevel(logging.INFO)

  # XML parsing
  tree = ET.parse('geko_data.xml')
  root = tree.getroot()

  # Sequelize setup
  sequelize = Sequelize('postgres://user:pass@localhost:5432/alitools')

  # Product model
  class Product(Model):
      pass

  Product.init({
      id: { type: DataTypes.INTEGER, primaryKey: True, autoIncrement: True },
      code: { type: DataTypes.STRING, allowNull: False },
      name: { type: DataTypes.STRING, allowNull: False },
      created_at: { type: DataTypes.DATE, allowNull: False },
      updated_at: { type: DataTypes.DATE, allowNull: False }
      # Other fields as per database_schema.md
  }, { sequelize, modelName: 'product' })

  # Process products
  for product in root.findall('product'):
      try:
          data = {
              'code': product.get('code'),
              'name': product.find('description/name').text,
              'created_at': product.find('created_at')?.text or datetime.now(),
              'updated_at': product.find('updated_at')?.text or datetime.now()
              # Other fields
          }
          Product.create(data, { ignoreDuplicates: True })
          logger.info(f'Product {data["code"]} inserted successfully.')
      except Exception as e:
          logger.error(f'Error processing product {data["code"]}: {str(e)}')
  ```
- **Timeline**:
  - **Week 1**: Set up the XML parser and conduct initial tests with sample data.
  - **Week 2**: Implement transformation and insertion logic for PostgreSQL.
  - **Week 3**: Test with real GEKO API data and optimize performance.

## 3. Considerations

- **Error Handling**:
  - Capture and log errors for malformed XML, missing fields, or database connection failures.
  - Implement retries with exponential backoff for temporary failures (as per `rules.b2b_specific.integration.geko_api.retry_strategy`).
- **Data Validation**:
  - Use regex to validate EAN (e.g., `^\d{13}$`).
  - Verify URLs using libraries like `urllib.parse`.
- **Timestamps**:
  - Ensure `created_at` and `updated_at` are populated for all records, using XML-provided timestamps if available or `CURRENT_TIMESTAMP` otherwise, as per `rules.data_integration`.
- **Performance**:
  - Process XML files in batches to reduce overhead.
  - Use indexes recommended in `database_schema.md` to speed up queries.
- **Testing**:
  - Create unit tests for the XML parser (minimum 80% coverage, as per `rules.testing.coverage.unit`).
  - Test the import process with real GEKO API data in a staging environment.
- **GEKO API Integration**:
  - Synchronize data every 30 minutes, as per `rules.b2b_specific.integration.geko_api.sync_frequency`.
  - Use an incremental sync strategy (as per `rules.b2b_specific.integration.geko_api.sync_strategy`).

## 4. Next Steps

- Set up a scheduled job (e.g., using `node-cron`) to automate synchronization.
- Implement health monitoring for the sync process, as per `rules.b2b_specific.integration.geko_api.monitoring`.
- Document the import process in the repository's `README.md`, as per `rules.documentation.requireReadme`.

---