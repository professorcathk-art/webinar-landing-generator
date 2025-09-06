// Vampire Sales Funnel - Aggressive Marketing JavaScript
// Global variables
let registrationModal = null;
let thankYouModal = null;
let registrationForm = null;
let countdownTimer = null;
let submitCountdownTimer = null;
let spotsRemaining = 23;
let deadlineHours = 47;
let deadlineMinutes = 59;
let deadlineSeconds = 45;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Vampire Sales Funnel Loading...');
    
    // Initialize in specific order with delays to ensure DOM is ready
    setTimeout(() => {
        initializeElements();
        initializeCountdownTimers();
        initializeModalFunctionality();
        initializeFormHandling();
        initializeCTAButtons();
        initializeSpotsCounter();
        initializeScrollEffects();
        initializeAnimations();
        initializePsychologicalTriggers();
        initializeAnalytics();
        
        console.log('💀 Vampire Sales Funnel Ready to Convert!');
    }, 100);
});

// Initialize DOM elements
function initializeElements() {
    registrationModal = document.getElementById('registrationModal');
    thankYouModal = document.getElementById('thankYouModal');
    registrationForm = document.getElementById('registrationForm');
    
    console.log('Elements initialized:', {
        registrationModal: !!registrationModal,
        thankYouModal: !!thankYouModal,
        registrationForm: !!registrationForm
    });
}

// Initialize countdown timers
function initializeCountdownTimers() {
    console.log('🕒 Starting countdown timers...');
    
    // Start main countdown
    startCountdown();
    
    // Update remaining spots periodically
    setInterval(() => {
        simulateSpotsDecrease();
    }, Math.random() * 30000 + 20000); // Random between 20-50 seconds
}

// Main countdown timer
function startCountdown() {
    countdownTimer = setInterval(() => {
        // Decrease seconds
        deadlineSeconds--;
        
        if (deadlineSeconds < 0) {
            deadlineSeconds = 59;
            deadlineMinutes--;
            
            if (deadlineMinutes < 0) {
                deadlineMinutes = 59;
                deadlineHours--;
                
                if (deadlineHours < 0) {
                    // Reset countdown (simulate urgency)
                    deadlineHours = 47;
                    deadlineMinutes = 59;
                    deadlineSeconds = 45;
                }
            }
        }
        
        // Update all countdown displays
        updateCountdownDisplays();
        
    }, 1000);
}

// Update countdown displays
function updateCountdownDisplays() {
    const hourElements = document.querySelectorAll('#hours, #hours2');
    const minuteElements = document.querySelectorAll('#minutes, #minutes2');
    const secondElements = document.querySelectorAll('#seconds, #seconds2');
    
    hourElements.forEach(el => {
        if (el) el.textContent = String(deadlineHours).padStart(2, '0');
    });
    
    minuteElements.forEach(el => {
        if (el) el.textContent = String(deadlineMinutes).padStart(2, '0');
    });
    
    secondElements.forEach(el => {
        if (el) el.textContent = String(deadlineSeconds).padStart(2, '0');
    });
}

// Initialize spots counter
function initializeSpotsCounter() {
    // Update all spots displays
    updateSpotsDisplays();
    
    // Simulate urgency with random spot decreases
    setTimeout(() => {
        simulateSpotsDecrease();
    }, Math.random() * 15000 + 10000);
}

// Update spots displays
function updateSpotsDisplays() {
    const spotsElements = document.querySelectorAll('#remaining-spots, #spots-left, #modal-spots');
    
    spotsElements.forEach(el => {
        if (el) el.textContent = spotsRemaining;
    });
    
    // Update progress bar
    const spotsBar = document.querySelector('.spots-fill');
    if (spotsBar) {
        const percentage = (spotsRemaining / 100) * 100;
        spotsBar.style.width = `${percentage}%`;
    }
}

