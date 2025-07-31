/**
 * Rumba SDK Service
 * Handles barcode scanning through Socket Mobile's Rumba JavaScript API for iOS devices
 * Documentation: https://docs.socketmobile.dev/rumba/en/latest/rumbaJsApi.html
 */

class RumbaSDKService {
  constructor() {
    this.isInitialized = false
    this.isAvailable = false
    this.onBarcodeCallback = null
    this.deviceInfo = null
    this.initializationAttempts = 0
    this.maxRetryAttempts = 3
    
    // Track scanning state
    this.isScanning = false
    this.scanningOptions = null
    
    // Configuration
    this.config = {
      debugLogging: true,
      autoStartScanning: true,
      scanTimeout: 30000, // 30 seconds timeout
      retryDelay: 1000 // 1 second retry delay
    }
  }

  /**
   * Check if Rumba JavaScript API is available
   * This indicates we're running in the Rumba app environment
   */
  isRumbaAPIAvailable() {
    try {
      // Check for Rumba JavaScript API objects
      const hasRumbaAPI = typeof window !== 'undefined' && (
        window.RumbaJS || 
        window.rumbaJS ||
        window.socketmobile ||
        window.SocketMobile ||
        // Check for Rumba-specific webkit message handlers
        (window.webkit && window.webkit.messageHandlers && (
          window.webkit.messageHandlers.rumba ||
          window.webkit.messageHandlers.socketmobile ||
          window.webkit.messageHandlers.barcode
        ))
      )
      
      if (this.config.debugLogging) {
        console.log('🔍 Rumba API availability check:', {
          hasRumbaAPI,
          hasWebkit: !!window.webkit,
          hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
          userAgent: navigator.userAgent,
          platform: navigator.platform
        })
      }
      
      return hasRumbaAPI
    } catch (error) {
      if (this.config.debugLogging) {
        console.log('⚠️ Error checking Rumba API availability:', error.message)
      }
      return false
    }
  }

