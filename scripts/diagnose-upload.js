#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { r2Client, R2_BUCKET_NAME } = require('../lib/r2-client')
const { ListObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

console.log('🔍 上传问题诊断工具')
console.log('==================')

async function runDiagnostics() {
  console.log('\n1. 环境变量检查')
  console.log('----------------')
  
  const envVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
  ]
  
  let missingVars = []
  envVars.forEach(varName => {
    const value = process.env[varName]
    const status = value ? '✅ 已设置' : '❌ 未设置'
    console.log(`   ${varName}: ${status}`)
    if (!value) missingVars.push(varName)
  })
  
  if (missingVars.length > 0) {
    console.log('\n❌ 缺少环境变量:', missingVars.join(', '))
    console.log('请运行: node scripts/setup-env.js')
    return
  }

  console.log('\n2. R2连接测试')
  console.log('-------------')
  try {
    const listCommand = new ListObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 5
    })
    
    const result = await r2Client.send(listCommand)
    console.log('✅ R2连接成功')
    console.log(`   存储桶: ${R2_BUCKET_NAME}`)
    console.log(`   现有对象: ${result.Contents?.length || 0}`)
    
    if (result.Contents && result.Contents.length > 0) {
      console.log('   示例对象:')
      result.Contents.slice(0, 3).forEach(obj => {
        console.log(`     - ${obj.Key} (${(obj.Size / 1024).toFixed(2)}KB)`)
      })
    }
  } catch (error) {
    console.error('❌ R2连接失败:', error.message)
    if (error.name === 'NoSuchBucket') {
      console.log('💡 存储桶不存在，请手动创建:')
      console.log(`   名称: ${R2_BUCKET_NAME}`)
      console.log('   位置: Cloudflare Dashboard -> R2 -> Create bucket')
    }
    return
  }

  console.log('\n3. 测试文件上传')
  console.log('---------------')
  try {
    const testContent = Buffer.from('测试文件内容 - ' + new Date().toISOString())
    const testKey = `mynumber/input/test-${Date.now()}.txt`
    
    console.log(`   上传测试文件: ${testKey}`)
    
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    })
    
    await r2Client.send(uploadCommand)
    console.log('✅ 测试文件上传成功')
    console.log(`   URL: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${testKey}`)
    
  } catch (error) {
    console.error('❌ 测试文件上传失败:', error.message)
  }

  console.log('\n4. 权限检查')
  console.log('-----------')
  try {
    // 检查是否可以写入到input目录
    const testKey = `${R2_PATHS.INPUT}permission-test-${Date.now()}.txt`
    const testContent = Buffer.from('权限测试')
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    })
    
    await r2Client.send(command)
    console.log('✅ 有权限写入到input目录')
    
  } catch (error) {
    console.error('❌ 权限检查失败:', error.message)
  }

  console.log('\n5. 建议下一步操作')
  console.log('----------------')
  console.log('1. 访问 http://localhost:3000/test-upload 进行前端测试')
  console.log('2. 打开浏览器开发者工具查看网络请求')
  console.log('3. 检查浏览器控制台是否有错误信息')
  console.log('4. 确保后端服务已启动: npm run dev')
}

const R2_PATHS = {
  INPUT: 'mynumber/input/',
  OUTPUT: 'mynumber/output/',
}

runDiagnostics().catch(console.error)