// Simulate spots decreasing
function simulateSpotsDecrease() {
    if (spotsRemaining > 5) {
        const decrease = Math.random() > 0.7 ? 2 : 1;
        spotsRemaining = Math.max(5, spotsRemaining - decrease);
        updateSpotsDisplays();
        
        // Show urgency notification
        if (spotsRemaining <= 15 && spotsRemaining > 10) {
            showToast('⚡ 注意：名額快滿了！僅剩' + spotsRemaining + '個席位', 'warning', 5000);
        } else if (spotsRemaining <= 10) {
            showToast('🔥 緊急：最後' + spotsRemaining + '個名額！立即搶占！', 'error', 6000);
        }
        
        trackEvent('Scarcity', 'Spots_Decreased', `Spots remaining: ${spotsRemaining}`);
    }
}

// Initialize all CTA buttons
function initializeCTAButtons() {
    console.log('🎯 Setting up CTA buttons...');
    
    // Wait a moment for DOM to be fully ready
    setTimeout(() => {
        // Find all registration buttons with multiple selectors
        const ctaSelectors = [
            '.btn-vampire',
            '.btn-hero', 
            '.btn-final',
            '.btn-submit',
            'button[onclick*="openRegistrationModal"]',
            '[onclick*="openRegistrationModal"]'
        ];
        
        let allButtons = [];
        ctaSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(btn => {
                if (!allButtons.includes(btn)) {
                    allButtons.push(btn);
                }
            });
        });
        
        console.log('Found CTA buttons:', allButtons.length);
        
        allButtons.forEach((button, index) => {
            console.log(`Setting up button ${index + 1}:`, button.className, button.textContent?.substring(0, 30));
            
            // Remove existing onclick handlers
            button.removeAttribute('onclick');
            
            // Remove existing event listeners by replacing the element
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Skip form submit buttons
            if (newButton.type === 'submit' || newButton.classList.contains('btn-submit')) {
                console.log('Skipping form submit button');
                return;
            }
            
            // Skip special action buttons (WhatsApp, download, etc.)
            if (newButton.onclick && newButton.onclick.toString().includes('window.open')) {
                console.log('Skipping special action button');
                return;
            }
            
            // Add click event listener
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 CTA button clicked:', this.className);
                
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                openRegistrationModal();
            });
            
            console.log(`Button ${index + 1} setup completed`);
        });
        
        console.log('CTA buttons setup completed');
    }, 200);
}

// Open registration modal
function openRegistrationModal() {
    console.log('💀 Opening registration modal...');
    
    if (!registrationModal) {
        console.error('Registration modal not found!');
        showToast('系統錯誤，請重新整理頁面', 'error');
        return;
    }
    
    // Show modal
    registrationModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Start submit countdown
    startSubmitCountdown();
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = registrationModal.querySelector('input[name="fullName"]');
        if (firstInput) {
            firstInput.focus();
            console.log('Focused on first input');
        }
    }, 300);
    
    // Add urgency pressure
    setTimeout(() => {
        if (!registrationModal.classList.contains('hidden')) {
            showToast('⚠️ 記住：48小時後這個機會永遠消失！', 'warning', 4000);
        }
    }, 3000);
    
    trackEvent('Modal', 'Open', 'Registration modal opened');
    console.log('Registration modal opened successfully');
}

// Close registration modal
function closeRegistrationModal() {
    console.log('Closing registration modal...');
    
    if (!registrationModal) return;
    
    registrationModal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Clear submit countdown
    if (submitCountdownTimer) {
        clearInterval(submitCountdownTimer);
        submitCountdownTimer = null;
    }
    
    trackEvent('Modal', 'Close', 'Registration modal closed');
}

// Start submit countdown (creates urgency)
function startSubmitCountdown() {
    let countdown = 10;
    const countdownEl = document.getElementById('submit-countdown');
    
    if (!countdownEl) return;
    
    if (submitCountdownTimer) {
        clearInterval(submitCountdownTimer);
    }
    
    submitCountdownTimer = setInterval(() => {
        countdown--;
        countdownEl.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(submitCountdownTimer);
            submitCountdownTimer = null;
            
            // Show urgent warning
            showToast('⚡ 時間到！這個機會正在溜走...', 'error', 3000);
            
            // Reset countdown
            countdown = 10;
            countdownEl.textContent = countdown;
            startSubmitCountdown();
        }
    }, 1000);
}

