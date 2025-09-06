// DOM elements
const floatingSupport = document.getElementById('floatingSupport');
const contactForm = document.getElementById('contactForm');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeFloatingSupport();
    initializeFormHandling();
    initializeAnimations();
    initializeSmoothScroll();
    initializeWarmInteractions();
    initializeCTAButtons();
    console.log('💕 溫暖陪伴應用程式已準備就緒');
});

// Initialize CTA buttons
function initializeCTAButtons() {
    const ctaButtons = document.querySelectorAll('.hero__cta');
    console.log(`找到 ${ctaButtons.length} 個 CTA 按鈕`);
    
    ctaButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`CTA 按鈕 ${index + 1} 被點擊`);
            scrollToSolution();
        });
    });
}

// Initialize floating support functionality
function initializeFloatingSupport() {
    if (!floatingSupport) return;
    
    // Show floating support after scrolling
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        if (scrollPosition > windowHeight * 0.3) {
            floatingSupport.classList.add('visible');
        } else {
            floatingSupport.classList.remove('visible');
        }
    });
    
    // Click handler for floating support
    floatingSupport.addEventListener('click', function(e) {
        e.preventDefault();
        scrollToContact();
        showWarmMessage('我們很高興您想要聯繫我們！讓我們一起開始這段溫暖的對話吧 💕', 'info');
    });
}

// Smooth scroll to contact section
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Focus on first form field after scrolling
        setTimeout(() => {
            const firstInput = document.getElementById('name');
            if (firstInput) {
                firstInput.focus();
            }
        }, 800);
        console.log('滾動到聯絡表單');
    } else {
        console.error('找不到聯絡區段');
    }
}

// Scroll to solution section
function scrollToSolution() {
    const solutionSection = document.getElementById('solution');
    if (solutionSection) {
        solutionSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        console.log('滾動到解決方案區段');
    } else {
        console.error('找不到解決方案區段');
    }
}

// Initialize form handling with warm approach
function initializeFormHandling() {
    if (!contactForm) {
        console.error('聯絡表單未找到');
        return;
    }
    
    console.log('💝 表單處理已初始化，準備接收您的溫暖訊息');
    
    // Add gentle form validation feedback
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        // Ensure inputs are functional
        input.addEventListener('input', function() {
            console.log('輸入變更:', this.name, this.value);
            if (this.value.trim()) {
                clearFieldFeedback(this);
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                showFieldFeedback(this, '請別忘了填寫這個欄位，我們想要更了解您 🌸', 'gentle-reminder');
            } else if (this.value.trim()) {
                showFieldFeedback(this, '謝謝您的分享 💕', 'appreciation');
            }
        });
        
        input.addEventListener('focus', function() {
            clearFieldFeedback(this);
        });
    });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('💌 收到您的溫暖訊息');
        
        // Get form elements
        const nameEl = document.getElementById('name');
        const contactEl = document.getElementById('contact');
        const concernEl = document.getElementById('concern');
        
        if (!nameEl || !contactEl) {
            console.error('表單元素未找到');
            showWarmMessage('表單出現小問題，請重新整理頁面再試一次 😔', 'error');
            return;
        }
        
        // Get form data
        const formData = {
            name: nameEl.value.trim(),
            contact: contactEl.value.trim(),
            concern: concernEl ? concernEl.value.trim() : ''
        };
        
        console.log('收到的訊息:', formData);
        
        // Validate with warm messages
        if (!formData.name) {
            showWarmMessage('親愛的朋友，請告訴我們您的名字，這樣我們就能更親切地稱呼您了 🌸', 'gentle');
            nameEl.focus();
            showFieldFeedback(nameEl, '請輸入您的名字 🌸', 'gentle-reminder');
            return;
        }
        
        if (!formData.contact) {
            showWarmMessage('請分享您的聯絡方式，這樣我們就能與您保持溫暖的聯繫 💕', 'gentle');
            contactEl.focus();
            showFieldFeedback(contactEl, '請輸入您的聯絡方式 💕', 'gentle-reminder');
            return;
        }
        
        // Basic email validation if it looks like an email
        if (formData.contact.includes('@') && !isValidEmail(formData.contact)) {
            showWarmMessage('請確認您的電子郵件格式是否正確，這樣我們才能與您聯繫 💌', 'gentle');
            contactEl.focus();
            showFieldFeedback(contactEl, '請確認電子郵件格式 📧', 'gentle-reminder');
            return;
        }
        
        // Show loading state with warm message
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        const originalContent = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="btn-icon">🤗</span><span>正在用心處理您的訊息...</span>';
        submitButton.disabled = true;
        
        console.log('表單驗證通過，正在處理提交...');
        
        // Submit to leads API
        submitToLeadsAPI(formData)
            .then((result) => {
                // Reset button
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
                
                // Show success modal with warm approach
                showWarmSuccessModal(formData);
                
                // Reset form
                contactForm.reset();
                clearAllFieldFeedback();
                
                console.log('💕 訊息提交成功:', formData);
                
                // Track with warm analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'warm_contact_form_submit', {
                        'event_category': 'engagement',
                        'event_label': 'warm_companion',
                        'value': 1
                    });
                }
            })
            .catch((error) => {
                // Reset button
                submitButton.innerHTML = originalContent;
                submitButton.disabled = false;
                
                // Show error message
                showFieldFeedback(contactEl, '提交失敗，請稍後再試', 'error');
                console.error('Form submission error:', error);
            });
    });
}

