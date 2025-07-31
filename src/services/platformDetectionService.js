/**
 * Platform Detection Service  
 * Detects the current platform and scanning environment to determine
 * which scanner service should be used (CaptureJS vs Rumba SDK)
 */

class PlatformDetectionService {
  constructor() {
    this.detectionCache = null
    this.lastDetectionTime = null
    this.cacheTimeout = 30000 // 30 seconds cache timeout
    
    this.config = {
      debugLogging: true
    }
  }

  /**
   * Get current platform and scanning environment information
   * Results are cached for performance
   */
  getPlatformInfo(forceRefresh = false) {
    // Return cached result if available and not expired
    if (!forceRefresh && this.detectionCache && this.lastDetectionTime) {
      const cacheAge = Date.now() - this.lastDetectionTime
      if (cacheAge < this.cacheTimeout) {
        if (this.config.debugLogging) {
          console.log('📱 Using cached platform detection result')
        }
        return this.detectionCache
      }
    }

    // Perform fresh detection
    const platformInfo = this.detectPlatform()
    
    // Cache the result
    this.detectionCache = platformInfo
    this.lastDetectionTime = Date.now()
    
    if (this.config.debugLogging) {
      console.log('📱 Platform detection complete:', platformInfo)
    }
    
    return platformInfo
  }

  /**
   * Perform comprehensive platform detection
   */
  detectPlatform() {
    const userAgent = navigator.userAgent || ''
    const platform = navigator.platform || ''
    const vendor = navigator.vendor || ''
    
    // Basic environment detection
    const environment = this.detectEnvironment(userAgent, platform, vendor)
    
    // Scanner API availability
    const scannerAPIs = this.detectScannerAPIs()
    
    // Network and connectivity
    const connectivity = this.detectConnectivity()
    
    // Browser capabilities
    const capabilities = this.detectCapabilities()
    
    // Determine recommended scanner service
    const recommendation = this.getRecommendedScannerService(environment, scannerAPIs)
    
    return {
      environment,
      scannerAPIs,
      connectivity,
      capabilities,
      recommendation,
      timestamp: new Date().toISOString(),
      userAgent: userAgent.substring(0, 150) + (userAgent.length > 150 ? '...' : ''),
      platform,
      vendor
    }
  }

  /**
   * Detect basic environment information
   */
  detectEnvironment(userAgent, platform, vendor) {
    // Operating System Detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                  (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isAndroid = /Android/.test(userAgent)
    const isWindows = /Windows/.test(userAgent) || /Win32|Win64/.test(platform)
    const isMacOS = /Macintosh|MacIntel/.test(platform) && navigator.maxTouchPoints <= 1
    const isLinux = /Linux/.test(platform) && !isAndroid
    
    // Browser Detection
    const isChrome = /Chrome|CriOS/.test(userAgent) && !/Edge|Edg\//.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent)
    const isFirefox = /Firefox|FxiOS/.test(userAgent)
    const isEdge = /Edge|Edg\//.test(userAgent)
    
    // Device Type Detection
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS
    const isTablet = /Tablet|iPad/.test(userAgent) || 
                     (isIOS && window.screen.width >= 768)
    const isDesktop = !isMobile && !isTablet
    
    // App Environment Detection
    const isRumbaApp = this.isRunningInRumbaApp()
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true
    const isWebView = this.isRunningInWebView(userAgent)
    
    return {
      os: {
        isIOS,
        isAndroid, 
        isWindows,
        isMacOS,
        isLinux,
        name: this.getOSName(isIOS, isAndroid, isWindows, isMacOS, isLinux)
      },
      browser: {
        isChrome,
        isSafari,
        isFirefox,
        isEdge,
        name: this.getBrowserName(isChrome, isSafari, isFirefox, isEdge)
      },
      device: {
        isMobile,
        isTablet,
        isDesktop,
        type: this.getDeviceType(isMobile, isTablet, isDesktop)
      },
      app: {
        isRumbaApp,
        isStandalone,
        isWebView,
        context: this.getAppContext(isRumbaApp, isStandalone, isWebView)
      }
    }
  }

  /**
   * Check if running in Rumba app environment
   */
  isRunningInRumbaApp() {
    try {
      // Check for proper Rumba constructor (new API)
      const hasRumbaConstructor = typeof window !== 'undefined' && 
        window.Rumba && 
        typeof window.Rumba === 'function'
      
      // Check for Rumba-specific JavaScript API objects (legacy)
      const hasRumbaAPI = !!(
        window.RumbaJS || 
        window.rumbaJS ||
        window.socketmobile ||
        window.SocketMobile
      )
      
      // Check for Rumba-specific webkit message handlers
      const hasRumbaWebkit = !!(
        window.webkit && 
        window.webkit.messageHandlers && (
          window.webkit.messageHandlers.rumba ||
          window.webkit.messageHandlers.socketmobile ||  
          window.webkit.messageHandlers.barcode
        )
      )
      
      // Check user agent for Rumba signatures
      const userAgent = navigator.userAgent || ''
      const hasRumbaUserAgent = /Rumba|SocketMobile/i.test(userAgent)
      
      return hasRumbaConstructor || hasRumbaAPI || hasRumbaWebkit || hasRumbaUserAgent
    } catch (error) {
      return false
    }
  }

