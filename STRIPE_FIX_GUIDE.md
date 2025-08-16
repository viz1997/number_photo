# Stripe 支付问题修复指南

## 当前问题

1. **Stripe 价格 ID 错误**: `No such price: 'prod_SprMgWsS92ZFHT'`
2. **缺少客户端环境变量**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 未设置
3. **CORS 错误**: 图片无法从 `mynumberphoto.com` 加载

## 修复步骤

### 1. 修复环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# 添加客户端可访问的 Stripe 公钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RrsNs8UZ184KxWx2yPYCvquCF3HSGJRI0PAiFEQc7LzgranWd8P0CWLdVwbCZcbKO8sQtt9EV1w
YTX2eomtS5Pl00Nk3ha6dN

# 修复价格 ID（需要运行脚本获取正确的价格 ID）
# STRIPE_PRICE_ID=price_1RrsNs8UZ184KxWx2yPYCvquCF3HSGJRI0PAiFEQc7LzgranWd8P0CWLdVwbCZcbKO8sQtt9EV1w
# YTX2eomtS5Pl00Nk3ha6dN
```

### 2. 设置正确的 Stripe 价格

运行以下命令来设置正确的价格：

```bash
# 安装依赖（如果还没有安装）
npm install stripe

# 运行价格设置脚本
node scripts/setup-stripe-price.js
```

脚本会：
- 检查现有的 Stripe 价格
- 如果没有 500 日元的价格，会自动创建一个
- 输出正确的价格 ID 供你配置

### 3. 更新环境变量

根据脚本输出的价格 ID，更新 `.env.local` 文件中的 `STRIPE_PRICE_ID`。

### 4. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

## 已修复的代码

### 1. 改进了 Stripe 错误处理

`app/api/payment/create-checkout-session/route.ts` 现在包含：
- 价格 ID 格式验证
- 价格存在性检查
- 更详细的错误信息

### 2. 添加了 CORS 配置

`next.config.mjs` 现在包含：
- 图片域名配置
- API 路由的 CORS 头

### 3. 创建了价格设置脚本

`scripts/setup-stripe-price.js` 可以：
- 自动创建正确的 Stripe 价格
- 验证现有配置
- 提供详细的设置指导

## 验证修复

1. 重启开发服务器
2. 上传图片并处理
3. 尝试进入支付流程
4. 检查控制台是否还有错误

## 常见问题

### Q: 为什么会出现 "No such price" 错误？
A: 因为当前配置使用的是产品 ID (`prod_`) 而不是价格 ID (`price_`)。Stripe 需要价格 ID 来创建结账会话。

### Q: 如何获取正确的价格 ID？
A: 运行 `node scripts/setup-stripe-price.js` 脚本，它会自动创建或找到正确的价格 ID。

### Q: 为什么图片无法加载？
A: 这是 CORS 问题，已通过 `next.config.mjs` 中的配置修复。

### Q: 客户端 Stripe 集成失败？
A: 需要设置 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` 环境变量，客户端才能访问 Stripe。

## 下一步

修复完成后，你的应用应该能够：
1. 正常处理图片上传
2. 显示处理结果
3. 成功创建 Stripe 结账会话
4. 完成支付流程
