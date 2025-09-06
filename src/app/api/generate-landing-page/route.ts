import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

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

    const prompt = `你是一個專業的轉換優化專家，專門創建類似ClickFunnels風格的高轉換率webinar landing page。請根據以下客戶信息，創建一個專業級別的funnel頁面：

## 客戶背景信息
${filledFields}

## 專業Webinar Funnel結構要求

### 1. Hero Section (首屏) - 高轉換設計
- 強有力的主標題 (H1) - 解決痛點或承諾具體結果
- 吸引人的副標題 - 具體說明價值和學習成果
- 緊急感CTA按鈕 - "立即搶先報名" 或 "限時免費註冊"
- 倒計時器或名額限制元素
- 視覺衝擊力的背景設計和動畫效果
- 信任標誌和社會證明元素

### 2. 問題/痛點放大區 - 情感共鳴
- 3-5個目標受眾面臨的具體問題
- 每個問題配有相關圖標和情感化描述
- 使用"您是否也遇到這些困擾？"等共鳴語言
- 問題描述要具體、真實、有代入感

### 3. 解決方案預告區 - 價值展示
- "您將學到什麼" 詳細區塊
- 具體的學習成果承諾和技能提升
- 3-5個核心價值點，每個都有具體說明
- 視覺化的價值展示和學習路徑
- 包含"學完後您將能夠..."的具體承諾

### 4. 講師權威建立區 - 信任建立
- 專業頭像/照片位置
- 詳細的資歷和成就展示
- 社會證明和認證標誌
- 成功案例數量和具體數據
- 學員成功故事和見證

### 5. 社會證明區 - 可信度提升
- 真實感強的學員見證和成功案例
- 具體的成果數據和轉變故事
- 學員照片和姓名（或化名）
- 評分和星級展示
- 媒體報導或合作夥伴標誌

### 6. Webinar詳情區 - 內容價值
- 具體的時間安排和參與方式
- 詳細的內容大綱和學習模組
- 參與方式說明和技術要求
- 價值對比展示（原價 vs 免費）
- 額外獎勵和贈品說明

### 7. 緊急感/稀缺性區 - 行動驅動
- 名額限制提醒和剩餘名額顯示
- 動態時間倒計時器
- 錯過機會的損失描述
- 立即行動的緊迫感營造
- 限時優惠和早鳥福利

### 8. FAQ區 - 疑慮消除
- 常見疑慮和反對意見解答
- 手風琴式展開設計
- 消除購買阻力和信任障礙
- 包含技術問題、時間安排、後續服務等

### 9. 最終CTA區 - 轉換完成
- 醒目的註冊表單設計
- 多個CTA按鈕和行動呼籲
- 風險消除承諾和保證
- 額外獎勵和價值提升說明
- 緊急感和稀缺性再次強調

## 轉換優化要求
- 使用心理觸發點：稀缺性、社會證明、權威性、緊急感
- 清晰的價值主張和利益點
- 消除所有可能的購買阻力
- 多個轉換點設計
- 視覺層次分明，引導視線流向CTA

## 技術實現要求
- 完全響應式設計 (Mobile-first)
- 現代化的視覺設計
- 流暢的動畫效果
- 表單驗證和提交處理
- 追蹤代碼整合準備

## 內容風格
- 使用繁體中文
- 專業但親切的語調
- 具體的數字和數據
- 情感化的描述
- 行動導向的語言

## 重要技術要求
請創建一個完整的、可直接使用的webinar funnel landing page，必須包含：

### HTML結構要求：
1. 完整的HTML5文檔結構（DOCTYPE html, html, head, body）
2. 正確的meta標籤（charset, viewport, title, description, og tags）
3. 響應式設計的viewport設置
4. 完整的頁面內容結構，包含所有9個核心區塊
5. 表單元素必須包含所有指定的聯絡信息欄位
6. 所有圖片使用提供的照片URL或適當的佔位符
7. 語義化HTML標籤和無障礙設計

### CSS樣式要求：
1. 現代化的響應式設計，Mobile-first approach
2. 根據視覺偏好選擇合適的配色方案和字體
3. 使用提供的品牌色彩（如果有的話）
4. 流暢的動畫和過渡效果（hover, scroll, loading）
5. 專業的視覺層次和排版設計
6. 高轉換率的視覺元素（按鈕、表單、CTA）
7. 漸變背景、陰影效果、圓角設計等現代元素

### JavaScript功能要求：
1. 表單驗證和提交處理
2. 模態框開關功能和動畫效果
3. FAQ手風琴展開/收合功能
4. 動態倒計時器功能
5. 平滑滾動效果和錨點導航
6. 表單提交到 /api/leads 端點
7. 滾動動畫和元素顯示效果
8. 表單字段驗證和錯誤提示

### 內容要求：
- 只使用客戶提供的具體信息，不要添加虛假或示例內容
- 如果某個欄位為空，則不要包含相關內容
- 確保所有文字內容都是繁體中文
- 使用專業但親切的語調，符合目標受眾
- 包含具體的數字、數據和成果承諾
- 使用轉換心理學的文案技巧

請以JSON格式返回：
{
  "html": "完整的HTML5文檔代碼，包含DOCTYPE、head、body等完整結構",
  "css": "完整的CSS樣式代碼，包含響應式設計和動畫效果", 
  "js": "完整的JavaScript代碼，包含所有互動功能",
  "title": "頁面標題",
  "metaDescription": "頁面描述"
}`

    // Generate landing page with AI
    let aiResponse: string | null = null
    try {
      console.log('Attempting to call AIML API with model: gpt-4o')
      const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
      const baseURL = process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1"
      console.log('API Key (first 8 chars):', apiKey.substring(0, 8) + "...")
      console.log('Base URL:', baseURL)
      console.log('Using environment variable:', !!process.env.OPENAI_API_KEY)
      
      // Check if we have a valid API key
      if (!apiKey || apiKey.length < 10) {
        throw new Error('Invalid API key configuration')
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `你是一個專業的轉換優化專家和網頁設計師，專門創建高轉換率的webinar funnel landing page。你精通轉換心理學、用戶體驗設計，以及現代網頁開發技術。你的任務是創建完整的、專業級的webinar funnel頁面，具有強大的視覺吸引力和高轉換率。`
          },
          {
            role: "user",
            content: `請根據客戶填寫的信息，創建一個高轉換的 webinar funnel landing page，目的是收集客戶leads, 利用客戶填寫的內容進行拓展，生成豐富的webinar funnel page：

## 頁面要求
請創建一個完整的 webinar funnel 頁面，包含以下元素：

1. **響應式設計**: Mobile-first，支援各種設備
2. **核心組件**: Hero區、價值主張、講師介紹、社會證明、FAQ、註冊表單
3. **轉換心理學**: 稀缺性、緊急感、社會證明、價值對比
4. **互動功能**: Modal表單、平滑滾動、手風琴效果

## 內容要求
- 使用繁體中文
- 符合目標受眾的語調和痛點
- 包含具體的學習成果承諾
- 整合提供的社會證明和成功案例
- 創建吸引人的標題和副標題
- 列出webinar內容及價值

## 技術輸出
請提供：
1. 完整的HTML頁面代碼
2. CSS樣式文件（包含指定的視覺風格）
3. JavaScript互動功能
4. 註冊表單
5. 成功頁面設計

請確保頁面具有高轉換率，視覺吸引力強，並完全符合客戶的業務需求。

${prompt}`
          }
        ]
      })

      aiResponse = completion.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('AI generation failed - no response content')
      }
      console.log('AI API call successful')
    } catch (openaiError) {
      const errorDetails = {
        message: openaiError instanceof Error ? openaiError.message : 'Unknown error',
        status: (openaiError as any)?.status,
        statusText: (openaiError as any)?.statusText,
        response: (openaiError as any)?.response?.data,
        apiKey: process.env.OPENAI_API_KEY ? 'Using env var' : 'Using fallback key',
        baseURL: process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1"
      }
      
      console.error('OpenAI API error details:', errorDetails)
      
      // Provide specific guidance for different error types
      if ((openaiError as any)?.status === 401) {
        console.error('401 Unauthorized Error - Possible causes:')
        console.error('1. API key is invalid or expired')
        console.error('2. API key format is incorrect')
        console.error('3. API key is not authorized for AIML API service')
        console.error('4. Check your AIML API account status and billing')
      } else if ((openaiError as any)?.status === 403) {
        console.error('403 Forbidden Error - Possible causes:')
        console.error('1. API key has insufficient permissions')
        console.error('2. API key has reached quota limits')
        console.error('3. AIML API service is temporarily unavailable')
        console.error('4. Account suspended or restricted')
      }
      
      // If API fails (quota exceeded, 403, or any other error), use mock data for testing
      console.log('Using mock data due to API error:', openaiError instanceof Error ? openaiError.message : 'Unknown error')
        aiResponse = JSON.stringify({
          html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessInfo} - 專業Webinar</title>
    <meta name="description" content="${webinarContent}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="webinar-landing-page">
        <!-- Hero Section -->
        <header class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <div class="urgency-banner">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>限時免費！僅剩最後 ${Math.floor(Math.random() * 20) + 10} 個名額</span>
                    </div>
                    <h1 class="hero-title">掌握${businessInfo}的完整秘訣</h1>
                    <p class="hero-subtitle">${webinarContent} - 從零開始，快速掌握核心技能</p>
                    <div class="hero-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>立即獲得實用技能</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>專業講師一對一指導</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>終身學習資源</span>
                        </div>
                    </div>
                    <div class="hero-cta">
                        <button class="cta-button primary" onclick="openModal()">
                            <i class="fas fa-rocket"></i>
                            立即搶先報名
                        </button>
                        <p class="cta-subtitle">100% 免費 • 無需信用卡 • 立即開始</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Problem Section -->
        <section class="problem-section">
            <div class="container">
                <h2>您是否遇到這些問題？</h2>
                <div class="problems-grid">
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>缺乏系統性學習</h3>
                        <p>不知道從哪裡開始，學習路徑混亂</p>
                    </div>
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>實戰經驗不足</h3>
                        <p>理論知識豐富，但實際應用困難</p>
                    </div>
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>時間成本太高</h3>
                        <p>自學需要大量時間，效率低下</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Solution Section -->
        <section class="solution-section">
            <div class="container">
                <h2>我們為您提供完整解決方案</h2>
                <div class="solution-content">
                    <div class="solution-left">
                        <h3>您將學到什麼？</h3>
                        <ul class="learning-points">
                            <li><i class="fas fa-star"></i> ${businessInfo}的核心原理</li>
                            <li><i class="fas fa-star"></i> 實戰技巧和最佳實踐</li>
                            <li><i class="fas fa-star"></i> 常見問題解決方案</li>
                            <li><i class="fas fa-star"></i> 進階應用技巧</li>
                        </ul>
                    </div>
                    <div class="solution-right">
                        <div class="value-box">
                            <div class="value-amount">價值 $997</div>
                            <div class="current-price">今日免費</div>
                            <div class="savings">節省 100%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Instructor Section -->
        <section class="instructor-section">
            <div class="container">
                <h2>專業講師介紹</h2>
                <div class="instructor-card">
                    <div class="instructor-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="instructor-info">
                        <h3>資深${businessInfo}專家</h3>
                        <p class="instructor-credentials">${instructorCreds}</p>
                        <div class="instructor-stats">
                            <div class="stat-item">
                                <span class="stat-number">1000+</span>
                                <span class="stat-label">學員</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">5+</span>
                                <span class="stat-label">年經驗</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">98%</span>
                                <span class="stat-label">滿意度</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Proof -->
        <section class="social-proof">
            <div class="container">
                <h2>學員真實見證</h2>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <div class="testimonial-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <p>"參加這個webinar讓我對${businessInfo}有了全新的認識，講師的經驗分享非常實用！"</p>
                        <div class="testimonial-author">
                            <div class="author-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="author-info">
                                <div class="author-name">張先生</div>
                                <div class="author-title">${targetAudience}</div>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <div class="testimonial-rating">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <p>"講師的教學方法很清晰，讓我少走了很多彎路，強烈推薦給所有想學習${businessInfo}的朋友！"</p>
                        <div class="testimonial-author">
                            <div class="author-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="author-info">
                                <div class="author-name">李女士</div>
                                <div class="author-title">${targetAudience}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Urgency Section -->
        <section class="urgency-section">
            <div class="container">
                <div class="urgency-content">
                    <h2>時間緊迫！名額有限</h2>
                    <div class="countdown-timer" id="countdown">
                        <div class="countdown-item">
                            <span class="countdown-number" id="hours">24</span>
                            <span class="countdown-label">小時</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="minutes">00</span>
                            <span class="countdown-label">分鐘</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="seconds">00</span>
                            <span class="countdown-label">秒</span>
                        </div>
                    </div>
                    <p class="urgency-text">錯過這次機會，您將需要支付 $997 才能獲得相同內容</p>
                    <button class="cta-button urgency" onclick="openModal()">
                        <i class="fas fa-clock"></i>
                        立即搶先報名
                    </button>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
            <div class="container">
                <h2>常見問題</h2>
                <div class="faq-list">
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            這個webinar適合什麼程度的人參加？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>適合所有對${businessInfo}感興趣的${targetAudience}，從初學者到進階者都能有所收穫。我們會從基礎開始，逐步深入。</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            webinar會錄製嗎？可以重複觀看嗎？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>是的，我們會提供錄製版本給註冊的學員，您可以隨時回看學習，完全免費。</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            真的完全免費嗎？需要信用卡嗎？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>完全免費！不需要信用卡，只需要填寫基本信息即可參加。</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Final CTA Section -->
        <section class="final-cta-section">
            <div class="container">
                <div class="final-cta-content">
                    <h2>立即開始您的${businessInfo}學習之旅</h2>
                    <p>加入 ${Math.floor(Math.random() * 1000) + 500} 位學員的行列，立即獲得專業指導</p>
                    <button class="cta-button final" onclick="openModal()">
                        <i class="fas fa-graduation-cap"></i>
                        立即免費報名
                    </button>
                    <p class="guarantee">30天滿意保證 • 隨時可取消</p>
                </div>
            </div>
        </section>

        <!-- Registration Form Modal -->
        <div id="registrationModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <div class="modal-header">
                    <h2>立即免費報名</h2>
                    <p>填寫以下信息，立即開始學習</p>
                </div>
                <form class="registration-form" onsubmit="handleRegistration(event)">
                    <div class="form-group">
                        <label for="name">姓名 *</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">電話</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="question">相關問題或需求</label>
                        <textarea id="question" name="question" rows="3" placeholder="請告訴我們您的學習目標或任何問題"></textarea>
                    </div>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-paper-plane"></i>
                        確認報名
                    </button>
                    <p class="form-note">* 我們承諾保護您的隱私，不會向第三方分享您的信息</p>
                </form>
            </div>
        </div>
    </div>
</body>
</html>`,
          css: `/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Hero Section */
.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
}

.hero-content {
    position: relative;
    z-index: 2;
}

.urgency-banner {
    background: rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 25px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
    font-weight: 600;
    backdrop-filter: blur(10px);
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    line-height: 1.2;
}

.hero-subtitle {
    font-size: 1.4rem;
    margin-bottom: 40px;
    opacity: 0.95;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.hero-benefits {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
    font-weight: 500;
}

.benefit-item i {
    color: #4ade80;
    font-size: 1.2rem;
}

.hero-cta {
    margin-top: 40px;
}

.cta-button {
    background: linear-gradient(45deg, #ff6b6b, #ff8e53);
    color: white;
    border: none;
    padding: 20px 50px;
    font-size: 1.3rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 700;
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.cta-button:hover {
    background: linear-gradient(45deg, #ff5252, #ff7043);
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(255, 107, 107, 0.6);
}

.cta-subtitle {
    margin-top: 15px;
    font-size: 0.95rem;
    opacity: 0.9;
    font-weight: 500;
}

/* Problem Section */
.problem-section {
    padding: 80px 0;
    background: #f8f9fa;
}

.problem-section h2 {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: #2c3e50;
    font-weight: 700;
}

.problems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.problem-card {
    background: white;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.problem-card:hover {
    transform: translateY(-5px);
    border-color: #ff6b6b;
}

.problem-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    color: #ff6b6b;
}

.problem-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #2c3e50;
    font-weight: 600;
}

/* Solution Section */
.solution-section {
    padding: 80px 0;
    background: white;
}

.solution-section h2 {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: #2c3e50;
    font-weight: 700;
}

.solution-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 50px;
    align-items: center;
}

.solution-left h3 {
    font-size: 2rem;
    margin-bottom: 30px;
    color: #2c3e50;
}

.learning-points {
    list-style: none;
}

.learning-points li {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    font-size: 1.2rem;
    color: #555;
}

.learning-points i {
    color: #667eea;
    font-size: 1.3rem;
}

.value-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
}

.value-amount {
    font-size: 1.5rem;
    text-decoration: line-through;
    opacity: 0.8;
    margin-bottom: 10px;
}

.current-price {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 10px;
}

.savings {
    font-size: 1.2rem;
    font-weight: 600;
    color: #4ade80;
}

/* Instructor Section */
.instructor-section {
    padding: 80px 0;
    background: #f8f9fa;
}

.instructor-section h2 {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: #2c3e50;
    font-weight: 700;
}

.instructor-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px;
    border-radius: 25px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
    display: flex;
    align-items: center;
    gap: 40px;
    max-width: 800px;
    margin: 0 auto;
}

.instructor-avatar {
    font-size: 4rem;
    opacity: 0.9;
}

.instructor-info h3 {
    font-size: 2rem;
    margin-bottom: 15px;
    font-weight: 700;
}

.instructor-credentials {
    font-size: 1.3rem;
    margin: 20px 0;
    opacity: 0.9;
}

.instructor-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 30px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    color: #4ade80;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Social Proof */
.social-proof {
    padding: 80px 0;
    background: white;
}

.social-proof h2 {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: #2c3e50;
    font-weight: 700;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.testimonial-card {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.testimonial-card:hover {
    transform: translateY(-5px);
}

.testimonial-rating {
    margin-bottom: 20px;
}

.testimonial-rating i {
    color: #ffd700;
    font-size: 1.2rem;
    margin-right: 2px;
}

.testimonial-card p {
    font-style: italic;
    font-size: 1.1rem;
    margin-bottom: 25px;
    color: #555;
    line-height: 1.6;
}

.testimonial-author {
    display: flex;
    align-items: center;
    gap: 15px;
}

.author-avatar {
    width: 50px;
    height: 50px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.author-name {
    font-weight: 600;
    color: #2c3e50;
}

.author-title {
    font-size: 0.9rem;
    color: #667eea;
}

/* Urgency Section */
.urgency-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    color: white;
    text-align: center;
}

.urgency-content h2 {
    font-size: 2.8rem;
    margin-bottom: 30px;
    font-weight: 700;
}

.countdown-timer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 40px 0;
}

.countdown-item {
    background: rgba(255, 255, 255, 0.2);
    padding: 20px;
    border-radius: 15px;
    min-width: 80px;
}

.countdown-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 5px;
}

.countdown-label {
    font-size: 0.9rem;
    opacity: 0.9;
}

.urgency-text {
    font-size: 1.2rem;
    margin-bottom: 30px;
    font-weight: 600;
}

.cta-button.urgency {
    background: white;
    color: #ff6b6b;
    font-size: 1.4rem;
    padding: 25px 60px;
}

.cta-button.urgency:hover {
    background: #f8f9fa;
    transform: translateY(-3px);
}

/* FAQ Section */
.faq-section {
    padding: 80px 0;
    background: #f8f9fa;
}

.faq-section h2 {
    text-align: center;
    font-size: 2.8rem;
    margin-bottom: 60px;
    color: #2c3e50;
    font-weight: 700;
}

.faq-item {
    background: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.faq-item:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.faq-item h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.3rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
}

.faq-item h3 i:first-child {
    color: #667eea;
}

.faq-item h3 i:last-child {
    margin-left: auto;
    transition: transform 0.3s ease;
}

.faq-content {
    display: none;
    padding-top: 20px;
    border-top: 1px solid #eee;
    margin-top: 15px;
}

.faq-content.active {
    display: block;
}

.faq-item.active h3 i:last-child {
    transform: rotate(180deg);
}

/* Final CTA Section */
.final-cta-section {
    padding: 80px 0;
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    text-align: center;
}

.final-cta-content h2 {
    font-size: 2.8rem;
    margin-bottom: 20px;
    font-weight: 700;
}

.final-cta-content p {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.9;
}

.cta-button.final {
    background: linear-gradient(45deg, #4ade80, #22c55e);
    font-size: 1.4rem;
    padding: 25px 60px;
    margin-bottom: 20px;
}

.guarantee {
    font-size: 1rem;
    opacity: 0.8;
    font-weight: 500;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    backdrop-filter: blur(5px);
}

.modal-content {
    background-color: white;
    margin: 3% auto;
    padding: 0;
    border-radius: 25px;
    width: 90%;
    max-width: 600px;
    position: relative;
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    overflow: hidden;
}

.modal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    text-align: center;
}

.modal-header h2 {
    font-size: 2rem;
    margin-bottom: 10px;
    font-weight: 700;
}

.modal-header p {
    opacity: 0.9;
    font-size: 1.1rem;
}

.close {
    color: white;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 20px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.close:hover {
    opacity: 1;
}

.registration-form {
    padding: 40px;
}

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
    font-size: 1rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 18px 30px;
    font-size: 1.2rem;
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.submit-btn:hover {
    background: linear-gradient(45deg, #5a6fd8, #6a5acd);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.form-note {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-subtitle {
        font-size: 1.2rem;
    }
    
    .hero-benefits {
        flex-direction: column;
        gap: 15px;
    }
    
    .solution-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .instructor-card {
        flex-direction: column;
        padding: 40px 30px;
    }
    
    .instructor-stats {
        gap: 20px;
    }
    
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .countdown-timer {
        gap: 10px;
    }
    
    .countdown-item {
        min-width: 60px;
        padding: 15px;
    }
    
    .countdown-number {
        font-size: 2rem;
    }
    
    .modal-content {
        margin: 5% auto;
        width: 95%;
    }
    
    .modal-header,
    .registration-form {
        padding: 30px 20px;
    }
}`,
          js: `// Modal functionality
function openModal() {
    document.getElementById('registrationModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('registrationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('registrationModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Form submission
async function handleRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        pageId: window.location.search.split('=')[1] || '',
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        instagram: formData.get('instagram') || '',
        additionalInfo: formData.get('question') || ''
    };
    
    console.log('Submitting registration data:', data);
    
    try {
        // Get the current domain and construct the API URL
        const currentOrigin = window.location.origin;
        const apiUrl = currentOrigin + '/api/leads';
        
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Success response:', result);
            
            // Show success message
            alert('感謝您的註冊！我們會盡快與您聯繫確認詳情。');
            closeModal();
            
            // Reset form
            event.target.reset();
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to submit registration: ' + response.status);
        }
    } catch (error) {
        console.error('Error submitting registration:', error);
        alert('抱歉，提交時發生錯誤。請稍後再試。錯誤詳情: ' + error.message);
    }
}

// FAQ Toggle functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const content = faqItem.querySelector('.faq-content');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            item.querySelector('.faq-content').classList.remove('active');
        }
    });
    
    // Toggle current FAQ item
    faqItem.classList.toggle('active');
    content.classList.toggle('active');
}

