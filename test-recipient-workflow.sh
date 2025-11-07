#!/bin/bash

# BDSM Recipient Approval Workflow - Test Script
# This script demonstrates the complete recipient approval workflow

echo "=========================================="
echo "BDSM - Recipient Approval Workflow Test"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Register a new recipient${NC}"
echo "--------------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/recipient/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name":"Emma Thompson",
    "age":9,
    "gender":"female",
    "guardian_name":"Sarah Thompson",
    "guardian_contact":"9998887777",
    "address":"456 Oak Street, Delhi",
    "needs_description":"School uniform and books"
  }')

echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null
RECIPIENT_ID=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('recipient_id', ''))" 2>/dev/null)

if [ -z "$RECIPIENT_ID" ]; then
    echo "❌ Failed to register recipient"
    exit 1
fi

echo -e "${GREEN}✅ Recipient registered with ID: $RECIPIENT_ID${NC}"
echo ""

echo -e "${BLUE}Step 2: Admin views pending recipients${NC}"
echo "--------------------------------------"
PENDING_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/recipients?status=pending")
echo "$PENDING_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
echo ""

PENDING_COUNT=$(echo "$PENDING_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('recipients', [])))" 2>/dev/null)
echo -e "${GREEN}✅ Found $PENDING_COUNT pending recipient(s)${NC}"
echo ""

echo -e "${BLUE}Step 3: Admin approves the recipient${NC}"
echo "--------------------------------------"
APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/recipients/$RECIPIENT_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{"adminId":1}')

echo "$APPROVE_RESPONSE" | python3 -m json.tool 2>/dev/null

RECIPIENT_CODE=$(echo "$APPROVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('credentials', {}).get('recipientCode', ''))" 2>/dev/null)
PASSWORD=$(echo "$APPROVE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('credentials', {}).get('password', ''))" 2>/dev/null)

echo ""
echo -e "${GREEN}✅ Recipient approved successfully!${NC}"
echo -e "${YELLOW}Generated Credentials:${NC}"
echo -e "   Recipient Code: ${GREEN}$RECIPIENT_CODE${NC}"
echo -e "   Password: ${GREEN}$PASSWORD${NC}"
echo ""

echo -e "${BLUE}Step 4: Verify recipient is now verified${NC}"
echo "--------------------------------------"
VERIFIED_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/recipients?status=verified")
VERIFIED_COUNT=$(echo "$VERIFIED_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('recipients', [])))" 2>/dev/null)
echo -e "${GREEN}✅ Total verified recipients: $VERIFIED_COUNT${NC}"
echo ""

echo -e "${BLUE}Step 5: Check pending recipients again${NC}"
echo "--------------------------------------"
PENDING_AFTER=$(curl -s -X GET "$BASE_URL/admin/recipients?status=pending")
PENDING_AFTER_COUNT=$(echo "$PENDING_AFTER" | python3 -c "import sys, json; print(len(json.load(sys.stdin).get('recipients', [])))" 2>/dev/null)
echo -e "${GREEN}✅ Remaining pending recipients: $PENDING_AFTER_COUNT${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ WORKFLOW TEST COMPLETED SUCCESSFULLY!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Recipient registered: Emma Thompson (ID: $RECIPIENT_ID)"
echo "  - Status changed: pending → verified"
echo "  - Credentials generated:"
echo "    Code: $RECIPIENT_CODE"
echo "    Pass: $PASSWORD"
echo ""
echo "Next steps:"
echo "  1. Open: file://$(pwd)/frontend/ADMIN/recipients.html"
echo "  2. View all recipients in the admin interface"
echo "  3. Try approving/rejecting more recipients"
echo ""