// Initialize modal functionality
function initializeModalFunctionality() {
    console.log('🔧 Initializing modal functionality...');
    
    // Wait for elements to be available
    setTimeout(() => {
        // Registration modal
        if (registrationModal) {
            // Close when clicking outside
            registrationModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    console.log('Clicked outside modal, showing exit intent...');
                    showExitIntentWarning();
                }
            });
            
            // Close button
            const closeButton = registrationModal.querySelector('.modal-close');
            if (closeButton) {
                closeButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Close button clicked');
                    showExitIntentWarning();
                });
            }
        }
        
        // Thank you modal
        if (thankYouModal) {
            // Close when clicking outside
            thankYouModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeThankYouModal();
                }
            });
            
            // Close button
            const closeBtn = thankYouModal.querySelector('.btn-close-success');
            if (closeBtn) {
                closeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    closeThankYouModal();
                });
            }
        }
        
        // Escape key handling
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (registrationModal && !registrationModal.classList.contains('hidden')) {
                    showExitIntentWarning();
                }
                if (thankYouModal && !thankYouModal.classList.contains('hidden')) {
                    closeThankYouModal();
                }
            }
        });
        
        console.log('Modal functionality initialized');
    }, 100);
}

// Show exit intent warning
function showExitIntentWarning() {
    const shouldClose = confirm('⚠️ 等等！你確定要放棄這個價值$50,000的機密嗎？\n\n48小時後這個機會將永遠消失！\n\n點擊「取消」繼續報名，點擊「確定」離開。');
    
    if (shouldClose) {
        closeRegistrationModal();
        
        // Show final desperate attempt
        setTimeout(() => {
            showToast('💀 最後機會！你剛剛錯過了改變命運的機會...', 'error', 8000);
        }, 1000);
        
        trackEvent('ExitIntent', 'Confirmed', 'User left registration modal');
    } else {
        trackEvent('ExitIntent', 'Prevented', 'User stayed in registration modal');
        showToast('🎯 明智的選擇！現在就完成報名吧！', 'success', 3000);
    }
}

// Initialize form handling
function initializeFormHandling() {
    console.log('📝 Initializing form handling...');
    
    // Wait for form to be available
    setTimeout(() => {
        if (!registrationForm) {
            console.error('Registration form not found');
            return;
        }
        
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            handleFormSubmission();
        });
        
        // Real-time validation and psychological triggers
        const inputs = registrationForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
                
                // Psychological trigger on email input
                if (this.name === 'email' && this.value.includes('@')) {
                    setTimeout(() => {
                        showToast('✅ 太好了！我們將把機密資料發送到這個郵箱', 'success', 3000);
                    }, 500);
                }
            });
            
            input.addEventListener('focus', function() {
                if (this.name === 'fullName') {
                    showToast('💀 輸入你的真實姓名，成為財富密碼的掌握者', 'info', 3000);
                }
            });
        });
        
        console.log('Form handling initialized');
    }, 100);
}

// Handle form submission
function handleFormSubmission() {
    console.log('💀 Processing form submission...');
    
    const formData = collectFormData();
    console.log('Form data collected:', formData);
    
    // Validate
    const errors = validateFormData(formData);
    if (errors.length > 0) {
        console.log('Form validation errors:', errors);
        showFormErrors(errors);
        return;
    }
    
    // Show loading with dramatic effect
    setSubmitButtonLoading(true);
    
    // Add dramatic pause for psychological effect
    setTimeout(() => {
        console.log('🔥 Submitting to the vampire vault...');
        
        submitFormData(formData)
            .then(response => {
                console.log('💰 Form submission successful');
                handleFormSuccess(formData);
            })
            .catch(error => {
                console.error('💀 Form submission failed:', error);
                handleFormError(error);
            })
            .finally(() => {
                setSubmitButtonLoading(false);
            });
    }, 2000); // Dramatic 2-second pause
}

