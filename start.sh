#!/bin/bash
set -e

echo "=== EquipScout Frontend Deploy ==="
echo "Working directory: $(pwd)"

# Change to webapp directory
cd webapp

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
npm run build

echo "Starting production server..."
PORT=${PORT:-8080}
echo "Binding to 0.0.0.0:$PORT"

# Use serve with explicit host and port
exec npx serve -s dist -l "tcp://0.0.0.0:$PORT"
