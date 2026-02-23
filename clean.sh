#!/bin/bash
# 清理残留进程脚本

echo "Cleaning up残留进程..."

# 杀掉可能残留的进程
pkill -9 -f 'ts-node-dev' 2>/dev/null || true
pkill -9 -f 'vite' 2>/dev/null || true
pkill -9 -f 'concurrently' 2>/dev/null || true
pkill -9 -f 'node.*linheim' 2>/dev/null || true

sleep 2

# 检查端口
echo "Checking ports..."
if ss -tlnp 2>/dev/null | grep -q ":5000"; then
    echo "Warning: Port 5000 still in use"
    ss -lptn 'sport = :5000' 2>/dev/null
else
    echo "Port 5000 is free"
fi

if ss -tlnp 2>/dev/null | grep -q ":3001"; then
    echo "Warning: Port 3001 still in use"
    ss -lptn 'sport = :3001' 2>/dev/null
else
    echo "Port 3001 is free"
fi

echo "Done!"
