#!/bin/bash
set -e

SERVER="root@119.91.226.17"
REMOTE_DIR="/whois-undercover-game"
APP_NAME="whois-undercover"
ARCHIVE="whois-undercover-game.tar.gz"

echo "==> Building frontend..."
yarn build

echo "==> Packing project..."
tar czf "/tmp/$ARCHIVE" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='data' \
  --exclude='src' \
  --exclude='public' \
  --exclude='.DS_Store' \
  --exclude='.env*' \
  -C "$(dirname "$0")" .

echo "==> Uploading to $SERVER..."
scp "/tmp/$ARCHIVE" "$SERVER:/tmp/$ARCHIVE"

echo "==> Deploying on server..."
ssh "$SERVER" bash --login -s <<'EOF'
  set -e

  # Load nvm to get the correct node version
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

  echo "==> Node: $(node -v), Yarn: $(yarn -v)"

  REMOTE_DIR="/whois-undercover-game"
  APP_NAME="whois-undercover"
  ARCHIVE="whois-undercover-game.tar.gz"

  mkdir -p $REMOTE_DIR
  rm -rf $REMOTE_DIR/*
  tar xzf /tmp/$ARCHIVE -C $REMOTE_DIR
  rm -f /tmp/$ARCHIVE

  cd $REMOTE_DIR
  echo "==> Installing dependencies..."
  yarn install --production --ignore-engines

  echo "==> Starting with pm2..."
  pm2 delete $APP_NAME 2>/dev/null || true
  pm2 start yarn --name "$APP_NAME" -- start
  pm2 save

  echo "==> Done! App is running."
  pm2 list
EOF

rm -f "/tmp/$ARCHIVE"
echo "==> Deploy complete!"
