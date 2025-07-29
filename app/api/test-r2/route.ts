import { NextResponse } from "next/server"
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2-client"
import { ListObjectsV2Command } from "@aws-sdk/client-s3"

export async function GET() {
  try {
    console.log('Testing R2 connection...')
    console.log('Environment variables:', {
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? 'Set' : 'Not set',
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Not set',
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
      R2_BUCKET_NAME: R2_BUCKET_NAME
    })

    // 测试列出存储桶中的对象
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 10
    })

    const result = await r2Client.send(command)
    
    return NextResponse.json({
      success: true,
      message: "R2 connection successful",
      bucket: R2_BUCKET_NAME,
      objects: result.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified
      })) || [],
      totalObjects: result.KeyCount
    })
  } catch (error) {
    console.error('R2 test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? 'Set' : 'Not set',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Not set',
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
        R2_BUCKET_NAME: R2_BUCKET_NAME
      }
    }, { status: 500 })
  }
} 