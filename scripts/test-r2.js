#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { r2Client, R2_BUCKET_NAME } = require('../lib/r2-client')
const { UploadPartCommand, ListObjectsCommand } = require('@aws-sdk/client-s3')

console.log('🔍 R2连接测试开始...')

async function testR2Connection() {
  try {
    console.log('📊 配置检查:')
    console.log(`   R2_ACCOUNT_ID: ${process.env.R2_ACCOUNT_ID ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`   R2_ACCESS_KEY_ID: ${process.env.R2_ACCESS_KEY_ID ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`   R2_SECRET_ACCESS_KEY: ${process.env.R2_SECRET_ACCESS_KEY ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`   R2_BUCKET_NAME: ${R2_BUCKET_NAME}`)

    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.log('\n❌ 环境变量未正确配置')
      console.log('请运行: node scripts/setup-env.js 来配置')
      return
    }

    console.log('\n🌐 测试R2连接...')
    
    // 测试列出存储桶中的对象
    const listCommand = new ListObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 1
    })

    const result = await r2Client.send(listCommand)
    console.log('✅ R2连接成功!')
    console.log(`   存储桶: ${R2_BUCKET_NAME}`)
    console.log(`   对象数量: ${result.Contents?.length || 0}`)

    if (result.Contents && result.Contents.length > 0) {
      console.log('   示例对象:', result.Contents[0].Key)
    }

    console.log('\n🎯 R2配置验证完成！')
    console.log('现在可以运行: npm run dev 来启动应用')

  } catch (error) {
    console.error('❌ R2连接失败:', error.message)
    
    if (error.name === 'NoSuchBucket') {
      console.log('\n💡 存储桶不存在，请检查:')
      console.log('1. 存储桶名称是否正确')
      console.log('2. 存储桶是否已创建')
      console.log('3. API令牌是否有正确权限')
    } else if (error.name === 'InvalidAccessKeyId') {
      console.log('\n💡 Access Key ID 无效，请检查:')
      console.log('1. R2_ACCESS_KEY_ID 是否正确')
      console.log('2. API令牌是否已启用')
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n💡 密钥不匹配，请检查:')
      console.log('1. R2_SECRET_ACCESS_KEY 是否正确')
      console.log('2. 密钥是否已过期')
    } else {
      console.log('\n💡 其他错误，请检查:')
      console.log('1. 网络连接')
      console.log('2. Cloudflare账户权限')
      console.log('3. R2服务是否可用')
    }
  }
}

testR2Connection()