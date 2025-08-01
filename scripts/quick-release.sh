#!/bin/bash

# 快速发布脚本
# 使用方法: ./scripts/quick-release.sh [patch|minor|major] [--auto]

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "请指定版本类型: patch, minor, 或 major"
    echo "使用方法: ./scripts/quick-release.sh [patch|minor|major] [--auto]"
    echo "  --auto: 自动执行所有步骤（包括 git push 和创建 release）"
    exit 1
fi

VERSION_TYPE=$1
AUTO_MODE=false

# 检查是否有 --auto 参数
if [ $# -eq 2 ] && [ "$2" = "--auto" ]; then
    AUTO_MODE=true
fi

# 验证版本类型
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
    echo "错误: 版本类型必须是 patch, minor, 或 major"
    exit 1
fi

echo "🚀 开始 $VERSION_TYPE 版本发布..."
if [ "$AUTO_MODE" = true ]; then
    echo "🤖 自动模式已启用"
fi

# 先更新 Tauri 相关文件的版本号
echo "🔧 更新 Tauri 版本号..."
node scripts/update-tauri-version.js $VERSION_TYPE

# 暂存更改 等待一起提交 changelogen 生成的更改
git add .
git commit -m"chore: update tauri version"

# 使用 changelogen 更新 package.json 版本号和生成 changelog
echo "📝 使用 changelogen 更新版本号和生成 changelog..."
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
esac

echo "✅ 版本号更新完成！"

if [ "$AUTO_MODE" = true ]; then

    echo "🔄 自动执行后续步骤..."
    
    # 获取新版本号
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo "📦 新版本: v$NEW_VERSION"
    
    # Git 操作 - 创建标签并推送
    echo "🏷️ 创建并推送标签..."
    git tag "v$NEW_VERSION"
    git push origin "v$NEW_VERSION"
    
    echo "🎉 自动发布完成！"
    echo "📋 GitHub Actions 将自动构建并创建 Release"
else
    # 手动模式：提示用户手动执行
    echo ""
    echo "📋 接下来请手动执行以下步骤:"
    echo "1. 检查生成的 CHANGELOG.md 和 package.json 文件"
    echo "2. 创建并推送标签:"
    echo "   git tag \"v\$(node -p \"require('./package.json').version\")\""
    echo "   git push origin \"v\$(node -p \"require('./package.json').version\")\""
    echo "3. GitHub Actions 将自动构建并更新 Release"
    echo ""
    echo "🎉 发布准备完成！"
    echo "💡 提示: 使用 --auto 参数可自动执行所有步骤"
fi
