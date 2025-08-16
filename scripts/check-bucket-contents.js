#!/usr/bin/env node

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')

// 创建R2客户端
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

async function checkBucketContents() {
  try {
    console.log('🔍 检查私有桶 numberphoto-private 的内容:')
    const privateResult = await r2Client.send(new ListObjectsV2Command({
      Bucket: 'numberphoto-private'
    }))
    
    if (privateResult.Contents && privateResult.Contents.length > 0) {
      privateResult.Contents.forEach(obj => {
        console.log(`  ${obj.Key} (${(obj.Size/1024).toFixed(1)}KB)`)
      })
    } else {
      console.log('  私有桶为空')
    }
    
    console.log('\n🔍 检查公开桶 numberphoto 的内容:')
    const publicResult = await r2Client.send(new ListObjectsV2Command({
      Bucket: 'numberphoto'
    }))
    
    if (publicResult.Contents && publicResult.Contents.length > 0) {
      publicResult.Contents.forEach(obj => {
        console.log(`  ${obj.Key} (${(obj.Size/1024).toFixed(1)}KB)`)
      })
    } else {
      console.log('  公开桶为空')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkBucketContents()
