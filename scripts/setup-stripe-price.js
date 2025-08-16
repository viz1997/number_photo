#!/usr/bin/env node

/**
 * Stripe 价格设置脚本
 * 这个脚本帮助你在 Stripe 中创建正确的价格
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// 读取 .env.local 文件
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 文件不存在');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function setupStripePrice() {
  const env = loadEnvFile();
  const secretKey = env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY 环境变量未设置');
    console.log('请在 .env.local 文件中设置 STRIPE_SECRET_KEY');
    return;
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-07-30.basil' });

  try {
    console.log('🔍 检查现有价格...');
    
    // 列出所有价格
    const prices = await stripe.prices.list({
      limit: 10,
      active: true
    });

    console.log('\n📋 现有价格列表:');
    prices.data.forEach(price => {
      console.log(`- ID: ${price.id}`);
      console.log(`  金额: ${price.unit_amount} ${price.currency.toUpperCase()}`);
      console.log(`  描述: ${price.nickname || '无描述'}`);
      console.log(`  状态: ${price.active ? '活跃' : '非活跃'}`);
      console.log('');
    });

    // 检查是否有 500 日元的价格
    const jpyPrice = prices.data.find(price => 
      price.currency === 'jpy' && price.unit_amount === 500
    );

    if (jpyPrice) {
      console.log('✅ 找到 500 日元价格:', jpyPrice.id);
      console.log('请在 .env.local 文件中设置:');
      console.log(`STRIPE_PRICE_ID=${jpyPrice.id}`);
    } else {
      console.log('❌ 未找到 500 日元价格');
      console.log('\n🔧 创建新价格...');
      
      // 创建新产品
      const product = await stripe.products.create({
        name: 'マイナンバーカード用写真処理',
        description: '高画質JPEG形式の写真処理サービス',
        metadata: {
          service: 'my_number_card_photo'
        }
      });

      console.log('✅ 创建产品:', product.id);

      // 创建价格
      const price = await stripe.prices.create({
        unit_amount: 500,
        currency: 'jpy',
        product: product.id,
        nickname: 'マイナンバーカード用写真処理 (500円)',
        metadata: {
          service: 'my_number_card_photo'
        }
      });

      console.log('✅ 创建价格:', price.id);
      console.log('\n📝 请在 .env.local 文件中设置:');
      console.log(`STRIPE_PRICE_ID=${price.id}`);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.log('请检查 STRIPE_SECRET_KEY 是否正确');
    }
  }
}

// 运行脚本
setupStripePrice().catch(console.error);
