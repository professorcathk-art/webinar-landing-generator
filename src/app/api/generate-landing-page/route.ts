import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VERCEL_OPENAI_API_KEY,
})

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Generate landing page API is accessible',
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

    // Create AI prompt
    const prompt = `請根據以下客戶信息，創建一個高轉換的 webinar funnel landing page，目的是收集客戶leads：

## 客戶背景信息
**業務描述**: ${businessInfo}
**Webinar內容**: ${webinarContent}
**目標受眾**: ${targetAudience}
**Webinar詳情**: ${webinarInfo}
**講師資歷**: ${instructorCreds}
**需要收集的用戶聯絡信息**: ${contactFields.join(', ')}
**視覺偏好**: ${visualStyle || '未指定'}
**獨特賣點**: ${uniqueSellingPoints || '未指定'}
**Upsell轉換目標**: ${upsellProducts || '未指定'}
**特殊需求**: ${specialRequirements || '無'}
**相關照片**: ${photoUrls.length > 0 ? photoUrls.join(', ') : '無'}

## 頁面要求
請創建一個完整的 webinar funnel 頁面，包含以下元素：

1. **響應式設計**: Mobile-first，支援各種設備
2. **核心組件**: Hero區、價值主張、講師介紹、社會證明、FAQ、註冊表單
3. **轉換心理學**: 稀缺性、緊急感、社會證明、價值對比
4. **互動功能**: Modal表單、平滑滾動、手風琴效果
5. **追蹤整合**: 準備GA4和Facebook Pixel整合

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
4. 註冊表單（姓名、Email、電話、相關問題）
5. 成功頁面設計

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
    let aiResponse: string | null = null
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一個專業的網頁設計師和轉換優化專家，專門創建高轉換率的webinar登陸頁面。你擅長創建視覺吸引力強、轉換率高的專業landing page，包含完整的HTML結構、現代CSS樣式、互動JavaScript功能，以及符合轉換心理學的內容設計。請確保生成的頁面具有專業的外觀、響應式設計、完整的表單功能，並且完全符合客戶的業務需求。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      })

      aiResponse = completion.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('AI generation failed - no response content')
      }
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      
      // If quota exceeded, use mock data for testing
      if (openaiError instanceof Error && openaiError.message.includes('429')) {
        console.log('Using mock data due to OpenAI quota exceeded')
        aiResponse = JSON.stringify({
          html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessInfo} - 專業Webinar</title>
    <meta name="description" content="${webinarContent}">
</head>
<body>
    <div class="webinar-landing-page">
        <!-- Hero Section -->
        <header class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">${businessInfo}</h1>
                    <p class="hero-subtitle">${webinarContent}</p>
                    <div class="hero-cta">
                        <button class="cta-button primary" onclick="openModal()">立即註冊參加</button>
                        <p class="urgency-text">⚠️ 名額有限，僅剩最後 ${Math.floor(Math.random() * 20) + 10} 個名額</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Value Proposition -->
        <section class="value-prop">
            <div class="container">
                <h2>您將學到什麼？</h2>
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <div class="benefit-icon">🎯</div>
                        <h3>實用技能</h3>
                        <p>掌握${businessInfo}的核心技能和實戰技巧</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">💡</div>
                        <h3>專業指導</h3>
                        <p>獲得資深專家的專業指導和經驗分享</p>
                    </div>
                    <div class="benefit-card">
                        <div class="benefit-icon">🚀</div>
                        <h3>實戰應用</h3>
                        <p>學習如何將理論應用到實際工作中</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Instructor Section -->
        <section class="instructor-section">
            <div class="container">
                <h2>講師介紹</h2>
                <div class="instructor-card">
                    <div class="instructor-info">
                        <h3>專業講師</h3>
                        <p class="instructor-credentials">${instructorCreds}</p>
                        <ul class="instructor-highlights">
                            <li>✅ 豐富的實戰經驗</li>
                            <li>✅ 專業的教學方法</li>
                            <li>✅ 學員好評如潮</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Proof -->
        <section class="social-proof">
            <div class="container">
                <h2>學員見證</h2>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <p>"參加這個webinar讓我對${businessInfo}有了全新的認識，非常實用！"</p>
                        <div class="testimonial-author">- 張先生，${targetAudience}</div>
                    </div>
                    <div class="testimonial-card">
                        <p>"講師的經驗分享讓我少走了很多彎路，強烈推薦！"</p>
                        <div class="testimonial-author">- 李女士，${targetAudience}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section">
            <div class="container">
                <h2>常見問題</h2>
                <div class="faq-list">
                    <div class="faq-item">
                        <h3>這個webinar適合什麼程度的人參加？</h3>
                        <p>適合所有對${businessInfo}感興趣的${targetAudience}，從初學者到進階者都能有所收穫。</p>
                    </div>
                    <div class="faq-item">
                        <h3>webinar會錄製嗎？</h3>
                        <p>是的，我們會提供錄製版本給註冊的學員，方便您隨時回看學習。</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Registration Form Modal -->
        <div id="registrationModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <h2>立即註冊參加</h2>
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
                        <label for="question">相關問題</label>
                        <textarea id="question" name="question" rows="3"></textarea>
                    </div>
                    <button type="submit" class="submit-btn">確認註冊</button>
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
    padding: 80px 0;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 30px;
    opacity: 0.9;
}

.hero-cta {
    margin-top: 40px;
}

.cta-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 18px 40px;
    font-size: 1.2rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.cta-button:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.urgency-text {
    margin-top: 15px;
    font-size: 0.9rem;
    opacity: 0.8;
}

/* Value Proposition */
.value-prop {
    padding: 80px 0;
    background: #f8f9fa;
}

.value-prop h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.benefit-card {
    background: white;
    padding: 40px 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.benefit-card:hover {
    transform: translateY(-5px);
}

.benefit-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.benefit-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #2c3e50;
}

/* Instructor Section */
.instructor-section {
    padding: 80px 0;
    background: white;
}

.instructor-section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

.instructor-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 50px;
    border-radius: 20px;
    text-align: center;
}

.instructor-credentials {
    font-size: 1.2rem;
    margin: 20px 0;
    opacity: 0.9;
}

.instructor-highlights {
    list-style: none;
    margin-top: 30px;
}

.instructor-highlights li {
    margin: 10px 0;
    font-size: 1.1rem;
}

/* Social Proof */
.social-proof {
    padding: 80px 0;
    background: #f8f9fa;
}

.social-proof h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.testimonial-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.testimonial-card p {
    font-style: italic;
    font-size: 1.1rem;
    margin-bottom: 20px;
    color: #555;
}

.testimonial-author {
    font-weight: 600;
    color: #667eea;
}

/* FAQ Section */
.faq-section {
    padding: 80px 0;
    background: white;
}

.faq-section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 50px;
    color: #2c3e50;
}

.faq-item {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.faq-item h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.2rem;
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
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 40px;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    position: relative;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 15px;
}

.close:hover {
    color: #000;
}

.registration-form {
    margin-top: 30px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.submit-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    font-weight: 600;
    transition: background 0.3s ease;
}

.submit-btn:hover {
    background: #5a6fd8;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-subtitle {
        font-size: 1.1rem;
    }
    
    .benefits-grid,
    .testimonials-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-content {
        margin: 10% auto;
        padding: 20px;
        width: 95%;
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
function handleRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        question: formData.get('question')
    };
    
    // Here you would typically send the data to your server
    console.log('Registration data:', data);
    
    // Show success message
    alert('感謝您的註冊！我們會盡快與您聯繫確認詳情。');
    closeModal();
    
    // Reset form
    event.target.reset();
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

// Add scroll animations
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.benefit-card, .testimonial-card, .faq-item');
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight && position.bottom >= 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// Initialize animations
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.benefit-card, .testimonial-card, .faq-item');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});`,
          title: `${businessInfo} - 專業Webinar`,
          metaDescription: `${webinarContent} - 立即註冊參加專業webinar，掌握${businessInfo}的核心技能`
        })
      } else {
        throw new Error(`OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`)
      }
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

    // Create or get default user for demo purposes
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'demo@webinar-generator.com' }
    })
    
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'demo@webinar-generator.com',
          name: 'Demo User',
          password: 'demo-password-hash', // This should be properly hashed in production
        }
      })
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
        userId: defaultUser.id,
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