// Collect form data
function collectFormData() {
    const formData = {};
    const inputs = registrationForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        formData[input.name] = input.value.trim();
    });
    
    return formData;
}

// Validate form data
function validateFormData(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.length < 2) {
        errors.push({ field: 'fullName', message: '💀 財富密碼需要你的真實姓名！' });
    }
    
    if (!data.email) {
        errors.push({ field: 'email', message: '⚡ 沒有郵箱，我們無法發送價值$50,000的機密！' });
    } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: '🔥 請輸入正確的郵箱格式' });
    }
    
    if (!data.phone) {
        errors.push({ field: 'phone', message: '📱 緊急聯繫需要你的手機號碼！' });
    }
    
    return errors;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form errors
function showFormErrors(errors) {
    errors.forEach(error => {
        const field = registrationForm.querySelector(`[name="${error.field}"]`);
        if (field) {
            showFieldError(field, error.message);
        }
    });
    
    if (errors.length > 0) {
        const firstErrorField = registrationForm.querySelector(`[name="${errors[0].field}"]`);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
    
    showToast('⚠️ 請修正錯誤，別讓財富從指縫溜走！', 'error');
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#EF4444';
    field.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error vampire-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #EF4444;
        font-size: 12px;
        font-weight: 700;
        margin-top: 4px;
        display: block;
        animation: shake 0.5s ease-in-out;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Set submit button loading
function setSubmitButtonLoading(isLoading) {
    const submitBtn = registrationForm.querySelector('.btn-submit');
    if (!submitBtn) return;
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="btn-text">🔥 正在開啟財富密碼...</span>
            <span class="btn-countdown">請稍等，正在驗證你的資格</span>
        `;
        submitBtn.style.opacity = '0.8';
        submitBtn.style.animation = 'pulse 1s infinite';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span class="btn-text">立即獲取機密資料</span>
            <span class="btn-countdown">(<span id="submit-countdown">10</span>秒後自動關閉)</span>
        `;
        submitBtn.style.opacity = '1';
        submitBtn.style.animation = '';
        
        // Restart countdown if needed
        setTimeout(() => startSubmitCountdown(), 100);
    }
}

// Submit form data to leads API
function submitFormData(formData) {
    return new Promise((resolve, reject) => {
        // Get page ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('id') || window.location.pathname.split('/').pop();
        
        if (!pageId) {
            reject(new Error('無法識別頁面ID'));
            return;
        }
        
        // Prepare data for leads API
        const leadData = {
            pageId: pageId,
            name: formData.fullName || formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            instagram: formData.instagram || '',
            additionalInfo: {
                formType: 'vampire-aggressive-funnel',
                submissionTime: new Date().toISOString(),
                userAgent: navigator.userAgent
            }
        };
        
        // Send to leads API
        fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                resolve({ 
                    status: 'success', 
                    data: formData,
                    leadId: data.data.id,
                    secretCode: 'VAMPIRE' + Math.random().toString(36).substr(2, 6).toUpperCase()
                });
            } else {
                reject(new Error(data.error || '提交失敗'));
            }
        })
        .catch(error => {
            console.error('Lead submission error:', error);
            reject(new Error('網路血脈中斷，請重新嘗試！'));
        });
    });
}

// Handle form success
function handleFormSuccess(formData) {
    // Decrease remaining spots
    spotsRemaining = Math.max(1, spotsRemaining - 1);
    updateSpotsDisplays();
    
    // Reset form
    registrationForm.reset();
    
    // Clear errors
    const errorElements = registrationForm.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());
    
    const inputElements = registrationForm.querySelectorAll('input, select, textarea');
    inputElements.forEach(el => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
    });
    
    // Show success modal
    openThankYouModal(formData);
    
    // Track conversion
    trackConversion(formData);
    
    showToast('💀👑 恭喜！你已成為財富密碼的掌握者！', 'success');
}

