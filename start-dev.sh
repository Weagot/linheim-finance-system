#!/bin/bash
# Start Mock API Server
node mock-server.js &
# Start Frontend Dev Server
cd frontend && pnpm run dev --port 5000 --host
