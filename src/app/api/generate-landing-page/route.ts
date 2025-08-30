import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const businessInfo = JSON.parse(formData.get('businessInfo') as string)
    const webinarContent = JSON.parse(formData.get('webinarContent') as string)
    const targetAudience = JSON.parse(formData.get('targetAudience') as string)
    const webinarInfo = JSON.parse(formData.get('webinarInfo') as string)
    const instructorCreds = JSON.parse(formData.get('instructorCreds') as string)
    const contactFields = JSON.parse(formData.get('contactFields') as string)
    const visualStyle = formData.get('visualStyle') ? JSON.parse(formData.get('visualStyle') as string) : null
    const brandColors = formData.get('brandColors') ? JSON.parse(formData.get('brandColors') as string) : null
    const uniqueSellingPoints = formData.get('uniqueSellingPoints') ? JSON.parse(formData.get('uniqueSellingPoints') as string) : null
    const upsellProducts = formData.get('upsellProducts') ? JSON.parse(formData.get('upsellProducts') as string) : null
    const specialRequirements = formData.get('specialRequirements') ? JSON.parse(formData.get('specialRequirements') as string) : null
    
    // Handle file uploads
    const photos = formData.getAll('photos') as File[]
    const photoUrls: string[] = []
    
    for (const photo of photos) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${uuidv4()}-${photo.name}`
      const filePath = join(process.cwd(), 'public', 'uploads', fileName)
      await writeFile(filePath, buffer)
      photoUrls.push(`/uploads/${fileName}`)
    }

    // Create AI prompt
    const prompt = `# Webinar Funnel 頁面生成指令
請根據以下客戶信息，創建一個高轉換的 webinar funnel landing page，目的是收集客戶leads：

## 客戶背景信息
- 業務描述: ${businessInfo}
- Webinar內容: ${webinarContent}
- 目標受眾: ${targetAudience}
- Webinar詳情: ${webinarInfo}
- 講師資歷: ${instructorCreds}
- 需要收集的用戶聯絡信息: ${contactFields.join(', ')}
- 視覺偏好: ${visualStyle || '未指定'}
- 獨特賣點: ${uniqueSellingPoints || '未指定'}
- Upsell轉換目標: ${upsellProducts || '未指定'}
- 特殊需求: ${specialRequirements || '無'}
- 相關照片: ${photoUrls.length > 0 ? photoUrls.join(', ') : '無'}

## 頁面要求
請創建一個完整的 webinar funnel 頁面，包含以下元素：
- **響應式設計**: Mobile-first，支援各種設備
- **核心組件**: Hero區、價值主張、講師介紹、社會證明、FAQ、註冊表單
- **轉換心理學**: 稀缺性、緊急感、社會證明、價值對比
- **互動功能**: Modal表單、平滑滾動、手風琴效果
- **追蹤整合**: 準備GA4和Facebook Pixel整合

## 內容要求
- 使用繁體中文
- 符合目標受眾的語調和痛點
- 包含具體的學習成果承諾
- 整合提供的社會證明和成功案例
- 創建吸引人的標題和副標題
- 列出webinar內容及價值

## 技術輸出
請提供：
- 完整的HTML頁面代碼
- CSS樣式文件（包含指定的視覺風格）
- JavaScript互動功能
- 註冊表單（姓名、Email、電話、相關問題）
- 成功頁面設計

請確保頁面具有高轉換率，視覺吸引力強，並完全符合客戶的業務需求。

請以JSON格式返回，包含以下結構：
{
  "html": "完整的HTML代碼",
  "css": "CSS樣式代碼",
  "js": "JavaScript代碼",
  "title": "頁面標題",
  "metaDescription": "頁面描述"
}`

    // Generate landing page with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一個專業的網頁設計師和轉換優化專家，專門創建高轉換率的webinar登陸頁面。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('AI generation failed')
    }

    // Parse AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (error) {
      // If AI didn't return valid JSON, create a basic structure
      parsedResponse = {
        html: aiResponse,
        css: '',
        js: '',
        title: 'Webinar Landing Page',
        metaDescription: 'Generated webinar landing page'
      }
    }

    // Create landing page in database
    const landingPage = await prisma.landingPage.create({
      data: {
        title: parsedResponse.title || 'Webinar Landing Page',
        slug: `webinar-${Date.now()}`,
        content: {
          businessInfo,
          webinarContent,
          targetAudience,
          webinarInfo,
          instructorCreds,
          contactFields,
          visualStyle,
          brandColors,
          uniqueSellingPoints,
          upsellProducts,
          specialRequirements,
          photos: photoUrls,
        },
        htmlContent: parsedResponse.html,
        cssContent: parsedResponse.css,
        jsContent: parsedResponse.js,
        userId: 'temp-user-id', // TODO: Replace with actual user ID from auth
      },
    })

    return NextResponse.json({
      success: true,
      pageId: landingPage.id,
      message: 'Landing page generated successfully'
    })

  } catch (error) {
    console.error('Error generating landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate landing page' },
      { status: 500 }
    )
  }
}