// Handle form error
function handleFormError(error) {
    console.error('Form error:', error);
    showToast('💀 血脈傳輸失敗！請檢查網路連線後重試', 'error');
    
    // Add dramatic retry suggestion
    setTimeout(() => {
        showToast('⚡ 不要放棄！財富就在眼前，再試一次！', 'warning', 5000);
    }, 2000);
}

// Open thank you modal
function openThankYouModal(userData) {
    if (!thankYouModal) return;
    
    closeRegistrationModal();
    
    setTimeout(() => {
        thankYouModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add celebration effect
        setTimeout(() => {
            showToast('🎉 歡迎加入財富精英圈！', 'success', 4000);
        }, 1000);
        
        // Simulate immediate value delivery
        setTimeout(() => {
            showToast('📧 機密資料已發送！立即查收郵箱', 'info', 6000);
        }, 3000);
        
    }, 500);
}

// Close thank you modal
function closeThankYouModal() {
    if (!thankYouModal) return;
    
    thankYouModal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Final psychological trigger
    showToast('🚀 開始你的財富征服之旅！', 'success', 4000);
}

// Download PDF function
function downloadPDF() {
    // Simulate PDF download
    showToast('📥 財富密碼PDF正在下載...', 'info', 3000);
    
    // In a real implementation, this would trigger actual PDF download
    setTimeout(() => {
        showToast('✅ 下載完成！開始研讀你的財富密碼', 'success', 4000);
    }, 2000);
    
    trackEvent('Download', 'PDF', 'Wealth secrets downloaded');
}

// Initialize psychological triggers
function initializePsychologicalTriggers() {
    console.log('🧠 Activating psychological triggers...');
    
    // Random urgency notifications
    setInterval(() => {
        if (Math.random() > 0.7) {
            const urgencyMessages = [
                '⚡ 警告：又有2人搶占了席位！',
                '🔥 緊急：名額正在快速減少...',
                '💀 提醒：48小時倒數中，機會稍縱即逝',
                '⚠️ 注意：這個機會即將永遠關閉',
                '👑 只有真正的勇者才能抓住這個機會'
            ];
            
            const message = urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)];
            showToast(message, 'warning', 4000);
        }
    }, Math.random() * 45000 + 30000); // Random 30-75 seconds
    
    // Social proof notifications
    setInterval(() => {
        if (Math.random() > 0.6) {
            const names = ['李先生', '王小姐', '陳總裁', '張老闆', '劉女士', '黃先生'];
            const name = names[Math.floor(Math.random() * names.length)];
            const amounts = ['68萬', '125萬', '234萬', '89萬', '156萬', '78萬'];
            const amount = amounts[Math.floor(Math.random() * amounts.length)];
            
            showToast(`💰 ${name}剛剛通過財富密碼賺了${amount}！`, 'success', 5000);
        }
    }, Math.random() * 40000 + 25000); // Random 25-65 seconds
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Parallax and scroll animations
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.scrollY;
        
        // Parallax effect for background patterns
        const bgPatterns = document.querySelectorAll('.hero-bg-pattern, .cta-bg-pattern');
        bgPatterns.forEach(pattern => {
            pattern.style.transform = `translateY(${scrolled * 0.1}px)`;
        });
        
        ticking = false;
    }
    
    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestScrollUpdate);
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.8s ease-out';
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.pain-card, .secret-reveal-card, .testimonial-vampire, .stat-box, .authority-content'
    );
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Initialize animations
function initializeAnimations() {
    // Add dynamic hover effects
    const vampireCards = document.querySelectorAll('.pain-card, .secret-reveal-card, .testimonial-vampire');
    
    vampireCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Pulsing effect for critical elements
    const pulseElements = document.querySelectorAll('.urgency-box, .scarcity-box');
    pulseElements.forEach(element => {
        element.style.animation = 'pulse-glow 3s infinite';
    });
}

