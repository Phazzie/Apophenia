/**
 * Grok Image Service
 * 
 * Handles integration with xAI Grok-2-image-1212 model for image generation.
 * Includes retry logic, error handling, and usage tracking.
 */

import axios from 'axios';

class GrokImageService {
  constructor(apiKey, logger) {
    this.apiKey = apiKey;
    this.logger = logger;
    this.baseURL = 'https://api.x.ai/v1';
    this.model = 'grok-2-image-1212';
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffFactor: 2
    };
    
    // Usage tracking
    this.usageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalImagesGenerated: 0,
      totalTokensUsed: 0
    };
    
    if (!this.apiKey) {
      this.logger?.warn('XAI_API_KEY not provided. Grok image service will not function.');
    }
  }
  
  /**
   * Check if the service is properly configured
   */
  isConfigured() {
    return !!this.apiKey;
  }
  
  /**
   * Generate images using Grok-2-image-1212 model
   */
  async generateImages(prompt, imageCount = 4, responseFormat = 'url') {
    if (!this.isConfigured()) {
      throw new Error('XAI_API_KEY not configured');
    }
    
    this.usageStats.totalRequests++;
    
    const requestBody = {
      model: this.model,
      prompt: prompt.trim(),
      n: imageCount,
      image_format: responseFormat === 'base64' ? 'base64' : 'url'
    };
    
    this.logger?.info('Starting Grok image generation', {
      model: this.model,
      imageCount,
      responseFormat,
      promptLength: prompt.length
    });
    
    try {
      const result = await this._makeRequestWithRetry(requestBody);
      
      this.usageStats.successfulRequests++;
      this.usageStats.totalImagesGenerated += result.images.length;
      
      if (result.usage) {
        this.usageStats.totalTokensUsed += result.usage.total_tokens || 0;
      }
      
      this.logger?.info('Grok image generation successful', {
        imagesGenerated: result.images.length,
        usage: result.usage
      });
      
      return result;
      
    } catch (error) {
      this.usageStats.failedRequests++;
      this.logger?.error('Grok image generation failed', {
        error: error.message,
        model: this.model,
        imageCount
      });
      throw error;
    }
  }
  
  /**
   * Make API request with retry logic
   */
  async _makeRequestWithRetry(requestBody, attempt = 1) {
    try {
      const response = await axios.post(
        `${this.baseURL}/images/generations`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );
      
      if (!response.data) {
        throw new Error('Empty response from Grok API');
      }
      
      // Parse response based on the expected format
      const images = this._parseImageResponse(response.data, requestBody.image_format);
      
      return {
        images,
        usage: response.data.usage || null,
        model: this.model,
        responseFormat: requestBody.image_format
      };
      
    } catch (error) {
      const isLastAttempt = attempt >= this.retryConfig.maxRetries;
      const isRetryableError = this._isRetryableError(error);
      
      if (!isLastAttempt && isRetryableError) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1),
          this.retryConfig.maxDelay
        );
        
        this.logger?.warn(`Grok API request failed (attempt ${attempt}/${this.retryConfig.maxRetries}), retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          nextRetryIn: `${delay}ms`
        });
        
        await this._delay(delay);
        return this._makeRequestWithRetry(requestBody, attempt + 1);
      }
      
      // Transform error for better error handling
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          throw new Error('Invalid XAI API key');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded for Grok API');
        } else if (status === 400) {
          throw new Error(`Invalid request: ${errorData?.error?.message || 'Bad request'}`);
        } else if (status >= 500) {
          throw new Error('Grok API server error');
        }
      }
      
      throw new Error(`Grok image generation failed: ${error.message}`);
    }
  }
  
  /**
   * Parse image response from API
   */
  _parseImageResponse(responseData, format) {
    if (!responseData.data || !Array.isArray(responseData.data)) {
      throw new Error('Invalid response format from Grok API');
    }
    
    return responseData.data.map((item, index) => {
      if (format === 'base64') {
        if (!item.b64_json) {
          throw new Error(`Missing base64 data for image ${index}`);
        }
        return {
          format: 'base64',
          data: item.b64_json,
          index
        };
      } else {
        if (!item.url) {
          throw new Error(`Missing URL for image ${index}`);
        }
        return {
          format: 'url',
          url: item.url,
          index
        };
      }
    });
  }
  
  /**
   * Check if an error is retryable
   */
  _isRetryableError(error) {
    if (!error.response) {
      // Network errors are retryable
      return true;
    }
    
    const status = error.response.status;
    
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429 || status === 502 || status === 503 || status === 504;
  }
  
  /**
   * Delay utility for retries
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      successRate: this.usageStats.totalRequests > 0 
        ? (this.usageStats.successfulRequests / this.usageStats.totalRequests) * 100 
        : 0
    };
  }
  
  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalImagesGenerated: 0,
      totalTokensUsed: 0
    };
  }
  
  /**
   * Test API connection
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'XAI_API_KEY not configured'
      };
    }
    
    try {
      const result = await this.generateImages(
        'A simple test image of a red circle on white background',
        1,
        'url'
      );
      
      return {
        success: true,
        model: this.model,
        imagesGenerated: result.images.length
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default GrokImageService;