// Simple email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field-specific feedback with warm tone
function showFieldFeedback(field, message, type) {
    clearFieldFeedback(field);
    
    const feedback = document.createElement('div');
    feedback.className = `field-feedback field-feedback--${type}`;
    feedback.style.cssText = `
        margin-top: var(--space-8);
        padding: var(--space-8) var(--space-12);
        border-radius: var(--radius-base);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        display: flex;
        align-items: center;
        gap: var(--space-8);
        animation: gentleFadeIn 0.3s ease-out;
    `;
    
    if (type === 'gentle-reminder') {
        feedback.style.background = 'var(--color-warm-bg-2)';
        feedback.style.color = 'var(--color-soft-teal)';
        feedback.style.border = '1px solid var(--color-soft-teal)';
    } else if (type === 'appreciation') {
        feedback.style.background = 'var(--color-warm-bg-3)';
        feedback.style.color = 'var(--color-mint-green)';
        feedback.style.border = '1px solid var(--color-mint-green)';
    }
    
    feedback.textContent = message;
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.appendChild(feedback);
    }
}

// Clear field feedback
function clearFieldFeedback(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const existingFeedback = formGroup.querySelector('.field-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
    }
}

// Clear all field feedback
function clearAllFieldFeedback() {
    const allFeedback = document.querySelectorAll('.field-feedback');
    allFeedback.forEach(feedback => feedback.remove());
}

