/**
 * Client-side form validation and submission handling for resource forms
 */

// Import analytics tracking
import { trackResourceFunnel, getSessionId } from '@/lib/resource-analytics';

// Validation patterns
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Form validation utilities
class ResourceFormValidator {
  constructor(form) {
    this.form = form;
    this.resourceName = form.dataset.resource || 'unknown';
    this.resourceCategory = this.getResourceCategory(this.resourceName);
    this.sessionId = getSessionId();
    this.formStarted = false;
    
    this.fields = {
      email: form.querySelector('#email'),
      name: form.querySelector('#name'),
      workplace: form.querySelector('#workplace'),
      role: form.querySelector('#role')
    };
    this.submitBtn = form.querySelector('#submitBtn');
    this.btnText = this.submitBtn.querySelector('.btn-text');
    this.btnLoading = this.submitBtn.querySelector('.btn-loading');
    this.successMessage = form.querySelector('#successMessage');
    this.globalError = form.querySelector('#globalError');
    
    this.setupEventListeners();
    this.trackPageView();
  }

  getResourceCategory(resourceName) {
    const categoryMap = {
      'automation-guide': 'Business Guide',
      'whitelabel-checklist': 'Implementation Guide',
      'ai-integration-playbook': 'Strategy Guide'
    };
    return categoryMap[resourceName] || 'Resource';
  }

  trackPageView() {
    trackResourceFunnel('page_view', {
      resourceName: this.resourceName,
      resourceCategory: this.resourceCategory,
      sessionId: this.sessionId
    });
  }

  setupEventListeners() {
    // Real-time validation on input
    Object.entries(this.fields).forEach(([fieldName, field]) => {
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldName));
        field.addEventListener('input', () => {
          this.clearFieldError(fieldName);
          this.trackFormStart();
        });
        field.addEventListener('focus', () => this.trackFormStart());
      }
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  trackFormStart() {
    if (!this.formStarted) {
      this.formStarted = true;
      trackResourceFunnel('form_start', {
        resourceName: this.resourceName,
        resourceCategory: this.resourceCategory,
        sessionId: this.sessionId
      });
    }
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    const value = field.value.trim();
    const _errorElement = document.getElementById(`${fieldName}-error`);
    
    let error = null;

    switch (fieldName) {
      case 'email':
        error = this.validateEmail(value);
        break;
      case 'name':
        error = this.validateRequiredField(value, 'Name', 2, 100);
        break;
      case 'workplace':
        error = this.validateRequiredField(value, 'Company/Organization', 2, 200);
        break;
      case 'role':
        error = this.validateRequiredField(value, 'Job Title/Role', 2, 100);
        break;
    }

    if (error) {
      this.showFieldError(fieldName, error);
      return false;
    } else {
      this.clearFieldError(fieldName);
      return true;
    }
  }

  validateEmail(email) {
    if (!email) {
      return 'Email is required';
    }
    
    if (email.length > 254) {
      return 'Email is too long';
    }
    
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  }

  validateRequiredField(value, fieldLabel, minLength = 1, maxLength = 200) {
    if (!value) {
      return `${fieldLabel} is required`;
    }
    
    if (value.length < minLength) {
      return `${fieldLabel} must be at least ${minLength} characters`;
    }
    
    if (value.length > maxLength) {
      return `${fieldLabel} must be less than ${maxLength} characters`;
    }
    
    // Check for suspicious patterns
    if (this.containsSuspiciousContent(value)) {
      return `${fieldLabel} contains invalid content`;
    }
    
    return null;
  }

  containsSuspiciousContent(text) {
    const suspiciousPatterns = [
      /<[^>]*>/g, // HTML tags
      /javascript:/gi, // JavaScript protocol
      /on\w+\s*=/gi, // Event handlers
      /\b(viagra|cialis|casino|loan)\b/gi // Common spam words
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  showFieldError(fieldName, message) {
    const field = this.fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearFieldError(fieldName) {
    const field = this.fields[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  validateAllFields() {
    let isValid = true;
    
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  showGlobalMessage(message, isError = false) {
    this.hideAllMessages();
    
    const messageElement = isError ? this.globalError : this.successMessage;
    const textElement = messageElement.querySelector('.message-text');
    
    if (messageElement && textElement) {
      textElement.textContent = message;
      messageElement.style.display = 'flex';
      
      // Auto-hide success messages after 5 seconds
      if (!isError) {
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 5000);
      }
    }
  }

  hideAllMessages() {
    if (this.successMessage) this.successMessage.style.display = 'none';
    if (this.globalError) this.globalError.style.display = 'none';
  }

  setLoadingState(isLoading) {
    if (this.submitBtn && this.btnText && this.btnLoading) {
      this.submitBtn.disabled = isLoading;
      
      if (isLoading) {
        this.btnText.style.display = 'none';
        this.btnLoading.style.display = 'flex';
      } else {
        this.btnText.style.display = 'inline';
        this.btnLoading.style.display = 'none';
      }
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    // Clear previous messages
    this.hideAllMessages();
    
    // Validate all fields
    if (!this.validateAllFields()) {
      this.showGlobalMessage('Please fix the errors above before submitting.', true);
      return;
    }
    
    // Set loading state
    this.setLoadingState(true);
    
    try {
      // Prepare form data
      const formData = new FormData(this.form);
      const formDataObject = Object.fromEntries(formData.entries());
      
      // Submit to API
      const response = await fetch('/api/resource-download', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Track form submission success
        trackResourceFunnel('form_submit', {
          resourceName: this.resourceName,
          resourceCategory: this.resourceCategory,
          sessionId: this.sessionId
        });
        
        this.showGlobalMessage(result.message || 'Form submitted successfully!');
        
        // Handle download URL if provided
        if (result.downloadUrl) {
          this.handleDownloadUrl(result.downloadUrl, formDataObject);
        }
        
        // Reset form after successful submission
        setTimeout(() => {
          this.form.reset();
          this.hideAllMessages();
          this.formStarted = false; // Reset form started flag
        }, 3000);
        
      } else {
        // Handle validation errors
        if (result.validationErrors && Array.isArray(result.validationErrors)) {
          result.validationErrors.forEach(error => {
            this.showFieldError(error.field, error.message);
          });
        }
        
        this.showGlobalMessage(result.error || 'An error occurred. Please try again.', true);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showGlobalMessage('Network error. Please check your connection and try again.', true);
    } finally {
      this.setLoadingState(false);
    }
  }

  handleDownloadUrl(downloadUrl, formData) {
    // Create download link and trigger download
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track download completion
      trackResourceFunnel('download_complete', {
        resourceName: this.resourceName,
        resourceCategory: this.resourceCategory,
        sessionId: this.sessionId,
        resourceValue: this.getResourceValue()
      }, formData);
      
      this.showGlobalMessage('Your download has started! The file should appear in your downloads folder.');
    }, 1000);
  }

  getResourceValue() {
    // Assign values to different resource types for conversion tracking
    const valueMap = {
      'automation-guide': 25,
      'whitelabel-checklist': 15,
      'ai-integration-playbook': 30
    };
    return valueMap[this.resourceName] || 20;
  }
}

// Initialize form validation when DOM is ready
function initializeResourceForms() {
  const resourceForms = document.querySelectorAll('.resource-form');
  
  resourceForms.forEach(form => {
    new ResourceFormValidator(form);
  });
}

// Initialize on DOM content loaded and after page transitions
document.addEventListener('DOMContentLoaded', initializeResourceForms);
document.addEventListener('astro:after-swap', initializeResourceForms);

// Export for use in other modules
window.ResourceFormValidator = ResourceFormValidator;