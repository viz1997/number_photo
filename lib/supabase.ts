import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface PhotoRecord {
  id: string
  user_id: string
  is_paid: boolean
  email: string
  input_image_url: string
  output_image_url: string | null
  created_at: string
  updated_at: string
}

export interface CreatePhotoRecordData {
  user_id: string
  email: string
  input_image_url: string
  is_paid?: boolean
}

export async function getPhotoRecord(photoRecordId: string): Promise<PhotoRecord | null> {
  try {
    console.log('=== getPhotoRecord 开始 ===')
    console.log('查询记录ID:', photoRecordId)
    console.log('Supabase 客户端状态:', {
      url: supabaseUrl ? 'Set' : 'Not set',
      key: supabaseKey ? 'Set' : 'Not set'
    })
    
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoRecordId)
      .single()

    console.log('Supabase 响应:', { data, error })

    if (error) {
      console.error('Error fetching photo record:', error)
      return null
    }

    console.log('成功获取记录:', data)
    return data
  } catch (error) {
    console.error('Exception fetching photo record:', error)
    return null
  } finally {
    console.log('=== getPhotoRecord 结束 ===')
  }
}

export async function updatePhotoRecord(
  photoRecordId: string, 
  updates: Partial<PhotoRecord>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('photos')
      .update(updates)
      .eq('id', photoRecordId)

    if (error) {
      console.error('Error updating photo record:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception updating photo record:', error)
    return false
  }
}

export async function createPhotoRecord(record: CreatePhotoRecordData): Promise<string | null> {
  try {
    console.log('=== createPhotoRecord 开始 ===')
    console.log('输入参数:', record)
    console.log('Supabase 客户端状态:', {
      url: supabaseUrl ? 'Set' : 'Not set',
      key: supabaseKey ? 'Set' : 'Not set'
    })
    
    const { data, error } = await supabase
      .from('photos')
      .insert([record])
      .select('id')
      .single()

    console.log('Supabase 响应:', { data, error })

    if (error) {
      console.error('Error creating photo record:', error)
      return null
    }

    console.log('成功创建记录，ID:', data.id)
    return data.id
  } catch (error) {
    console.error('Exception creating photo record:', error)
    return null
  } finally {
    console.log('=== createPhotoRecord 结束 ===')
  }
}
