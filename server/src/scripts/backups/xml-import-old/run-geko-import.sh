#!/bin/bash

# GEKO XML Import Script Runner
# This script runs the GEKO XML import with increased memory allocation

# Default values
XML_FILE_PATH="../../geko_products_en.xml"
MEMORY_LIMIT=4096

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -f|--file) XML_FILE_PATH="$2"; shift ;;
        -m|--memory) MEMORY_LIMIT="$2"; shift ;;
        -h|--help) 
            echo "Usage: ./run-geko-import.sh [OPTIONS]"
            echo "Options:"
            echo "  -f, --file FILE      Specify XML file path (default: ../../geko_products_en.xml)"
            echo "  -m, --memory SIZE    Specify memory limit in MB (default: 4096)"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Determine script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Use absolute path for XML file if it's relative
if [[ ! "$XML_FILE_PATH" = /* ]]; then
    XML_FILE_PATH="$SCRIPT_DIR/$XML_FILE_PATH"
fi

echo "========================================================"
echo "GEKO XML Import"
echo "========================================================"
echo "XML File: $XML_FILE_PATH"
echo "Memory Limit: ${MEMORY_LIMIT}MB"
echo "Starting import..."
echo "========================================================"

# Run the Node.js script with increased memory
NODE_OPTIONS="--max-old-space-size=$MEMORY_LIMIT" node "$SCRIPT_DIR/import-geko-xml.js" "$XML_FILE_PATH"

# Check exit status
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo "========================================================"
    echo "Import completed successfully!"
    echo "========================================================"
else
    echo "========================================================"
    echo "Import failed with exit code: $EXIT_CODE"
    echo "Check the logs for more details."
    echo "========================================================"
fi

exit $EXIT_CODE 