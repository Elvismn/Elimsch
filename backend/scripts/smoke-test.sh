#!/usr/bin/env bash
# scripts/smoke-test.sh
# End-to-end API smoke test for ElimSch. Assumes `npm run seed` has been run.
set -euo pipefail

BASE="http://localhost:5000"
JQ() { command -v jq >/dev/null 2>&1 || { echo "❌ jq is required (apt install jq / brew install jq)"; exit 1; }; }
JQ

banner() { printf "\n\033[1;36m── %s ──\033[0m\n" "$1"; }

banner "1. Admin login"
ADMIN_TOKEN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elimsch.com","password":"Password123!"}' \
  | jq -r .data.token)
echo "admin token: ${ADMIN_TOKEN:0:20}…"

banner "2. Discover IDs from the API"
ROUTES_JSON=$(curl -sf "$BASE/api/routes"        -H "Authorization: Bearer $ADMIN_TOKEN")
USERS_JSON=$(curl -sf "$BASE/api/users"          -H "Authorization: Bearer $ADMIN_TOKEN")
VEHICLES_JSON=$(curl -sf "$BASE/api/vehicles"    -H "Authorization: Bearer $ADMIN_TOKEN")
STUDENTS_JSON=$(curl -sf "$BASE/api/students"    -H "Authorization: Bearer $ADMIN_TOKEN")

AM_ROUTE=$(echo "$ROUTES_JSON"   | jq -r '.data[] | select(.shiftType=="am") | ._id' | head -1)
VEHICLE=$(echo "$VEHICLES_JSON"  | jq -r '.data[0]._id')
DRIVER=$(echo "$USERS_JSON"      | jq -r '.data[] | select(.role=="driver")    | ._id' | head -1)
CODRIVER=$(echo "$USERS_JSON"    | jq -r '.data[] | select(.role=="co-driver") | ._id' | head -1)
PARENT=$(echo "$USERS_JSON"      | jq -r '.data[] | select(.role=="parent")    | ._id' | head -1)
STUDENT1=$(echo "$STUDENTS_JSON" | jq -r '.data[0]._id')
STUDENT1_QR=$(echo "$STUDENTS_JSON" | jq -r '.data[0].qrCodeIdentifier')

cat <<EOF
AM_ROUTE   = $AM_ROUTE
VEHICLE    = $VEHICLE
DRIVER     = $DRIVER
CODRIVER   = $CODRIVER
PARENT     = $PARENT
STUDENT1   = $STUDENT1
STUDENT1_QR= $STUDENT1_QR
EOF

banner "3. Create today's AM trip"
TODAY=$(date +%Y-%m-%d)
TRIP_JSON=$(curl -s -X POST "$BASE/api/trips" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"routeId\":\"$AM_ROUTE\",\"vehicleId\":\"$VEHICLE\",\"driverId\":\"$DRIVER\",\"coDriverId\":\"$CODRIVER\",\"date\":\"$TODAY\"}")
echo "$TRIP_JSON" | jq .
TRIP=$(echo "$TRIP_JSON" | jq -r '.data._id')
if [[ -z "$TRIP" || "$TRIP" == "null" ]]; then echo "❌ Trip creation failed"; exit 1; fi
echo "TRIP       = $TRIP"

banner "4. Try to create the SAME trip again → expect 409"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$BASE/api/trips" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"routeId\":\"$AM_ROUTE\",\"vehicleId\":\"$VEHICLE\",\"driverId\":\"$DRIVER\",\"coDriverId\":\"$CODRIVER\",\"date\":\"$TODAY\"}"

banner "5. Move trip → in-progress"
curl -s -X PATCH "$BASE/api/trips/$TRIP/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}' | jq '.message, .data.status'

banner "6. Co-driver marks student1 as boarded (via studentId)"
CO_TOKEN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"codriver@elimsch.com","password":"Password123!"}' | jq -r .data.token)

curl -s -X PATCH "$BASE/api/trips/$TRIP/manifest" \
  -H "Authorization: Bearer $CO_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"studentId\":\"$STUDENT1\",\"status\":\"boarded\"}" | jq '.message, .data.results'

banner "7. Co-driver marks the OTHER student boarded via QR code"
STUDENT2_QR=$(echo "$STUDENTS_JSON" | jq -r '.data[1].qrCodeIdentifier')
curl -s -X PATCH "$BASE/api/trips/$TRIP/manifest" \
  -H "Authorization: Bearer $CO_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"qrCodeIdentifier\":\"$STUDENT2_QR\",\"status\":\"boarded\"}" | jq '.message, .data.results'

banner "8. Parent can see the trip but ONLY their children"
P_TOKEN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@elimsch.com","password":"Password123!"}' | jq -r .data.token)

curl -s "$BASE/api/trips/$TRIP" -H "Authorization: Bearer $P_TOKEN" \
  | jq '{ trip: .data._id, manifest_count: (.data.attendanceManifest|length), statuses: [.data.attendanceManifest[].status] }'

banner "9. Parent tries admin endpoint → expect 403 (RBAC proof)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE/api/users" -H "Authorization: Bearer $P_TOKEN"

banner "10. Parent tries to update manifest → expect 403 (RBAC proof)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X PATCH "$BASE/api/trips/$TRIP/manifest" \
  -H "Authorization: Bearer $P_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"'$STUDENT1'","status":"excused"}'

banner "11. Fuel log — expect odometer to bump to 45200"
curl -s -X POST "$BASE/api/fuel-logs" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"vehicleId\":\"$VEHICLE\",\"tripId\":\"$TRIP\",\"litersAdded\":40,\"totalCost\":6000,\"odometerReading\":45200}" \
  | jq '.message, .data.odometerUpdated, .data.log.odometerReading'

banner "12. Move trip → completed"
curl -s -X PATCH "$BASE/api/trips/$TRIP/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}' | jq '.message, .data.status'

banner "13. Try to go completed → in-progress → expect 400 (state machine proof)"
curl -s -X PATCH "$BASE/api/trips/$TRIP/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}' | jq '.message'

banner "14. Driver can only see their own trips"
D_TOKEN=$(curl -sf -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@elimsch.com","password":"Password123!"}' | jq -r .data.token)

curl -s "$BASE/api/trips/active" -H "Authorization: Bearer $D_TOKEN" \
  | jq '{ count: (.data|length), driver_matches: [.data[].driverId._id] }'

echo -e "\n\033[1;32m✅ SMOKE TEST COMPLETE\033[0m\n"