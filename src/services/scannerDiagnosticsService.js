/**
 * Scanner Diagnostics Service
 * Provides comprehensive diagnostics and troubleshooting for scanner integration
 * Helps identify and resolve issues with Socket Mobile, Rumba SDK, and other scanner services
 */

import unifiedScannerManager from './unifiedScannerManager'
import platformDetectionService from './platformDetectionService'
import scannerService from './scannerService'
import rumbaSDKService from './rumbaSDKService'

class ScannerDiagnosticsService {
  constructor() {
    this.diagnosticsHistory = []
    this.maxHistoryEntries = 50
    this.config = {
      debugLogging: true,
      enableDetailedLogs: true,
      enablePerformanceTracking: true
    }
  }

  /**
   * Run comprehensive scanner diagnostics
   */
  async runFullDiagnostics() {
    const startTime = Date.now()
    
    if (this.config.debugLogging) {
      console.log('🔍 Running comprehensive scanner diagnostics...')
    }

    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        executionTime: null,
        platform: this.getPlatformDiagnostics(),
        environment: this.getEnvironmentDiagnostics(),
        services: await this.getServiceDiagnostics(),
        connectivity: this.getConnectivityDiagnostics(),
        permissions: await this.getPermissionsDiagnostics(),
        configuration: this.getConfigurationDiagnostics(),
        commonIssues: this.identifyCommonIssues(),
        recommendations: this.generateRecommendations(),
        troubleshooting: this.getTroubleshootingSteps()
      }

      diagnostics.executionTime = Date.now() - startTime
      
      // Add to diagnostics history
      this.addToDiagnosticsHistory(diagnostics)
      
      if (this.config.debugLogging) {
        console.log('✅ Comprehensive diagnostics complete:', diagnostics)
      }

