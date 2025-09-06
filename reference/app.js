// Professional Business Template JavaScript - Fixed Version

// DOM Elements
let landingPage, thankYouPage, registrationForm;

// Application State
let isSubmitting = false;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        initializeApplication();
    }, 100);
});

// Main initialization function
function initializeApplication() {
    // Get DOM elements
    landingPage = document.getElementById('landing-page');
    thankYouPage = document.getElementById('thank-you-page');
    registrationForm = document.getElementById('registrationForm');

    if (!landingPage || !thankYouPage || !registrationForm) {
        console.error('Essential DOM elements not found:', {
            landingPage: !!landingPage,
            thankYouPage: !!thankYouPage,
            registrationForm: !!registrationForm
        });
        return;
    }

    initializeFormHandling();
    initializeCTAButtons();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeAccessibility();
    
    console.log('Professional Business Template initialized successfully');
}

// Initialize CTA buttons
function initializeCTAButtons() {
    // Find all CTA buttons that should scroll to form
    const ctaButtons = document.querySelectorAll('.btn--primary, .hero .btn');
    
    ctaButtons.forEach((button, index) => {
        // Remove any existing onclick attributes to avoid conflicts
        button.removeAttribute('onclick');
        
        // Add click event listener
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`CTA button ${index + 1} clicked`);
            scrollToForm();
        });
    });

    console.log(`Initialized ${ctaButtons.length} CTA buttons`);
}

// Scroll to form function
function scrollToForm() {
    const formSection = document.getElementById('opt-in-form');
    if (formSection) {
        console.log('Scrolling to form section');
        formSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Focus first input after scroll
        setTimeout(() => {
            const firstInput = document.getElementById('firstName');
            if (firstInput) {
                firstInput.focus();
                console.log('Focused on first input');
            }
        }, 800);
    } else {
        console.error('Form section not found');
    }
}

// Initialize form handling
function initializeFormHandling() {
    if (!registrationForm) {
        console.error('Registration form not found');
        return;
    }

    // Remove any existing event listeners
    const newForm = registrationForm.cloneNode(true);
    registrationForm.parentNode.replaceChild(newForm, registrationForm);
    registrationForm = newForm;

    // Add form submission handler
    registrationForm.addEventListener('submit', handleFormSubmission);
    
    // Add real-time validation
    const inputs = registrationForm.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
        
        // Ensure inputs are properly functional
        input.addEventListener('focus', function() {
            console.log(`Input ${input.id} focused`);
        });
    });

    // Test that inputs are working
    const testInput = document.getElementById('firstName');
    if (testInput) {
        testInput.addEventListener('input', function() {
            console.log('Input working - value:', this.value);
        });
    }

    console.log('Form handling initialized with', inputs.length, 'required inputs');
}

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Form submission handler called');
    
    if (isSubmitting) {
        console.log('Already submitting, ignoring duplicate submission');
        return;
    }

    // Validate form
    if (!validateForm()) {
        showNotification('請填寫所有必填欄位', 'error');
        return;
    }

    // Get form data
    const formData = collectFormData();
    console.log('Form data collected:', formData);

    // Set loading state
    setFormLoadingState(true);
    isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
        try {
            // Show success and switch to thank you page
            showThankYouPage(formData);
            
            // Track successful conversion
            trackConversion(formData);
            
            console.log('Form submission successful');
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('提交失敗，請稍後再試', 'error');
            setFormLoadingState(false);
            isSubmitting = false;
        }
    }, 2000);
}

// Collect form data
function collectFormData() {
    const getData = (id) => {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };

    return {
        firstName: getData('firstName'),
        lastName: getData('lastName'),
        email: getData('email'),
        phone: getData('phone'),
        company: getData('company'),
        timestamp: new Date().toISOString()
    };
}

