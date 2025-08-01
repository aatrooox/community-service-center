#!/usr/bin/env node

/**
 * 版本号同步脚本
 * 用于同步更新 package.json、Cargo.toml 和 tauri.conf.json 中的版本号
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

function updateVersion(newVersion) {
  if (!newVersion) {
    console.error('请提供新版本号，例如: node scripts/update-version.js 1.0.0')
    process.exit(1)
  }

  // 验证版本号格式
  const versionRegex = /^\d+\.\d+\.\d+$/
  if (!versionRegex.test(newVersion)) {
    console.error('版本号格式错误，请使用 x.y.z 格式，例如: 1.0.0')
    process.exit(1)
  }

  console.log(`正在更新版本号到 ${newVersion}...`)

  try {
    // 更新 package.json
    const packageJsonPath = join(rootDir, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    packageJson.version = newVersion
    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log('✅ 已更新 package.json')

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

    console.log(`\n🎉 版本号已成功更新到 ${newVersion}`)
    console.log('\n下一步:')
    console.log(`1. 提交更改: git add . && git commit -m "chore: bump version to v${newVersion}"`)
    console.log(`2. 创建标签: git tag v${newVersion}`)
    console.log(`3. 推送标签: git push origin v${newVersion}`)
    console.log('4. GitHub Actions 将自动构建发布包')
  }
  catch (error) {
    console.error('❌ 更新版本号时出错:', error.message)
    process.exit(1)
  }
}

// 获取命令行参数
const newVersion = process.argv[2]
updateVersion(newVersion)
