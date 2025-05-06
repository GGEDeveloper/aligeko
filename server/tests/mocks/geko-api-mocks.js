// Mock data and functions for GEKO API integration tests

// Sample XML data for testing GEKO API integration
export const sampleXmlData = `
<?xml version="1.0" encoding="UTF-8"?>
<geko>
  <products>
    <product code="P001">
      <description>
        <name>Power Drill</name>
        <short>Professional power drill</short>
        <long>Professional power drill with variable speed and multiple attachments</long>
      </description>
      <ean>1234567890123</ean>
      <vat>23</vat>
      <category>
        <id>tools</id>
        <name>Tools</name>
        <path>tools</path>
      </category>
      <producer>
        <name>ToolMaker</name>
        <website>toolmaker.com</website>
      </producer>
      <unit>pcs</unit>
      <weight>2.5</weight>
      <images>
        <image>
          <url>https://example.com/image1.jpg</url>
          <alt>Power Drill Image</alt>
          <order>1</order>
        </image>
        <image>
          <url>https://example.com/image2.jpg</url>
          <alt>Power Drill Side View</alt>
          <order>2</order>
        </image>
      </images>
      <variants>
        <variant>
          <code>P001-V1</code>
          <weight>2.5</weight>
          <stock>
            <quantity>100</quantity>
            <status>available</status>
          </stock>
          <prices>
            <price>
              <value>199.99</value>
              <discount_value>149.99</discount_value>
              <discount_start>2023-01-01</discount_start>
              <discount_end>2023-12-31</discount_end>
            </price>
          </prices>
        </variant>
      </variants>
    </product>
    <product code="P002">
      <description>
        <name>Screwdriver Set</name>
        <short>Professional screwdriver set</short>
        <long>Set of 10 professional screwdrivers with different head types</long>
      </description>
      <ean>2345678901234</ean>
      <vat>23</vat>
      <category>
        <id>tools</id>
        <name>Tools</name>
        <path>tools</path>
      </category>
      <producer>
        <name>ToolMaker</name>
        <website>toolmaker.com</website>
      </producer>
      <unit>set</unit>
      <weight>1.2</weight>
      <images>
        <image>
          <url>https://example.com/screwdriver1.jpg</url>
          <alt>Screwdriver Set Image</alt>
          <order>1</order>
        </image>
      </images>
      <variants>
        <variant>
          <code>P002-V1</code>
          <weight>1.2</weight>
          <stock>
            <quantity>50</quantity>
            <status>available</status>
          </stock>
          <prices>
            <price>
              <value>99.99</value>
              <discount_value>79.99</discount_value>
              <discount_start>2023-01-01</discount_start>
              <discount_end>2023-12-31</discount_end>
            </price>
          </prices>
        </variant>
      </variants>
    </product>
  </products>
</geko>
`;

// Mock models for GEKO API integration tests
export const mockModels = {
  Product: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Category: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Producer: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Unit: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Variant: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Stock: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Price: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  Image: {
    upsert: jest.fn().mockResolvedValue([{}, true]),
    findAll: jest.fn().mockResolvedValue([])
  },
  SyncHealth: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      sync_type: 'manual',
      status: 'success',
      start_time: new Date(),
      end_time: new Date(),
      duration_seconds: 2.5,
      api_url: 'https://api.geko.com/products',
      items_processed: {
        products: 2,
        categories: 1,
        producers: 1,
        units: 2,
        variants: 2,
        stocks: 2,
        prices: 2,
        images: 3
      },
      error_count: 0
    }),
    findAll: jest.fn().mockResolvedValue([])
  }
};

// Mock axios for API requests
export const mockAxiosResponse = {
  data: sampleXmlData,
  status: 200,
  statusText: 'OK',
  headers: {
    'content-type': 'application/xml'
  },
  config: {},
  request: {}
};

// Mock sequelize transaction
export const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined)
}; 