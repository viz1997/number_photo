# 实现总结：安全的双存储桶架构

## 🎯 实现目标

按照你的建议，我们成功实现了正确的存储策略：

> ✅ **正确做法总结（一句话）**：
> 只在前端展示带水印的预览图（公开可读），支付后再通过后端签发一次性无水印原图的下载链接。

## 🏗️ 架构实现

### 1. 双存储桶配置

- **私有桶** (`number-card-photos-private`): 存储原始无水印照片
- **公开桶** (`number-card-photos-public`): 存储带水印预览图

### 2. 存储策略实现

| 阶段 | 操作 | 存储桶策略 | 是否暴露原图 |
|------|------|------------|--------------|
| 上传 & AI 处理 | 上传无水印原图到 private-bucket | 私有 | ❌ 不暴露 |
| 预览阶段 | 生成带水印缩略图上传到 preview-bucket | 公开可读 | ✅ 安全展示 |
| 支付完成 | 后端生成一次性预签名 URL 指向 private-bucket 的原图 | 私有 | ✅ 仅限已支付用户 |

## 🔧 技术实现

### 核心文件修改

1. **`lib/r2-client.ts`**
   - 添加预签名URL生成功能
   - 支持双存储桶配置
   - 新增 `generatePresignedUrl()` 函数

2. **`lib/r2-utils.ts`**
   - 支持指定存储桶上传
   - 新增 `uploadToPublicR2()` 函数
   - 新增 `generateWatermarkedPreview()` 函数

3. **`app/api/process/route.ts`**
   - 原图存储到私有桶
   - 生成带水印预览图存储到公开桶
   - 返回预览图URL用于前端展示

4. **`app/api/download/[token]/route.ts`**
   - 使用预签名URL访问私有桶原图
   - 验证支付状态
   - 24小时有效期

5. **`app/api/download/create-token/route.ts`**
   - 简化API，只需photoRecordId
   - 验证支付状态
   - 生成安全下载token

### 数据库更新

- 添加 `preview_image_url` 字段到 `photos` 表
- 存储预览图URL用于前端展示

### 前端更新

- 更新下载逻辑，使用新的API结构
- 移除对fileKey的依赖
- 使用photoRecordId进行下载验证

## 🔒 安全优势

### 1. 原图保护
- 无水印原图始终存储在私有桶中
- 无法通过直接URL访问
- 仅通过预签名URL临时访问

### 2. 预览安全
- 带水印预览图可安全展示
- 公开可读，无需认证
- 水印防止未授权使用

### 3. 访问控制
- 通过支付状态控制下载权限
- 预签名URL 24小时自动过期
- 一次性访问，无法重复使用

### 4. 数据隔离
- 私有数据与公开数据完全分离
- 不同存储桶，不同权限策略
- 降低数据泄露风险

## 🚀 部署步骤

### 1. 创建存储桶
```bash
# 私有桶
R2_BUCKET_NAME=number-card-photos-private

# 公开桶  
R2_PUBLIC_BUCKET_NAME=number-card-photos-public
```

### 2. 配置环境变量
```bash
# 添加到 .env.local
R2_BUCKET_NAME=number-card-photos-private
R2_PUBLIC_BUCKET_NAME=number-card-photos-public
NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN=https://your-public-bucket.your-domain.com
```

### 3. 数据库迁移
```sql
-- 运行迁移脚本
ALTER TABLE photos ADD COLUMN IF NOT EXISTS preview_image_url TEXT;
```

### 4. 测试配置
```bash
npm run test-storage
```

## 📊 性能优化

### 1. 存储优化
- 私有桶：高安全性，适合存储敏感数据
- 公开桶：快速访问，适合频繁读取的预览图

### 2. 网络优化
- 预览图：CDN加速，全球快速访问
- 原图：按需生成预签名URL，减少带宽消耗

### 3. 成本优化
- 预览图：公开访问，减少API调用
- 原图：私有存储，按需访问

## 🧪 测试验证

### 自动化测试
```bash
npm run test-storage
```

### 手动测试流程
1. 上传图片 → 验证存储到私有桶
2. AI处理 → 验证生成预览图到公开桶
3. 前端展示 → 验证预览图正常显示
4. 支付完成 → 验证预签名URL生成
5. 下载原图 → 验证无水印原图下载

## 📈 监控建议

### 1. 存储监控
- 监控两个存储桶的使用量
- 跟踪预签名URL的生成次数
- 监控下载成功率

### 2. 安全监控
- 监控未授权访问尝试
- 跟踪支付状态变化
- 监控异常下载模式

### 3. 性能监控
- 监控预览图加载时间
- 跟踪预签名URL生成延迟
- 监控存储桶响应时间

## 🎉 总结

我们成功实现了你建议的安全存储架构：

1. **✅ 原图安全**: 无水印原图存储在私有桶，无法直接访问
2. **✅ 预览安全**: 带水印预览图存储在公开桶，安全展示
3. **✅ 访问控制**: 通过支付状态和预签名URL控制下载权限
4. **✅ 时效性**: 下载链接24小时自动过期
5. **✅ 一次性**: 预签名URL确保临时访问

这个架构完美平衡了安全性、性能和用户体验，符合现代Web应用的最佳实践。