// Countdown Timer
function startCountdown() {
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // Set countdown to 24 hours from now
    let totalSeconds = 24 * 60 * 60;
    
    const countdown = setInterval(function() {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        if (totalSeconds <= 0) {
            clearInterval(countdown);
            // Reset to 24 hours
            totalSeconds = 24 * 60 * 60;
        }
        
        totalSeconds--;
    }, 1000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.problem-card, .testimonial-card, .faq-item, .benefit-item');
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.8 && position.bottom >= 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize animations and functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    const elements = document.querySelectorAll('.problem-card, .testimonial-card, .faq-item, .benefit-item');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
    
    // Start countdown timer
    startCountdown();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    
    // Trigger initial animation check
    animateOnScroll();
    
    // Add hover effects for CTA buttons
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add form validation
    const form = document.querySelector('.registration-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            
            if (!name || !email) {
                e.preventDefault();
                alert('請填寫姓名和Email欄位');
                return false;
            }
            
            if (!email.includes('@')) {
                e.preventDefault();
                alert('請輸入有效的Email地址');
                return false;
            }
        });
    }
});

// Add urgency effect to CTA buttons
function addUrgencyEffect() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        setInterval(() => {
            button.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6)';
            setTimeout(() => {
                button.style.boxShadow = '';
            }, 500);
        }, 3000);
    });
}

