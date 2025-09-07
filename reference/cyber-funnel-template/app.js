// Cyber Tech Theme JavaScript - Fixed Version
class CyberFunnelApp {
    constructor() {
        this.modal = document.getElementById('thankYouModal');
        this.form = document.getElementById('registrationForm');
        this.fab = document.getElementById('fab');
        
        this.init();
    }
    
    init() {
        this.initializeEventListeners();
        this.initializeAnimations();
        this.initializeParticles();
        this.initializeTerminalEffects();
        this.startGlitchEffects();
    }
    
    initializeEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // CTA buttons - Fixed scroll functionality
        document.querySelectorAll('.hero__cta').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToRegistration();
            });
        });
        
        // All primary buttons should scroll to registration
        document.querySelectorAll('.btn--primary').forEach(btn => {
            // Only add scroll behavior if it's not a form submit button
            if (btn.type !== 'submit' && !btn.classList.contains('modal-close-btn')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToRegistration();
                });
            }
        });
        
        // Modal close - Fixed modal functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close-btn')) {
                e.preventDefault();
                this.closeModal();
            }
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
        
        // FAB click - Fixed functionality
        if (this.fab) {
            this.fab.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFabClick();
            });
        }
        
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Input focus effects
        document.querySelectorAll('.cyber-input').forEach(input => {
            input.addEventListener('focus', () => this.activateInputScan(input));
            input.addEventListener('blur', () => this.deactivateInputScan(input));
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submission intercepted by JavaScript');
        
        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            phone: formData.get('phone')?.trim() || ''
        };
        
        // Validate required fields
        if (!data.name || !data.email || !data.phone) {
            this.showNotification('請填寫所有必填欄位', 'error');
            return;
        }
        
        // Validate email
        if (!this.validateEmail(data.email)) {
            this.showNotification('請輸入有效的電子郵件地址', 'error');
            return;
        }
        
        // Show loading state
        this.setFormLoading(true);
        
        // Submit to leads API
        this.submitToLeadsAPI(data)
            .then((result) => {
                this.setFormLoading(false);
                
                // Clear any existing success messages
                this.clearInlineMessages();
                
                // Show the modal
                this.showSuccessModal(data);
                
                // Reset form
                this.form.reset();
                
                // Track conversion
                this.trackConversion(data);
            })
            .catch((error) => {
                this.setFormLoading(false);
                this.showNotification('提交失敗，請重試', 'error');
                console.error('Form submission error:', error);
            });
    }
    
    clearInlineMessages() {
        // Remove any inline success messages that might be showing
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setFormLoading(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        
        if (isLoading) {
            btnText.textContent = '處理中...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            this.startProcessingAnimation(submitBtn);
        } else {
            btnText.textContent = '[立即獲取]';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            this.stopProcessingAnimation(submitBtn);
        }
    }
    
    startProcessingAnimation(btn) {
        const scan = btn.querySelector('.btn-scan');
        if (scan) {
            scan.style.animation = 'cyber-processing 1s linear infinite';
        }
    }
    
    stopProcessingAnimation(btn) {
        const scan = btn.querySelector('.btn-scan');
        if (scan) {
            scan.style.animation = '';
        }
    }
    
    showSuccessModal(data) {
        if (!this.modal) {
            console.error('Modal not found');
            this.showNotification('報名成功！歡迎加入科技未來', 'success');
            return;
        }
        
        // Update modal with user data
        const userName = this.modal.querySelector('#userName');
        if (userName) {
            userName.textContent = data.name;
        }
        
        // Show modal with animation
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        const modalContent = this.modal.querySelector('.cyber-modal');
        if (modalContent) {
            modalContent.style.animation = 'modalEnter 0.5s ease-out';
        }
        
        // Start typing animation for access granted
        setTimeout(() => {
            this.typewriterEffect();
        }, 800);
        
        // Show success notification as well
        this.showNotification('報名成功！歡迎加入科技未來', 'success');
    }
    
    closeModal() {
        if (!this.modal) return;
        
        const modalContent = this.modal.querySelector('.cyber-modal');
        if (modalContent) {
            modalContent.style.animation = 'modalExit 0.3s ease-in';
        }
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
    
    typewriterEffect() {
        const accessLines = this.modal.querySelectorAll('.access-line .command');
        let delay = 0;
        
        accessLines.forEach((line, index) => {
            setTimeout(() => {
                const text = line.textContent;
                line.textContent = '';
                line.style.borderRight = '1px solid var(--cyber-accent)';
                
                let i = 0;
                const typing = setInterval(() => {
                    if (i < text.length) {
                        line.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(typing);
                        line.style.borderRight = 'none';
                    }
                }, 50);
            }, delay);
            delay += 1000;
        });
    }
    
    scrollToRegistration() {
        const registration = document.getElementById('registration');
        if (registration) {
            // Smooth scroll to registration section
            registration.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add focus effect to first input after scroll completes
            setTimeout(() => {
                const firstInput = registration.querySelector('input[type="text"], input[type="email"]');
                if (firstInput) {
                    firstInput.focus();
                    this.addFocusPulse(firstInput);
                }
            }, 1000); // Wait for scroll to complete
        } else {
            console.error('Registration section not found');
        }
    }
    
    addFocusPulse(element) {
        element.style.boxShadow = '0 0 20px var(--cyber-primary)';
        element.style.borderColor = 'var(--cyber-primary)';
        setTimeout(() => {
            element.style.boxShadow = '';
            element.style.borderColor = '';
        }, 2000);
    }
    
    handleFabClick() {
        // Improved FAB functionality - scroll to registration or show options
        if (window.scrollY > 500) {
            // If scrolled down, scroll to registration form
            this.scrollToRegistration();
        } else {
            // If at top, show contact options
            this.showContactOptions();
        }
    }
    
    showContactOptions() {
        const options = [
            { 
                text: '📝 立即報名', 
                action: () => this.scrollToRegistration() 
            },
            { 
                text: '💬 WhatsApp', 
                action: () => window.open('https://wa.me/+8521234567890?text=我想了解更多關於科技解決方案的資訊', '_blank') 
            },
            { 
                text: '📧 電子郵件', 
                action: () => window.location.href = 'mailto:info@example.com?subject=科技解決方案諮詢' 
            }
        ];
        
        this.showActionMenu(options);
    }
    
    showActionMenu(options) {
        // Remove existing menu
        const existingMenu = document.querySelector('.fab-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        const menu = document.createElement('div');
        menu.className = 'fab-menu';
        menu.innerHTML = options.map((option, index) => `
            <div class="fab-menu-item" style="animation-delay: ${index * 0.1}s" data-action="${index}">
                ${option.text}
            </div>
        `).join('');
        
        document.body.appendChild(menu);
        
        // Add click handlers
        menu.querySelectorAll('.fab-menu-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                options[index].action();
                menu.remove();
            });
        });
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !e.target.closest('.fab')) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (menu.parentElement) {
                menu.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => menu.remove(), 300);
            }
        }, 8000);
    }
    
    handleScroll() {
        const scrolled = window.scrollY;
        
        // Parallax effect for hero
        const hero = document.querySelector('.hero');
        if (hero) {
            const particles = hero.querySelector('.floating-particles');
            if (particles) {
                particles.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }
        
        // Update FAB appearance based on scroll position
        if (this.fab) {
            if (scrolled > 300) {
                this.fab.style.opacity = '1';
                this.fab.style.transform = 'scale(1)';
            } else {
                this.fab.style.opacity = '0.8';
                this.fab.style.transform = 'scale(0.9)';
            }
        }
        
        // Animate elements on scroll
        this.animateOnScroll();
    }
    
    animateOnScroll() {
        const elements = document.querySelectorAll('.value-card, .testimonial-card');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
            
            if (isVisible && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.animation = 'slideInUp 0.6s ease-out';
            }
        });
    }
    
    activateInputScan(input) {
        const scan = input.nextElementSibling;
        if (scan && scan.classList.contains('input-scan')) {
            scan.style.animation = 'inputScan 2s ease-in-out infinite';
        }
        
        // Add cyber glow effect
        input.style.boxShadow = '0 0 15px rgba(14, 165, 233, 0.5)';
        input.style.borderColor = 'var(--cyber-primary)';
    }
    
    deactivateInputScan(input) {
        const scan = input.nextElementSibling;
        if (scan && scan.classList.contains('input-scan')) {
            scan.style.animation = '';
        }
        
        input.style.boxShadow = '';
        input.style.borderColor = '';
    }
    
    initializeAnimations() {
        // Add CSS animations via JavaScript
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalEnter {
                from { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(50px);
                }
                to { 
                    opacity: 1; 
                    transform: scale(1) translateY(0);
                }
            }
            
            @keyframes modalExit {
                from { 
                    opacity: 1; 
                    transform: scale(1) translateY(0);
                }
                to { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(50px);
                }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes cyber-processing {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            @keyframes inputScan {
                0%, 100% { width: 0; left: 0; }
                50% { width: 100%; left: 0; }
            }
            
            @keyframes glitch {
                0%, 100% { 
                    transform: translate(0);
                    filter: hue-rotate(0deg);
                }
                20% { 
                    transform: translate(-2px, 2px);
                    filter: hue-rotate(90deg);
                }
                40% { 
                    transform: translate(-2px, -2px);
                    filter: hue-rotate(180deg);
                }
                60% { 
                    transform: translate(2px, 2px);
                    filter: hue-rotate(270deg);
                }
                80% { 
                    transform: translate(2px, -2px);
                    filter: hue-rotate(360deg);
                }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            .fab-menu {
                position: fixed;
                bottom: 90px;
                right: 20px;
                z-index: 1400;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .fab-menu-item {
                background: var(--cyber-bg-surface);
                border: 1px solid var(--cyber-primary);
                color: var(--cyber-text-light);
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                white-space: nowrap;
                animation: fabMenuItem 0.3s ease-out;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
            }
            
            .fab-menu-item:hover {
                background: var(--cyber-primary);
                color: white;
                transform: translateX(-5px);
                box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
            }
            
            @keyframes fabMenuItem {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .loading .btn-glow {
                opacity: 1 !important;
                animation: pulse-glow 1s ease-in-out infinite;
            }
            
            .cyber-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                padding: 16px 20px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                font-weight: bold;
                border: 1px solid;
                animation: notificationSlide 0.3s ease-out;
                max-width: 300px;
                word-wrap: break-word;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            .cyber-notification.success {
                background: rgba(6, 255, 165, 0.1);
                border-color: var(--cyber-accent);
                color: var(--cyber-accent);
            }
            
            .cyber-notification.error {
                background: rgba(255, 95, 86, 0.1);
                border-color: #ff5f56;
                color: #ff5f56;
            }
            
            .cyber-notification.info {
                background: rgba(14, 165, 233, 0.1);
                border-color: var(--cyber-primary);
                color: var(--cyber-primary);
            }
            
            @keyframes notificationSlide {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeParticles() {
        // Create additional floating particles
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const particleContainer = document.createElement('div');
        particleContainer.className = 'dynamic-particles';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1;
        `;
        
        // Create multiple particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: ${i % 3 === 0 ? 'var(--cyber-accent)' : 'var(--cyber-primary)'};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${5 + Math.random() * 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
                opacity: ${0.5 + Math.random() * 0.5};
                box-shadow: 0 0 4px currentColor;
            `;
            particleContainer.appendChild(particle);
        }
        
        hero.appendChild(particleContainer);
        
        // Add particle floating animation
        const floatStyle = document.createElement('style');
        floatStyle.textContent = `
            @keyframes floatParticle {
                0% { transform: translateY(100vh) translateX(0) rotate(0deg); }
                100% { transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg); }
            }
        `;
        document.head.appendChild(floatStyle);
    }
    
    initializeTerminalEffects() {
        // Add typing effect to access status
        const statusLines = document.querySelectorAll('.access-status .status-line .command');
        statusLines.forEach((line, index) => {
            const text = line.textContent;
            line.textContent = '';
            
            setTimeout(() => {
                let i = 0;
                const typing = setInterval(() => {
                    if (i < text.length) {
                        line.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(typing);
                        if (index === statusLines.length - 1) {
                            line.parentElement.classList.add('success');
                        }
                    }
                }, 50);
            }, index * 1000 + 1000);
        });
    }
    
    startGlitchEffects() {
        // Add random glitch effects to certain elements
        const glitchElements = document.querySelectorAll('.title-gradient, .cyber-accent');
        
        setInterval(() => {
            const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
            if (randomElement && Math.random() < 0.1) { // 10% chance
                randomElement.style.animation = 'glitch 0.3s linear';
                setTimeout(() => {
                    randomElement.style.animation = '';
                }, 300);
            }
        }, 3000);
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.cyber-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `cyber-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'notificationSlide 0.3s ease-in reverse';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 4000);
    }
    
    async submitToLeadsAPI(data) {
        // Get page ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('id') || window.location.pathname.split('/').pop();
        
        console.log('Page ID extracted:', pageId);
        console.log('Current URL:', window.location.href);
        console.log('Form data to submit:', data);
        
        if (!pageId) {
            throw new Error('無法識別頁面ID');
        }
        
        // Prepare data for leads API
        const leadData = {
            pageId: pageId,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            additionalInfo: {
                formType: 'cyber-funnel-template',
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

    trackConversion(data) {
        // Placeholder for analytics tracking
        console.log('Cyber Funnel Conversion:', {
            name: data.name,
            email: data.email,
            company: data.company,
            role: data.role,
            timestamp: new Date().toISOString()
        });
        
        // Here you would integrate with your analytics service
        // Example: gtag('event', 'conversion', { ... });
        // Example: fbq('track', 'Lead', { ... });
    }
}

// Global scroll function for inline onclick handlers
function scrollToRegistration() {
    const registration = document.getElementById('registration');
    if (registration) {
        registration.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add focus effect to first input after scroll completes
        setTimeout(() => {
            const firstInput = registration.querySelector('input[type="text"], input[type="email"]');
            if (firstInput) {
                firstInput.focus();
                firstInput.style.boxShadow = '0 0 20px var(--cyber-primary)';
                firstInput.style.borderColor = 'var(--cyber-primary)';
                setTimeout(() => {
                    firstInput.style.boxShadow = '';
                    firstInput.style.borderColor = '';
                }, 2000);
            }
        }, 1000);
    }
}

// Utility Functions
function generateMatrixRain() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.1;
    `;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01';
    const charSize = 14;
    const columns = canvas.width / charSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0EA5E9';
        ctx.font = `${charSize}px Courier New`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * charSize, drops[i] * charSize);
            
            if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 100);
    document.body.appendChild(canvas);
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Sound Effects (optional - can be enabled)
class CyberSoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = false; // Set to true to enable sounds
    }
    
    init() {
        if (!this.enabled) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playBeep(frequency = 800, duration = 100) {
        if (!this.audioContext || !this.enabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    playSuccess() {
        this.playBeep(660, 100);
        setTimeout(() => this.playBeep(880, 150), 120);
    }
    
    playError() {
        this.playBeep(300, 200);
        setTimeout(() => this.playBeep(250, 200), 250);
    }
    
    playClick() {
        this.playBeep(1000, 50);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main app
    const app = new CyberFunnelApp();
    
    // Initialize sound effects
    const soundEffects = new CyberSoundEffects();
    soundEffects.init();
    
    // Add matrix rain effect (optional)
    if (window.innerWidth > 768) { // Only on desktop
        setTimeout(() => {
            generateMatrixRain();
        }, 2000);
    }
    
    // Add click sound effects to buttons
    document.querySelectorAll('.btn--cyber').forEach(btn => {
        btn.addEventListener('click', () => {
            soundEffects.playClick();
        });
    });
    
    // Console welcome message
    console.log('%c🚀 CYBER FUNNEL SYSTEM ONLINE', 'color: #06FFA5; font-family: Courier New; font-size: 16px; font-weight: bold;');
    console.log('%c[SYSTEM] Initializing quantum processors...', 'color: #0EA5E9; font-family: Courier New;');
    console.log('%c[SYSTEM] Neural networks activated ✓', 'color: #06FFA5; font-family: Courier New;');
    console.log('%c[SYSTEM] Ready for digital transformation', 'color: #8B5CF6; font-family: Courier New;');
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when tab becomes visible
        document.body.style.animationPlayState = 'running';
    }
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('cyber-funnel-start');
    
    window.addEventListener('load', function() {
        performance.mark('cyber-funnel-end');
        performance.measure('cyber-funnel-load', 'cyber-funnel-start', 'cyber-funnel-end');
        
        const measure = performance.getEntriesByName('cyber-funnel-load')[0];
        console.log(`%c[PERFORMANCE] Page loaded in ${measure.duration.toFixed(2)}ms`, 'color: #FFD93D; font-family: Courier New;');
    });
}

// Export for external use
window.CyberFunnel = {
    app: null,
    init: function() {
        this.app = new CyberFunnelApp();
        return this.app;
    }
};