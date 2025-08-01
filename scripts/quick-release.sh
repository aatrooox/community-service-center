#!/bin/bash

# 快速发版脚本
# 用法: ./scripts/quick-release.sh [patch|minor|major|版本号]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是 Git 仓库"
    exit 1
fi

# 检查工作区是否干净
if ! git diff-index --quiet HEAD --; then
    print_warning "工作区有未提交的更改"
    echo "请先提交或暂存所有更改后再发版"
    git status --short
    exit 1
fi

# 获取当前版本
current_version=$(node -p "require('./package.json').version")
print_info "当前版本: v$current_version"

# 解析参数
release_type="$1"

if [ -z "$release_type" ]; then
    print_error "请指定发版类型或版本号"
    echo "用法: $0 [patch|minor|major|x.y.z]"
    echo "示例:"
    echo "  $0 patch     # 0.1.1 -> 0.1.2"
    echo "  $0 minor     # 0.1.1 -> 0.2.0"
    echo "  $0 major     # 0.1.1 -> 1.0.0"
    echo "  $0 1.2.3     # 直接指定版本号"
    exit 1
fi

# 计算新版本号
if [[ "$release_type" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # 直接指定版本号
    new_version="$release_type"
else
    # 根据类型计算版本号
    IFS='.' read -ra VERSION_PARTS <<< "$current_version"
    major=${VERSION_PARTS[0]}
    minor=${VERSION_PARTS[1]}
    patch=${VERSION_PARTS[2]}
    
    case "$release_type" in
        "patch")
            patch=$((patch + 1))
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        *)
            print_error "无效的发版类型: $release_type"
            exit 1
            ;;
    esac
    
    new_version="$major.$minor.$patch"
fi

print_info "新版本: v$new_version"

# 确认发版
echo
read -p "确认发布版本 v$new_version? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "发版已取消"
    exit 0
fi

print_info "开始发版流程..."

# 更新版本号
print_info "更新版本号到 v$new_version"
node scripts/update-version.js "$new_version"

# 提交更改
print_info "提交版本更新"
git add .
git commit -m "chore: bump version to v$new_version"

# 创建标签
print_info "创建标签 v$new_version"
git tag "v$new_version"

# 推送到远程
print_info "推送到远程仓库"
git push origin main
git push origin "v$new_version"

print_success "发版完成!"
print_info "GitHub Actions 将自动构建以下平台的安装包:"
echo "  • macOS DMG (Universal Binary)"
echo "  • Android APK (ARM64)"
echo
print_info "查看构建进度: https://github.com/aatrooox/community-service-center/actions"
print_info "发布页面: https://github.com/aatrooox/community-service-center/releases"
