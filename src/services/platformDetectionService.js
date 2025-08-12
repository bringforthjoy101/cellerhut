/**
 * Platform Detection Service  
 * Detects the current platform and scanning environment to determine
 * which scanner service should be used (keyboard wedge vs browser API)
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
    
    // Mobile Detection
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(userAgent) || 
                     navigator.maxTouchPoints > 1
    const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent) ||
                     (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    // App Environment
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
        name: this.getOSName(isIOS, isAndroid, isWindows, isMacOS, isLinux),
        version: this.getOSVersion(userAgent)
      },
      browser: {
        isChrome,
        isSafari,
        isFirefox,
        isEdge,
        name: this.getBrowserName(isChrome, isSafari, isFirefox, isEdge),
        version: this.getBrowserVersion(userAgent)
      },
      device: {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        hasTouchScreen: navigator.maxTouchPoints > 0 || 'ontouchstart' in window
      },
      app: {
        isStandalone,
        isWebView,
        context: this.getAppContext(isStandalone, isWebView)
      }
    }
  }

  /**
   * Check if running in a WebView
   */
  isRunningInWebView(userAgent) {
    return /WebView|wv|Version\/[\d\.]+.*Safari/.test(userAgent) && 
           !/Chrome|CriOS|Firefox|FxiOS|Edge|Edg/.test(userAgent)
  }

  /**
   * Get app context
   */
  getAppContext(isStandalone, isWebView) {
    if (isWebView) return 'webview'
    if (isStandalone) return 'standalone'
    return 'browser'
  }

  /**
   * Detect available scanner APIs
   */
  detectScannerAPIs() {
    return {
      // Keyboard Wedge (always available as it uses keyboard events)
      keyboardWedge: {
        available: true,
        ready: true,
        description: 'USB/Bluetooth scanners in keyboard emulation mode'
      },
      
      // Browser Barcode Detection API
      browserAPI: {
        available: this.isBarcodeDetectorAvailable(),
        supported: this.getSupportedBarcodeFormats()
      },
      
      // Camera API (for fallback scanning)
      cameraAPI: {
        available: this.isCameraAPIAvailable(),
        permissions: this.getCameraPermissionState()
      }
    }
  }

  /**
   * Check if Barcode Detector API is available
   */
  isBarcodeDetectorAvailable() {
    try {
      return 'BarcodeDetector' in window
    } catch (error) {
      return false
    }
  }

  /**
   * Get supported barcode formats
   */
  async getSupportedBarcodeFormats() {
    try {
      if ('BarcodeDetector' in window && 'getSupportedFormats' in window.BarcodeDetector) {
        return await window.BarcodeDetector.getSupportedFormats()
      }
    } catch (error) {
      // Ignore errors
    }
    return []
  }

  /**
   * Check if Camera API is available
   */
  isCameraAPIAvailable() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * Get camera permission state
   */
  async getCameraPermissionState() {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' })
        return permission.state
      }
    } catch (error) {
      // Permissions API not available or camera permission not queryable
    }
    return 'unknown'
  }

  /**
   * Detect network connectivity
   */
  detectConnectivity() {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection
    
    return {
      online: navigator.onLine,
      type: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false
    }
  }

  /**
   * Detect browser capabilities
   */
  detectCapabilities() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webGL: this.isWebGLAvailable(),
      localStorage: this.isLocalStorageAvailable(),
      indexedDB: 'indexedDB' in window,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      vibration: 'vibrate' in navigator,
      battery: 'getBattery' in navigator,
      bluetooth: 'bluetooth' in navigator,
      usb: 'usb' in navigator,
      midi: 'requestMIDIAccess' in navigator,
      clipboard: 'clipboard' in navigator,
      share: 'share' in navigator
    }
  }

  /**
   * Check WebGL availability
   */
  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch (error) {
      return false
    }
  }

  /**
   * Check localStorage availability
   */
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get OS name
   */
  getOSName(isIOS, isAndroid, isWindows, isMacOS, isLinux) {
    if (isIOS) return 'iOS'
    if (isAndroid) return 'Android'
    if (isWindows) return 'Windows'
    if (isMacOS) return 'macOS'
    if (isLinux) return 'Linux'
    return 'Unknown'
  }

  /**
   * Get OS version
   */
  getOSVersion(userAgent) {
    // iOS Version
    const iOSMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)
    if (iOSMatch) return `${iOSMatch[1]}.${iOSMatch[2]}.${iOSMatch[3] || 0}`
    
    // Android Version
    const androidMatch = userAgent.match(/Android (\d+\.?\d*\.?\d*)/)
    if (androidMatch) return androidMatch[1]
    
    // Windows Version
    const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/)
    if (windowsMatch) {
      const versionMap = {
        '10.0': '10/11',
        6.3: '8.1',
        6.2: '8',
        6.1: '7',
        '6.0': 'Vista',
        5.1: 'XP'
      }
      return versionMap[windowsMatch[1]] || windowsMatch[1]
    }
    
    return 'Unknown'
  }

  /**
   * Get browser name
   */
  getBrowserName(isChrome, isSafari, isFirefox, isEdge) {
    if (isEdge) return 'Edge'
    if (isChrome) return 'Chrome'
    if (isSafari) return 'Safari'
    if (isFirefox) return 'Firefox'
    return 'Unknown'
  }

  /**
   * Get browser version
   */
  getBrowserVersion(userAgent) {
    const match = userAgent.match(/(Chrome|CriOS|Safari|Firefox|FxiOS|Edge|Edg)\/(\d+)/)
    return match ? match[2] : 'Unknown'
  }

  /**
   * Get recommended scanner service based on platform
   */
  getRecommendedScannerService(environment, scannerAPIs) {
    const recommendation = {
      primary: null,
      alternatives: [],
      reasons: []
    }

    // Primary recommendation: Keyboard wedge for desktop/tablet with hardware scanners
    if (environment.device.isDesktop || environment.device.isTablet) {
      recommendation.primary = {
        service: 'keyboardWedge',
        confidence: 'high',
        reason: 'Desktop/tablet environment ideal for USB/Bluetooth scanners'
      }
      recommendation.reasons.push('Hardware scanners work best on desktop/tablet devices')
    } else if (environment.device.isMobile && scannerAPIs.browserAPI.available) {
      // Secondary recommendation: Browser API for mobile devices
      recommendation.primary = {
        service: 'browserAPI',
        confidence: 'high',
        reason: 'Mobile device with camera scanning capability'
      }
      recommendation.reasons.push('Camera-based scanning optimal for mobile devices')
    } else {
      // Fallback to keyboard wedge
      recommendation.primary = {
        service: 'keyboardWedge',
        confidence: 'medium',
        reason: 'Universal compatibility with any input device'
      }
      recommendation.reasons.push('Keyboard wedge works with any scanner in HID mode')
    }

    // Always add alternatives
    if (recommendation.primary?.service !== 'browserAPI' && scannerAPIs.browserAPI.available) {
      recommendation.alternatives.push({
        service: 'browserAPI',
        reason: 'Camera-based scanning available as fallback'
      })
    }

    if (recommendation.primary?.service !== 'keyboardWedge') {
      recommendation.alternatives.push({
        service: 'keyboardWedge',
        reason: 'Hardware scanner support available'
      })
    }

    return recommendation
  }

  /**
   * Quick check methods for convenience
   */
  shouldUseKeyboardWedge() {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.recommendation.primary?.service === 'keyboardWedge'
  }

  shouldUseBrowserAPI() {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.recommendation.primary?.service === 'browserAPI'
  }

  /**
   * Get diagnostic summary
   */
  getDiagnosticSummary() {
    const platformInfo = this.getPlatformInfo()
    const issues = []
    const recommendations = []

    // Check for potential issues
    if (!navigator.onLine) {
      issues.push('Device is offline')
    }

    if (!platformInfo.scannerAPIs.browserAPI.available && platformInfo.environment.device.isMobile) {
      issues.push('Mobile device without Barcode Detection API support')
      recommendations.push('Use keyboard wedge scanner or manual entry')
    }

    if (!platformInfo.scannerAPIs.cameraAPI.available && platformInfo.environment.device.isMobile) {
      issues.push('Camera API not available on mobile device')
    }

    // Add recommendations based on platform
    if (platformInfo.environment.device.isDesktop) {
      recommendations.push('Connect USB or Bluetooth barcode scanner for best performance')
    }

    if (platformInfo.environment.device.isMobile && platformInfo.scannerAPIs.cameraAPI.available) {
      recommendations.push('Use camera for barcode scanning')
    }

    return {
      platform: platformInfo.environment.os.name,
      browser: platformInfo.environment.browser.name,
      recommendedService: platformInfo.recommendation.primary?.service,
      issues,
      recommendations,
      capabilities: {
        keyboardWedge: 'Always available',
        browserAPI: platformInfo.scannerAPIs.browserAPI.available ? 'Available' : 'Not available',
        camera: platformInfo.scannerAPIs.cameraAPI.available ? 'Available' : 'Not available'
      }
    }
  }
}

// Export singleton instance
const platformDetectionService = new PlatformDetectionService()
export default platformDetectionService