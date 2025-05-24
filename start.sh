#!/bin/bash

# Start processes
bun run --filter=web dev &
WEB_PID=$!
bun run --filter=backend dev &
BACKEND_PID=$!

# Trap Ctrl+C to kill all processes
trap "kill $WEB_PID $BACKEND_PID" SIGINT

# Wait for all processes
wait
