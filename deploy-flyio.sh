#!/bin/bash

echo "========================================"
echo " HashWeb - Fly.io Deployment Script"
echo "========================================"
echo ""

echo "[1/5] Setting Redis Secret with TLS..."
fly secrets set REDIS="rediss://default:ATywAAIncDIwNTk2ODJjNmNmYTg0OTczYjEzZTdiMjJkOGFkMzAwOHAyMTU1MzY@flying-crappie-15536.upstash.io:6379" --app hashweb
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to set REDIS secret"
    exit 1
fi
echo "SUCCESS: REDIS secret set!"
echo ""

echo "[2/5] Verifying secrets..."
fly secrets list --app hashweb
echo ""

echo "[3/5] Deploying to Fly.io..."
fly deploy
if [ $? -ne 0 ]; then
    echo "ERROR: Deployment failed"
    exit 1
fi
echo "SUCCESS: Deployment complete!"
echo ""

echo "[4/5] Checking status..."
fly status --app hashweb
echo ""

echo "[5/5] Showing logs (Press Ctrl+C to stop)..."
fly logs --app hashweb
