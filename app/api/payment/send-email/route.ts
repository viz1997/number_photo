import { NextRequest, NextResponse } from "next/server";
import { brevoAPI } from "@/lib/brevo";

export async function POST(request: NextRequest) {
  try {
    const { email, photoRecordId, downloadUrl, orderId, amount } = await request.json();
    
    if (!email || !photoRecordId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数：email 和 photoRecordId' 
      }, { status: 400 });
    }

    // 如果没有提供downloadUrl，生成一个7天有效期的下载链接
    let finalDownloadUrl = downloadUrl;
    if (!finalDownloadUrl) {
      try {
        const linkResponse = await fetch(`${request.nextUrl.origin}/api/download/email-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoRecordId })
        });
        
        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
                   if (linkData.success && linkData.downloadUrl) {
           finalDownloadUrl = linkData.downloadUrl;
           console.log('生成了30天有效期的邮件下载链接:', finalDownloadUrl);
         }
        }
             } catch (error) {
         console.warn('生成邮件下载链接失败，使用提供的downloadUrl:', error);
       }
    }



         // 1. 更新付费状态到Brevo
     if (orderId && amount) {
       const updateStatus = await brevoAPI.updatePaidStatus(email, photoRecordId, orderId, amount);
       console.log('更新付费状态结果:', updateStatus);
     }

         // 2. 发送支付成功邮件
     const emailResult = await brevoAPI.sendPaymentSuccessEmail(email, photoRecordId, finalDownloadUrl);
     console.log('发送邮件结果:', emailResult);   

    if (!emailResult.success) {
      console.error('发送邮件失败:', emailResult.error);
      return NextResponse.json({ 
        success: false, 
        error: emailResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '邮件发送成功',
      emailResult 
    });

  } catch (error) {
    console.error('发送邮件API错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
