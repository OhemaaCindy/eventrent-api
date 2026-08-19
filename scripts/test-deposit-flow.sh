#!/bin/bash
set -e

RENTER_EMAIL="cindy@example.com"
RENTER_PASSWORD="correcthorsebatteries"
OWNER_EMAIL="bizowner@example.com"
OWNER_PASSWORD="correcthorsebatteries"
LISTING_ID="b3397d50-b2f8-4978-85e6-86c6c7df569a"
START_DATE="2026-09-15"
END_DATE="2026-09-15"

echo "Logging in as renter..."
RENTER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RENTER_EMAIL\",\"password\":\"$RENTER_PASSWORD\"}" \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Creating booking..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $RENTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"listingId\":\"$LISTING_ID\",\"quantity\":1,\"startDate\":\"$START_DATE\",\"endDate\":\"$END_DATE\"}")

echo "$BOOKING_RESPONSE"
echo ""

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
PAYMENT_URL=$(echo "$BOOKING_RESPONSE" | grep -o '"paymentUrl":"[^"]*' | cut -d'"' -f4)

echo "Booking ID: $BOOKING_ID"
echo ""
echo "Open this in your browser and click the 'Success' test option:"
echo "$PAYMENT_URL"
echo ""
read -p "Press ENTER once payment is complete (check Prisma Studio if unsure)... "

echo "Logging in as owner..."
OWNER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}" \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "Calling confirm-return..."
curl -s -i -X POST "http://localhost:4000/bookings/$BOOKING_ID/confirm-return" \
  -H "Authorization: Bearer $OWNER_TOKEN"
echo ""