// Analytics functions
function initializeAnalytics() {
    // Track page view
    trackEvent('Page', 'View', 'Vampire Sales Funnel Loaded');
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackEvent('Scroll', 'Depth', `${maxScroll}%`);
            }
        }
    }, 1000));
    
    // Track time on page
    let timeOnPage = 0;
    setInterval(() => {
        timeOnPage += 30;
        if (timeOnPage % 120 === 0) { // Track every 2 minutes
            trackEvent('Engagement', 'Time', `${timeOnPage}s`);
        }
    }, 30000);
}

function trackEvent(category, action, label, value) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', `${category}_${action}`, {
            label: label,
            value: value
        });
    }
    
    console.log(`📊 Event tracked: ${category} - ${action} - ${label}`, value);
}

function trackConversion(formData) {
    // Google Ads Conversion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            send_to: 'YOUR_CONVERSION_ID',
            value: 50000,
            currency: 'HKD',
            transaction_id: 'VAMPIRE_' + Date.now()
        });
    }
    
    // Facebook Conversion
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CompleteRegistration', {
            value: 50000,
            currency: 'HKD',
            content_name: 'Vampire Wealth Secrets'
        });
        
        fbq('track', 'Lead', {
            content_name: 'High Value Lead',
            content_category: 'Wealth Training'
        });
    }
    
    console.log('💰 Conversion tracked for:', formData.email);
    
    // Additional tracking for high-value lead
    trackEvent('Conversion', 'Registration', 'Vampire Wealth Secrets', 50000);
}

// Toast notifications with vampire theme
function showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.vampire-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `vampire-toast toast-${type}`;
    
    const styles = {
        info: { 
            bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(0, 0, 0, 0.9))', 
            color: '#60A5FA', 
            border: '#3B82F6',
            icon: 'ℹ️'
        },
        success: { 
            bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(0, 0, 0, 0.9))', 
            color: '#FBBF24', 
            border: '#F59E0B',
            icon: '👑'
        },
        error: { 
            bg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(0, 0, 0, 0.9))', 
            color: '#EF4444', 
            border: '#DC2626',
            icon: '💀'
        },
        warning: { 
            bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(0, 0, 0, 0.9))', 
            color: '#F59E0B', 
            border: '#EF4444',
            icon: '⚡'
        }
    };
    
    const style = styles[type] || styles.info;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${style.bg};
        color: ${style.color};
        padding: 16px 20px;
        border-radius: 12px;
        border: 2px solid ${style.border};
        font-weight: 700;
        font-size: 14px;
        z-index: 2100;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${style.border}40;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.5s ease-out;
        font-family: 'Noto Sans TC', sans-serif;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 18px;">${style.icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 500);
        }
    }, duration);
}

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Field validation helper
function validateField(field) {
    const value = field.value.trim();
    
    if (field.name === 'fullName' && value.length < 2) {
        showFieldError(field, '💀 姓名至少需要2個字符');
        return false;
    }
    
    if (field.name === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, '🔥 請輸入有效的電子郵件地址');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

// Global function exports for backwards compatibility and direct access
window.openRegistrationModal = openRegistrationModal;
window.closeRegistrationModal = closeRegistrationModal;
window.closeThankYouModal = closeThankYouModal;
window.downloadPDF = downloadPDF;

// Add custom styles for toasts and animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    
    @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse-glow {
        0%, 100% { 
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
        }
        50% { 
            box-shadow: 0 0 30px rgba(220, 38, 38, 0.6), 0 0 40px rgba(251, 191, 36, 0.3);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .vampire-toast {
        backdrop-filter: blur(10px);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .vampire-toast:hover {
        transform: scale(1.02);
    }
    
    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }
    
    /* Custom scrollbar for vampire theme */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #111827;
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #DC2626, #FBBF24);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #B91C1C, #F59E0B);
    }
`;
document.head.appendChild(style);

console.log('💀🔥 Vampire Sales Funnel JavaScript loaded and armed for maximum conversion!');
console.log('🎯 All psychological triggers activated!');
console.log('⚡ Ready to harvest leads!');