      return diagnostics

    } catch (error) {
      const errorDiagnostics = {
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
        error: {
          message: error.message,
          stack: error.stack,
          type: error.constructor.name
        },
        partialResults: this.getBasicDiagnostics()
      }

      console.error('❌ Diagnostics execution failed:', errorDiagnostics)
      return errorDiagnostics
    }
  }

  /**
   * Get platform-specific diagnostics
   */
  getPlatformDiagnostics() {
    const platformInfo = platformDetectionService.getPlatformInfo()
    
    return {
      detected: {
        os: platformInfo.environment.os.name,
        browser: platformInfo.environment.browser.name,
        device: platformInfo.environment.device.type,
        context: platformInfo.environment.app.context
      },
      capabilities: platformInfo.capabilities,
      scannerAPIs: Object.keys(platformInfo.scannerAPIs).map(api => ({
        name: api,
        available: platformInfo.scannerAPIs[api].available,
        details: platformInfo.scannerAPIs[api]
      })),
      recommendation: platformInfo.recommendation,
      userAgent: platformInfo.userAgent,
      connectivity: platformInfo.connectivity
    }
  }

  /**
   * Get environment diagnostics
   */
  getEnvironmentDiagnostics() {
    const env = {}
    
    // Check environment variables (safely)
    const envVars = [
      'REACT_APP_SOCKETMOBILE_APP_ID',
      'REACT_APP_SOCKETMOBILE_DEVELOPER_ID', 
      'REACT_APP_SOCKETMOBILE_APP_KEY',
      'NODE_ENV'
    ]
    
    envVars.forEach(varName => {
      const value = process.env[varName]
      env[varName] = value ? {
        isSet: true,
        length: value.length,
        preview: varName.includes('KEY') ? '***' : value.substring(0, 10) + '...'
      } : { isSet: false }
    })

    return {
      variables: env,
      window: {
        location: {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          port: window.location.port,
          pathname: window.location.pathname
        },
        navigator: {
          userAgent: navigator.userAgent.substring(0, 100) + '...',
          platform: navigator.platform,
          language: navigator.language,
          onLine: navigator.onLine,
          cookieEnabled: navigator.cookieEnabled
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth
        }
      }
    }
  }

  /**
   * Get service-specific diagnostics
   */
  async getServiceDiagnostics() {
    const services = {}

    // Unified Scanner Manager
    try {
      services.unifiedManager = {
        available: true,
        status: unifiedScannerManager.getStatus(),
        diagnostics: unifiedScannerManager.getDiagnostics()
      }
    } catch (error) {
      services.unifiedManager = {
        available: false,
        error: error.message
      }
    }

    // CaptureJS Service
    try {
      services.captureJS = {
        available: true,
        status: scannerService.getStatus(),
        diagnostics: scannerService.getDiagnostics(),
        companionService: await this.testSocketMobileCompanion()
      }
    } catch (error) {
      services.captureJS = {
        available: false,
        error: error.message
      }
    }

    // Rumba SDK Service
    try {
      services.rumbaSDK = {
        available: true,
        status: rumbaSDKService.getStatus(),
        diagnostics: rumbaSDKService.getDiagnostics()
      }
    } catch (error) {
      services.rumbaSDK = {
        available: false,
        error: error.message
      }
    }

    return services
  }

  /**
   * Test Socket Mobile Companion service
   */
  async testSocketMobileCompanion() {
    try {
      if (scannerService.checkCompanionService) {
        const result = await scannerService.checkCompanionService()
        return {
          available: result,
          tested: true,
          timestamp: new Date().toISOString()
        }
      }
      return { available: false, tested: false, reason: 'No check method available' }
    } catch (error) {
      return {
        available: false,
        tested: true,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get connectivity diagnostics
   */
  getConnectivityDiagnostics() {
    return {
      online: navigator.onLine,
      connection: this.getConnectionInfo(),
      localNetwork: this.testLocalConnectivity(),
      socketMobile: this.testSocketMobileConnectivity()
    }
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    try {
      if ('connection' in navigator) {
        const conn = navigator.connection
        return {
          available: true,
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        }
      }
      return { available: false }
    } catch (error) {
      return { available: false, error: error.message }
    }
  }

  /**
   * Test local connectivity (basic checks)
   */
  testLocalConnectivity() {
    return {
      localhost: this.canReachLocalhost(),
      websocket: this.testWebSocketSupport(),
      cors: this.testCORSSupport()
    }
  }

  /**
   * Test if localhost is reachable
   */
  canReachLocalhost() {
    try {
      // Simple check - can we create requests to localhost
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1'
      return {
        accessible: isLocalhost,
        currentHost: window.location.hostname
      }
    } catch (error) {
      return { accessible: false, error: error.message }
    }
  }

  /**
   * Test WebSocket support
   */
  testWebSocketSupport() {
    try {
      return {
        supported: 'WebSocket' in window,
        constructor: typeof WebSocket
      }
    } catch (error) {
      return { supported: false, error: error.message }
    }
  }

  /**
   * Test CORS support
   */
  testCORSSupport() {
    try {
      return {
        supported: 'fetch' in window && 'Request' in window,
        xmlHttpRequest: 'XMLHttpRequest' in window
      }
    } catch (error) {
      return { supported: false, error: error.message }
    }
  }

  /**
   * Test Socket Mobile connectivity
   */
  testSocketMobileConnectivity() {
    try {
      // Check if Socket Mobile service ports might be accessible
      const commonPorts = [18481, 18482, 18483] // Common Socket Mobile ports
      
      return {
        commonPorts,
        localhost: window.location.hostname === 'localhost',
        protocol: window.location.protocol,
        note: 'Socket Mobile Companion runs on localhost with specific ports'
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  /**
   * Get permissions diagnostics
   */
  async getPermissionsDiagnostics() {
    const permissions = {}

    // Camera permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        permissions.camera = { granted: true, tested: true }
        stream.getTracks().forEach(track => track.stop()) // Clean up
      } else {
        permissions.camera = { granted: false, reason: 'getUserMedia not available' }
      }
    } catch (error) {
      permissions.camera = {
        granted: false,
        tested: true,
        error: error.name,
        message: error.message
      }
    }

    // Notification permission
    try {
      if ('Notification' in window) {
        permissions.notifications = {
          supported: true,
          permission: Notification.permission
        }
      } else {
        permissions.notifications = { supported: false }
      }
    } catch (error) {
      permissions.notifications = { supported: false, error: error.message }
    }

    // Storage permissions
    permissions.storage = {
      localStorage: this.testStoragePermission('localStorage'),
      sessionStorage: this.testStoragePermission('sessionStorage'),
      indexedDB: this.testIndexedDBPermission()
    }

    return permissions
  }

  /**
   * Test storage permission
   */
  testStoragePermission(storageType) {
    try {
      const storage = window[storageType]
      const testKey = '__diagnostic_test__'
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return { available: true, tested: true }
    } catch (error) {
      return { available: false, tested: true, error: error.message }
    }
  }

  /**
   * Test IndexedDB permission
   */
  testIndexedDBPermission() {
    try {
      return {
        supported: 'indexedDB' in window,
        available: !!window.indexedDB
      }
    } catch (error) {
      return { supported: false, error: error.message }
    }
  }

  /**
   * Get configuration diagnostics
   */
  getConfigurationDiagnostics() {
    return {
      unifiedManager: unifiedScannerManager.config || {},
      services: {
        captureJS: {
          hasCredentials: !!(process.env.REACT_APP_SOCKETMOBILE_APP_ID && 
                            process.env.REACT_APP_SOCKETMOBILE_DEVELOPER_ID && 
                            process.env.REACT_APP_SOCKETMOBILE_APP_KEY),
          maxRetryAttempts: scannerService.maxRetryAttempts || 'unknown'
        },
        rumbaSDK: rumbaSDKService.config || {}
      }
    }
  }

  /**
   * Identify common issues based on diagnostics
   */
  identifyCommonIssues() {
    const issues = []
    const platformInfo = platformDetectionService.getPlatformInfo()

    // Environment issues
    if (!process.env.REACT_APP_SOCKETMOBILE_APP_ID) {
      issues.push({
        type: 'configuration',
        severity: 'high',
        title: 'Missing Socket Mobile App ID',
        description: 'REACT_APP_SOCKETMOBILE_APP_ID environment variable is not set',
        impact: 'CaptureJS scanner service will not work'
      })
    }

    // Platform compatibility issues
    if (platformInfo.environment.app.isRumbaApp && !platformInfo.scannerAPIs.rumbaSDK.available) {
      issues.push({
        type: 'compatibility',
        severity: 'high',
        title: 'Rumba SDK not available in Rumba app',
        description: 'Running in Rumba app but Rumba JavaScript API is not accessible',
        impact: 'Barcode scanning will not work properly in Rumba app'
      })
    }

    // Browser compatibility issues
    if (!platformInfo.capabilities.webWorkers) {
      issues.push({
        type: 'browser',
        severity: 'medium',
        title: 'Web Workers not supported',
        description: 'Browser does not support Web Workers',
        impact: 'May affect barcode detection performance'
      })
    }

    // Camera issues
    if (!platformInfo.scannerAPIs.camera.available) {
      issues.push({
        type: 'permissions',
        severity: 'medium',
        title: 'Camera not available',
        description: 'Camera access is not available for barcode scanning',
        impact: 'Browser-based barcode scanning will not work'
      })
    }

    return issues
  }

  /**
   * Generate recommendations based on current state
   */
  generateRecommendations() {
    const recommendations = []
    const platformInfo = platformDetectionService.getPlatformInfo()

    // Platform-specific recommendations
    if (platformInfo.environment.app.isRumbaApp) {
      recommendations.push({
        category: 'platform',
        priority: 'high',
        title: 'Optimize for Rumba app',
        description: 'You are running in Rumba app. Ensure Rumba SDK integration is working properly.',
        action: 'Test Rumba SDK functionality and cart integration'
      })
    } else {
      recommendations.push({
        category: 'platform',
        priority: 'medium',
        title: 'Regular browser detected',
        description: 'Use CaptureJS for Socket Mobile scanners or camera scanning as fallback.',
        action: 'Start Socket Mobile Companion service for hardware scanner support'
      })
    }

    // Service recommendations
    if (!unifiedScannerManager.isInitialized) {
      recommendations.push({
        category: 'service',
        priority: 'high',
        title: 'Initialize scanner manager',
        description: 'The unified scanner manager is not initialized.',
        action: 'Call initialize() method with appropriate callback'
      })
    }

    // Configuration recommendations
    if (!process.env.REACT_APP_SOCKETMOBILE_APP_ID) {
      recommendations.push({
        category: 'configuration',
        priority: 'high',
        title: 'Set up Socket Mobile credentials',
        description: 'Socket Mobile environment variables are missing.',
        action: 'Add REACT_APP_SOCKETMOBILE_* variables to .env file'
      })
    }

    return recommendations
  }

  /**
   * Get troubleshooting steps
   */
  getTroubleshootingSteps() {
    return {
      socketMobile: [
        'Ensure Socket Mobile Companion app is installed and running',
        'Check that scanner is paired with Companion app',
        'Verify Socket Mobile credentials in environment variables',
        'Test scanner in Companion app first',
        'Check browser console for connection errors'
      ],
      rumbaApp: [
        'Verify app is running in Rumba environment',
        'Check that Rumba JavaScript API is accessible',
        'Test barcode scanning directly in Rumba app',
        'Ensure cart integration is working (not populating search field)',
        'Check for JavaScript errors in console'
      ],
      browserScanning: [
        'Grant camera permissions when prompted',
        'Ensure adequate lighting for barcode scanning',
        'Hold barcode steady and at appropriate distance',
        'Check that BarcodeDetector API is supported',
        'Try different barcode formats if detection fails'
      ],
      general: [
        'Refresh the page and try again',
        'Clear browser cache and cookies',
        'Check internet connection',
        'Disable browser extensions that might interfere',
        'Try in incognito/private browsing mode'
      ]
    }
  }

  /**
   * Get basic diagnostics (fallback for errors)
   */
  getBasicDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      online: navigator.onLine,
      location: window.location.href,
      environment: process.env.NODE_ENV
    }
  }

  /**
   * Add diagnostics to history
   */
  addToDiagnosticsHistory(diagnostics) {
    this.diagnosticsHistory.unshift(diagnostics)
    
    // Keep only the most recent entries
    if (this.diagnosticsHistory.length > this.maxHistoryEntries) {
      this.diagnosticsHistory = this.diagnosticsHistory.slice(0, this.maxHistoryEntries)
    }
  }

  /**
   * Get diagnostics history
   */
  getDiagnosticsHistory() {
    return [...this.diagnosticsHistory]
  }

  /**
   * Export diagnostics for sharing/support
   */
  exportDiagnostics(format = 'json') {
    const diagnostics = this.diagnosticsHistory[0] // Most recent
    
    if (!diagnostics) {
      return null
    }

    switch (format) {
      case 'json':
        return JSON.stringify(diagnostics, null, 2)
      
      case 'text':
        return this.formatDiagnosticsAsText(diagnostics)
      
      case 'summary':
        return this.createDiagnosticsSummary(diagnostics)
      
      default:
        return diagnostics
    }
  }

  /**
   * Format diagnostics as readable text
   */
  formatDiagnosticsAsText(diagnostics) {
    let text = `Scanner Diagnostics Report\n`
    text += `Generated: ${diagnostics.timestamp}\n`
    text += `Execution Time: ${diagnostics.executionTime}ms\n\n`
    
    text += `Platform: ${diagnostics.platform.detected.os} ${diagnostics.platform.detected.browser}\n`
    text += `Device: ${diagnostics.platform.detected.device}\n`
    text += `Context: ${diagnostics.platform.detected.context}\n\n`
    
    text += `Available Scanner APIs:\n`
    diagnostics.platform.scannerAPIs.forEach(api => {
      text += `- ${api.name}: ${api.available ? 'Available' : 'Not Available'}\n`
    })
    
    if (diagnostics.commonIssues.length > 0) {
      text += `\nCommon Issues Found:\n`
      diagnostics.commonIssues.forEach((issue, index) => {
        text += `${index + 1}. ${issue.title} (${issue.severity})\n`
        text += `   ${issue.description}\n`
      })
    }
    
    return text
  }

  /**
   * Create diagnostics summary
   */
  createDiagnosticsSummary(diagnostics) {
    const availableAPIs = diagnostics.platform.scannerAPIs
      .filter(api => api.available)
      .map(api => api.name)
    
    const highIssues = diagnostics.commonIssues
      .filter(issue => issue.severity === 'high')
    
    return {
      timestamp: diagnostics.timestamp,
      platform: `${diagnostics.platform.detected.os} ${diagnostics.platform.detected.browser}`,
      context: diagnostics.platform.detected.context,
      availableAPIs,
      highPriorityIssues: highIssues.length,
      totalIssues: diagnostics.commonIssues.length,
      recommendedService: diagnostics.platform.recommendation.primary?.service,
      healthy: highIssues.length === 0 && availableAPIs.length > 0
    }
  }

  /**
   * Clear diagnostics history
   */
  clearHistory() {
    this.diagnosticsHistory = []
    if (this.config.debugLogging) {
      console.log('🗑️ Scanner diagnostics history cleared')
    }
  }
}

// Export singleton instance
export const scannerDiagnosticsService = new ScannerDiagnosticsService()
export default scannerDiagnosticsService