  /**
   * Check if running in a WebView
   */
  isRunningInWebView(userAgent) {
    // Common WebView indicators
    const webViewPatterns = [
      /wv\)/i, // Android WebView
      /Version\/[\d.]+.*Mobile.*Safari/i, // iOS WebView (partial)
      /FB_IAB/i, // Facebook in-app browser
      /FBAN|FBAV/i, // Facebook app
      /Instagram/i, // Instagram in-app browser
      /LinkedIn/i, // LinkedIn in-app browser
      /Twitter/i, // Twitter in-app browser
      /Line\//i // Line app browser
    ]
    
    return webViewPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Detect available scanner APIs
   */
  detectScannerAPIs() {
    const apis = {
      // CaptureJS (Socket Mobile Capture API)
      captureJS: {
        available: this.isCaptureJSAvailable(),
        version: this.getCaptureJSVersion(),
        companionServiceRunning: null // Will be checked later
      },
      
      // Rumba SDK  
      rumbaSDK: {
        available: this.isRumbaSDKAvailable(),
        apiType: this.getRumbaAPIType(),
        messageHandlers: this.getRumbaMessageHandlers()
      },
      
      // Browser native barcode detection
      browserAPI: {
        available: this.isBrowserBarcodeAPIAvailable(),
        support: this.getBrowserBarcodeSupport()
      },
      
      // Camera access for scanning
      camera: {
        available: this.isCameraAvailable(),
        permissions: null // Will be checked on demand
      }
    }
    
    return apis
  }

