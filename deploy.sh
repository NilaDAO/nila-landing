#!/usr/bin/env bash
# deploy.sh — Build and deploy nila-landing to Amplify (nilapwa / landing branch)
# Usage: ./deploy.sh

set -euo pipefail

APP_ID="d108zfeejs7ppp"
BRANCH="landing"
REGION="ap-south-1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP="$SCRIPT_DIR/dist-deploy.zip"

echo "==> Building..."
cd "$SCRIPT_DIR"
npm run build

echo "==> Zipping dist/ (flat — index.html at root)..."
rm -f "$ZIP"
(cd dist && zip -r "$ZIP" .)

echo "==> Creating Amplify deployment..."
RESPONSE=$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --output json)

JOB_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['jobId'])")
UPLOAD_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['zipUploadUrl'])")

echo "==> Uploading zip (job $JOB_ID)..."
curl -s -T "$ZIP" "$UPLOAD_URL"

echo "==> Starting deployment..."
aws amplify start-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-id "$JOB_ID" \
  --region "$REGION" > /dev/null

echo "==> Waiting for deployment to complete..."
while true; do
  STATUS=$(aws amplify get-job \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH" \
    --job-id "$JOB_ID" \
    --region "$REGION" \
    --query 'job.summary.status' \
    --output text)
  echo "    status: $STATUS"
  if [[ "$STATUS" == "SUCCEED" ]]; then
    echo "==> Deployed successfully! https://www.nila.land"
    break
  elif [[ "$STATUS" == "FAILED" || "$STATUS" == "CANCELLED" ]]; then
    echo "==> Deployment $STATUS."
    exit 1
  fi
  sleep 10
done

echo "==> Cleaning up zip..."
rm -f "$ZIP"
