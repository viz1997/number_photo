#!/usr/bin/env node

/**
 * 更新环境变量脚本
 */

const fs = require('fs');
const path = require('path');

const NEW_PRICE_ID = 'price_1RvqjX8UZ184KxWxIy1bUYal';
const NEW_PUBLISHABLE_KEY = 'pk_test_51RrsNs8UZ184KxWx2yPYCvquCF3HSGJRI0PAiFEQc7LzgranWd8P0CWLdVwbCZcbKO8sQtt9EV1w\nYTX2eomtS5Pl00Nk3ha6dN';

function updateEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 文件不存在');
    return;
  }

  let content = fs.readFileSync(envPath, 'utf8');
  
  // 更新价格 ID
  content = content.replace(
    /STRIPE_PRICE_ID=.*/,
    `STRIPE_PRICE_ID=${NEW_PRICE_ID}`
  );
  
  // 添加客户端公钥（如果不存在）
  if (!content.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
    content += `\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEW_PUBLISHABLE_KEY}`;
  }
  
  // 写回文件
  fs.writeFileSync(envPath, content);
  
  console.log('✅ 环境变量文件已更新');
  console.log(`📝 价格 ID: ${NEW_PRICE_ID}`);
  console.log('📝 客户端公钥已添加');
  console.log('\n🔄 请重启开发服务器以应用更改');
}

updateEnvFile();
