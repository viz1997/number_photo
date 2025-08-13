#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking application configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please run: npm run setup-env');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 Environment Variables Status:\n');

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase project URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key (REQUIRED for payment updates)',
  'STRIPE_SECRET_KEY': 'Stripe secret key',
  'STRIPE_PRICE_ID': 'Stripe price ID',
  'R2_ACCOUNT_ID': 'Cloudflare R2 account ID',
  'R2_ACCESS_KEY_ID': 'Cloudflare R2 access key',
  'R2_SECRET_ACCESS_KEY': 'Cloudflare R2 secret key',
  'R2_BUCKET_NAME': 'Cloudflare R2 bucket name',
  'REPLICATE_API_TOKEN': 'Replicate AI API token'
};

let hasIssues = false;

Object.entries(requiredVars).forEach(([key, description]) => {
  const value = envVars[key];
  const status = value ? '✅' : '❌';
  const displayValue = value ? (key.includes('KEY') || key.includes('TOKEN') ? '***SET***' : value) : 'MISSING';
  
  console.log(`${status} ${key}: ${displayValue}`);
  console.log(`   ${description}`);
  
  if (!value) {
    hasIssues = true;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      console.log(`   ⚠️  This is the ROOT CAUSE of your 403 errors!`);
      console.log(`   🔑 Get it from: Supabase Dashboard → Settings → API → service_role key`);
    }
  }
  console.log('');
});

if (hasIssues) {
  console.log('🚨 Configuration issues detected!');
  console.log('\n🔧 To fix the 403 error:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the "service_role" key (NOT the anon key)');
  console.log('4. Add it to your .env.local file as: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('5. Restart your development server');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are configured!');
  console.log('🚀 Your application should work correctly now.');
}