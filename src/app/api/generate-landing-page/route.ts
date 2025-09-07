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
    // Get authenticated user from token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token and get user ID
    const { verify } = await import('jsonwebtoken')
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

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
      visualStyle: visualStyle?.trim() || '科技感',
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

    // Choose template based on visual style (moved before prompt generation)
    let templateName = 'cyber-funnel-template'
    if (visualStyle === '專業商務') {
      templateName = 'professional-funnel-template'
    } else if (visualStyle === '溫暖生活化') {
      templateName = 'warm-tone-funnel' // Use warm-tone-funnel for warm style
    } else if (visualStyle === '創意活潑') {
      templateName = 'cyber-funnel-template' // Use cyber for creative style
    } else if (visualStyle === '吸血鬼') {
      templateName = 'vampire-aggressive-funnel' // Use vampire for aggressive style
    } else if (visualStyle === '其他') {
      templateName = 'professional-funnel-template' // Default to professional
    }

    // Generate template-specific AI prompt
    const generateTemplatePrompt = (templateName: string, filledFields: string) => {
      if (templateName === 'cyber-funnel-template') {
        return `為科技感webinar landing page生成高轉換率的文案內容（僅文字，不包含HTML）：

參考高轉換頁面結構：
- Hero區使用科技感標題和未來感元素 (如：NEXT-GEN TECHNOLOGY、量子計算)
- 問題區突出數位轉型痛點，解決方案區展示AI技術和創新成果
- 講師介紹包含科技成就、數據成果和技術突破
- 使用科技感CTA按鈕 (如：立即獲取、啟動系統、接入平台)
- 階梯式價值展示：數位優勢 → 創新解決方案 → 未來技術 → 社會證明 → CTA
- 信任元素：具體數據、科技客戶見證、技術資歷

客戶信息：
${filledFields}

請生成以下文案內容，返回JSON格式：
{
  "pageTitle": "頁面標題",
  "brandName": "品牌名稱",
  "heroTitle": "主要標題 - 吸引目標受眾的問題或承諾",
  "heroSubtitle": "副標題 - 詳細說明價值主張",
  "badgeText": "科技標籤文字",
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
  "valuePoint1Description": "第一個價值點的詳細描述",
  "valuePoint2Description": "第二個價值點的詳細描述",
  "valuePoint3Description": "第三個價值點的詳細描述",
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
- 內容要具體、有說服力，具有科技感和未來感
- 包含緊急感和社會證明
- 只使用提供的客戶信息，不要添加虛假內容
- 確保JSON格式正確
- 重要：只返回JSON文字內容，不要包含任何HTML、CSS或JavaScript代碼
- 不要生成完整的網頁，只生成文案內容
- 如果客戶提供了Upsell轉換目標，在感謝頁面訊息中提及相關產品或服務`
      } else if (templateName === 'vampire-aggressive-funnel') {
        // Vampire template prompt
        return `為吸血鬼風格webinar landing page生成高轉換率的文案內容（僅文字，不包含HTML）：

參考高轉換頁面結構：
- Hero區使用禁忌感標題和緊急感元素 (如：業界禁忌、限時48小時、僅限100人)
- 問題區突出財富痛點，解決方案區展示禁忌機密和財富密碼
- 講師介紹包含禁忌成就、財富突破和血狼老師身份
- 使用吸血鬼感CTA按鈕 (如：立即搶奪財富密碼、血狼老師指導、禁忌揭露)
- 階梯式價值展示：禁忌揭露 → 財富密碼 → 血狼老師 → 社會證明 → CTA
- 信任元素：具體數字、財富見證、禁忌資歷

客戶信息：
${filledFields}

請生成以下文案內容，返回JSON格式：
{
  "pageTitle": "頁面標題",
  "brandName": "品牌名稱",
  "heroTitle": "主要標題 - 吸引目標受眾的問題或承諾",
  "heroSubtitle": "副標題 - 詳細說明價值主張",
  "badgeText": "禁忌標籤文字",
  "mainQuestion": "主要問題 - 為什麼有些人30歲就實現財富自由",
  "answerTeaser": "答案預告 - 48小時內徹底顛覆認知",
  "secret1": "秘密1 - 頂級富豪隱藏的3個賺錢密碼",
  "secret2": "秘密2 - 99%窮人永遠不會知道的思維陷阱", 
  "secret3": "秘密3 - 如何在30天內改變你的財富軌道",
  "urgencyText": "緊急感文字 - 限時48小時免費",
  "urgencyWarning": "緊急警告 - 僅限前100名",
  "alertWarning": "錯過永遠後悔",
  "heroButtonText": "立即搶占席位",
  "remainingSpots": "剩餘名額數量",
  "trustNumber1": "信任數字1 - 人已搶占",
  "trustNumber2": "信任數字2 - 學員總收益",
  "trustNumber3": "信任數字3 - 後永遠關閉",
  "painSectionTitle": "殘酷真相標題",
  "painSectionSubtitle": "為什麼你越努力卻越貧窮",
  "painTitle1": "金錢陷阱",
  "painDesc1": "金錢陷阱描述",
  "painTitle2": "機會鎖鏈", 
  "painDesc2": "機會鎖鏈描述",
  "painTitle3": "時間殺手",
  "painDesc3": "時間殺手描述",
  "realityTitle": "血淋淋的現實",
  "stat1": "95%的人60歲時仍需要工作維生",
  "stat2": "80%的人死前仍在為錢擔憂",
  "stat3": "5%的富豪擁有全世界95%的財富",
  "realityQuestion": "你甘心成為那95%的韭菜嗎",
  "solutionTitle": "機密曝光標題",
  "solutionSubtitle": "富豪絕不外流的財富密碼",
  "solutionDescription": "首次公開價值$50,000的頂級機密",
  "secretCode1": "密碼一",
  "secretTitle1": "富豪收割法則",
  "secretDesc1": "富豪收割法則描述",
  "secretPreview1": "當所有人都在買入時，我在...",
  "secretCode2": "密碼二",
  "secretTitle2": "信息操控術",
  "secretDesc2": "信息操控術描述", 
  "secretPreview2": "媒體告訴你買房，他們卻在...",
  "secretCode3": "密碼三",
  "secretTitle3": "財富血脈系統",
  "secretDesc3": "財富血脈系統描述",
  "secretPreview3": "一個簡單動作，月收入增加...",
  "authorityName": "陳血狼",
  "authorityTitle": "財富收割者",
  "credential1": "華人財富界地下教父",
  "credential2": "27歲實現財富自由（資產破億）",
  "credential3": "幫助3,247人翻轉財富命運",
  "credential4": "首次公開頂級機密方法",
  "authorityWarning": "嚴重警告",
  "authorityWarningText": "這些機密方法威力極強，使用不當可能導致暴富",
  "socialProofTitle": "血淋淋的成功見證",
  "socialProofSubtitle": "他們已經搶先致富，你還在等什麼",
  "testimonial1Name": "李總裁",
  "testimonial1Title": "前工廠員工 → 千萬富豪",
  "testimonial1Result": "+$1,280萬",
  "testimonial1Content": "跟著血狼老師3個月，我從負債50萬變成資產千萬",
  "testimonial2Name": "王小姐",
  "testimonial2Title": "家庭主婦 → 投資女王",
  "testimonial2Result": "+$680萬",
  "testimonial2Content": "老師的方法簡直是降維打擊",
  "testimonial3Name": "陳先生",
  "testimonial3Title": "小職員 → 財富自由",
  "testimonial3Result": "+$420萬",
  "testimonial3Content": "我26歲就財富自由了",
  "successStats1": "3,247成功案例",
  "successStats2": "$2.8億學員總收益",
  "successStats3": "98.7%成功率",
  "successStats4": "30天平均見效時間",
  "scarcityTitle": "48小時後永遠消失",
  "scarcityReasonsTitle": "為什麼我要這麼做",
  "reason1": "這些機密太過強大，大規模公開會擾亂金融秩序",
  "reason2": "富豪圈子已經對我施壓，要求我停止洩露機密",
  "reason3": "48小時後，這些資料將永遠封存在保險庫",
  "countdownTitle": "機會倒數計時",
  "countdownWarning": "時間到後，頁面將自動銷毀",
  "spotsText": "僅剩名額",
  "finalCtaTitle": "最後警告",
  "finalCtaSubtitle": "不要成為那99%的後悔者",
  "finalCtaText": "現在你面臨人生最重要的選擇",
  "choiceBadTitle": "選擇逃避",
  "choiceBad1": "繼續被財富拋棄",
  "choiceBad2": "永遠為錢煩惱",
  "choiceBad3": "看著別人暴富",
  "choiceBad4": "後悔終生",
  "choiceGoodTitle": "抓住機會",
  "choiceGood1": "掌握財富密碼",
  "choiceGood2": "30天開始暴富",
  "choiceGood3": "財富自由人生",
  "choiceGood4": "成為人生贏家",
  "guaranteeTitle": "血誓保證",
  "guaranteeText": "如果30天內你沒有看到明顯的財富增長",
  "finalButtonText": "立即搶奪財富密碼",
  "finalButtonUrgency": "48小時後永遠關閉",
  "finalWarning1": "僅限前100名，手慢無",
  "finalWarning2": "價值$50,000，現在免費",
  "finalWarning3": "錯過後悔終生",
  "modalTitle": "搶奪財富密碼",
  "modalUrgency": "僅剩名額",
  "formTitle": "姓名",
  "formEmail": "電子郵件",
  "formPhone": "手機號碼",
  "formPainPoint": "現在最大的財務痛點",
  "painOption1": "負債累累，看不到希望",
  "painOption2": "收入太低，永遠不夠用",
  "painOption3": "不會投資，錯過所有機會",
  "painOption4": "思維局限，不知如何突破",
  "painOption5": "沒有時間，被工作綁死",
  "submitButtonText": "立即獲取機密資料",
  "submitCountdown": "秒後自動關閉",
  "guaranteeItem1": "資料絕對保密",
  "guaranteeItem2": "立即獲得價值$50,000機密",
  "guaranteeItem3": "48小時後永遠關閉",
  "thankYouTitle": "恭喜！你已獲得財富密碼",
  "thankYouSubtitle": "機密資料已發送到你的郵箱",
  "nextStepsTitle": "接下來的行動步驟",
  "step1": "立即檢查郵箱（包括垃圾郵件夾）",
  "step2": "下載機密資料PDF文件",
  "step3": "加入VIP群組獲得更多內幕",
  "step4": "開始實施財富密碼，30天見效",
  "vipButtonText": "加入VIP群組",
  "downloadButtonText": "下載機密資料",
  "successWarning": "記住：這些機密極其強大，請謹慎使用",
  "startJourneyButton": "開始我的財富之路",
  "ctaButton": "CTA按鈕文字",
  "valuePoint1": "價值點1 - 具體益處",
  "valuePoint2": "價值點2 - 解決痛點",
  "valuePoint3": "價值點3 - 獨特優勢",
  "valuePoint1Description": "第一個價值點的詳細描述",
  "testimonial1": "客戶見證1",
  "testimonial2": "客戶見證2",
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
- 內容要具體、有說服力，具有吸血鬼風格和禁忌感
- 包含緊急感和社會證明，使用禁忌、財富密碼等元素
- 只使用提供的客戶信息，不要添加虛假內容
- 確保JSON格式正確
- 重要：只返回JSON文字內容，不要包含任何HTML、CSS或JavaScript代碼
- 不要生成完整的網頁，只生成文案內容
- 如果客戶提供了Upsell轉換目標，在感謝頁面訊息中提及相關產品或服務`
      } else if (templateName === 'warm-tone-funnel') {
        // Warm tone template prompt
        return `為溫暖生活化webinar landing page生成高轉換率的文案內容（僅文字，不包含HTML）：

參考高轉換頁面結構：
- Hero區使用溫暖親和標題和信任元素 (如：用心陪伴、溫暖支持、專業指導)
- 問題區突出生活痛點，解決方案區展示溫暖支持和陪伴價值
- 講師介紹包含溫暖資歷、生活經驗和親和力
- 使用溫暖感CTA按鈕 (如：開始溫暖之旅、獲得專業陪伴、開啟美好生活)
- 階梯式價值展示：溫暖支持 → 專業陪伴 → 生活改善 → 社會證明 → CTA
- 信任元素：溫暖見證、生活改善案例、親和力展示

客戶信息：
${filledFields}

請生成以下文案內容，返回JSON格式：
{
  "pageTitle": "頁面標題",
  "brandName": "品牌名稱",
  "heroTitle": "主要標題 - 溫暖親和的承諾",
  "heroSubtitle": "副標題 - 詳細說明溫暖價值主張",
  "valuePoint1": "價值點1 - 溫暖支持",
  "valuePoint2": "價值點2 - 專業陪伴",
  "valuePoint3": "價值點3 - 生活改善",
  "testimonial1": "溫暖見證1",
  "testimonial2": "溫暖見證2",
  "formTitle": "表單標題 - 溫暖邀請",
  "formSubtitle": "表單副標題 - 說明將獲得什麼溫暖支持",
  "ctaButton": "CTA按鈕文字",
  "thankYouTitle": "感謝標題",
  "thankYouMessage": "感謝訊息和下一步指引"
}

要求：
- 使用繁體中文
- 內容要具體、有說服力，具有溫暖親和感
- 包含信任感和社會證明
- 只使用提供的客戶信息，不要添加虛假內容
- 確保JSON格式正確
- 重要：只返回JSON文字內容，不要包含任何HTML、CSS或JavaScript代碼
- 不要生成完整的網頁，只生成文案內容
- 如果客戶提供了Upsell轉換目標，在感謝頁面訊息中提及相關產品或服務`
      } else {
        // Professional template prompt
        return `為專業商務webinar landing page生成高轉換率的文案內容（僅文字，不包含HTML）：

參考高轉換頁面結構：
- Hero區使用專業商務標題和信任元素 (如：專業認證、企業級解決方案)
- 問題區突出商業痛點，解決方案區展示具體商業價值和ROI
- 講師介紹包含商業成就、企業經驗和專業認證
- 使用專業CTA按鈕 (如：立即獲取、免費諮詢、開始合作)
- 階梯式價值展示：價值點 → 解決痛點 → 獨特優勢 → 社會證明 → CTA
- 信任元素：具體數字、企業客戶見證、專業資歷

客戶信息：
${filledFields}

請生成以下文案內容，返回JSON格式：
{
  "pageTitle": "頁面標題",
  "brandName": "品牌名稱",
  "heroTitle": "主要標題 - 吸引目標受眾的問題或承諾",
  "heroSubtitle": "副標題 - 詳細說明價值主張",
  "valuePoint1": "價值點1 - 具體益處",
  "valuePoint2": "價值點2 - 解決痛點",
  "valuePoint3": "價值點3 - 獨特優勢",
  "testimonial1": "客戶見證1",
  "testimonial2": "客戶見證2",
  "dataProof": "數據證明",
  "formTitle": "表單標題 - 呼籲行動",
  "formSubtitle": "表單副標題 - 說明將獲得什麼",
  "ctaButton": "CTA按鈕文字",
  "thankYouTitle": "感謝標題",
  "thankYouMessage": "感謝訊息和下一步指引"
}

要求：
- 使用繁體中文
- 內容要具體、有說服力，具有專業商務感
- 包含緊急感和社會證明
- 只使用提供的客戶信息，不要添加虛假內容
- 確保JSON格式正確
- 重要：只返回JSON文字內容，不要包含任何HTML、CSS或JavaScript代碼
- 不要生成完整的網頁，只生成文案內容
- 如果客戶提供了Upsell轉換目標，在感謝頁面訊息中提及相關產品或服務`
      }
    }

    const prompt = generateTemplatePrompt(templateName, filledFields)

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
    const applyTemplate = (templateContent: string, contentData: any, contactFields: string[] = [], templateName: string) => {
      let result = templateContent
      
      // Template-specific replacements
      let replacements: { [key: string]: string } = {}
      
      if (templateName === 'cyber-funnel-template') {
        // Cyber template replacements
        replacements = {
          '頁面標題': contentData.pageTitle || 'Webinar Landing Page',
          '[您的科技品牌]': contentData.brandName || '您的品牌',
          '[主要標題 - 科技創新解決方案]': contentData.heroTitle || '立即提升您的技能',
          '[副標題 - 數位轉型價值主張]': contentData.heroSubtitle || '專業培訓，限時免費',
          '[立即獲取]': contentData.ctaButton || '立即搶先報名',
          '[獲取數位解決方案]': contentData.formTitle || '立即報名',
          '[立即獲得先進技術資源]': contentData.formSubtitle || '填寫信息，立即開始',
          '[歡迎加入科技未來]': contentData.thankYouTitle || '歡迎加入',
          '[感謝您的信任，準備迎接數位革命]': contentData.thankYouMessage || '感謝您的信任',
          '[INPUT_NAME]': '姓名',
          '[INPUT_EMAIL]': 'Email',
          '[INPUT_COMPANY]': '公司名稱',
          '[SELECT_ROLE]': '職位',
          'NEXT-GEN TECHNOLOGY': contentData.badgeText || 'NEXT-GEN TECHNOLOGY',
          '為什麼選擇我們的科技解決方案？': contentData.valuePropositionTitle || '為什麼選擇我們的科技解決方案？',
          '利用先進AI技術，實現智能化自動處理，提升效率300%': contentData.valuePoint1Description || '利用先進AI技術，實現智能化自動處理，提升效率300%',
          '突破性架構設計，實現毫秒級響應，零延遲體驗': contentData.valuePoint2Description || '突破性架構設計，實現毫秒級響應，零延遲體驗',
          '融合區塊鏈與量子計算，構建下一代數位生態系統': contentData.valuePoint3Description || '融合區塊鏈與量子計算，構建下一代數位生態系統',
          '全球企業信任之選': contentData.socialProofTitle || '全球企業信任之選',
          '[感謝頁面標題]': contentData.thankYouTitle || '感謝您的興趣',
          '[感謝頁面訊息]': contentData.thankYouMessage || '我們將盡快與您聯繫，分享更多科技資訊'
        }
      } else if (templateName === 'vampire-aggressive-funnel') {
        // Vampire template replacements - Comprehensive mapping
        replacements = {
          // Page title and meta
          '頁面標題': contentData.pageTitle || 'Webinar Landing Page',
          '【禁忌揭露】99%的人不知道的財富密碼｜限時48小時免費公開': contentData.pageTitle || '【禁忌揭露】99%的人不知道的財富密碼｜限時48小時免費公開',
          '業界禁忌！首次公開價值$50,000的財富密碼。限時48小時，僅限100人。錯過永遠後悔！': contentData.heroSubtitle || '業界禁忌！首次公開價值$50,000的財富密碼。限時48小時，僅限100人。錯過永遠後悔！',
          
          // Hero section
          '⚡ 業界禁忌首次公開 ⚡': contentData.badgeText || '⚡ 業界禁忌首次公開 ⚡',
          '【警告】': contentData.heroTitle || '【警告】',
          '99%的人永遠不知道的': contentData.heroTitle || '99%的人永遠不知道的',
          '財富血脈密碼': contentData.heroTitle || '財富血脈密碼',
          '為什麼有些人30歲就實現財富自由，而你卻還在為錢煩惱？': contentData.mainQuestion || '為什麼有些人30歲就實現財富自由，而你卻還在為錢煩惱？',
          '答案將在接下來的48小時內徹底顛覆你的認知...': contentData.answerTeaser || '答案將在接下來的48小時內徹底顛覆你的認知...',
          '頂級富豪隱藏的3個賺錢密碼': contentData.secret1 || '頂級富豪隱藏的3個賺錢密碼',
          '99%窮人永遠不會知道的思維陷阱': contentData.secret2 || '99%窮人永遠不會知道的思維陷阱',
          '如何在30天內改變你的財富軌道': contentData.secret3 || '如何在30天內改變你的財富軌道',
          '錯過永遠後悔！': contentData.alertWarning || '錯過永遠後悔！',
          '立即搶占席位': contentData.heroButtonText || '立即搶占席位',
          '剩餘 23 個名額': contentData.remainingSpots || '剩餘 23 個名額',
          '1,847': contentData.trustNumber1 || '1,847',
          '人已搶占': contentData.trustNumber1 || '人已搶占',
          '$2.8億': contentData.trustNumber2 || '$2.8億',
          '學員總收益': contentData.trustNumber2 || '學員總收益',
          '48小時': contentData.trustNumber3 || '48小時',
          '後永遠關閉': contentData.trustNumber3 || '後永遠關閉',
          
          // Pain agitation section
          '⚠️ 殘酷真相': contentData.painSectionTitle || '⚠️ 殘酷真相',
          '為什麼你越努力卻越貧窮？': contentData.painSectionSubtitle || '為什麼你越努力卻越貧窮？',
          '金錢陷阱': contentData.painTitle1 || '金錢陷阱',
          '你被洗腦相信「努力就能致富」，但真相是：窮人思維讓你永遠在為錢工作': contentData.painDesc1 || '你被洗腦相信「努力就能致富」，但真相是：窮人思維讓你永遠在為錢工作',
          '機會鎖鏈': contentData.painTitle2 || '機會鎖鏈',
          '每一次猶豫，每一次「等等看」，都是財富之門在你面前關閉': contentData.painDesc2 || '每一次猶豫，每一次「等等看」，都是財富之門在你面前關閉',
          '時間殺手': contentData.painTitle3 || '時間殺手',
          '30歲、40歲、50歲...每一年的拖延都讓你離財富自由越來越遠': contentData.painDesc3 || '30歲、40歲、50歲...每一年的拖延都讓你離財富自由越來越遠',
          '🩸 血淋淋的現實': contentData.realityTitle || '🩸 血淋淋的現實',
          '95%的人60歲時仍需要工作維生': contentData.stat1 || '95%的人60歲時仍需要工作維生',
          '80%的人死前仍在為錢擔憂': contentData.stat2 || '80%的人死前仍在為錢擔憂',
          '5%的富豪擁有全世界95%的財富': contentData.stat3 || '5%的富豪擁有全世界95%的財富',
          '你甘心成為那95%的韭菜嗎？': contentData.realityQuestion || '你甘心成為那95%的韭菜嗎？',
          
          // Solution reveal section
          '💀 機密曝光': contentData.solutionTitle || '💀 機密曝光',
          '富豪絕不外流的財富密碼': contentData.solutionSubtitle || '富豪絕不外流的財富密碼',
          '首次公開！價值$50,000的頂級機密，48小時後永遠封存': contentData.solutionDescription || '首次公開！價值$50,000的頂級機密，48小時後永遠封存',
          '密碼一': contentData.secretCode1 || '密碼一',
          '🗡️ 富豪收割法則': contentData.secretTitle1 || '🗡️ 富豪收割法則',
          '為什麼富豪越來越富？因為他們掌握了「收割窮人財富」的血腥法則': contentData.secretDesc1 || '為什麼富豪越來越富？因為他們掌握了「收割窮人財富」的血腥法則',
          '「當所有人都在買入時，我在...」': contentData.secretPreview1 || '「當所有人都在買入時，我在...」',
          '密碼二': contentData.secretCode2 || '密碼二',
          '👁️ 信息操控術': contentData.secretTitle2 || '👁️ 信息操控術',
          '頂級富豪如何操控信息流向，讓99%的人永遠接收錯誤信號': contentData.secretDesc2 || '頂級富豪如何操控信息流向，讓99%的人永遠接收錯誤信號',
          '「媒體告訴你買房，他們卻在...」': contentData.secretPreview2 || '「媒體告訴你買房，他們卻在...」',
          '密碼三': contentData.secretCode3 || '密碼三',
          '⚡ 財富血脈系統': contentData.secretTitle3 || '⚡ 財富血脈系統',
          '如何建立自動賺錢的財富血脈，讓金錢24小時為你工作': contentData.secretDesc3 || '如何建立自動賺錢的財富血脈，讓金錢24小時為你工作',
          '「一個簡單動作，月收入增加...」': contentData.secretPreview3 || '「一個簡單動作，月收入增加...」',
          
          // Authority section
          '陳血狼': contentData.authorityName || '陳血狼',
          '財富收割者': contentData.authorityTitle || '財富收割者',
          '華人財富界地下教父': contentData.credential1 || '華人財富界地下教父',
          '27歲實現財富自由（資產破億）': contentData.credential2 || '27歲實現財富自由（資產破億）',
          '幫助3,247人翻轉財富命運': contentData.credential3 || '幫助3,247人翻轉財富命運',
          '首次公開頂級機密方法': contentData.credential4 || '首次公開頂級機密方法',
          '⚠️ 嚴重警告': contentData.authorityWarning || '⚠️ 嚴重警告',
          '這些機密方法威力極強，使用不當可能導致暴富。僅限心理承受能力強的人參與，膽小者勿入！': contentData.authorityWarningText || '這些機密方法威力極強，使用不當可能導致暴富。僅限心理承受能力強的人參與，膽小者勿入！',
          
          // Social proof section
          '🔥 血淋淋的成功見證': contentData.socialProofTitle || '🔥 血淋淋的成功見證',
          '他們已經搶先致富，你還在等什麼？': contentData.socialProofSubtitle || '他們已經搶先致富，你還在等什麼？',
          '李總裁': contentData.testimonial1Name || '李總裁',
          '前工廠員工 → 千萬富豪': contentData.testimonial1Title || '前工廠員工 → 千萬富豪',
          '+$1,280萬': contentData.testimonial1Result || '+$1,280萬',
          '跟著血狼老師3個月，我從負債50萬變成資產千萬！財富密碼太可怕了，我老婆都不敢相信...': contentData.testimonial1Content || '跟著血狼老師3個月，我從負債50萬變成資產千萬！財富密碼太可怕了，我老婆都不敢相信...',
          '王小姐': contentData.testimonial2Name || '王小姐',
          '家庭主婦 → 投資女王': contentData.testimonial2Title || '家庭主婦 → 投資女王',
          '+$680萬': contentData.testimonial2Result || '+$680萬',
          '老師的方法簡直是降維打擊！短短6個月，我就賺到老公10年的工資，現在他反而要向我借錢...': contentData.testimonial2Content || '老師的方法簡直是降維打擊！短短6個月，我就賺到老公10年的工資，現在他反而要向我借錢...',
          '陳先生': contentData.testimonial3Name || '陳先生',
          '小職員 → 財富自由': contentData.testimonial3Title || '小職員 → 財富自由',
          '+$420萬': contentData.testimonial3Result || '+$420萬',
          '我26歲就財富自由了！同事還在996，而我已經躺著數錢。血狼老師，您改變了我的命運！': contentData.testimonial3Content || '我26歲就財富自由了！同事還在996，而我已經躺著數錢。血狼老師，您改變了我的命運！',
          '3,247': contentData.successStats1 || '3,247',
          '成功案例': contentData.successStats1 || '成功案例',
          '$2.8億': contentData.successStats2 || '$2.8億',
          '學員總收益': contentData.successStats2 || '學員總收益',
          '98.7%': contentData.successStats3 || '98.7%',
          '成功率': contentData.successStats3 || '成功率',
          '30天': contentData.successStats4 || '30天',
          '平均見效時間': contentData.successStats4 || '平均見效時間',
          
          // Scarcity section
          '48小時後永遠消失': contentData.scarcityTitle || '48小時後永遠消失',
          '為什麼我要這麼做？': contentData.scarcityReasonsTitle || '為什麼我要這麼做？',
          '這些機密太過強大，大規模公開會擾亂金融秩序': contentData.reason1 || '這些機密太過強大，大規模公開會擾亂金融秩序',
          '富豪圈子已經對我施壓，要求我停止洩露機密': contentData.reason2 || '富豪圈子已經對我施壓，要求我停止洩露機密',
          '48小時後，這些資料將永遠封存在保險庫': contentData.reason3 || '48小時後，這些資料將永遠封存在保險庫',
          '⏰ 機會倒數計時': contentData.countdownTitle || '⏰ 機會倒數計時',
          '時間到後，頁面將自動銷毀': contentData.countdownWarning || '時間到後，頁面將自動銷毀',
          '僅剩 23/100 個名額': contentData.spotsText || '僅剩 23/100 個名額',
          
          // Final CTA section
          '⚠️ 最後警告': contentData.finalCtaTitle || '⚠️ 最後警告',
          '不要成為那99%的後悔者': contentData.finalCtaSubtitle || '不要成為那99%的後悔者',
          '現在你面臨人生最重要的選擇：': contentData.finalCtaText || '現在你面臨人生最重要的選擇：',
          '❌ 選擇逃避': contentData.choiceBadTitle || '❌ 選擇逃避',
          '繼續被財富拋棄': contentData.choiceBad1 || '繼續被財富拋棄',
          '永遠為錢煩惱': contentData.choiceBad2 || '永遠為錢煩惱',
          '看著別人暴富': contentData.choiceBad3 || '看著別人暴富',
          '後悔終生': contentData.choiceBad4 || '後悔終生',
          '✅ 抓住機會': contentData.choiceGoodTitle || '✅ 抓住機會',
          '掌握財富密碼': contentData.choiceGood1 || '掌握財富密碼',
          '30天開始暴富': contentData.choiceGood2 || '30天開始暴富',
          '財富自由人生': contentData.choiceGood3 || '財富自由人生',
          '成為人生贏家': contentData.choiceGood4 || '成為人生贏家',
          '🛡️ 血誓保證': contentData.guaranteeTitle || '🛡️ 血誓保證',
          '如果30天內你沒有看到明顯的財富增長，我將親自跪下道歉並賠償你10倍損失！': contentData.guaranteeText || '如果30天內你沒有看到明顯的財富增長，我將親自跪下道歉並賠償你10倍損失！',
          '立即搶奪財富密碼': contentData.finalButtonText || '立即搶奪財富密碼',
          '48小時後永遠關閉': contentData.finalButtonUrgency || '48小時後永遠關閉',
          '⚡ 僅限前100名，手慢無': contentData.finalWarning1 || '⚡ 僅限前100名，手慢無',
          '🔥 價值$50,000，現在免費': contentData.finalWarning2 || '🔥 價值$50,000，現在免費',
          '💀 錯過後悔終生': contentData.finalWarning3 || '💀 錯過後悔終生',
          
          // Form section
          '搶奪財富密碼': contentData.modalTitle || '搶奪財富密碼',
          '僅剩 23 個名額': contentData.modalUrgency || '僅剩 23 個名額',
          '姓名 *': contentData.formTitle || '姓名 *',
          '電子郵件 *': contentData.formEmail || '電子郵件 *',
          '手機號碼 *': contentData.formPhone || '手機號碼 *',
          '現在最大的財務痛點': contentData.formPainPoint || '現在最大的財務痛點',
          '負債累累，看不到希望': contentData.painOption1 || '負債累累，看不到希望',
          '收入太低，永遠不夠用': contentData.painOption2 || '收入太低，永遠不夠用',
          '不會投資，錯過所有機會': contentData.painOption3 || '不會投資，錯過所有機會',
          '思維局限，不知如何突破': contentData.painOption4 || '思維局限，不知如何突破',
          '沒有時間，被工作綁死': contentData.painOption5 || '沒有時間，被工作綁死',
          '立即獲取機密資料': contentData.submitButtonText || '立即獲取機密資料',
          '秒後自動關閉': contentData.submitCountdown || '秒後自動關閉',
          '資料絕對保密': contentData.guaranteeItem1 || '資料絕對保密',
          '立即獲得價值$50,000機密': contentData.guaranteeItem2 || '立即獲得價值$50,000機密',
          '48小時後永遠關閉': contentData.guaranteeItem3 || '48小時後永遠關閉',
          
          // Thank you section
          '恭喜！你已獲得財富密碼': contentData.thankYouTitle || '恭喜！你已獲得財富密碼',
          '機密資料已發送到你的郵箱，立即查收開始你的財富之路': contentData.thankYouSubtitle || '機密資料已發送到你的郵箱，立即查收開始你的財富之路',
          '接下來的行動步驟：': contentData.nextStepsTitle || '接下來的行動步驟：',
          '立即檢查郵箱（包括垃圾郵件夾）': contentData.step1 || '立即檢查郵箱（包括垃圾郵件夾）',
          '下載機密資料PDF文件': contentData.step2 || '下載機密資料PDF文件',
          '加入VIP群組獲得更多內幕': contentData.step3 || '加入VIP群組獲得更多內幕',
          '開始實施財富密碼，30天見效': contentData.step4 || '開始實施財富密碼，30天見效',
          '💬 加入VIP群組': contentData.vipButtonText || '💬 加入VIP群組',
          '📥 下載機密資料': contentData.downloadButtonText || '📥 下載機密資料',
          '⚠️ 記住：這些機密極其強大，請謹慎使用！': contentData.successWarning || '⚠️ 記住：這些機密極其強大，請謹慎使用！',
          '開始我的財富之路 →': contentData.startJourneyButton || '開始我的財富之路 →',
          
          // Legacy mappings for backward compatibility
          '價值 $50,000 的機密資料': contentData.valuePoint1 || '價值 $50,000 的機密資料',
          '限時48小時免費': contentData.urgencyText || '限時48小時免費',
          '僅限前100名，不設重播': contentData.urgencyWarning || '僅限前100名，不設重播',
          '富豪絕不外流的財富密碼': contentData.valuePoint3 || '富豪絕不外流的財富密碼',
          '首次公開！價值$50,000的頂級機密，48小時後永遠封存': contentData.valuePoint1Description || '首次公開！價值$50,000的頂級機密，48小時後永遠封存',
          '跟著血狼老師3個月，我從負債50萬變成資產千萬！財富密碼太可怕了，我老婆都不敢相信...': contentData.testimonial1 || '跟著血狼老師3個月，我從負債50萬變成資產千萬！財富密碼太可怕了，我老婆都不敢相信...',
          '我26歲就財富自由了！同事還在996，而我已經躺著數錢。血狼老師，您改變了我的命運！': contentData.testimonial2 || '我26歲就財富自由了！同事還在996，而我已經躺著數錢。血狼老師，您改變了我的命運！',
          '立即搶奪財富密碼': contentData.ctaButton || '立即搶奪財富密碼',
          '價值$50,000，現在免費': contentData.formSubtitle || '價值$50,000，現在免費',
          '搶奪財富密碼': contentData.formTitle || '搶奪財富密碼',
          '[感謝標題]': contentData.thankYouTitle || '恭喜！你已獲得財富密碼',
          '[感謝訊息和下一步指引]': contentData.thankYouMessage || '機密資料已發送到你的郵箱，立即查收開始你的財富之路'
        }
      } else if (templateName === 'warm-tone-funnel') {
        // Warm tone template replacements
        replacements = {
          '頁面標題': contentData.pageTitle || 'Webinar Landing Page',
          '[您的品牌名稱]': contentData.brandName || '您的品牌',
          '[主要標題 - 溫暖親和的承諾]': contentData.heroTitle || '用心陪伴您的每一步成長',
          '[副標題 - 詳細說明溫暖價值主張]': contentData.heroSubtitle || '專業溫暖的指導，讓您的生活更美好',
          '[價值點1 - 溫暖支持]': contentData.valuePoint1 || '溫暖支持',
          '[價值點2 - 專業陪伴]': contentData.valuePoint2 || '專業陪伴',
          '[價值點3 - 生活改善]': contentData.valuePoint3 || '生活改善',
          '[溫暖見證1]': contentData.testimonial1 || '溫暖見證1',
          '[溫暖見證2]': contentData.testimonial2 || '溫暖見證2',
          '[表單標題 - 溫暖邀請]': contentData.formTitle || '開始您的溫暖之旅',
          '[表單副標題 - 說明將獲得什麼溫暖支持]': contentData.formSubtitle || '我們會用最溫暖的方式與您聯繫',
          '[CTA按鈕文字]': contentData.ctaButton || '開始溫暖之旅',
          '[感謝標題]': contentData.thankYouTitle || '感謝您的信任',
          '[感謝訊息和下一步指引]': contentData.thankYouMessage || '我們將用最溫暖的方式與您聯繫，陪伴您的每一步成長'
        }
      } else {
        // Professional template replacements
        replacements = {
          '頁面標題': contentData.pageTitle || 'Webinar Landing Page',
          '[您的品牌名稱]': contentData.brandName || '您的品牌',
          '[主要標題 - 吸引目標受眾的問題或承諾]': contentData.heroTitle || '立即提升您的技能',
          '[副標題 - 詳細說明價值主張]': contentData.heroSubtitle || '專業培訓，限時免費',
          '[價值點1 - 具體益處]': contentData.valuePoint1 || '具體益處',
          '[價值點2 - 解決痛點]': contentData.valuePoint2 || '解決痛點',
          '[價值點3 - 獨特優勢]': contentData.valuePoint3 || '獨特優勢',
          '[客戶見證1]': contentData.testimonial1 || '客戶見證1',
          '[客戶見證2]': contentData.testimonial2 || '客戶見證2',
          '[數據證明]': contentData.dataProof || '數據證明',
          '[表單標題 - 呼籲行動]': contentData.formTitle || '立即報名',
          '[表單副標題 - 說明將獲得什麼]': contentData.formSubtitle || '填寫信息，立即開始',
          '[立即獲取]': contentData.ctaButton || '立即搶先報名',
          '[感謝標題]': contentData.thankYouTitle || '感謝您的興趣',
          '[感謝訊息和下一步指引]': contentData.thankYouMessage || '我們將盡快與您聯繫，提供更多專業資訊'
        }
      }
      
      // Apply simple replacements
      Object.entries(replacements).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
      })
      
      // Handle dynamic form fields based on user selection
      if (contactFields && contactFields.length > 0) {
        // For cyber template, use the specific logic
        if (templateName === 'cyber-funnel-template') {
          // Hide all form fields first, then show only selected ones
          result = result.replace(/<div class="form-group">[\s\S]*?<\/div>/g, (match) => {
            // Always show name and email as they are required
            if (match.includes('name') || match.includes('email')) {
              return match
            }
            
            // Check if this form group contains a field that should be shown
            const shouldShow = contactFields.some(field => {
              if (field === '姓名' && match.includes('name')) return true
              if (field === 'Email' && match.includes('email')) return true
              if (field === '電話' && match.includes('phone')) return true
              if (field === 'Instagram帳號' && match.includes('instagram')) return true
              return false
            })
            
            // Show other fields only if selected
            return shouldShow ? match : ''
          })
        }
        
        // Add phone field if selected
        if (contactFields.includes('電話')) {
          const phoneField = `
                        <div class="form-group">
                            <label class="form-label" for="phone">
                                <span class="label-prompt">[INPUT_PHONE]$</span>
                                <span class="label-text">電話號碼</span>
                            </label>
                            <input type="tel" id="phone" name="phone" class="form-control cyber-input" placeholder="請輸入電話號碼">
                            <div class="input-scan"></div>
                        </div>`
          
          // Insert phone field before company field
          result = result.replace(
            /<div class="form-group">[\s\S]*?<span class="label-prompt">\[INPUT_COMPANY\]\$<\/span>/,
            phoneField + '\n                        <div class="form-group">\n                            <label class="form-label" for="company">\n                                <span class="label-prompt">[INPUT_COMPANY]$</span>'
          )
        }
        
        // Add Instagram field if selected
        if (contactFields.includes('Instagram帳號')) {
          const instagramField = `
                        <div class="form-group">
                            <label class="form-label" for="instagram">
                                <span class="label-prompt">[INPUT_INSTAGRAM]$</span>
                                <span class="label-text">Instagram帳號</span>
                            </label>
                            <input type="text" id="instagram" name="instagram" class="form-control cyber-input" placeholder="請輸入Instagram帳號">
                            <div class="input-scan"></div>
                        </div>`
          
          // Insert Instagram field before company field
          result = result.replace(
            /<div class="form-group">[\s\S]*?<span class="label-prompt">\[INPUT_COMPANY\]\$<\/span>/,
            instagramField + '\n                        <div class="form-group">\n                            <label class="form-label" for="company">\n                                <span class="label-prompt">[INPUT_COMPANY]$</span>'
          )
        }
        
        // Hide company and role fields if not selected
        if (!contactFields.includes('公司名稱')) {
          result = result.replace(/<div class="form-group">[\s\S]*?<span class="label-prompt">\[INPUT_COMPANY\]\$<\/span>[\s\S]*?<\/div>/g, '')
        }
        if (!contactFields.includes('職位')) {
          result = result.replace(/<div class="form-group">[\s\S]*?<span class="label-prompt">\[SELECT_ROLE\]\$<\/span>[\s\S]*?<\/div>/g, '')
        }
      }
      
    // All templates now use standardized form fields: name, email, phone
    // No need for complex field filtering since all forms are simplified
    console.log('Using standardized form fields: name, email, phone')
      
      // Replace value points
      if (contentData.valuePoints && contentData.valuePoints.length > 0) {
        contentData.valuePoints.forEach((point: any, index: number) => {
          result = result.replace(`[數位優勢${index + 1}]`, point.title || `優勢${index + 1}`)
          result = result.replace(`[創新解決方案${index + 1}]`, point.title || `解決方案${index + 1}`)
          result = result.replace(`[未來技術${index + 1}]`, point.title || `技術${index + 1}`)
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
    
    const templateDir = path.join(process.cwd(), 'reference', templateName)
    
    // Debug: Log template directory and check if files exist
    console.log('Template directory:', templateDir)
    console.log('Template name:', templateName)
    console.log('Current working directory:', process.cwd())
    console.log('Reference directory exists:', fs.existsSync(path.join(process.cwd(), 'reference')))
    console.log('Files in reference directory:', fs.existsSync(path.join(process.cwd(), 'reference')) ? fs.readdirSync(path.join(process.cwd(), 'reference')) : 'Reference directory not found')
    
    // Check if template directory exists
    if (!fs.existsSync(templateDir)) {
      console.error('Template directory does not exist:', templateDir)
      throw new Error(`Template directory not found: ${templateDir}`)
    }
    
    console.log('Files in template directory:', fs.readdirSync(templateDir))
    
    // Read template files with error handling
    let templateHTML, templateCSS, templateJS
    
    try {
      templateHTML = fs.readFileSync(path.join(templateDir, 'index.html'), 'utf8')
      templateCSS = fs.readFileSync(path.join(templateDir, 'style.css'), 'utf8')
      templateJS = fs.readFileSync(path.join(templateDir, 'app.js'), 'utf8')
    } catch (error) {
      console.error('Error reading template files:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to read template files for ${templateName}: ${errorMessage}`)
    }
    
    // Apply template with AI-generated content
    const finalHTML = applyTemplate(templateHTML, parsedResponse, cleanData.contactFields, templateName)
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
        userId: userId // Using the authenticated user ID from JWT token
      }
    })

    return NextResponse.json({
      success: true,
      pageId: landingPage.id,
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
