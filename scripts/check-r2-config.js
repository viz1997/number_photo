#!/usr/bin/env node

/**
 * R2配置检查脚本
 * 用于验证R2环境变量和连接状态
 */

console.log('=== R2配置检查 ===\n')

// 检查环境变量
const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
]

const optionalEnvVars = [
  'R2_ENDPOINT',
  'NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN'
]

console.log('必需环境变量:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***已设置***' : value}`)
  } else {
    console.log(`❌ ${varName}: 未设置`)
  }
})

console.log('\n可选环境变量:')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`⚠️  ${varName}: 未设置`)
  }
})

// 检查存储桶名称
const bucketName = process.env.R2_BUCKET_NAME || 'numberphoto'
console.log(`\n当前配置的存储桶名称: ${bucketName}`)

// 检查路径配置
console.log('\n路径配置:')
console.log(`输入路径: ${bucketName}/input-ugc/`)
console.log(`输出路径: ${bucketName}/output-ugc/`)

// 测试R2连接
async function testR2Connection() {
  try {
    const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3')
    
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })

    console.log('\n=== 测试R2连接 ===')
    
    // 列出存储桶
    const listCommand = new ListBucketsCommand({})
    const result = await r2Client.send(listCommand)
    
    console.log('✅ R2连接成功!')
    console.log('可用的存储桶:')
    result.Buckets?.forEach(bucket => {
      console.log(`  - ${bucket.Name} (创建时间: ${bucket.CreationDate})`)
    })
    
    // 检查指定存储桶是否存在
    if (result.Buckets?.some(bucket => bucket.Name === bucketName)) {
      console.log(`✅ 存储桶 "${bucketName}" 存在`)
    } else {
      console.log(`❌ 存储桶 "${bucketName}" 不存在`)
      console.log('请检查 R2_BUCKET_NAME 环境变量设置')
    }
    
  } catch (error) {
    console.error('❌ R2连接失败:', error.message)
    console.error('请检查:')
    console.error('1. R2_ACCOUNT_ID 是否正确')
    console.error('2. R2_ACCESS_KEY_ID 和 R2_SECRET_ACCESS_KEY 是否有效')
    console.error('3. 网络连接是否正常')
  }
}

// 运行测试
testR2Connection().catch(console.error)
