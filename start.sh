#!/bin/bash

# 林海财务系统启动脚本
# 确保正确启动前后端服务

cd /workspace/projects/linheim-finance-system

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# 启动后端服务（后台）
echo "Starting backend server..."
pnpm run dev:server > /app/work/logs/bypass/server.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "Backend started successfully on port 3001"
else
    echo "Backend may not be ready yet, continuing..."
fi

# 启动前端服务
echo "Starting frontend server..."
pnpm run dev:frontend

# 前端服务会阻塞，后端在后台运行
