# Cloudflare R2 存储配置指南

## 获取R2凭据的步骤

### 1. 获取 Cloudflare Account ID
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 在右侧边栏找到 **Account ID** (格式: 32位字符串)

### 2. 创建R2存储桶
1. 在Cloudflare Dashboard中选择 **R2**
2. 点击 **Create bucket**
3. 输入存储桶名称: `number-card-photos`
4. 选择地区 (建议选择离你最近的地区)
5. 点击 **Create bucket**

### 3. 创建API令牌
1. 在R2页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 输入令牌名称: `number-card-upload`
4. 权限设置:
   - **Object Read & Write**: 选择你的存储桶
   - **Account**: Read (可选)
5. 点击 **Create API Token**
6. 保存生成的 **Access Key ID** 和 **Secret Access Key**

### 4. 更新环境变量
将以下信息填入 `.env.local` 文件:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=你的实际账户ID
R2_ACCESS_KEY_ID=你的实际访问密钥ID
R2_SECRET_ACCESS_KEY=你的实际密钥
R2_BUCKET_NAME=number-card-photos
```

## 验证配置

运行以下命令测试R2连接:
```bash
npm run dev
# 然后访问 http://localhost:3000 测试上传功能
```

## 常见问题

### 权限错误
如果遇到403错误，请检查:
- API令牌是否有正确的存储桶权限
- 密钥是否正确复制
- 存储桶名称是否匹配

### 跨域问题
确保R2存储桶的CORS配置允许你的域名:
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