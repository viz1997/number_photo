# Brevo Email Service Setup

## 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# Brevo Email Service Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_LIST_ID=5
BREVO_PAYMENT_SUCCESS_TEMPLATE_ID=16
BREVO_CONTACTS_API_URL=https://api.brevo.com/v3/contacts
BREVO_SMTP_API_URL=https://api.brevo.com/v3/smtp/email

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 配置说明

### BREVO_API_KEY
- 从 Brevo 控制台获取的 API 密钥
- 用于认证 API 请求

### BREVO_LIST_ID
- Brevo 联系人列表 ID
- 用于将用户添加到特定列表并触发自动化流程

### BREVO_PAYMENT_SUCCESS_TEMPLATE_ID
- 支付成功邮件的模板 ID
- 在 Brevo 中创建的邮件模板

### 邮件模板变量

支付成功邮件模板支持以下变量：

- `PHOTO_RECORD_ID`: 照片记录ID
- `DOWNLOAD_URL`: 下载链接
- `PAYMENT_DATE`: 支付日期
- `APP_URL`: 应用URL

## 功能说明

### 1. 支付成功邮件推送
- 用户支付成功后自动发送邮件
- 包含下载链接和支付信息

### 2. 联系人管理
- 自动创建或更新 Brevo 联系人
- 记录用户状态和支付信息

### 3. 自动化流程
- 通过列表ID触发 Brevo 自动化流程
- 支持后续的营销邮件推送

## API 端点

### POST /api/payment/send-email
发送支付成功邮件

请求参数：
```json
{
  "email": "user@example.com",
  "photoRecordId": "record-id",
  "downloadUrl": "https://example.com/download",
  "orderId": "order-id",
  "amount": 1000
}
```

响应：
```json
{
  "success": true,
  "message": "邮件发送成功",
  "emailResult": {}
}
```
