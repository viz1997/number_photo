#!/usr/bin/env node

/**
 * 检查R2配置脚本
 * 验证R2存储桶配置是否正确
 */

require('dotenv').config({ path: '.env.local' })

// 检查必要的环境变量
const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BUCKET_NAME',
  'NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN'
]

console.log('🔍 检查R2配置...')
console.log('')

let missingVars = []
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  console.log(`   ${varName}: ${status}`)
  if (value) {
    // 隐藏敏感信息
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      console.log(`     值: ${value.substring(0, 8)}...`)
    } else {
      console.log(`     值: ${value}`)
    }
  }
  if (!value) missingVars.push(varName)
})

console.log('')

if (missingVars.length > 0) {
  console.log('❌ 缺少环境变量:', missingVars.join(', '))
  console.log('请检查 .env.local 文件')
  console.log('')
  console.log('💡 参考 env.example 文件设置正确的值')
  process.exit(1)
}

console.log('✅ 所有R2环境变量已配置')
console.log('')

// 检查配置逻辑
console.log('🔧 配置检查:')

// 1. 检查存储桶名称
const privateBucket = process.env.R2_BUCKET_NAME
const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME

if (privateBucket === publicBucket) {
  console.log('⚠️  警告: 私有桶和公开桶使用相同名称')
  console.log('   建议使用不同的存储桶名称以提高安全性')
} else {
  console.log('✅ 私有桶和公开桶使用不同名称')
}

// 2. 检查公共域名
const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
if (publicDomain) {
  if (publicDomain.startsWith('https://')) {
    console.log('✅ 公共域名使用HTTPS')
  } else {
    console.log('⚠️  警告: 公共域名未使用HTTPS')
  }
  
  if (publicDomain.includes('localhost') || publicDomain.includes('127.0.0.1')) {
    console.log('⚠️  警告: 公共域名指向本地地址，生产环境应使用真实域名')
  }
} else {
  console.log('❌ 未配置公共域名')
}

// 3. 检查端点配置
const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
console.log(`✅ R2端点: ${endpoint}`)

console.log('')
console.log('📋 当前配置摘要:')
console.log(`   私有桶: ${privateBucket}`)
console.log(`   公开桶: ${publicBucket}`)
console.log(`   公共域名: ${publicDomain || '未设置'}`)
console.log(`   R2端点: ${endpoint}`)

console.log('')
console.log('🎯 下一步:')
('1. 确保在Cloudflare R2中创建了对应的存储桶')
console.log('2. 确保公开桶已启用公共访问')
console.log('3. 配置公开桶的自定义域名')
console.log('4. 运行 npm run test-storage 测试连接')

console.log('')
console.log('✅ R2配置检查完成')