  /**
   * Check CaptureJS API availability
   */
  isCaptureJSAvailable() {
    try {
      return typeof window !== 'undefined' && !!(
        window.Capture || 
        (window.socketmobile && window.socketmobile.Capture)
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Get CaptureJS version if available
   */
  getCaptureJSVersion() {
    try {
      if (window.Capture && window.Capture.version) {
        return window.Capture.version
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Check Rumba SDK availability
   */
  isRumbaSDKAvailable() {
    return this.isRunningInRumbaApp()
  }

  /**
   * Get Rumba API type
   */
  getRumbaAPIType() {
    if (typeof window.Rumba === 'function') return 'Rumba (constructor)'
    if (window.RumbaJS) return 'RumbaJS (instance)'
    if (window.rumbaJS) return 'rumbaJS (legacy)'
    if (window.webkit && window.webkit.messageHandlers) return 'webkit'
    return null
  }

  /**
   * Get available Rumba message handlers
   */
  getRumbaMessageHandlers() {
    try {
      if (window.webkit && window.webkit.messageHandlers) {
        const allHandlers = Object.keys(window.webkit.messageHandlers)
        const rumbaHandlers = allHandlers.filter(handler => 
          /rumba|socketmobile|barcode/i.test(handler)
        )
        return rumbaHandlers
      }
      return []
    } catch (error) {
      return []
    }
  }

  /**
   * Check browser barcode detection API
   */
  isBrowserBarcodeAPIAvailable() {
    try {
      return 'BarcodeDetector' in window
    } catch (error) {
      return false
    }
  }

  /**
   * Get browser barcode support details
   */
  getBrowserBarcodeSupport() {
    try {
      if ('BarcodeDetector' in window) {
        return {
          supported: true,
          canDetect: typeof BarcodeDetector.getSupportedFormats === 'function'
        }
      }
      return { supported: false }
    } catch (error) {
      return { supported: false, error: error.message }
    }
  }

  /**
   * Check camera availability
   */
  isCameraAvailable() {
    try {
      return !!(
        navigator.mediaDevices && 
        navigator.mediaDevices.getUserMedia
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Detect connectivity information
   */
  detectConnectivity() {
    return {
      online: navigator.onLine,
      connection: this.getConnectionInfo(),
      serviceWorker: 'serviceWorker' in navigator
    }
  }

  /**
   * Get network connection information
   */
  getConnectionInfo() {
    try {
      if ('connection' in navigator) {
        const conn = navigator.connection
        return {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        }
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Detect browser capabilities
   */
  detectCapabilities() {
    return {
      webAssembly: 'WebAssembly' in window,
      webWorkers: 'Worker' in window,
      webRTC: this.hasWebRTC(),
      localStorage: this.hasLocalStorage(),
      sessionStorage: this.hasSessionStorage(),
      indexedDB: 'indexedDB' in window,
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      pushMessaging: 'PushManager' in window,
      touchEvents: 'ontouchstart' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window
    }
  }

  /**
   * Check WebRTC availability
   */
  hasWebRTC() {
    try {
      return !!(
        window.RTCPeerConnection || 
        window.webkitRTCPeerConnection || 
        window.mozRTCPeerConnection
      )
    } catch (error) {
      return false
    }
  }

  /**
   * Check localStorage availability
   */
  hasLocalStorage() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Check sessionStorage availability
   */
  hasSessionStorage() {
    try {
      const test = '__session_test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get recommended scanner service based on detection results
   */
  getRecommendedScannerService(environment, scannerAPIs) {
    const recommendations = []
    
    // Primary recommendation: Rumba SDK for Rumba app
    if (environment.app.isRumbaApp && scannerAPIs.rumbaSDK.available) {
      recommendations.push({
        service: 'rumbaSDK',
        priority: 1,
        reason: 'Running in Rumba app with Rumba SDK available',
        confidence: 'high'
      })
    }
    
    // Secondary recommendation: CaptureJS for regular browsers
    if (!environment.app.isRumbaApp && scannerAPIs.captureJS.available) {
      recommendations.push({
        service: 'captureJS',
        priority: 2,
        reason: 'Regular browser with CaptureJS available',
        confidence: 'high'
      })
    }
    
    // Tertiary recommendation: Browser API for camera scanning
    if (scannerAPIs.browserAPI.available && scannerAPIs.camera.available) {
      recommendations.push({
        service: 'browserAPI',
        priority: 3,
        reason: 'Browser barcode detection and camera available',
        confidence: 'medium'
      })
    }
    
    // Fallback: Keyboard wedge scanning
    recommendations.push({
      service: 'keyboardWedge',
      priority: 4,
      reason: 'Universal fallback for USB/Bluetooth scanners',
      confidence: 'low'
    })
    
    return {
      primary: recommendations[0] || null,
      alternatives: recommendations.slice(1),
      allOptions: recommendations
    }
  }

  /**
   * Helper methods for cleaner code
   */
  getOSName(isIOS, isAndroid, isWindows, isMacOS, isLinux) {
    if (isIOS) return 'iOS'
    if (isAndroid) return 'Android'
    if (isWindows) return 'Windows'
    if (isMacOS) return 'macOS'
    if (isLinux) return 'Linux'
    return 'Unknown'
  }

  getBrowserName(isChrome, isSafari, isFirefox, isEdge) {
    if (isChrome) return 'Chrome'
    if (isSafari) return 'Safari'
    if (isFirefox) return 'Firefox'
    if (isEdge) return 'Edge'
    return 'Unknown'
  }

  getDeviceType(isMobile, isTablet, isDesktop) {
    if (isTablet) return 'tablet'
    if (isMobile) return 'mobile'
    if (isDesktop) return 'desktop'
    return 'unknown'
  }

  getAppContext(isRumbaApp, isStandalone, isWebView) {
    if (isRumbaApp) return 'rumba'
    if (isStandalone) return 'standalone'
    if (isWebView) return 'webview'
    return 'browser'
  }

  /**
   * Check if specific scanner service is recommended
   */
  shouldUseRumbaSDK() {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.recommendation.primary?.service === 'rumbaSDK'
  }

  shouldUseCaptureJS() {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.recommendation.primary?.service === 'captureJS' ||
           (platformInfo.recommendation.primary?.service !== 'rumbaSDK' && 
            platformInfo.scannerAPIs.captureJS.available)
  }

  shouldUseBrowserAPI() {
    const platformInfo = this.getPlatformInfo()
    const primary = platformInfo.recommendation.primary?.service
    return primary === 'browserAPI' || 
           (!['rumbaSDK', 'captureJS'].includes(primary) && 
            platformInfo.scannerAPIs.browserAPI.available)
  }

  /**
   * Get diagnostic summary for troubleshooting
   */
  getDiagnosticSummary() {
    const platformInfo = this.getPlatformInfo()
    
    return {
      environment: `${platformInfo.environment.os.name} ${platformInfo.environment.browser.name} (${platformInfo.environment.device.type})`,
      context: platformInfo.environment.app.context,
      recommendedService: platformInfo.recommendation.primary?.service || 'none',
      availableAPIs: Object.keys(platformInfo.scannerAPIs).filter(
        api => platformInfo.scannerAPIs[api].available
      ),
      issues: this.identifyPotentialIssues(platformInfo),
      timestamp: platformInfo.timestamp
    }
  }

  /**
   * Identify potential issues based on platform detection
   */
  identifyPotentialIssues(platformInfo) {
    const issues = []
    
    if (platformInfo.environment.app.isRumbaApp && !platformInfo.scannerAPIs.rumbaSDK.available) {
      issues.push('Running in Rumba app but Rumba SDK not available')
    }
    
    if (!platformInfo.environment.app.isRumbaApp && !platformInfo.scannerAPIs.captureJS.available) {
      issues.push('Not in Rumba app and CaptureJS not available')
    }
    
    if (!platformInfo.connectivity.online) {
      issues.push('Device is offline')
    }
    
    if (!platformInfo.scannerAPIs.camera.available) {
      issues.push('Camera access not available')
    }
    
    return issues
  }

  /**
   * Clear detection cache to force fresh detection
   */
  clearCache() {
    this.detectionCache = null
    this.lastDetectionTime = null
    if (this.config.debugLogging) {
      console.log('🗑️ Platform detection cache cleared')
    }
  }
}

// Export singleton instance
export const platformDetectionService = new PlatformDetectionService()
export default platformDetectionService