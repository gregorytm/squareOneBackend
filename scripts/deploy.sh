#!/usr/bin/env bash

set -e

# name="squareOneBackend"
# app="$apps/$name"
# repo="$repos/$name"
# tmp="$tmps/$name"

echo "initializing nvm..."
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

echo "installing dependencies..."
NODE_ENV=production npm ci

echo "swapping out app..."
pm2 stop "$name" || echo 'app not running'
rm -rf "$app"
mv "$tmp" "$app"
pm2 start "$name"