// Validate entire form
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email'];
    let isValid = true;

    console.log('Validating form...');

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.error(`Required field ${fieldId} not found`);
            isValid = false;
            return;
        }

        const fieldValid = validateField({ target: field });
        if (!fieldValid) {
            isValid = false;
        }
        console.log(`Field ${fieldId}: ${fieldValid ? 'valid' : 'invalid'}`);
    });

    console.log('Form validation result:', isValid);
    return isValid;
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearFieldError(event);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = '此欄位為必填';
    }

    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = '請輸入有效的電子郵件地址';
    }

    // Phone validation (optional but if provided should be valid)
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = '請輸入有效的電話號碼';
    }

    // Show error if validation failed
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (basic)
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError({ target: field });

    // Add error class
    field.classList.add('error');
    field.style.borderColor = '#DC2626';

    // Create and show error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = `
        color: #DC2626;
        font-size: var(--font-size-sm);
        margin-top: var(--space-4);
        margin-bottom: var(--space-8);
        font-weight: var(--font-weight-medium);
    `;
    errorElement.textContent = message;

    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Clear field error
function clearFieldError(event) {
    if (!event || !event.target) return;
    
    const field = event.target;
    
    // Remove error class and styling
    field.classList.remove('error');
    field.style.borderColor = '';

    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Set form loading state
function setFormLoadingState(loading) {
    const submitButton = registrationForm.querySelector('button[type="submit"]');
    const inputs = registrationForm.querySelectorAll('input');

    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }

    if (loading) {
        // Store original text
        if (!submitButton.getAttribute('data-original-text')) {
            submitButton.setAttribute('data-original-text', submitButton.textContent);
        }
        
        submitButton.disabled = true;
        submitButton.classList.add('form-loading');
        submitButton.textContent = '提交中...';
        
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        console.log('Form loading state: ON');
    } else {
        submitButton.disabled = false;
        submitButton.classList.remove('form-loading');
        submitButton.textContent = submitButton.getAttribute('data-original-text') || '立即獲取';
        
        inputs.forEach(input => {
            input.disabled = false;
        });
        
        console.log('Form loading state: OFF');
    }
}

// Show thank you page
function showThankYouPage(formData) {
    console.log('Showing thank you page');
    
    // Hide landing page
    if (landingPage) {
        landingPage.classList.add('hidden');
    }
    
    // Show thank you page
    if (thankYouPage) {
        thankYouPage.classList.remove('hidden');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Personalize thank you page if possible
    personalizeThankYouPage(formData);
    
    // Show success notification
    showNotification('提交成功！歡迎查看您的專屬內容', 'success');
    
    // Initialize back to home button
    initializeBackButton();
}

// Initialize back button
function initializeBackButton() {
    const backButton = document.querySelector('.back-home-section .btn');
    if (backButton) {
        // Remove any existing onclick
        backButton.removeAttribute('onclick');
        
        // Add new event listener
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            backToHome();
        });
        
        console.log('Back button initialized');
    }
}

// Personalize thank you page
function personalizeThankYouPage(formData) {
    try {
        // Find elements that can be personalized
        const titleElement = document.querySelector('.thank-you-title');
        const messageElement = document.querySelector('.thank-you-message');
        
        if (titleElement && formData.firstName) {
            // Add first name to title if it contains placeholder
            const currentTitle = titleElement.textContent;
            if (currentTitle.includes('[感謝標題]')) {
                titleElement.textContent = `謝謝您，${formData.firstName}！`;
            }
        }
        
        if (messageElement && formData.firstName) {
            // Add first name to message if it contains placeholder
            const currentMessage = messageElement.textContent;
            if (currentMessage.includes('[感謝訊息和下一步指引]')) {
                messageElement.textContent = `親愛的${formData.firstName}，感謝您的信任！我們已將相關資料發送到您的電子郵件。請查收並開始您的專業提升之旅。`;
            }
        }
        
        console.log('Thank you page personalized for:', formData.firstName);
    } catch (error) {
        console.error('Error personalizing thank you page:', error);
    }
}

// Back to home function
function backToHome() {
    console.log('Back to home function called');
    
    // Hide thank you page
    if (thankYouPage) {
        thankYouPage.classList.add('hidden');
    }
    
    // Show landing page
    if (landingPage) {
        landingPage.classList.remove('hidden');
    }
    
    // Reset form
    resetForm();
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    console.log('Returned to home page');
}

// Reset form
function resetForm() {
    if (registrationForm) {
        console.log('Resetting form');
        
        registrationForm.reset();
        
        // Clear any remaining errors
        const errorElements = registrationForm.querySelectorAll('.field-error');
        errorElements.forEach(error => error.remove());
        
        // Reset form state
        setFormLoadingState(false);
        isSubmitting = false;
        
        // Remove error classes
        const inputs = registrationForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
            input.style.borderColor = '';
        });
    }
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    // Handle anchor links
    document.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    console.log('Smooth scrolling initialized');
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe animated elements
    const animatedElements = document.querySelectorAll(
        '.testimonial-card, .stat-item, .material-item, .value-item'
    );
    
    animatedElements.forEach(element => {
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        // Observe for animation
        observer.observe(element);
    });

    console.log('Animations initialized for', animatedElements.length, 'elements');
}

// Initialize accessibility features
function initializeAccessibility() {
    // Keyboard navigation for forms
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && input.type !== 'submit') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    // If last input, focus submit button
                    const submitButton = registrationForm.querySelector('button[type="submit"]');
                    if (submitButton) {
                        submitButton.focus();
                    }
                }
            }
        });
    });

    // Escape key to close notifications
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const notifications = document.querySelectorAll('.notification');
            notifications.forEach(notification => {
                notification.remove();
            });
        }
    });

    console.log('Accessibility features initialized');
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set styles based on type
    const styles = {
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', color: '#1E40AF' },
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', color: '#047857' },
        error: { bg: 'rgba(220, 38, 38, 0.1)', border: '#DC2626', color: '#B91C1C' },
        warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', color: '#D97706' }
    };

    const style = styles[type] || styles.info;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 16px 20px;
        background: ${style.bg};
        border: 1px solid ${style.border};
        border-left: 4px solid ${style.border};
        border-radius: 8px;
        color: ${style.color};
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease-out;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    // Add icon based on type
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };

    notification.innerHTML = `
        <span style="font-size: 16px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);

    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });

    console.log('Notification shown:', message, type);
}

