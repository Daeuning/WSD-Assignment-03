#!/bin/bash

# 서버 종료
echo "Stopping server..."
pkill -f "node server.js"

# 서버 재시작
echo "Starting server..."
sudo nohup node server.js > output.log 2>&1 &

echo "Server restarted successfully."
