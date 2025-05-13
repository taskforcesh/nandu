#!/bin/bash

set -e

echo "Building nandu packages with safer compiler options..."

# Get the absolute path of the project root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build the service package
echo "Building service package..."
cd "$ROOT_DIR/packages/service"
npx tsc --skipLibCheck --noEmit false --project ./tsconfig.json

# Build the cli package
echo "Building cli package..."
cd "$ROOT_DIR/packages/cli"
npx tsc --skipLibCheck --noEmit false --project ./tsconfig.json

echo "Build completed successfully!"