  /**
   * Detect if we're running in iOS Safari or Rumba app
   */
  getEnvironmentInfo() {
    const userAgent = navigator.userAgent || ''
    const platform = navigator.platform || ''
    
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                  (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent)
    const isRumbaApp = this.isRumbaAPIAvailable()
    
    return {
      isIOS,
      isSafari,
      isRumbaApp,
      userAgent: userAgent.substring(0, 100) + '...', // Truncate for logging
      platform,
      hasWebkit: !!window.webkit,
      hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers)
    }
  }

  /**
   * Initialize Rumba SDK service
   */
  async initialize(onBarcodeCallback, options = {}) {
    if (this.config.debugLogging) {
      console.log('🌐 Initializing Rumba SDK Service...')
      console.log('Initialization attempt:', ++this.initializationAttempts)
    }

    if (this.isInitialized) {
      console.warn('⚠️ Rumba SDK service already initialized')
      return
    }

    // Merge configuration
    this.config = { ...this.config, ...options }
    this.onBarcodeCallback = onBarcodeCallback

    try {
      // Check environment
      const envInfo = this.getEnvironmentInfo()
      if (this.config.debugLogging) {
        console.log('📱 Environment info:', envInfo)
      }

      // Check if Rumba API is available
      this.isAvailable = this.isRumbaAPIAvailable()
      
      if (!this.isAvailable) {
        throw new Error('Rumba JavaScript API not available - not running in Rumba app')
      }

      // Initialize Rumba SDK
      await this.initializeRumbaAPI()
      
      this.isInitialized = true
      this.initializationAttempts = 0

      if (this.config.debugLogging) {
        console.log('✅ Rumba SDK Service initialized successfully')
      }

    } catch (error) {
      const errorMessage = `Rumba SDK initialization failed: ${error.message}`
      
      if (this.config.debugLogging) {
        console.error('❌ Rumba SDK initialization error:', {
          attempt: this.initializationAttempts,
          error: error.message,
          available: this.isAvailable,
          canRetry: this.initializationAttempts < this.maxRetryAttempts
        })
      }

      const enhancedError = new Error(errorMessage)
      enhancedError.type = 'RUMBA_INIT_FAILED'
      enhancedError.attempt = this.initializationAttempts
      enhancedError.canRetry = this.initializationAttempts < this.maxRetryAttempts
      
      throw enhancedError
    }
  }

  /**
   * Initialize the Rumba JavaScript API
   */
  async initializeRumbaAPI() {
    try {
      // Method 1: Try direct RumbaJS API
      if (window.RumbaJS) {
        if (this.config.debugLogging) {
          console.log('🔌 Using RumbaJS direct API')
        }
        await this.initializeDirectAPI()
        return
      }

      // Method 2: Try webkit message handlers
      if (window.webkit && window.webkit.messageHandlers) {
        if (this.config.debugLogging) {
          console.log('🔌 Using webkit message handlers')
        }
        await this.initializeWebkitHandlers()
        return
      }

      // Method 3: Try legacy rumbaJS
      if (window.rumbaJS) {
        if (this.config.debugLogging) {
          console.log('🔌 Using legacy rumbaJS API')
        }
        await this.initializeLegacyAPI()
        return
      }

      throw new Error('No compatible Rumba API found')

    } catch (error) {
      throw new Error(`Rumba API initialization failed: ${error.message}`)
    }
  }

  /**
   * Initialize using direct RumbaJS API
   */
  async initializeDirectAPI() {
    try {
      // Set up barcode scanning callback
      window.RumbaJS.onBarcodeScanned = (barcodeData) => {
        this.handleBarcodeScanned(barcodeData)
      }

      // Enable barcode scanning if available
      if (window.RumbaJS.enableBarcodeScanning) {
        await window.RumbaJS.enableBarcodeScanning(true)
      }

      // Get device info if available
      if (window.RumbaJS.getDeviceInfo) {
        this.deviceInfo = await window.RumbaJS.getDeviceInfo()
      }

      if (this.config.debugLogging) {
        console.log('✅ RumbaJS direct API initialized', {
          deviceInfo: this.deviceInfo
        })
      }

    } catch (error) {
      throw new Error(`Direct API initialization failed: ${error.message}`)
    }
  }

  /**
   * Initialize using webkit message handlers
   */
  async initializeWebkitHandlers() {
    try {
      // Set up global callback for barcode events
      window.rumbaJSCallback = (data) => {
        if (data && data.type === 'barcode' && data.value) {
          this.handleBarcodeScanned(data.value)
        }
      }

      // Try different message handler names
      const handlers = ['rumba', 'socketmobile', 'barcode']
      let activeHandler = null

      for (const handlerName of handlers) {
        if (window.webkit.messageHandlers[handlerName]) {
          activeHandler = window.webkit.messageHandlers[handlerName]
          break
        }
      }

      if (!activeHandler) {
        throw new Error('No compatible webkit message handler found')
      }

      // Send initialization message
      activeHandler.postMessage({
        action: 'initialize',
        config: {
          enableBarcodeScanning: true,
          autoStart: this.config.autoStartScanning
        }
      })

      if (this.config.debugLogging) {
        console.log('✅ Webkit message handlers initialized')
      }

    } catch (error) {
      throw new Error(`Webkit handlers initialization failed: ${error.message}`)
    }
  }

  /**
   * Initialize using legacy rumbaJS API
   */
  async initializeLegacyAPI() {
    try {
      // Set up callback
      window.rumbaJS.setBarcodeCallback((barcodeData) => {
        this.handleBarcodeScanned(barcodeData)
      })

      // Enable scanning
      if (window.rumbaJS.enableScanning) {
        window.rumbaJS.enableScanning(true)
      }

      if (this.config.debugLogging) {
        console.log('✅ Legacy rumbaJS API initialized')
      }

    } catch (error) {
      throw new Error(`Legacy API initialization failed: ${error.message}`)
    }
  }

  /**
   * Handle barcode scanned from Rumba API
   */
  handleBarcodeScanned(barcodeData) {
    if (this.config.debugLogging) {
      console.log('📊 Barcode scanned via Rumba SDK:', {
        data: barcodeData,
        timestamp: new Date().toISOString(),
        isScanning: this.isScanning
      })
    }

    // Update scanning state
    this.isScanning = false

    // Call the registered callback
    if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
      this.onBarcodeCallback(barcodeData, 'rumbaSDK')
    } else {
      console.warn('⚠️ No barcode callback registered in Rumba SDK')
    }
  }

  /**
   * Start barcode scanning
   */
  async startScanning(options = {}) {
    if (!this.isInitialized || !this.isAvailable) {
      throw new Error('Rumba SDK not initialized or not available')
    }

    if (this.config.debugLogging) {
      console.log('🎯 Starting Rumba SDK barcode scanning...')
    }

    this.isScanning = true
    this.scanningOptions = options

    try {
      // Method 1: Direct API
      if (window.RumbaJS && window.RumbaJS.startScanning) {
        await window.RumbaJS.startScanning(options)
        return
      }

      // Method 2: Webkit handlers
      if (window.webkit && window.webkit.messageHandlers) {
        const handlers = ['rumba', 'socketmobile', 'barcode']
        for (const handlerName of handlers) {
          const handler = window.webkit.messageHandlers[handlerName]
          if (handler) {
            handler.postMessage({
              action: 'startScanning',
              options
            })
            return
          }
        }
      }

      // Method 3: Legacy API
      if (window.rumbaJS && window.rumbaJS.startScanning) {
        window.rumbaJS.startScanning(options)
        return
      }

      // If no specific start method, scanning might be auto-enabled
      if (this.config.debugLogging) {
        console.log('✅ Rumba SDK scanning ready (auto-enabled)')
      }

      // Set up timeout for auto-stop
      if (this.config.scanTimeout > 0) {
        setTimeout(() => {
          if (this.isScanning) {
            this.stopScanning()
            if (this.config.debugLogging) {
              console.log('⏰ Rumba SDK scanning timeout')
            }
          }
        }, this.config.scanTimeout)
      }

    } catch (error) {
      this.isScanning = false
      throw new Error(`Failed to start Rumba SDK scanning: ${error.message}`)
    }
  }

  /**
   * Stop barcode scanning
   */
  stopScanning() {
    if (this.config.debugLogging) {
      console.log('🛑 Stopping Rumba SDK barcode scanning...')
    }

    this.isScanning = false

    try {
      // Method 1: Direct API
      if (window.RumbaJS && window.RumbaJS.stopScanning) {
        window.RumbaJS.stopScanning()
        return
      }

      // Method 2: Webkit handlers
      if (window.webkit && window.webkit.messageHandlers) {
        const handlers = ['rumba', 'socketmobile', 'barcode']
        for (const handlerName of handlers) {
          const handler = window.webkit.messageHandlers[handlerName]
          if (handler) {
            handler.postMessage({ action: 'stopScanning' })
            return
          }
        }
      }

      // Method 3: Legacy API
      if (window.rumbaJS && window.rumbaJS.stopScanning) {
        window.rumbaJS.stopScanning()
        return
      }

      if (this.config.debugLogging) {
        console.log('✅ Rumba SDK scanning stopped')
      }

    } catch (error) {
      console.error('❌ Error stopping Rumba SDK scanning:', error.message)
    }
  }

  /**
   * Check if currently scanning
   */
  isCurrentlyScanning() {
    return this.isScanning
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isAvailable: this.isAvailable,
      isScanning: this.isScanning,
      deviceInfo: this.deviceInfo,
      attempts: this.initializationAttempts,
      maxAttempts: this.maxRetryAttempts,
      environment: this.getEnvironmentInfo()
    }
  }

  /**
   * Get comprehensive diagnostics
   */
  getDiagnostics() {
    return {
      service: {
        isInitialized: this.isInitialized,
        isAvailable: this.isAvailable,
        isScanning: this.isScanning,
        attempts: this.initializationAttempts,
        maxAttempts: this.maxRetryAttempts
      },
      api: {
        hasRumbaJS: !!window.RumbaJS,
        hasLegacyRumbaJS: !!window.rumbaJS,
        hasWebkit: !!window.webkit,
        hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
        messageHandlers: window.webkit && window.webkit.messageHandlers ? 
          Object.keys(window.webkit.messageHandlers) : []
      },
      device: {
        deviceInfo: this.deviceInfo,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      },
      callback: {
        hasCallback: this.onBarcodeCallback !== null,
        callbackType: typeof this.onBarcodeCallback
      },
      environment: this.getEnvironmentInfo(),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.config.debugLogging) {
      console.log('🧹 Cleaning up Rumba SDK Service...')
    }

    // Stop scanning if running
    if (this.isScanning) {
      this.stopScanning()
    }

    // Clean up global callbacks
    if (window.rumbaJSCallback) {
      delete window.rumbaJSCallback
    }

    // Reset state
    this.isInitialized = false
    this.isAvailable = false
    this.isScanning = false
    this.onBarcodeCallback = null
    this.deviceInfo = null
    this.initializationAttempts = 0
    this.scanningOptions = null

    if (this.config.debugLogging) {
      console.log('✅ Rumba SDK Service cleanup complete')
    }
  }

  /**
   * Retry initialization
   */
  async retryInitialization(onBarcodeCallback, options = {}) {
    if (this.initializationAttempts >= this.maxRetryAttempts) {
      throw new Error(`Maximum retry attempts (${this.maxRetryAttempts}) exceeded`)
    }

    if (this.config.debugLogging) {
      console.log(`⏱️ Retrying Rumba SDK initialization in ${this.config.retryDelay}ms...`)
    }
    
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
    return this.initialize(onBarcodeCallback, options)
  }
}

// Export singleton instance
export const rumbaSDKService = new RumbaSDKService()
export default rumbaSDKService