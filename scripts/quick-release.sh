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

# 使用 changelogen 更新版本号和生成 changelog
echo "📝 更新版本号和生成 changelog..."
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
    # 自动模式：执行所有步骤
    echo "🔄 自动执行后续步骤..."
    
    # 获取新版本号
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo "📦 新版本: v$NEW_VERSION"
    
    # Git 操作
    echo "📝 提交更改..."
    git add .
    git commit -m "chore: release v$NEW_VERSION"
    
    echo "⬆️ 推送到远程仓库..."
    git push
    
    echo "🏷️ 创建 Git 标签..."
    git tag "v$NEW_VERSION"
    git push origin "v$NEW_VERSION"
    
    echo "🎉 自动发布完成！"
    echo "📋 GitHub Actions 将自动构建并创建 Release"
else
    # 手动模式：提示用户手动执行
    echo ""
    echo "📋 接下来请手动执行以下步骤:"
    echo "1. 检查生成的 CHANGELOG.md 和 package.json 文件"
    echo "2. git add ."
    echo "3. git commit -m \"chore: release v\$(node -p \"require('./package.json').version\")\""
    echo "4. git push"
    echo "5. git tag \"v\$(node -p \"require('./package.json').version\")\""
    echo "6. git push origin \"v\$(node -p \"require('./package.json').version\")\""
    echo "7. GitHub Actions 将自动构建并创建 Release"
    echo ""
    echo "🎉 发布准备完成！"
    echo "💡 提示: 使用 --auto 参数可自动执行所有步骤"
fi
