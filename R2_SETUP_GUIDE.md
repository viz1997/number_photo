# Cloudflare R2 存储配置指南

## 双存储桶架构

本系统使用两个R2存储桶来确保安全性：

1. **私有桶** (`number-card-photos-private`): 存储原始无水印照片
2. **公开桶** (`number-card-photos-public`): 存储带水印预览图

## 获取R2凭据的步骤

### 1. 获取 Cloudflare Account ID
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在右侧边栏找到 **Account ID** (格式: 32位字符串)

### 2. 创建私有存储桶
1. 在Cloudflare Dashboard中选择 **R2**
2. 点击 **Create bucket**
3. 输入存储桶名称: `number-card-photos-private`
4. 选择地区 (建议选择离你最近的地区)
5. 点击 **Create bucket**
6. **重要**: 保持默认的私有设置，不要设置为公开

### 3. 创建公开存储桶
1. 再次点击 **Create bucket**
2. 输入存储桶名称: `number-card-photos-public`
3. 选择相同地区
4. 点击 **Create bucket**
5. 在存储桶设置中，启用 **Public bucket** 选项

### 4. 配置公开桶域名 (可选但推荐)
1. 在公开桶设置中，找到 **Custom Domains**
2. 点击 **Add Custom Domain**
3. 输入你的域名，例如: `photos.yourdomain.com`
4. 按照提示配置DNS记录

### 5. 创建API令牌
1. 在R2页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 输入令牌名称: `number-card-upload`
4. 权限设置:
   - **Object Read & Write**: 选择两个存储桶
   - **Account**: Read (可选)
5. 点击 **Create API Token**
6. 保存生成的 **Access Key ID** 和 **Secret Access Key**

### 6. 更新环境变量
将以下信息填入 `.env.local` 文件:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=你的实际账户ID
R2_ACCESS_KEY_ID=你的实际访问密钥ID
R2_SECRET_ACCESS_KEY=你的实际密钥
R2_BUCKET_NAME=number-card-photos-private
R2_PUBLIC_BUCKET_NAME=number-card-photos-public
NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN=https://photos.yourdomain.com
```

## 验证配置

运行以下命令测试R2连接:
```bash
npm run dev
# 然后访问 http://localhost:3000 测试上传功能
```

## 存储桶权限配置

### 私有桶 (`number-card-photos-private`)
- **访问控制**: 私有
- **用途**: 存储原始无水印照片
- **访问方式**: 仅通过预签名URL

### 公开桶 (`number-card-photos-public`)
- **访问控制**: 公开可读
- **用途**: 存储带水印预览图
- **访问方式**: 直接URL访问

## CORS配置

为两个存储桶配置CORS策略:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": []
  }
]
```

## 常见问题

### 权限错误
如果遇到403错误，请检查:
- API令牌是否有正确的存储桶权限
- 密钥是否正确复制
- 存储桶名称是否匹配

### 跨域问题
确保R2存储桶的CORS配置允许你的域名

### 公开桶访问问题
- 确保公开桶已启用Public bucket选项
- 检查自定义域名配置
- 验证DNS记录是否正确

### 预签名URL问题
- 检查私有桶权限设置
- 验证API密钥权限
- 确认存储桶名称配置正确

## 安全最佳实践

1. **定期轮换API密钥**
2. **使用最小权限原则**
3. **监控存储桶访问日志**
4. **定期审查权限设置**
5. **启用存储桶版本控制** (可选)