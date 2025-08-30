import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface BlockRefinementRequest {
  blockType: string
  currentContent: string
  userInstructions: string
  pageContext: {
    businessInfo: string
    targetAudience: string
    webinarContent: string
  }
}

export async function refineBlock(request: BlockRefinementRequest) {
  try {
    const prompt = `You are a professional web developer and conversion optimization expert. 
    
    I need you to refine a specific block of a webinar landing page based on user instructions.
    
    **Block Type**: ${request.blockType}
    **Current Content**: ${request.currentContent}
    **User Instructions**: ${request.userInstructions}
    
    **Page Context**:
    - Business: ${request.pageContext.businessInfo}
    - Target Audience: ${request.pageContext.targetAudience}
    - Webinar Content: ${request.pageContext.webinarContent}
    
    Please provide an improved version of this block that:
    1. Follows the user's specific instructions
    2. Maintains consistency with the overall page context
    3. Uses persuasive copywriting techniques
    4. Is optimized for conversions
    5. Uses traditional Chinese (繁體中文)
    
    Return only the refined HTML content for this specific block.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional web developer specializing in high-converting landing pages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error refining block:', error)
    throw new Error('Failed to refine block')
  }
}

export async function generateCompletePage(formData: any) {
  try {
    const prompt = `# Webinar Funnel 頁面生成指令
請根據以下客戶信息，創建一個高轉換的 webinar funnel landing page，目的是收集客戶leads：

## 客戶背景信息
- 業務描述: ${formData.businessInfo}
- Webinar內容: ${formData.webinarContent}
- 目標受眾: ${formData.targetAudience}
- Webinar詳情: ${formData.webinarInfo}
- 講師資歷: ${formData.instructorCreds}
- 需要收集的用戶聯絡信息: ${formData.contactFields.join(', ')}
- 視覺偏好: ${formData.visualStyle || '未指定'}
- 獨特賣點: ${formData.uniqueSellingPoints || '未指定'}
- Upsell轉換目標: ${formData.upsellProducts || '未指定'}
- 特殊需求: ${formData.specialRequirements || '無'}
- 相關照片: ${formData.photos?.length > 0 ? formData.photos.join(', ') : '無'}

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

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('AI generation failed')
    }

    try {
      return JSON.parse(response)
    } catch (error) {
      // If AI didn't return valid JSON, create a basic structure
      return {
        html: response,
        css: '',
        js: '',
        title: 'Webinar Landing Page',
        metaDescription: 'Generated webinar landing page'
      }
    }
  } catch (error) {
    console.error('Error generating complete page:', error)
    throw new Error('Failed to generate page')
  }
}
