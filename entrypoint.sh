#!/bin/bash
# entrypoint.sh
set -e

# Change this path
rm -f /app/tmp/pids/server.pid

exec "$@"
