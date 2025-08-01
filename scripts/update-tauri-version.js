#!/usr/bin/env node

/**
 * Tauri 版本号同步脚本
 * 用于根据 package.json 的版本号同步更新 Cargo.toml 和 tauri.conf.json 中的版本号
 * 不会修改 package.json，让 changelogen 来处理 package.json 的版本更新
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 获取命令行参数
const versionType = process.argv[2]

if (!versionType) {
  console.error('请提供版本类型')
  console.error('用法: node scripts/update-tauri-version.js <type>')
  console.error('示例: node scripts/update-tauri-version.js patch')
  console.error('支持的类型: patch, minor, major')
  process.exit(1)
}

// 验证版本类型
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('无效的版本类型，支持: patch, minor, major')
  process.exit(1)
}

// 读取当前版本号
const packageJsonPath = join(rootDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
const currentVersion = packageJson.version

// 计算新版本号
function calculateNewVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number)

  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'major':
      return `${major + 1}.0.0`
    default:
      throw new Error(`无效的版本类型: ${type}`)
  }
}

const newVersion = calculateNewVersion(currentVersion, versionType)

function updateTauriVersion(newVersion) {
  console.log(`正在将 Tauri 版本号更新到 ${newVersion}...`)

  try {
    // 更新 tauri.conf.json
    const tauriConfPath = join(rootDir, 'src-tauri/tauri.conf.json')
    const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'))
    tauriConf.version = newVersion
    writeFileSync(tauriConfPath, `${JSON.stringify(tauriConf, null, 2)}\n`)
    console.log('✅ 已更新 src-tauri/tauri.conf.json')

    // 更新 Cargo.toml
    const cargoTomlPath = join(rootDir, 'src-tauri/Cargo.toml')
    let cargoToml = readFileSync(cargoTomlPath, 'utf8')
    cargoToml = cargoToml.replace(/^version = "[^"]+"/m, `version = "${newVersion}"`)
    writeFileSync(cargoTomlPath, cargoToml)
    console.log('✅ 已更新 src-tauri/Cargo.toml')

    console.log(`\n🎉 Tauri 版本号已成功更新到 ${newVersion}`)
    console.log('📝 package.json 的版本号将由 changelogen 处理')
  }
  catch (error) {
    console.error('❌ 更新 Tauri 版本号时出错:', error.message)
    process.exit(1)
  }
}

updateTauriVersion(newVersion)