// Start urgency effect after page load
window.addEventListener('load', addUrgencyEffect);`,
          title: `${businessInfo} - 專業Webinar`,
          metaDescription: `${webinarContent} - 立即註冊參加專業webinar，掌握${businessInfo}的核心技能`
        })
    }

    // Generate CSS based on visual style preference and brand colors
    const generateCSS = (style: string, brandColors?: string) => {
      // Parse brand colors if provided
      let primaryColor = '#667eea'
      let secondaryColor = '#764ba2'
      let accentColor = '#ff6b6b'
      
      if (brandColors && brandColors.trim()) {
        const colors = brandColors.split(',').map(c => c.trim().replace('#', ''))
        if (colors.length >= 1) primaryColor = '#' + colors[0]
        if (colors.length >= 2) secondaryColor = '#' + colors[1]
        if (colors.length >= 3) accentColor = '#' + colors[2]
      }

      const baseCSS = `/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 0 15px;
    }
}`

      let styleCSS = ''
      
      switch (style) {
        case '現代簡約':
          styleCSS = `
/* Modern Minimalist Style */
.hero-section {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.cta-button {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px ${primaryColor}40;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${primaryColor}60;
}`
          break
          
        case '溫暖生活化':
          styleCSS = `
/* Warm Lifestyle Style */
.hero-section {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    color: #2d3748;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.cta-button {
    background: linear-gradient(135deg, ${accentColor} 0%, #fecfef 100%);
    color: #2d3748;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px ${accentColor}40;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${accentColor}60;
}`
          break
          
        case '專業商務':
          styleCSS = `
/* Professional Business Style */
.hero-section {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: white;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.cta-button {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px ${primaryColor}40;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${primaryColor}60;
}`
          break
          
        case '創意活潑':
          styleCSS = `
/* Creative Playful Style */
.hero-section {
    background: linear-gradient(135deg, ${accentColor} 0%, #4ecdc4 100%);
    color: white;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.cta-button {
    background: linear-gradient(135deg, ${accentColor} 0%, #4ecdc4 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px ${accentColor}40;
}

.cta-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px ${accentColor}60;
}`
          break
          
        default:
          styleCSS = `
/* Default Modern Style */
.hero-section {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
    padding: 100px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.cta-button {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px ${primaryColor}40;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${primaryColor}60;
}`
      }
      
      return baseCSS + styleCSS
    }

    // Parse AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
      // Apply visual style to AI-generated CSS
      if (parsedResponse.css) {
        parsedResponse.css = generateCSS(visualStyle, brandColors) + '\n' + parsedResponse.css
      } else {
        parsedResponse.css = generateCSS(visualStyle, brandColors)
      }
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error)
      // If AI didn't return valid JSON, create a comprehensive HTML structure
      const completeHTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cleanData.businessInfo || 'Webinar'} - 專業Webinar</title>
    <meta name="description" content="${cleanData.webinarContent || '專業Webinar課程'}">
    <meta property="og:title" content="${cleanData.businessInfo || 'Webinar'} - 專業Webinar">
    <meta property="og:description" content="${cleanData.webinarContent || '專業Webinar課程'}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="webinar-landing-page">
        <!-- Hero Section -->
        <header class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <div class="urgency-banner">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>限時免費！僅剩最後 15 個名額</span>
                    </div>
                    <h1 class="hero-title">掌握${cleanData.businessInfo || '專業技能'}的完整秘訣</h1>
                    <p class="hero-subtitle">${cleanData.webinarContent || '立即註冊參加專業webinar，掌握核心技能'}</p>
                    <div class="hero-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>立即獲得實用技能</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>專業講師一對一指導</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>終身學習資源</span>
                        </div>
                    </div>
                    <div class="hero-cta">
                        <button class="cta-button primary" onclick="openModal()">
                            <i class="fas fa-rocket"></i>
                            立即搶先報名
                        </button>
                        <p class="cta-subtitle">100% 免費 • 無需信用卡 • 立即開始</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Problem Section -->
        <section class="problem-section">
            <div class="container">
                <h2>您是否遇到這些問題？</h2>
                <div class="problems-grid">
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>缺乏系統性學習</h3>
                        <p>不知道從哪裡開始，學習路徑混亂</p>
                    </div>
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>實戰經驗不足</h3>
                        <p>理論知識豐富，但實際應用困難</p>
                    </div>
                    <div class="problem-card">
                        <div class="problem-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <h3>時間成本太高</h3>
                        <p>自學需要大量時間，效率低下</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Solution Section -->
        <section class="solution-section">
            <div class="container">
                <h2>我們為您提供完整解決方案</h2>
                <div class="solution-content">
                    <div class="solution-left">
                        <h3>您將學到什麼？</h3>
                        <ul class="learning-points">
                            <li><i class="fas fa-star"></i> ${cleanData.businessInfo || '專業技能'}的核心原理</li>
                            <li><i class="fas fa-star"></i> 實戰技巧和最佳實踐</li>
                            <li><i class="fas fa-star"></i> 常見問題解決方案</li>
                            <li><i class="fas fa-star"></i> 進階應用技巧</li>
                        </ul>
                    </div>
                    <div class="solution-right">
                        <div class="value-box">
                            <div class="value-amount">價值 $997</div>
                            <div class="current-price">今日免費</div>
                            <div class="savings">節省 100%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Instructor Section -->
        <section class="instructor-section">
            <div class="container">
                <h2>專業講師介紹</h2>
                <div class="instructor-card">
                    <div class="instructor-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="instructor-info">
                        <h3>資深${cleanData.businessInfo || '專業'}專家</h3>
                        <p class="instructor-credentials">${cleanData.instructorCreds || '擁有豐富的實戰經驗和專業知識'}</p>
                        <div class="instructor-stats">
                            <div class="stat-item">
                                <span class="stat-number">1000+</span>
                                <span class="stat-label">學員</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">5+</span>
                                <span class="stat-label">年經驗</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">98%</span>
                                <span class="stat-label">滿意度</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Urgency Section -->
        <section class="urgency-section">
            <div class="container">
                <div class="urgency-content">
                    <h2>時間緊迫！名額有限</h2>
                    <div class="countdown-timer" id="countdown">
                        <div class="countdown-item">
                            <span class="countdown-number" id="hours">24</span>
                            <span class="countdown-label">小時</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="minutes">00</span>
                            <span class="countdown-label">分鐘</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number" id="seconds">00</span>
                            <span class="countdown-label">秒</span>
                        </div>
                    </div>
                    <p class="urgency-text">錯過這次機會，您將需要支付 $997 才能獲得相同內容</p>
                    <button class="cta-button urgency" onclick="openModal()">
                        <i class="fas fa-clock"></i>
                        立即搶先報名
                    </button>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
            <div class="container">
                <h2>常見問題</h2>
                <div class="faq-list">
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            這個webinar適合什麼程度的人參加？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>適合所有對${cleanData.businessInfo || '專業技能'}感興趣的${cleanData.targetAudience || '學習者'}，從初學者到進階者都能有所收穫。我們會從基礎開始，逐步深入。</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            webinar會錄製嗎？可以重複觀看嗎？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>是的，我們會提供錄製版本給註冊的學員，您可以隨時回看學習，完全免費。</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <h3 onclick="toggleFAQ(this)">
                            <i class="fas fa-question-circle"></i>
                            真的完全免費嗎？需要信用卡嗎？
                            <i class="fas fa-chevron-down"></i>
                        </h3>
                        <div class="faq-content">
                            <p>完全免費！不需要信用卡，只需要填寫基本信息即可參加。</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Final CTA Section -->
        <section class="final-cta-section">
            <div class="container">
                <div class="final-cta-content">
                    <h2>立即開始您的${cleanData.businessInfo || '專業技能'}學習之旅</h2>
                    <p>加入 500+ 位學員的行列，立即獲得專業指導</p>
                    <button class="cta-button final" onclick="openModal()">
                        <i class="fas fa-graduation-cap"></i>
                        立即免費報名
                    </button>
                    <p class="guarantee">30天滿意保證 • 隨時可取消</p>
                </div>
            </div>
        </section>
        
        <!-- Registration Form Modal -->
        <div id="registrationModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <div class="modal-header">
                    <h2>立即免費報名</h2>
                    <p>填寫以下信息，立即開始學習</p>
                </div>
                <form class="registration-form" onsubmit="handleRegistration(event)">
                    ${cleanData.contactFields.includes('姓名') ? '<div class="form-group"><label for="name">姓名 *</label><input type="text" id="name" name="name" required></div>' : ''}
                    ${cleanData.contactFields.includes('Email') ? '<div class="form-group"><label for="email">Email *</label><input type="email" id="email" name="email" required></div>' : ''}
                    ${cleanData.contactFields.includes('電話') ? '<div class="form-group"><label for="phone">電話</label><input type="tel" id="phone" name="phone"></div>' : ''}
                    ${cleanData.contactFields.includes('Instagram帳號') ? '<div class="form-group"><label for="instagram">Instagram帳號</label><input type="text" id="instagram" name="instagram"></div>' : ''}
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-paper-plane"></i>
                        確認報名
                    </button>
                    <p class="form-note">* 我們承諾保護您的隱私，不會向第三方分享您的信息</p>
                </form>
            </div>
        </div>
    </div>
</body>
</html>`

      parsedResponse = {
        html: completeHTML,
        css: generateCSS(visualStyle, brandColors),
        js: `function openModal() { document.getElementById('registrationModal').style.display = 'block'; }
function closeModal() { document.getElementById('registrationModal').style.display = 'none'; }
async function handleRegistration(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        pageId: window.location.search.split('=')[1] || '',
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        instagram: formData.get('instagram') || '',
        additionalInfo: ''
    };
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('感謝您的註冊！');
            closeModal();
            event.target.reset();
        }
    } catch (error) {
        alert('提交時發生錯誤，請稍後再試。');
    }
}`,
        title: `${cleanData.businessInfo || 'Webinar'} - 專業Webinar`,
        metaDescription: cleanData.webinarContent || '專業Webinar課程'
      }
    }

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

    // Get the authenticated user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
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
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      pageId: landingPage.id,
      message: 'Landing page generated successfully'
    })

  } catch (error) {
    console.error('Error generating landing page:', error)
    
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate landing page',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        environment: {
          openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
          databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
        }
      },
      { status: 500 }
    )
  }
}
