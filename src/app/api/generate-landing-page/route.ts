import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1",
})

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Generate landing page API is accessible - Updated',
    timestamp: new Date().toISOString()
  })
}

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
    
    if (photos.length > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        await writeFile(join(uploadsDir, '.gitkeep'), '')
        
        for (const photo of photos) {
          const bytes = await photo.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const fileName = `${uuidv4()}-${photo.name}`
          const filePath = join(uploadsDir, fileName)
          await writeFile(filePath, buffer)
          photoUrls.push(`/uploads/${fileName}`)
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        // Continue without file uploads
        photoUrls.push('placeholder-image.jpg')
      }
    }

    // Filter out empty fields and create a clean data object
    const cleanData = {
      businessInfo: businessInfo?.trim() || '',
      webinarContent: webinarContent?.trim() || '',
      targetAudience: targetAudience?.trim() || '',
      webinarInfo: webinarInfo?.trim() || '',
      instructorCreds: instructorCreds?.trim() || '',
      contactFields: contactFields || [],
      visualStyle: visualStyle?.trim() || '現代簡約',
      brandColors: brandColors?.trim() || '',
      uniqueSellingPoints: uniqueSellingPoints?.trim() || '',
      upsellProducts: upsellProducts?.trim() || '',
      specialRequirements: specialRequirements?.trim() || '',
      photos: photoUrls
    }

    // Create AI prompt with only filled fields
    const filledFields = Object.entries(cleanData)
      .filter(([key, value]) => {
        if (key === 'contactFields') return Array.isArray(value) && value.length > 0
        if (key === 'photos') return Array.isArray(value) && value.length > 0
        return value && value.toString().trim() !== ''
      })
      .map(([key, value]) => {
        const fieldNames: { [key: string]: string } = {
          businessInfo: '業務描述',
          webinarContent: 'Webinar內容',
          targetAudience: '目標受眾',
          webinarInfo: 'Webinar詳情',
          instructorCreds: '講師資歷',
          contactFields: '需要收集的用戶聯絡信息',
          visualStyle: '視覺偏好',
          brandColors: '品牌色彩',
          uniqueSellingPoints: '獨特賣點',
          upsellProducts: 'Upsell轉換目標',
          specialRequirements: '特殊需求',
          photos: '相關照片'
        }
        return `**${fieldNames[key]}**: ${Array.isArray(value) ? value.join(', ') : value}`
      })
      .join('\n')

    const prompt = `為webinar landing page生成高轉換率的文案內容（僅文字，不包含HTML）：

參考高轉換頁面結構：
- Hero區使用緊急感標題和社會證明 (如：限時免費、僅剩名額)
- 問題區突出痛點，解決方案區展示具體價值和成果
- 講師介紹包含具體成就、數字和社會證明
- 使用倒計時和限時優惠增加緊急感
- CTA按鈕使用行動導向文字 (如：立即搶先報名、免費獲得)
- 階梯式價值展示：問題 → 解決方案 → 講師 → 社會證明 → CTA
- 信任元素：具體數字、學員見證、專業資歷

客戶信息：
${filledFields}

請生成以下文案內容，返回JSON格式：
{
  "pageTitle": "頁面標題",
  "brandName": "品牌名稱",
  "heroTitle": "主要標題 - 吸引目標受眾的問題或承諾",
  "heroSubtitle": "副標題 - 詳細說明價值主張",
  "ctaButton": "CTA按鈕文字",
  "valuePropositionTitle": "價值主張標題",
  "valuePoints": [
    {
      "title": "價值點標題1",
      "description": "價值點描述1"
    },
    {
      "title": "價值點標題2", 
      "description": "價值點描述2"
    },
    {
      "title": "價值點標題3",
      "description": "價值點描述3"
    }
  ],
  "socialProofTitle": "社會證明標題",
  "testimonials": [
    {
      "name": "客戶姓名1",
      "title": "客戶職位1",
      "company": "公司名稱1",
      "testimonial": "客戶見證內容1",
      "metric": "成果指標1"
    },
    {
      "name": "客戶姓名2",
      "title": "客戶職位2", 
      "company": "公司名稱2",
      "testimonial": "客戶見證內容2",
      "metric": "成果指標2"
    }
  ],
  "formTitle": "表單標題",
  "formSubtitle": "表單副標題",
  "submitButton": "提交按鈕文字",
  "thankYouTitle": "感謝頁面標題",
  "thankYouMessage": "感謝頁面訊息",
  "nextSteps": [
    {
      "title": "步驟1標題",
      "description": "步驟1描述"
    },
    {
      "title": "步驟2標題",
      "description": "步驟2描述"
    },
    {
      "title": "步驟3標題", 
      "description": "步驟3描述"
    }
  ],
  "videoTitle": "影片標題",
  "whatsappText": "WhatsApp聯繫文字"
}

要求：
- 使用繁體中文
- 內容要具體、有說服力
- 包含緊急感和社會證明
- 只使用提供的客戶信息，不要添加虛假內容
- 確保JSON格式正確
- 重要：只返回JSON文字內容，不要包含任何HTML、CSS或JavaScript代碼
- 不要生成完整的網頁，只生成文案內容`

    // Generate CSS based on visual style and brand colors
    const generateCSS = (style: string, colors: string) => {
      const baseCSS = `
        :root {
          --primary-color: #3b82f6;
          --secondary-color: #1e40af;
          --accent-color: #f59e0b;
          --text-color: #1f2937;
          --bg-color: #ffffff;
        }
      `
      
      let styleCSS = ''
      
      if (style === '科技未來') {
        styleCSS = `
          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .cta-button {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
        `
      } else if (style === '專業商務') {
        styleCSS = `
          .hero-section {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
          }
          .cta-button {
            background: #3498db;
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s ease;
          }
          .cta-button:hover {
            background: #2980b9;
          }
        `
      } else if (style === '創意活潑') {
        styleCSS = `
          .hero-section {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: #333;
          }
          .cta-button {
            background: linear-gradient(45deg, #ff9a9e, #fecfef);
            border: none;
            color: #333;
            padding: 15px 30px;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s ease;
          }
          .cta-button:hover {
            transform: scale(1.05);
          }
        `
      }
      
      return baseCSS + styleCSS
    }

    // Template engine function
    const applyTemplate = (templateContent: string, contentData: any) => {
      let result = templateContent
      
      // Replace simple placeholders
      const replacements = {
        '頁面標題': contentData.pageTitle || 'Webinar Landing Page',
        '品牌名稱': contentData.brandName || '您的品牌',
        '主要標題 - 吸引目標受眾的問題或承諾': contentData.heroTitle || '立即提升您的技能',
        '副標題 - 詳細說明價值主張': contentData.heroSubtitle || '專業培訓，限時免費',
        'CTA按鈕文字': contentData.ctaButton || '立即搶先報名',
        '價值主張標題': contentData.valuePropositionTitle || '為什麼選擇我們？',
        '社會證明標題': contentData.socialProofTitle || '學員見證',
        '表單標題': contentData.formTitle || '立即報名',
        '表單副標題': contentData.formSubtitle || '填寫信息，立即開始',
        '提交按鈕文字': contentData.submitButton || '立即報名',
        '感謝頁面標題': contentData.thankYouTitle || '歡迎加入',
        '感謝頁面訊息': contentData.thankYouMessage || '感謝您的信任',
        '影片標題': contentData.videoTitle || '產品演示影片',
        'WhatsApp聯繫文字': contentData.whatsappText || 'WhatsApp 諮詢'
      }
      
      // Apply simple replacements
      Object.entries(replacements).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(placeholder, 'g'), value)
      })
      
      // Replace value points
      if (contentData.valuePoints && contentData.valuePoints.length > 0) {
        contentData.valuePoints.forEach((point: any, index: number) => {
          result = result.replace(`[數位優勢${index + 1}]`, point.title || `優勢${index + 1}`)
          result = result.replace(`[創新解決方案${index + 1}]`, point.title || `解決方案${index + 1}`)
          result = result.replace(`[未來技術${index + 1}]`, point.title || `技術${index + 1}`)
          result = result.replace(`[優勢描述]`, point.description || `描述${index + 1}`)
          result = result.replace(`[解決方案描述]`, point.description || `描述${index + 1}`)
          result = result.replace(`[技術描述]`, point.description || `描述${index + 1}`)
        })
      }
      
      // Replace testimonials
      if (contentData.testimonials && contentData.testimonials.length > 0) {
        contentData.testimonials.forEach((testimonial: any, index: number) => {
          result = result.replace(`[科技客戶見證${index + 1}]`, testimonial.testimonial || `見證${index + 1}`)
          result = result.replace(`[數據成果見證${index + 1}]`, testimonial.testimonial || `見證${index + 1}`)
          result = result.replace(`[創新成果證明]`, testimonial.testimonial || `見證${index + 1}`)
        })
      }
      
      // Replace next steps
      if (contentData.nextSteps && contentData.nextSteps.length > 0) {
        contentData.nextSteps.forEach((step: any, index: number) => {
          result = result.replace(`[步驟${index + 1}標題]`, step.title || `步驟${index + 1}`)
          result = result.replace(`[步驟${index + 1}描述]`, step.description || `描述${index + 1}`)
        })
      }
      
      return result
    }

    // Generate landing page with AI (with retry logic)
    let aiResponse: string | null = null
    let lastError: string | null = null
    const maxRetries = 3
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to call AIML API with model: gpt-4o (attempt ${attempt}/${maxRetries})`)
        const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
        const baseURL = process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1"
        console.log('API Key (first 8 chars):', apiKey.substring(0, 8) + "...")
        console.log('Base URL:', baseURL)
        console.log('Using environment variable:', !!process.env.OPENAI_API_KEY)
        
        // Check if we have a valid API key
        if (!apiKey || apiKey.length < 10) {
          throw new Error('Invalid API key configuration')
        }
        
        // Build messages array
        const messages = [
          {
            role: "system" as const,
            content: '你是一個專業的webinar landing page文案專家，專精於創建高轉換率的行銷內容。'
          },
          {
            role: "user" as const,
            content: prompt
          }
        ]

        // Add error feedback for retry attempts
        if (attempt > 1 && lastError) {
          messages.push({
            role: "user" as const,
            content: `之前的回應有JSON語法錯誤，請修正：\n\n錯誤詳情：${lastError}\n\n請重新生成正確的JSON格式，確保：\n1. 所有字符串都用雙引號包圍\n2. 數組和對象的語法正確\n3. 沒有多餘的逗號\n4. 所有特殊字符都正確轉義\n5. 返回完整的JSON對象，不要截斷`
          })
        }
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 4000,
          temperature: 0.7
        })

        aiResponse = completion.choices[0]?.message?.content
        if (!aiResponse) {
          throw new Error('AI generation failed - no response content')
        }
        
        console.log(`AI API call successful (attempt ${attempt})`)
        
        // Try to parse the response to validate JSON
        try {
          const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const testParse = JSON.parse(cleanedResponse)
          if (testParse.pageTitle && testParse.heroTitle) {
            console.log('JSON validation successful, proceeding with template system')
            break // Success! Exit retry loop
          } else {
            throw new Error('Missing required fields in JSON response')
          }
        } catch (parseError) {
          lastError = parseError instanceof Error ? parseError.message : 'Unknown JSON parsing error'
          console.log(`JSON validation failed on attempt ${attempt}:`, lastError)
          
          if (attempt === maxRetries) {
            console.log('Max retries reached, will fall back to template system')
            break
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
        
      } catch (error) {
        console.error(`AI API call failed (attempt ${attempt}):`, error)
        lastError = error instanceof Error ? error.message : 'Unknown API error'
        
        if (attempt === maxRetries) {
          throw new Error('Failed to generate landing page content after all retries')
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    
    if (!aiResponse) {
      throw new Error('Failed to generate landing page content after all retries')
    }

    // Parse AI response and apply template
    let parsedResponse
    try {
      // Clean the AI response
      let cleanResponse = aiResponse.trim()
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '').replace(/```\n?/g, '')
      }
      
      // Try to parse JSON directly
      parsedResponse = JSON.parse(cleanResponse)
      console.log('JSON parsing successful')
      
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error)
      console.error('Raw AI response:', aiResponse.substring(0, 500) + '...')
      
      // Fallback to mock data if parsing fails
      parsedResponse = {
        pageTitle: businessInfo || 'Webinar Landing Page',
        brandName: businessInfo || '您的品牌',
        heroTitle: '立即提升您的技能',
        heroSubtitle: '專業培訓，限時免費',
        ctaButton: '立即搶先報名',
        valuePropositionTitle: '為什麼選擇我們？',
        valuePoints: [
          {
            title: '專業師資',
            description: '10年以上教學經驗的專業講師'
          },
          {
            title: '實用內容',
            description: '立即應用的實用技巧和方法'
          },
          {
            title: '限時優惠',
            description: '限時免費，錯過不再'
          }
        ],
        socialProofTitle: '學員見證',
        testimonials: [
          {
            name: '學員A',
            title: '企業主管',
            company: '知名企業',
            testimonial: '學習效果顯著，推薦給大家！',
            metric: '效率提升50%'
          }
        ],
        formTitle: '立即報名',
        formSubtitle: '填寫信息，立即開始',
        submitButton: '立即報名',
        thankYouTitle: '歡迎加入',
        thankYouMessage: '感謝您的信任',
        nextSteps: [
          {
            title: '查收郵件',
            description: '確認郵件已發送'
          },
          {
            title: '觀看影片',
            description: '了解詳細內容'
          },
          {
            title: '開始學習',
            description: '立即開始您的學習之旅'
          }
        ],
        videoTitle: '產品演示影片',
        whatsappText: 'WhatsApp 諮詢'
      }
    }

    // Validate that we have the required fields
    if (!parsedResponse.pageTitle || !parsedResponse.heroTitle) {
      throw new Error('AI response missing required fields (pageTitle, heroTitle)')
    }
    
    // Load template files
    // Choose template based on visual style
    let templateName = 'cyber-funnel-template'
    if (visualStyle === '專業商務') {
      templateName = 'professional-funnel-template'
    }
    
    const templateDir = path.join(process.cwd(), 'reference', templateName)
    
    // Read template files
    const templateHTML = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8')
    const templateCSS = fs.readFileSync(path.join(templateDir, 'style.css'), 'utf8')
    const templateJS = fs.readFileSync(path.join(templateDir, 'app.js'), 'utf8')
    
    // Apply template with AI-generated content
    const finalHTML = applyTemplate(templateHTML, parsedResponse)
    const finalCSS = templateCSS + '\n' + generateCSS(visualStyle, brandColors)
    const finalJS = templateJS
    
    // Store original parsed response for database
    const originalParsedResponse = parsedResponse
    
    // Create final response object
    const finalResponse = {
      html: finalHTML,
      css: finalCSS,
      js: finalJS,
      title: parsedResponse.pageTitle,
      metaDescription: parsedResponse.heroSubtitle
    }
    
    parsedResponse = finalResponse

    // Save to database
    const landingPage = await prisma.landingPage.create({
      data: {
        id: uuidv4(),
        title: parsedResponse.title,
        slug: `landing-page-${uuidv4()}`,
        content: {
          title: originalParsedResponse.pageTitle,
          metaDescription: originalParsedResponse.heroSubtitle,
          brandName: originalParsedResponse.brandName,
          heroTitle: originalParsedResponse.heroTitle,
          heroSubtitle: originalParsedResponse.heroSubtitle,
          ctaButton: originalParsedResponse.ctaButton,
          valuePropositionTitle: originalParsedResponse.valuePropositionTitle,
          valuePoints: originalParsedResponse.valuePoints,
          socialProofTitle: originalParsedResponse.socialProofTitle,
          testimonials: originalParsedResponse.testimonials,
          formTitle: originalParsedResponse.formTitle,
          formSubtitle: originalParsedResponse.formSubtitle,
          submitButton: originalParsedResponse.submitButton,
          thankYouTitle: originalParsedResponse.thankYouTitle,
          thankYouMessage: originalParsedResponse.thankYouMessage,
          nextSteps: originalParsedResponse.nextSteps,
          videoTitle: originalParsedResponse.videoTitle,
          whatsappText: originalParsedResponse.whatsappText
        },
        htmlContent: parsedResponse.html,
        cssContent: parsedResponse.css,
        jsContent: parsedResponse.js,
        businessInfo: cleanData.businessInfo,
        webinarContent: cleanData.webinarContent,
        targetAudience: cleanData.targetAudience,
        webinarInfo: cleanData.webinarInfo,
        instructorCreds: cleanData.instructorCreds,
        contactFields: cleanData.contactFields,
        visualStyle: cleanData.visualStyle,
        brandColors: cleanData.brandColors,
        uniqueSellingPoints: cleanData.uniqueSellingPoints,
        upsellProducts: cleanData.upsellProducts,
        specialRequirements: cleanData.specialRequirements,
        photos: cleanData.photos,
        userId: 'system' // TODO: Get actual user ID from session
      }
    })

    return NextResponse.json({
      success: true,
      landingPage: {
        id: landingPage.id,
        title: landingPage.title,
        slug: landingPage.slug,
        createdAt: landingPage.createdAt
      }
    })

  } catch (error) {
    console.error('Error generating landing page:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
