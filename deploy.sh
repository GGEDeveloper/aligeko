#!/bin/bash
# AliTools B2B E-commerce Platform Deployment Script
# This script automates the deployment process to Vercel

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    AliTools B2B Deployment Script    ${NC}"
echo -e "${GREEN}========================================${NC}"

# Step 1: Check environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ ! -f .env ] || [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env or .env.local file is missing${NC}"
    echo "Please ensure both files exist with proper configuration."
    exit 1
fi

# Check for required environment variables
required_vars=("NEON_DB_URL" "NODE_ENV" "PORT")
for var in "${required_vars[@]}"; do
    if ! grep -q "$var" .env && ! grep -q "$var" .env.local; then
        echo -e "${RED}Error: $var is not set in either .env or .env.local${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ Environment variables verified${NC}"

# Step 2: Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
node test-db-connection.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Database connection test failed${NC}"
    echo "Check your database credentials and connectivity."
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"

# Step 3: Build client
echo -e "\n${YELLOW}Building client...${NC}"
cd client && npm install && npm run build

# Return to root directory
cd ..
echo -e "${GREEN}✓ Client build successful${NC}"

# Step 4: Test API endpoints
echo -e "\n${YELLOW}Testing API endpoints...${NC}"
node test-api-products.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: API endpoint test failed${NC}"
    echo "Check your API implementation and database connection."
    exit 1
fi
echo -e "${GREEN}✓ API endpoints working correctly${NC}"

# Step 5: Commit changes if any
echo -e "\n${YELLOW}Checking for uncommitted changes...${NC}"
if [[ $(git status --porcelain) ]]; then
    echo "There are uncommitted changes. Commit first? (y/n)"
    read -r commit_choice
    if [[ $commit_choice == "y" || $commit_choice == "Y" ]]; then
        echo "Enter commit message:"
        read -r commit_message
        git add .
        git commit -m "$commit_message"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error: Git commit failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Warning: Proceeding with uncommitted changes${NC}"
    fi
else
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
fi

# Step 6: Deploy to Vercel
echo -e "\n${YELLOW}Deploying to Vercel...${NC}"
vercel deploy --prod

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}    Deployment process completed    ${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Post-deployment verification:${NC}"
echo "1. Check that the website loads correctly at your Vercel URL"
echo "2. Verify all navigation links work properly"
echo "3. Test the Products page displays data from the database"
echo "4. Check the browser console for any errors"
echo "5. Review Vercel logs for server-side errors" 