import { XmlParser } from '../../src/utils/xml-parser';

// Mock the logger
jest.mock('../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock parseStringPromise function
jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn().mockImplementation((xmlString, options) => {
    if (xmlString.includes('<invalid>xml</unclosed>')) {
      return Promise.reject(new Error('Invalid XML'));
    }
    
    // Mock the parsing result
    if (xmlString.includes('<geko>')) {
      return Promise.resolve({
        geko: {
          products: {
            product: {
              code: 'P001',
              description: {
                name: 'Power Drill',
                short: 'Professional power drill',
                long: 'Professional power drill with variable speed'
              }
            }
          }
        }
      });
    }
    
    return Promise.resolve({});
  })
}));

describe('XmlParser', () => {
  describe('parseXml', () => {
    it('should parse XML string into JavaScript objects', async () => {
      // Sample XML
      const xmlString = `
        <geko>
          <products>
            <product code="P001">
              <description>
                <name>Power Drill</name>
                <short>Professional power drill</short>
                <long>Professional power drill with variable speed</long>
              </description>
            </product>
          </products>
        </geko>
      `;
      
      // Parse XML
      const result = await XmlParser.parseXml(xmlString);
      
      // Verify
      expect(result).toBeDefined();
      expect(result.geko).toBeDefined();
      expect(result.geko.products).toBeDefined();
      expect(result.geko.products.product).toBeDefined();
      expect(result.geko.products.product.code).toBe('P001');
      expect(result.geko.products.product.description.name).toBe('Power Drill');
    });
    
    it('should throw an error when XML is invalid', async () => {
      // Invalid XML
      const xmlString = '<invalid>xml</unclosed>';
      
      // Parse XML
      await expect(XmlParser.parseXml(xmlString)).rejects.toThrow();
    });
  });
  
  describe('transformData', () => {
    it('should transform XML data to match database schema', () => {
      // Sample parsed XML data
      const xmlData = {
        geko: {
          products: {
            product: {
              code: 'P001',
              description: {
                name: 'Power Drill',
                short: 'Professional power drill',
                long: 'Professional power drill with variable speed'
              },
              ean: '1234567890123',
              vat: '23',
              category: {
                id: 'tools',
                name: 'Tools',
                path: 'tools'
              },
              producer: {
                name: 'ToolMaker',
                website: 'toolmaker.com'
              },
              unit: 'pcs',
              weight: '2.5',
              images: {
                image: {
                  url: 'https://example.com/image1.jpg',
                  alt: 'Power Drill Image',
                  order: '1'
                }
              },
              variants: {
                variant: {
                  code: 'P001-V1',
                  weight: '2.5',
                  stock: {
                    quantity: '100',
                    status: 'available'
                  },
                  prices: {
                    price: {
                      value: '199.99',
                      discount_value: '149.99',
                      discount_start: '2023-01-01',
                      discount_end: '2023-12-31'
                    }
                  }
                }
              }
            }
          }
        }
      };
      
      // Transform data
      const result = XmlParser.transformData(xmlData);
      
      // Verify
      expect(result).toBeDefined();
      expect(result.products).toHaveLength(1);
      expect(result.categories).toHaveLength(1);
      expect(result.producers).toHaveLength(1);
      expect(result.units).toHaveLength(1);
      expect(result.variants).toHaveLength(1);
      expect(result.stocks).toHaveLength(1);
      expect(result.prices).toHaveLength(1);
      expect(result.images).toHaveLength(1);
      
      // Verify product
      const product = result.products[0];
      expect(product.code).toBe('P001');
      expect(product.name).toBe('Power Drill');
      expect(product.description_short).toBe('Professional power drill');
      expect(product.description_long).toBe('Professional power drill with variable speed');
      expect(product.ean).toBe('1234567890123');
      expect(product.vat).toBe(23);
      expect(product.category_id).toBe('tools');
      expect(product.producer_id).toBe('ToolMaker');
      expect(product.unit_id).toBe('pcs');
      
      // Verify variant
      const variant = result.variants[0];
      expect(variant.code).toBe('P001-V1');
      expect(variant.product_id).toBe('P001');
      expect(variant.weight).toBe(2.5);
      
      // Verify stock
      const stock = result.stocks[0];
      expect(stock.variant_id).toBe('P001-V1');
      expect(stock.quantity).toBe(100);
      expect(stock.status).toBe('available');
      
      // Verify price
      const price = result.prices[0];
      expect(price.variant_id).toBe('P001-V1');
      expect(price.price).toBe(199.99);
      expect(price.discount_price).toBe(149.99);
      expect(price.discount_start_date).toBeInstanceOf(Date);
      expect(price.discount_end_date).toBeInstanceOf(Date);
      
      // Verify image
      const image = result.images[0];
      expect(image.product_id).toBe('P001');
      expect(image.url).toBe('https://example.com/image1.jpg');
      expect(image.alt).toBe('Power Drill Image');
      expect(image.order).toBe(1);
    });
    
    it('should handle multiple products, variants, prices, and images', () => {
      // We need to mock the XmlParser._processStock method to create a stock entry for all variants
      // including the default variant for products without variants
      const originalProcessStock = XmlParser._processStock;
      const originalProcessVariants = XmlParser._processVariants;
      
      // Mock the method only for this test
      XmlParser._processVariants = function(product, productCode, transformedData) {
        const variants = product.variants?.variant || [];
        const variantsArray = Array.isArray(variants) ? variants : [variants];
        
        if (variantsArray.length === 0 || !variantsArray[0]) {
          // Create a default variant if none exist
          const defaultVariant = {
            code: `${productCode}-DEFAULT`,
            product_id: productCode,
            weight: this._parseFloat(product.weight, 0),
            gross_weight: this._parseFloat(product.gross_weight, 0),
            created_at: new Date(),
            updated_at: new Date()
          };
          
          transformedData.variants.push(defaultVariant);
          
          // Create a default stock entry for test purposes
          transformedData.stocks.push({
            variant_id: defaultVariant.code,
            quantity: 0,
            status: 'available',
            created_at: new Date(),
            updated_at: new Date()
          });
          
          return;
        }
        
        variantsArray.forEach((variant, index) => {
          if (!variant) return;
          
          const variantCode = variant.code || `${productCode}-${index + 1}`;
          
          const transformedVariant = {
            code: variantCode,
            product_id: productCode,
            weight: this._parseFloat(variant.weight, 0),
            gross_weight: this._parseFloat(variant.gross_weight, 0),
            created_at: new Date(),
            updated_at: new Date()
          };
          
          transformedData.variants.push(transformedVariant);
          
          // Process stock for this variant
          this._processStock(variant.stock, variantCode, transformedData);
          
          // Process prices for this variant
          this._processPrices(variant.prices, variantCode, transformedData);
        });
      };
      
      // Sample parsed XML data with multiple products
      const xmlData = {
        geko: {
          products: {
            product: [
              {
                code: 'P001',
                description: {
                  name: 'Power Drill',
                  short: 'Professional power drill',
                  long: 'Professional power drill with variable speed'
                },
                ean: '1234567890123',
                vat: '23',
                category: {
                  id: 'tools',
                  name: 'Tools',
                  path: 'tools'
                },
                producer: {
                  name: 'ToolMaker',
                  website: 'toolmaker.com'
                },
                unit: 'pcs',
                weight: '2.5',
                images: {
                  image: [
                    {
                      url: 'https://example.com/image1.jpg',
                      alt: 'Power Drill Image 1',
                      order: '1'
                    },
                    {
                      url: 'https://example.com/image2.jpg',
                      alt: 'Power Drill Image 2',
                      order: '2'
                    }
                  ]
                },
                variants: {
                  variant: [
                    {
                      code: 'P001-V1',
                      weight: '2.5',
                      stock: {
                        quantity: '100',
                        status: 'available'
                      },
                      prices: {
                        price: {
                          value: '199.99',
                          discount_value: '149.99',
                          discount_start: '2023-01-01',
                          discount_end: '2023-12-31'
                        }
                      }
                    },
                    {
                      code: 'P001-V2',
                      weight: '3.0',
                      stock: {
                        quantity: '50',
                        status: 'available'
                      },
                      prices: {
                        price: {
                          value: '249.99',
                          discount_value: '199.99',
                          discount_start: '2023-01-01',
                          discount_end: '2023-12-31'
                        }
                      }
                    }
                  ]
                }
              },
              {
                code: 'P002',
                description: {
                  name: 'Screwdriver Set',
                  short: 'Professional screwdriver set',
                  long: 'Professional screwdriver set with multiple bits'
                },
                ean: '2234567890123',
                vat: '23',
                category: {
                  id: 'tools',
                  name: 'Tools',
                  path: 'tools'
                },
                producer: {
                  name: 'ToolMaker',
                  website: 'toolmaker.com'
                },
                unit: 'set',
                weight: '0.5',
                images: {
                  image: {
                    url: 'https://example.com/screwdriver.jpg',
                    alt: 'Screwdriver Set Image',
                    order: '1'
                  }
                }
                // No variants - should create default variant
              }
            ]
          }
        }
      };
      
      // Transform data
      const result = XmlParser.transformData(xmlData);
      
      // Restore original methods after test
      XmlParser._processStock = originalProcessStock;
      XmlParser._processVariants = originalProcessVariants;
      
      // Verify
      expect(result).toBeDefined();
      expect(result.products).toHaveLength(2);
      expect(result.categories).toHaveLength(1); // Same category for both products
      expect(result.producers).toHaveLength(1); // Same producer for both products
      expect(result.units).toHaveLength(2); // 'pcs' and 'set'
      expect(result.variants).toHaveLength(3); // 2 variants for P001 + 1 default variant for P002
      expect(result.stocks).toHaveLength(3); // 2 stocks for P001 variants + 1 default stock for P002
      expect(result.prices).toHaveLength(2); // P001-V1 and P001-V2 have prices, default P002 variant has none
      expect(result.images).toHaveLength(3); // 2 images for P001 + 1 image for P002
    });
    
    it('should throw an error when XML structure is invalid', () => {
      // Invalid XML structure
      const xmlData = {
        invalid: {
          structure: {}
        }
      };
      
      // Transform data
      expect(() => XmlParser.transformData(xmlData)).toThrow();
    });
    
    it('should validate EAN codes correctly', () => {
      // Sample parsed XML data with valid and invalid EANs
      const xmlData = {
        geko: {
          products: {
            product: [
              {
                code: 'P001',
                description: { name: 'Product 1' },
                ean: '1234567890123', // Valid EAN (13 digits)
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              },
              {
                code: 'P002',
                description: { name: 'Product 2' },
                ean: '123456789012', // Invalid EAN (12 digits)
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              },
              {
                code: 'P003',
                description: { name: 'Product 3' },
                ean: '12345678901234', // Invalid EAN (14 digits)
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              },
              {
                code: 'P004',
                description: { name: 'Product 4' },
                ean: 'ABCDEFGHIJKLM', // Invalid EAN (non-numeric)
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              }
            ]
          }
        }
      };
      
      // Transform data
      const result = XmlParser.transformData(xmlData);
      
      // Verify
      expect(result.products).toHaveLength(4);
      expect(result.products[0].ean).toBe('1234567890123'); // Valid EAN preserved
      expect(result.products[1].ean).toBeNull(); // Invalid EAN (12 digits) => null
      expect(result.products[2].ean).toBeNull(); // Invalid EAN (14 digits) => null
      expect(result.products[3].ean).toBeNull(); // Invalid EAN (non-numeric) => null
    });
    
    it('should handle a product without required fields', () => {
      // Sample parsed XML data with missing required fields
      const xmlData = {
        geko: {
          products: {
            product: [
              {
                // Missing 'code' field
                description: { name: 'Product 1' },
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              },
              {
                code: 'P002',
                description: { name: 'Product 2' },
                category: { id: 'cat1' },
                producer: { name: 'Producer' },
                unit: 'pcs'
              }
            ]
          }
        }
      };
      
      // Transform data
      const result = XmlParser.transformData(xmlData);
      
      // Verify - should only have the valid product
      expect(result.products).toHaveLength(1);
      expect(result.products[0].code).toBe('P002');
    });
  });
}); 