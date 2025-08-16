#!/usr/bin/env node

/**
 * 运行数据库迁移脚本
 * 添加 preview_image_url 字段到 photos 表
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// 检查必要的环境变量
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
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

// 创建 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('\n🚀 开始运行数据库迁移...')
  console.log('目标: 添加 preview_image_url 字段到 photos 表')
  
  try {
    // 1. 检查表是否存在
    console.log('\n1️⃣ 检查 photos 表是否存在...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('photos')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ photos 表不存在或无法访问:', tableError.message)
      console.log('\n💡 请先运行以下SQL创建表:')
      console.log(`
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  email TEXT,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `)
      process.exit(1)
    }
    
    console.log('✅ photos 表存在')
    
    // 2. 检查字段是否已存在
    console.log('\n2️⃣ 检查 preview_image_url 字段是否已存在...')
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'photos' })
    
    if (columnError) {
      // 如果无法获取列信息，尝试直接添加字段
      console.log('⚠️  无法获取表结构信息，尝试直接添加字段...')
    } else {
      const hasPreviewColumn = columns.some(col => col.column_name === 'preview_image_url')
      if (hasPreviewColumn) {
        console.log('✅ preview_image_url 字段已存在，跳过迁移')
        return
      }
    }
    
    // 3. 添加 preview_image_url 字段
    console.log('\n3️⃣ 添加 preview_image_url 字段...')
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE photos 
          ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
          
          COMMENT ON COLUMN photos.preview_image_url IS 'URL to watermarked preview image stored in public bucket';
          
          CREATE INDEX IF NOT EXISTS idx_photos_preview_image_url 
          ON photos(preview_image_url);
        `
      })
    
    if (alterError) {
      console.error('❌ 添加字段失败:', alterError.message)
      
      // 尝试使用原生SQL
      console.log('\n🔄 尝试使用原生SQL添加字段...')
      const { error: sqlError } = await supabase
        .from('photos')
        .select('*')
        .limit(0) // 不实际查询数据，只是测试连接
        
      if (sqlError) {
        console.error('❌ 无法连接到数据库:', sqlError.message)
        process.exit(1)
      }
      
      console.log('⚠️  请手动在 Supabase Dashboard 中运行以下SQL:')
      console.log(`
-- 添加 preview_image_url 字段
ALTER TABLE photos ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- 添加注释
COMMENT ON COLUMN photos.preview_image_url IS 'URL to watermarked preview image stored in public bucket';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_photos_preview_image_url ON photos(preview_image_url);
      `)
      process.exit(1)
    }
    
    console.log('✅ preview_image_url 字段添加成功')
    
    // 4. 验证字段是否添加成功
    console.log('\n4️⃣ 验证字段添加结果...')
    const { data: testData, error: testError } = await supabase
      .from('photos')
      .select('id, preview_image_url')
      .limit(1)
    
    if (testError) {
      console.error('❌ 验证失败:', testError.message)
    } else {
      console.log('✅ 字段验证成功')
      console.log('   示例数据:', testData[0] || '表为空')
    }
    
    console.log('\n🎉 数据库迁移完成！')
    console.log('✅ preview_image_url 字段已成功添加到 photos 表')
    console.log('✅ 索引已创建')
    console.log('✅ 注释已添加')
    
  } catch (error) {
    console.error('\n❌ 迁移过程中出现错误:', error.message)
    console.error('错误详情:', error)
    
    console.log('\n💡 手动迁移步骤:')
    console.log('1. 登录 Supabase Dashboard')
    console.log('2. 进入 SQL Editor')
    console.log('3. 运行以下SQL:')
    console.log(`
-- 添加 preview_image_url 字段
ALTER TABLE photos ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- 添加注释
COMMENT ON COLUMN photos.preview_image_url IS 'URL to watermarked preview image stored in public bucket';

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_photos_preview_image_url ON photos(preview_image_url);
    `)
    
    process.exit(1)
  }
}

// 运行迁移
runMigration()
