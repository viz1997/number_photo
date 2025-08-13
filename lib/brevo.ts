interface BrevoContact {
  email: string;
  listIds?: number[];
  attributes?: Record<string, any>;
}

interface BrevoEmailData {
  to: Array<{ email: string; name?: string }>;
  templateId: number;
  params?: Record<string, any>;
}

class BrevoAPI {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY!;
    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is required');
    }
  }

  // 基础请求方法
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid JSON response');
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // 创建或更新联系人
  async createOrUpdateContact(contact: BrevoContact) {
    try {
      const response = await this.request('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          ...contact,
          updateEnabled: true,
        }),
      });

      return {
        success: response.ok,
        data: response.data,
      };
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 发送模板邮件
  async sendTemplateEmail(emailData: BrevoEmailData) {
    try {
      const response = await this.request('/smtp/email', {
        method: 'POST',
        body: JSON.stringify({
          to: emailData.to,
          templateId: emailData.templateId,
          params: emailData.params || {},
        }),
      });

      if (!response.ok) {
        console.error('Failed to send template email:', response.data);
        return { success: false, error: response.data };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending template email:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // 发送支付成功邮件
  async sendPaymentSuccessEmail(email: string, photoRecordId: string, downloadUrl?: string) {
    const templateId = parseInt(process.env.BREVO_PAYMENT_SUCCESS_TEMPLATE_ID || '1');
    if (!templateId) {
      console.error('BREVO_PAYMENT_SUCCESS_TEMPLATE_ID is not configured');
      return { success: false, error: 'Template ID not configured' };
    }
    
    try {
      return await this.sendTemplateEmail({
        to: [{ email }],
        templateId,
        params: {
          PHOTO_RECORD_ID: photoRecordId,
          DOWNLOAD_URL: downloadUrl || '',
          PAYMENT_DATE: new Date().toISOString(),
          APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
      });
    } catch (error) {
      console.error('Error in sendPaymentSuccessEmail:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // 添加用户到Brevo并触发自动化
  async addContactToBrevo(email: string, photoRecordId: string, userId: string) {
    const listId = parseInt(process.env.BREVO_LIST_ID || '5');
    
    return this.createOrUpdateContact({
      email,
      listIds: [listId], // 触发自动化流程
      attributes: {
        PHOTO_RECORD_ID: photoRecordId,
        USER_ID: userId,
        IS_PAID: false,
        PHOTO_PROCESSING_STATUS: 'completed',
        LAST_PROCESSING_DATE: new Date().toISOString(),
        APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        LANGUAGE: 'JP',
      },
    });
  }

  // 更新付费状态
  async updatePaidStatus(email: string, photoRecordId: string, orderId: string, amount: number) {
    try {
      const response = await this.request('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          email,
          updateEnabled: true,
          attributes: {
            IS_PAID: true,
            PAID_DATE: new Date().toISOString(),
            ORDER_ID: orderId,
            PAID_AMOUNT: amount,
            PAYMENT_STATUS: 'completed',
            PHOTO_RECORD_ID: photoRecordId,
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating paid status:', error);
      return false;
    }
  }
}

export const brevoAPI = new BrevoAPI();
