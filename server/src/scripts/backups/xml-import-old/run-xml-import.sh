#!/bin/bash
# XML Import Runner Script
# This script provides a user-friendly interface to run the optimized XML import

# Color coding for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
XML_FILE="../../geko_products_en.xml"
MODE="import"
BATCH_SIZE=500
ENABLE_MEMORY_OPT=true
DEBUG=false

# Display help message
show_help() {
  echo -e "${CYAN}XML Import Runner Script${NC}"
  echo "This script runs the optimized XML import process."
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -f, --file FILE       Path to XML file (default: ../../geko_products_en.xml)"
  echo "  -m, --mode MODE       Execution mode: import, test, validate, perf, batch, memory, full"
  echo "                        (default: import)"
  echo "  -b, --batch SIZE      Batch size for database operations (default: 500)"
  echo "  --disable-memory-opt  Disable memory optimizations"
  echo "  -d, --debug           Enable debug output"
  echo "  -h, --help            Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --file ../../geko_products_en.xml"
  echo "  $0 --mode test --file ../../geko_products_en.xml"
  echo "  $0 --mode perf --batch 1000"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -f|--file)
      XML_FILE="$2"
      shift
      shift
      ;;
    -m|--mode)
      MODE="$2"
      shift
      shift
      ;;
    -b|--batch)
      BATCH_SIZE="$2"
      shift
      shift
      ;;
    --disable-memory-opt)
      ENABLE_MEMORY_OPT=false
      shift
      ;;
    -d|--debug)
      DEBUG=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

# Check if XML file exists
if [ ! -f "$XML_FILE" ]; then
  echo -e "${RED}ERROR: XML file not found: $XML_FILE${NC}"
  echo "Please specify a valid XML file with --file option"
  exit 1
fi

# Print configuration
echo -e "${CYAN}===========================================${NC}"
echo -e "${CYAN}XML IMPORT CONFIGURATION${NC}"
echo -e "${CYAN}===========================================${NC}"
echo -e "${BLUE}XML File:${NC} $XML_FILE"
echo -e "${BLUE}Mode:${NC} $MODE"
echo -e "${BLUE}Batch Size:${NC} $BATCH_SIZE"
echo -e "${BLUE}Memory Optimizations:${NC} $([ "$ENABLE_MEMORY_OPT" == true ] && echo 'Enabled' || echo 'Disabled')"
echo -e "${BLUE}Debug:${NC} $([ "$DEBUG" == true ] && echo 'Enabled' || echo 'Disabled')"
echo -e "${CYAN}===========================================${NC}"

# Set up environment variables
export BATCH_SIZE=$BATCH_SIZE
if [ "$DEBUG" == true ]; then
  export DEBUG=1
fi

# Function to run the command with progress indicator
run_command() {
  echo -e "${YELLOW}Executing: $1${NC}"
  echo -e "${CYAN}===========================================${NC}"
  eval "$1"
  EXIT_CODE=$?
  echo -e "${CYAN}===========================================${NC}"
  if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Command completed successfully${NC}"
  else
    echo -e "${RED}Command failed with exit code $EXIT_CODE${NC}"
  fi
  return $EXIT_CODE
}

# Set node options for increased memory if needed
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the appropriate command based on mode
case $MODE in
  import)
    CMD="node optimized-xml-import.js \"$XML_FILE\" --batch-size=$BATCH_SIZE"
    if [ "$ENABLE_MEMORY_OPT" == false ]; then
      CMD="$CMD --disable-memory-opt"
    fi
    run_command "$CMD"
    ;;
  test|validate|perf|performance|batch|memory|full)
    if [ "$MODE" == "perf" ]; then
      MODE="performance"
    fi
    CMD="node test-optimized-import.js \"$XML_FILE\" $MODE"
    run_command "$CMD"
    ;;
  *)
    echo -e "${RED}Invalid mode: $MODE${NC}"
    echo "Valid modes: import, test, validate, perf, batch, memory, full"
    exit 1
    ;;
esac

exit $EXIT_CODE 