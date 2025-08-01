#!/bin/bash

# 快速发版脚本
# 用法: ./scripts/quick-release.sh [patch|minor|major]

set -e

# 默认为 patch 版本
VERSION_TYPE=${1:-patch}

echo "🚀 开始快速发版流程..."

# 更新版本号
echo "📝 更新版本号 ($VERSION_TYPE)..."
node scripts/update-version.js $VERSION_TYPE

# 暂存版本文件
echo "📦 暂存版本文件..."
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json

# 使用项目的发版命令
echo "🚀 执行发版命令..."
case $VERSION_TYPE in
    "patch")
        pnpm release:patch
        ;;
    "minor")
        pnpm release:minor
        ;;
    "major")
        pnpm release:major
        ;;
    *)
        echo "❌ 无效的版本类型: $VERSION_TYPE"
        echo "支持的类型: patch, minor, major"
        exit 1
        ;;
esac

echo "✅ 发版完成！GitHub Actions 将自动构建和发布。"
echo "🔗 查看构建状态: https://github.com/zzstudio/community-service-center/actions"
