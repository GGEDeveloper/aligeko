/**
 * Test script for the enhanced GEKO XML Parser
 * 
 * This script tests the parser with a sample XML string to verify it correctly extracts all fields.
 */

import { parse } from '../utils/geko-xml-parser.js';

// Sample XML for testing
const sampleXml = `
<offer file_format="IOF" version="2.6" generated="2023-05-01">
  <products language="en" currency="EUR">
    <product id="12345" vat="23" code="TEST001" code_on_card="TEST-001" EAN="1234567890123" code_producer="PROD-001">
      <producer name="Test Producer" id="1"/>
      <category id="cat1" name="Test Category" path="Main/Test Category"/>
      <category_idosell path="Categories/Test" />
      <unit id="unit1" name="Each" moq="1"/>
      <card url="https://example.com/product/test001"/>
      <description>
        <n><![CDATA[Test Product]]></n>
        <long_desc xml:lang="en"><![CDATA[This is a long description of the test product.]]></long_desc>
        <short_desc xml:lang="en"><![CDATA[Short description]]></short_desc>
        <description><![CDATA[<p>HTML description</p>]]></description>
      </description>
      <delivery>2023-06-01</delivery>
      <price gross="19.99" net="16.25"/>
      <srp gross="24.99" net="20.32"/>
      <properties>
        <property name="Color" value="Red"/>
        <property name="Material" value="Plastic"/>
      </properties>
      <sizes>
        <size code="SIZE-S" weight="0.5" grossWeight="0.6">
          <stock id="1" quantity="10"/>
          <price gross="19.99" net="16.25"/>
          <srp gross="24.99" net="20.32"/>
        </size>
        <size code="SIZE-M" weight="0.6" grossWeight="0.7">
          <stock id="2" quantity="15"/>
          <price gross="21.99" net="17.88"/>
          <srp gross="26.99" net="21.94"/>
        </size>
      </sizes>
      <images>
        <image url="https://example.com/images/test001-1.jpg" is_main="true" order="1"/>
        <image url="https://example.com/images/test001-2.jpg" is_main="false" order="2"/>
      </images>
      <documents>
        <document name="Manual" url="https://example.com/docs/manual.pdf" type="PDF"/>
        <document name="Specs" url="https://example.com/docs/specs.xlsx" type="Excel"/>
      </documents>
    </product>
  </products>
</offer>
`;

// Test function
async function testParser() {
  console.log('Testing GEKO XML Parser...');
  
  try {
    const result = await parse(sampleXml);
    
    // Print out structure of result
    console.log('\nTransformation result structure:');
    Object.keys(result).forEach(key => {
      console.log(`- ${key}: ${Array.isArray(result[key]) ? result[key].length : 'unknown'} items`);
    });
    
    // Print out details of extracted data
    console.log('\nProducts:');
    result.products.forEach(p => console.log(`  - ${p.code}: ${p.name} (EAN: ${p.ean})`));

    console.log('\nCategories:');
    result.categories.forEach(c => console.log(`  - ${c.id}: ${c.name} (path: ${c.path})`));
    
    console.log('\nProducers:');
    result.producers.forEach(p => console.log(`  - ${p.name}`));
    
    console.log('\nUnits:');
    result.units.forEach(u => console.log(`  - ${u.id}: ${u.name}`));
    
    console.log('\nVariants:');
    result.variants.forEach(v => console.log(`  - ${v.code} (weight: ${v.weight})`));
    
    console.log('\nStocks:');
    result.stocks.forEach(s => console.log(`  - Variant ${s.variant_code}: ${s.quantity} units`));
    
    console.log('\nPrices:');
    result.prices.forEach(p => console.log(`  - Variant ${p.variant_code}: ${p.gross_price} ${p.currency} (type: ${p.price_type})`));
    
    console.log('\nImages:');
    result.images.forEach(i => console.log(`  - ${i.url} (main: ${i.is_main})`));
    
    console.log('\nDocuments:');
    result.documents.forEach(d => console.log(`  - ${d.name}: ${d.url} (${d.type})`));
    
    console.log('\nProduct Properties:');
    result.productProperties.forEach(p => console.log(`  - ${p.name}: ${p.value}`));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing parser:', error);
  }
}

// Run the test
testParser(); 