// Show warm success modal
function showWarmSuccessModal(formData) {
    console.log('顯示溫暖成功訊息');
    
    // Remove any existing modals
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(93, 78, 117, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: warmFadeIn 0.5s ease-out;
        backdrop-filter: blur(8px);
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: var(--color-surface);
        padding: var(--space-32);
        border-radius: var(--radius-lg);
        max-width: 500px;
        margin: var(--space-16);
        text-align: center;
        animation: warmSlideIn 0.5s ease-out;
        border: 3px solid var(--color-soft-teal);
        box-shadow: 0 20px 40px rgba(78, 205, 196, 0.2);
        position: relative;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 60px; margin-bottom: var(--space-20);">🤗</div>
        <h2 style="color: var(--color-soft-teal); margin-bottom: var(--space-16); font-size: var(--font-size-2xl);">親愛的 ${formData.name}，謝謝您！</h2>
        <p style="margin-bottom: var(--space-20); color: var(--color-text); font-size: var(--font-size-lg); line-height: 1.6;">我們已經收到您溫暖的訊息了！您的信任讓我們感到非常溫暖和感動。</p>
        
        <div style="background: var(--color-warm-bg-2); padding: var(--space-20); border-radius: var(--radius-base); margin-bottom: var(--space-20); border-left: 4px solid var(--color-soft-teal);">
            <h4 style="margin: 0 0 var(--space-12) 0; color: var(--color-text);">💕 我們會這樣關懷您：</h4>
            <ul style="text-align: left; margin: 0; padding-left: var(--space-20); color: var(--color-text-secondary); line-height: 1.6;">
                <li>24小時內用最溫暖的方式與您聯繫</li>
                <li>仔細聆聽您的每一個需求和擔憂</li>
                <li>為您準備專屬的關懷方案</li>
                <li>陪伴您走過每一步成長旅程</li>
            </ul>
        </div>
        
        <div style="background: var(--color-warm-bg-3); padding: var(--space-16); border-radius: var(--radius-base); margin-bottom: var(--space-20);">
            <p style="margin: 0; color: var(--color-success); font-weight: var(--font-weight-medium); display: flex; align-items: center; justify-content: center; gap: var(--space-8);">
                <span>🌸</span>
                <span>在等待的這段時間，請記住您並不孤單</span>
            </p>
        </div>
        
        <button class="btn btn--primary modal-close-btn" style="background: linear-gradient(135deg, var(--color-primary), var(--color-gentle-orange)); border: none; color: white; padding: var(--space-12) var(--space-24); border-radius: var(--radius-lg); font-weight: var(--font-weight-bold);">
            <span style="margin-right: var(--space-8);">💝</span>
            <span>開始我們的溫暖旅程</span>
        </button>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add close handlers
    const closeBtn = modalContent.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeWarmModal(modalOverlay));
    }
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeWarmModal(modalOverlay);
        }
    });
    
    // Close modal with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeWarmModal(modalOverlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    console.log('💕 溫暖成功訊息已顯示');
}

// Close warm modal
function closeWarmModal(modalOverlay) {
    if (modalOverlay && modalOverlay.parentElement) {
        modalOverlay.style.animation = 'warmFadeOut 0.3s ease-out';
        const modalContent = modalOverlay.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'warmSlideOut 0.3s ease-out';
        }
        
        setTimeout(() => {
            if (modalOverlay.parentElement) {
                document.body.removeChild(modalOverlay);
                document.body.style.overflow = '';
            }
        }, 300);
    }
}

// Show warm messages
function showWarmMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.warm-message');
    existingMessages.forEach(msg => {
        msg.style.animation = 'gentleFadeOut 0.3s ease-out';
        setTimeout(() => {
            if (msg.parentElement) {
                msg.remove();
            }
        }, 300);
    });
    
    // Create warm message element
    const warmMessage = document.createElement('div');
    warmMessage.className = `warm-message warm-message--${type}`;
    warmMessage.style.cssText = `
        position: fixed;
        top: var(--space-20);
        right: var(--space-20);
        padding: var(--space-16) var(--space-20);
        border-radius: var(--radius-lg);
        font-weight: var(--font-weight-medium);
        z-index: 1500;
        animation: gentleFadeIn 0.5s ease-out;
        max-width: 400px;
        word-wrap: break-word;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: var(--space-12);
        backdrop-filter: blur(10px);
    `;
    
    // Set colors and styles based on type
    let icon = '';
    let bgColor = '';
    let textColor = '';
    let borderColor = '';
    
    if (type === 'error') {
        icon = '😔';
        bgColor = 'rgba(255, 107, 107, 0.1)';
        textColor = 'var(--color-primary)';
        borderColor = 'var(--color-primary)';
    } else if (type === 'success' || type === 'appreciation') {
        icon = '🌸';
        bgColor = 'var(--color-warm-bg-3)';
        textColor = 'var(--color-mint-green)';
        borderColor = 'var(--color-mint-green)';
    } else if (type === 'gentle' || type === 'gentle-reminder') {
        icon = '💕';
        bgColor = 'var(--color-warm-bg-2)';
        textColor = 'var(--color-soft-teal)';
        borderColor = 'var(--color-soft-teal)';
    } else {
        icon = '🤗';
        bgColor = 'var(--color-warm-bg-1)';
        textColor = 'var(--color-text)';
        borderColor = 'var(--color-border)';
    }
    
    warmMessage.style.background = bgColor;
    warmMessage.style.color = textColor;
    warmMessage.style.border = `2px solid ${borderColor}`;
    
    warmMessage.innerHTML = `
        <span style="font-size: var(--font-size-xl); flex-shrink: 0;">${icon}</span>
        <span style="line-height: 1.5;">${message}</span>
    `;
    
    document.body.appendChild(warmMessage);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (warmMessage.parentElement) {
            warmMessage.style.animation = 'gentleFadeOut 0.5s ease-out';
            setTimeout(() => {
                if (warmMessage.parentElement) {
                    warmMessage.remove();
                }
            }, 500);
        }
    }, 5000);
}

