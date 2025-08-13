#!/usr/bin/env node

console.log('🔍 检查当前环境变量配置')
console.log('============================')

// 尝试加载不同的.env文件
const fs = require('fs')
const path = require('path')

const possibleFiles = [
  '.env.local',
  '.env',
  '.env.local.template'
]

const currentDir = process.cwd()

console.log('📁 当前工作目录:', currentDir)
console.log('\n📄 检查文件存在情况:')

possibleFiles.forEach(file => {
  const filePath = path.join(currentDir, file)
  const exists = fs.existsSync(filePath)
  console.log(`   ${file}: ${exists ? '✅ 存在' : '❌ 不存在'}`)
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8')
    console.log(`   内容预览:`)
    
    // 只显示配置项，不显示实际值
    const lines = content.split('\n')
    lines.forEach(line => {
      if (line.includes('R2_') || line.includes('REPLICATE_') || line.includes('POLAR_')) {
        const [key, value] = line.split('=')
        if (key && value) {
          const isPlaceholder = value.includes('your_') || value.includes('placeholder')
          const status = isPlaceholder ? '❌ 占位符' : '✅ 已配置'
          console.log(`     ${key}=${status}`)
        }
      }
    })
    console.log('')
  }
})

// 检查实际加载的环境变量
console.log('🔍 实际加载的环境变量:')
const envVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'REPLICATE_API_TOKEN',
  'POLAR_ACCESS_TOKEN'
]

let hasRealValues = false
envVars.forEach(varName => {
  const value = process.env[varName]
  const isSet = value ? true : false
  const isPlaceholder = value && (value.includes('your_') || value.includes('PLACEHOLDER') || value.includes('example'))
  
  console.log(`   ${varName}: ${isSet ? (isPlaceholder ? '❌ 占位符值' : '✅ 已配置') : '❌ 未设置'}`)
  
  if (isSet && !isPlaceholder) {
    hasRealValues = true
  }
})

console.log('\n📋 配置建议:')
if (!hasRealValues) {
  console.log('1. 运行: node scripts/setup-env.js')
  console.log('2. 或手动编辑 .env.local')
  console.log('3. 确保使用真实凭据，不是占位符')
} else {
  console.log('✅ 看起来已经配置了真实值')
}

console.log('\n📌 文件位置确认:')
console.log('   应该配置在:', path.join(currentDir, '.env.local'))
console.log('   确保文件内容类似:')
console.log('   R2_ACCOUNT_ID=1234567890abcdef1234567890abcdef')
console.log('   R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef')
console.log('   R2_SECRET_ACCESS_KEY=1234567890abcdef1234567890abcdef1234567890abcdef')
