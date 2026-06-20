#!/bin/sh
set -e

cd /app

export PATH="/app/node_modules/.bin:$PATH"

echo "Running database migrations..."
prisma migrate deploy

echo "Seeding demo data (skips if already present)..."
node prisma/seed.mjs

echo "Starting TekMarketing..."
exec node server.js