// Track conversion (analytics placeholder)
function trackConversion(formData) {
    console.log('Tracking conversion:', {
        event: 'form_submission',
        form_type: 'lead_generation',
        timestamp: formData.timestamp,
        user_data: {
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            company: formData.company
        }
    });

    // Example integrations (uncomment and configure as needed):
    
    // Google Analytics 4
    /*
    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
            'event_category': 'engagement',
            'event_label': 'professional_template_form',
            'value': 1
        });
    }
    */

    // Facebook Pixel
    /*
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Professional Business Template',
            content_category: 'Lead Generation'
        });
    }
    */
}

// Handle window beforeunload (warn about unsaved changes)
window.addEventListener('beforeunload', function(e) {
    if (!registrationForm) return;
    
    const hasFormData = Array.from(registrationForm.elements).some(element => 
        element.type !== 'submit' && element.value.trim() !== ''
    );
    
    if (hasFormData && !isSubmitting && landingPage && !landingPage.classList.contains('hidden')) {
        e.preventDefault();
        e.returnValue = '您有未儲存的表單資料，確定要離開嗎？';
        return '您有未儲存的表單資料，確定要離開嗎？';
    }
});

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .form-loading {
        position: relative;
        color: transparent !important;
    }
    
    .form-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .btn:focus-visible {
        outline: 2px solid #3B82F6 !important;
        outline-offset: 2px !important;
    }
    
    input.error {
        border-color: #DC2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
    }
`;

document.head.appendChild(animationStyles);

// Global functions for inline event handlers (as backup)
window.scrollToForm = scrollToForm;
window.backToHome = backToHome;

// Export functions for external use
window.professionalTemplate = {
    scrollToForm,
    backToHome,
    showNotification,
    resetForm
};

// Console welcome message
console.log('%c✨ Professional Business Template Loaded Successfully', 'color: #10B981; font-size: 16px; font-weight: bold;');
console.log('%c🚀 All functionality initialized and ready!', 'color: #1E3A8A; font-size: 14px;');