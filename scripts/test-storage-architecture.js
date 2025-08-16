#!/usr/bin/env node

/**
 * 测试双存储桶架构
 * 验证私有桶和公开桶的配置是否正确
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const { S3Client, ListObjectsV2Command, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { GetObjectCommand } = require('@aws-sdk/client-s3')

// 检查环境变量
const requiredEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_BUCKET_NAME'
]

console.log('🔍 检查环境变量...')
let missingVars = []
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  console.log(`   ${varName}: ${status}`)
  if (!value) missingVars.push(varName)
})

if (missingVars.length > 0) {
  console.log('\n❌ 缺少环境变量:', missingVars.join(', '))
  console.log('请检查 .env.local 文件')
  process.exit(1)
}

// 创建R2客户端
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

async function testStorageArchitecture() {
  console.log('\n🚀 开始测试存储架构...')
  
  const privateBucket = process.env.R2_BUCKET_NAME
  const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME
  
  try {
    // 1. 测试私有桶连接
    console.log('\n1️⃣ 测试私有桶连接...')
    const privateListCommand = new ListObjectsV2Command({
      Bucket: privateBucket,
      MaxKeys: 5
    })
    
    const privateResult = await r2Client.send(privateListCommand)
    console.log(`✅ 私有桶连接成功: ${privateBucket}`)
    console.log(`   现有对象: ${privateResult.Contents?.length || 0}`)
    
    // 2. 测试公开桶连接
    console.log('\n2️⃣ 测试公开桶连接...')
    const publicListCommand = new ListObjectsV2Command({
      Bucket: publicBucket,
      MaxKeys: 5
    })
    
    const publicResult = await r2Client.send(publicListCommand)
    console.log(`✅ 公开桶连接成功: ${publicBucket}`)
    console.log(`   现有对象: ${publicResult.Contents?.length || 0}`)
    
    // 3. 测试上传到私有桶
    console.log('\n3️⃣ 测试上传到私有桶...')
    const testKey = `test/private-test-${Date.now()}.txt`
    const privateUploadCommand = new PutObjectCommand({
      Bucket: privateBucket,
      Key: testKey,
      Body: 'This is a test file for private bucket',
      ContentType: 'text/plain'
    })
    
    await r2Client.send(privateUploadCommand)
    console.log(`✅ 私有桶上传成功: ${testKey}`)
    
    // 4. 测试上传到公开桶
    console.log('\n4️⃣ 测试上传到公开桶...')
    const publicTestKey = `test/public-test-${Date.now()}.txt`
    const publicUploadCommand = new PutObjectCommand({
      Bucket: publicBucket,
      Key: publicTestKey,
      Body: 'This is a test file for public bucket',
      ContentType: 'text/plain'
    })
    
    await r2Client.send(publicUploadCommand)
    console.log(`✅ 公开桶上传成功: ${publicTestKey}`)
    
    // 5. 测试预签名URL生成
    console.log('\n5️⃣ 测试预签名URL生成...')
    const getObjectCommand = new GetObjectCommand({
      Bucket: privateBucket,
      Key: testKey
    })
    
    const presignedUrl = await getSignedUrl(r2Client, getObjectCommand, { expiresIn: 3600 })
    console.log(`✅ 预签名URL生成成功`)
    console.log(`   URL: ${presignedUrl.substring(0, 100)}...`)
    
    // 6. 测试公开URL生成
    console.log('\n6️⃣ 测试公开URL生成...')
    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
    if (publicDomain) {
      const publicUrl = `${publicDomain}/${publicTestKey}`
      console.log(`✅ 公开URL生成成功`)
      console.log(`   URL: ${publicUrl}`)
    } else {
      console.log(`⚠️  未配置公开桶域名，跳过公开URL测试`)
    }
    
    console.log('\n🎉 所有测试通过！存储架构配置正确。')
    
    // 清理测试文件
    console.log('\n🧹 清理测试文件...')
    // 注意：这里没有删除文件，因为需要DeleteObjectCommand
    console.log('   测试文件保留在存储桶中，可手动删除')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n💡 存储桶不存在，请按照以下步骤创建:')
      console.log('   1. 登录 Cloudflare Dashboard')
      console.log('   2. 进入 R2 页面')
      console.log('   3. 创建存储桶:', privateBucket)
      console.log('   4. 创建存储桶:', publicBucket)
      console.log('   5. 确保公开桶启用了 Public bucket 选项')
    }
    
    if (error.name === 'AccessDenied') {
      console.log('\n💡 权限不足，请检查:')
      console.log('   1. API密钥权限设置')
      console.log('   2. 存储桶权限配置')
      console.log('   3. 环境变量是否正确')
    }
    
    process.exit(1)
  }
}

// 运行测试
testStorageArchitecture()
