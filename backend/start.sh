#!/bin/bash

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy || echo "Migrations skipped or failed (this is ok)"

echo "Starting server..."
node dist/server.js
