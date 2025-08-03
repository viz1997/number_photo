# 数字证件照处理核心功能

## 功能概述

这个功能实现了完整的数字证件照处理流程：

1. **用户上传照片** → 存储在R2中
2. **调用Replicate API** → 使用预设prompt处理照片
3. **生成带水印预览** → 前端Canvas处理
4. **用户下载无水印版本** → 跳过支付验证

## 技术实现

### 后端API

#### `/api/process` - 图片处理API
- 接收用户上传的图片URL
- 调用Replicate API进行图片处理
- 使用预设的prompt将照片转换为日本证件照格式
- 返回处理后的图片URL

**预设Prompt:**
```
Transform this photo into official Japanese ID card format: clean solid white background, crop and reframe to show head and upper shoulders only, center the face vertically in frame with head taking up 70-75% of total height, ensure 4±2mm margin from top of head to frame edge, position face exactly in horizontal center, maintain 34±2mm from chin to top of head measurement, professional passport-style lighting with no shadows on face or background, front-facing pose, gentle subtle smile with slight upward curve of lips - natural and pleasant expression, eyes looking directly at camera with warm friendly gaze, hair should not cover face or ears, remove any accessories like hats or sunglasses, sharp focus on facial features, government ID photo standards compliance, official document quality, maintain the original warm and kind facial expression, output image must be exactly 4.5cm × 3.5cm (45mm × 35mm) passport photo size
```

**输出格式设置:**
- `aspect_ratio: '35:45'` - 固定证件照比例 (3.5:4.5)
- `output_format: 'jpg'` - JPEG格式
- 符合官方要求：4.5cm × 3.5cm 尺寸

#### `/api/upload` - 文件上传API
- 接收用户上传的文件
- 验证文件格式、大小、尺寸
- 返回图片URL（目前使用占位符）

### 前端功能

#### 处理页面 (`/process`)
- 调用处理API
- 显示处理进度
- 使用前端Canvas API添加"Preview"水印
- 展示带水印预览
- 提供下载无水印版本的功能

#### 水印实现
- 使用原生Canvas API
- 在图片上叠加"Preview"文字水印
- 半透明遮罩效果
- 旋转文字增加水印效果

## 环境配置

### 必需的环境变量
```bash
# .env.local
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

### 依赖包
```bash
pnpm add replicate uuid @types/uuid
```

## 使用流程

1. **访问首页** (`/`) - 上传照片
2. **自动跳转到处理页面** (`/process`) - 处理照片
3. **查看带水印预览** - 确认效果
4. **点击下载按钮** - 获取无水印版本

## 测试

访问 `/test` 页面可以测试API功能，使用预设的测试图片。

## 待完善功能

1. **R2存储集成** - 目前使用占位符URL
2. **数据库集成** - 存储处理记录
3. **支付验证** - 验证用户权限
4. **图片验证集成** - 使用 `lib/image-validation.ts` 验证输出格式
5. **错误处理优化** - 更详细的错误信息

## 文件结构

```
app/
├── api/
│   ├── process/route.ts     # 图片处理API
│   └── upload/route.ts      # 文件上传API
├── process/page.tsx         # 处理页面
├── upload/page.tsx          # 上传页面
└── test/page.tsx           # 测试页面
```

## 注意事项

- 确保设置了正确的 `REPLICATE_API_TOKEN`
- 水印功能使用前端Canvas，零服务器成本
- 目前跳过支付验证，直接允许下载
- 错误处理包含重试机制（最多3次） 