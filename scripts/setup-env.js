#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 Cloudflare R2 配置设置工具')
console.log('================================')

const questions = [
  {
    key: 'R2_ACCOUNT_ID',
    question: '请输入您的 Cloudflare Account ID: ',
    description: '在Cloudflare Dashboard右侧可以找到'
  },
  {
    key: 'R2_ACCESS_KEY_ID',
    question: '请输入您的 R2 Access Key ID: ',
    description: '在R2 API令牌页面创建时生成'
  },
  {
    key: 'R2_SECRET_ACCESS_KEY',
    question: '请输入您的 R2 Secret Access Key: ',
    description: '在R2 API令牌页面创建时生成'
  },
  {
    key: 'REPLICATE_API_TOKEN',
    question: '请输入您的 Replicate API Token (可选): ',
    description: '从replicate.com获取'
  },
  {
    key: 'POLAR_ACCESS_TOKEN',
    question: '请输入您的 Polar Access Token (可选): ',
    description: '从polar.sh获取'
  }
]

const answers = {}

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile()
    return
  }

  const q = questions[index]
  console.log(`\n${q.description}`)
  rl.question(q.question, (answer) => {
    answers[q.key] = answer.trim() || ''
    askQuestion(index + 1)
  })
}

function createEnvFile() {
  const envContent = `# 环境变量配置
# 生成时间: ${new Date().toISOString()}

# Cloudflare R2 配置
R2_ACCOUNT_ID=${answers.R2_ACCOUNT_ID}
R2_ACCESS_KEY_ID=${answers.R2_ACCESS_KEY_ID}
R2_SECRET_ACCESS_KEY=${answers.R2_SECRET_ACCESS_KEY}
R2_BUCKET_NAME=number-card-photos

# AI服务配置
REPLICATE_API_TOKEN=${answers.REPLICATE_API_TOKEN}

# 支付服务配置
POLAR_ACCESS_TOKEN=${answers.POLAR_ACCESS_TOKEN}

# 数据库配置 (如需使用)
DATABASE_URL=your_database_url_here
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ 环境变量配置完成！')
    console.log(`📁 文件已保存: ${envPath}`)
    console.log('\n下一步:')
    console.log('1. npm run dev (启动开发服务器)')
    console.log('2. 访问 http://localhost:3000 测试上传功能')
  } catch (error) {
    console.error('❌ 保存文件失败:', error.message)
  }
  
  rl.close()
}

console.log('开始配置环境变量...')
askQuestion(0)