# 存储架构与安全策略

## 概述

本系统采用双存储桶架构，确保用户照片的安全性和访问控制：

- **私有桶** (`number-card-photos-private`): 存储原始处理后的无水印照片
- **公开桶** (`number-card-photos-public`): 存储带水印的预览图

## 存储策略

### 阶段1: 上传 & AI处理
- **操作**: 用户上传原图 → AI处理 → 存储无水印原图到私有桶
- **存储位置**: `R2_BUCKET_NAME` (私有桶)
- **访问控制**: 私有，仅通过预签名URL访问
- **安全级别**: 🔒 最高安全

### 阶段2: 预览阶段
- **操作**: 生成带水印预览图 → 存储到公开桶
- **存储位置**: `R2_PUBLIC_BUCKET_NAME` (公开桶)
- **访问控制**: 公开可读，用于前端展示
- **安全级别**: ✅ 安全展示

### 阶段3: 支付完成
- **操作**: 后端生成一次性预签名URL → 指向私有桶的原图
- **存储位置**: 私有桶 (通过预签名URL访问)
- **访问控制**: 仅限已支付用户，24小时有效期
- **安全级别**: 🔐 受控访问

## 环境变量配置

```bash
# 私有桶配置
R2_BUCKET_NAME=number-card-photos-private

# 公开桶配置
R2_PUBLIC_BUCKET_NAME=number-card-photos-public

# 公开桶域名 (用于预览图)
NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN=https://your-public-bucket.your-domain.com
```

## 文件路径结构

```
私有桶 (number-card-photos-private):
├── mynumber/input/     # 用户上传的原图
└── mynumber/output/    # AI处理后的无水印照片

公开桶 (number-card-photos-public):
└── mynumber/preview/   # 带水印的预览图
```

## API端点

### 处理API (`/api/process`)
- 接收AI处理结果
- 存储无水印原图到私有桶
- 生成带水印预览图存储到公开桶
- 返回预览图URL用于前端展示

### 下载API (`/api/download/[token]`)
- 验证支付状态
- 生成预签名URL访问私有桶原图
- 24小时有效期
- 一次性访问

### 创建下载Token (`/api/download/create-token`)
- 验证用户支付状态
- 生成安全下载token
- 仅限已支付用户

## 安全优势

1. **原图保护**: 无水印原图始终存储在私有桶中
2. **预览安全**: 带水印预览图可安全展示
3. **访问控制**: 通过支付状态控制下载权限
4. **时效性**: 下载链接24小时自动过期
5. **一次性**: 预签名URL确保临时访问

## 部署步骤

1. 创建两个R2存储桶：
   - `number-card-photos-private` (私有)
   - `number-card-photos-public` (公开)

2. 配置公开桶的公共域名

3. 运行数据库迁移：
   ```sql
   -- 添加preview_image_url字段
   ALTER TABLE photos ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
   ```

4. 更新环境变量

5. 测试完整流程

## 故障排除

### 常见问题

1. **预览图无法显示**
   - 检查公开桶域名配置
   - 验证CORS设置

2. **下载失败**
   - 检查支付状态
   - 验证预签名URL生成

3. **存储桶权限错误**
   - 检查R2 API密钥权限
   - 验证存储桶名称配置