// Initialize animations on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.understanding-card, .feature-card, .trust-card, .testimonial-card, .step-item, .benefit-item'
    );
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize smooth scrolling
function initializeSmoothScroll() {
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
}

// Initialize warm interactions
function initializeWarmInteractions() {
    // Add gentle hover effects to cards
    const cards = document.querySelectorAll('.understanding-card, .feature-card, .trust-card, .testimonial-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-6px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add warm feedback to form interactions
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            this.style.borderColor = 'var(--color-soft-teal)';
            this.style.boxShadow = '0 0 0 3px rgba(78, 205, 196, 0.1)';
            this.style.transition = 'all 0.3s ease';
        });
        
        control.addEventListener('blur', function() {
            this.style.borderColor = 'var(--color-border)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add gentle button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.4)';
                this.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.3)';
            }
        });
    });
}

// Utility functions
function isMobile() {
    return window.innerWidth <= 768;
}

// Handle window resize with warm approach
window.addEventListener('resize', function() {
    if (isMobile()) {
        if (floatingSupport) {
            floatingSupport.style.left = 'var(--space-16)';
            floatingSupport.style.right = 'var(--space-16)';
            floatingSupport.style.bottom = 'var(--space-16)';
        }
    } else {
        if (floatingSupport) {
            floatingSupport.style.left = 'auto';
            floatingSupport.style.bottom = 'var(--space-20)';
            floatingSupport.style.right = 'var(--space-20)';
        }
    }
});

// Add warm CSS animations
const warmStyle = document.createElement('style');
warmStyle.textContent = `
    @keyframes warmFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes warmFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes warmSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes warmSlideOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
    }
    
    @keyframes gentleFadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes gentleFadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes gentle-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    
    @keyframes gentle-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
    }
    
    /* Initially hide elements that will animate in */
    .understanding-card,
    .feature-card,
    .trust-card,
    .testimonial-card,
    .step-item,
    .benefit-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Show elements when they have the fade-in-up class */
    .understanding-card.fade-in-up,
    .feature-card.fade-in-up,
    .trust-card.fade-in-up,
    .testimonial-card.fade-in-up,
    .step-item.fade-in-up,
    .benefit-item.fade-in-up {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Warm transitions for all interactive elements */
    .understanding-card,
    .feature-card,
    .trust-card,
    .testimonial-card,
    .btn {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Enhanced focus styles with warm colors */
    .form-control:focus {
        outline: none;
        border-color: var(--color-soft-teal) !important;
        box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.15) !important;
    }
    
    /* Warm loading state */
    .btn:disabled {
        opacity: 0.8 !important;
        cursor: not-allowed !important;
        transform: none !important;
        background: var(--color-warm-bg-2) !important;
        color: var(--color-text-secondary) !important;
    }
    
    /* Mobile-specific warm styles */
    @media (max-width: 768px) {
        .warm-message {
            left: var(--space-16) !important;
            right: var(--space-16) !important;
            max-width: none !important;
        }
        
        .modal-content {
            margin: var(--space-8) !important;
            max-width: none !important;
        }
    }
`;

