# PR: XML Entity Mapping Documentation

## Summary

This pull request adds comprehensive documentation that maps GEKO XML entities to the corresponding database models. The documentation serves as a definitive reference for understanding how data flows from the XML import to the database, ensuring consistency in development and future maintenance.

## Details

Created a detailed mapping document (`docs/xml-import/xml-to-db-mapping.md`) that includes:

- A high-level overview of how each XML element maps to database tables
- Detailed field-by-field mapping tables for all 10 entity types:
  - Products
  - Categories
  - Producers
  - Units
  - Variants
  - Stocks
  - Prices
  - Images
  - Documents
  - Product Properties
- Rules for data transformation and validation
- Explanation of entity relationships and referential integrity
- Technical implementation details referencing the parser and import script
- Flowchart of the mapping process

## Why This Is Important

1. **Development Reference**: Provides a clear reference for developers working on the XML import system
2. **Onboarding Tool**: Helps new developers understand the complex data flow
3. **Consistency**: Ensures consistent implementation across the system
4. **Documentation Completeness**: Fills a gap in the project documentation regarding XML data mapping

## Related Tasks

- Completes implementation task 23.3 (Document XML integration processes)
- Supports the previously implemented comprehensive GEKO XML import system (Task 24)
- Complements the XML file upload interface documentation (Task 25)

## Testing

Documentation has been reviewed for:
- Accuracy against the actual code implementation
- Completeness of all entity mappings
- Clarity of explanations and technical details
- Proper formatting and structure

## Screenshots

N/A - Text documentation only

## Checklist

- [x] Documentation follows the established format
- [x] All entity mappings are accurate and complete
- [x] Technical implementation details are correct
- [x] Document is well-organized and easy to navigate
- [x] Formatting is consistent and readable
- [x] Implementation steps tracker has been updated 