// Append warm styles to head
if (document.head) {
    document.head.appendChild(warmStyle);
}

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

// Performance optimization: Debounce scroll events
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(function() {
        // Additional scroll-based functionality can be added here
    }, 16); // ~60fps
});

// Console welcome message with warm tone
console.log('%c🌸 歡迎來到溫暖陪伴的世界！', 'color: #FF6B6B; font-size: 18px; font-weight: bold;');
console.log('%c💕 我們準備用心聆聽您的每一個需求', 'color: #4ECDC4; font-size: 14px;');

// Error handling with warm approach
window.addEventListener('error', function(e) {
    console.error('應用程式出現小問題:', e.error);
    showWarmMessage('網頁出現了小問題，但請放心，這不影響我們對您的關懷 💕 如果問題持續，請重新整理頁面', 'gentle');
});

// Add GA4 and Facebook Pixel tracking with privacy focus
window.addEventListener('load', function() {
    // Only initialize analytics if user hasn't opted out
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: '溫暖親和風格漏斗模板 | 用心陪伴每一步成長',
            page_location: window.location.href,
            anonymize_ip: true, // Privacy-friendly
            respect_dnt: true
        });
    }
    
    if (typeof fbq !== 'undefined') {
        fbq('track', 'PageView');
    }
});

// Add accessibility improvements with warm approach
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
    
    // Ensure form elements have proper labels
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        const label = document.querySelector(`label[for="${control.id}"]`);
        if (label && !control.getAttribute('aria-describedby')) {
            control.setAttribute('aria-describedby', `${control.id}-help`);
        }
    });
    
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#contact';
    skipLink.textContent = '跳到聯絡表單';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
    `;
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
});

// Add warm welcome interaction
setTimeout(function() {
    if (sessionStorage.getItem('warm_welcome_shown') !== 'true') {
        showWarmMessage('歡迎來到我們溫暖的小角落！我們很高興您的到來 🌸', 'info');
        sessionStorage.setItem('warm_welcome_shown', 'true');
    }
}, 3000);

// Add gentle reminder for long-time visitors
let pageStartTime = Date.now();
setTimeout(function() {
    const timeOnPage = Date.now() - pageStartTime;
    const nameField = document.getElementById('name');
    if (timeOnPage > 60000 && nameField && !nameField.value) { // 1 minute
        showWarmMessage('如果您需要任何協助，請隨時與我們聯繫。我們隨時在這裡陪伴您 💕', 'gentle');
    }
}, 60000);

// Submit form data to leads API
async function submitToLeadsAPI(formData) {
    // Get page ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageId = urlParams.get('id') || window.location.pathname.split('/').pop();
    
    if (!pageId) {
        throw new Error('無法識別頁面ID');
    }
    
    // Prepare data for leads API
    const leadData = {
        pageId: pageId,
        name: formData.name || '',
        email: formData.contact || '', // warm-tone uses 'contact' field
        phone: '', // warm-tone doesn't have separate phone field
        instagram: '',
        additionalInfo: {
            formType: 'warm-tone-funnel',
            concern: formData.concern || '',
            submissionTime: new Date().toISOString(),
            userAgent: navigator.userAgent
        }
    };
    
    // Send to leads API
    const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || '提交失敗');
    }
    
    return result;
}

// Export for testing purposes
if (typeof window !== 'undefined') {
    window.warmCompanionApp = {
        scrollToContact,
        scrollToSolution,
        showWarmMessage,
        showWarmSuccessModal,
        submitToLeadsAPI
    };
}