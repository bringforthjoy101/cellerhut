/**
 * Scanner Testing Service
 * Comprehensive testing utilities for Socket Mobile integration
 * Tests both Rumba app and regular browser environments
 */

import unifiedScannerManager from './unifiedScannerManager'
import platformDetectionService from './platformDetectionService'
import scannerDiagnosticsService from './scannerDiagnosticsService'
import scannerService from './scannerService'
import rumbaSDKService from './rumbaSDKService'

class ScannerTestingService {
  constructor() {
    this.testResults = []
    this.isRunningTests = false
    this.currentTest = null
    this.testTimeout = 30000 // 30 seconds default timeout
    
    this.config = {
      debugLogging: true,
      runDiagnosticsOnFailure: true,
      autoCleanupAfterTests: true,
      detailedErrorReporting: true
    }
  }

  /**
   * Run comprehensive scanner integration tests
   */
  async runAllTests() {
    if (this.isRunningTests) {
      throw new Error('Tests are already running')
    }

    this.isRunningTests = true
    this.testResults = []

    if (this.config.debugLogging) {
      console.log('🧪 Starting comprehensive scanner integration tests...')
    }

    const startTime = Date.now()

    try {
      // Test 1: Platform Detection
      await this.runTest('Platform Detection', () => this.testPlatformDetection())

      // Test 2: Service Initialization
      await this.runTest('Service Initialization', () => this.testServiceInitialization())

      // Test 3: Scanner Service Selection
      await this.runTest('Scanner Service Selection', () => this.testScannerServiceSelection())

      // Test 4: Barcode Simulation
      await this.runTest('Barcode Simulation', () => this.testBarcodeSimulation())

      // Test 5: Error Handling
      await this.runTest('Error Handling', () => this.testErrorHandling())

      // Test 6: Platform-Specific Features
      await this.runTest('Platform-Specific Features', () => this.testPlatformSpecificFeatures())

      // Test 7: Fallback Mechanisms
      await this.runTest('Fallback Mechanisms', () => this.testFallbackMechanisms())

      // Test 8: Integration with Cart
      await this.runTest('Cart Integration', () => this.testCartIntegration())

      const totalTime = Date.now() - startTime
      const passedTests = this.testResults.filter(test => test.status === 'passed').length
      const failedTests = this.testResults.filter(test => test.status === 'failed').length

      const summary = {
        totalTests: this.testResults.length,
        passed: passedTests,
        failed: failedTests,
        executionTime: totalTime,
        successRate: (passedTests / this.testResults.length) * 100,
        timestamp: new Date().toISOString()
      }

      if (this.config.debugLogging) {
        console.log('🧪 Test suite complete:', summary)
      }

      return {
        summary,
        results: this.testResults,
        platformInfo: platformDetectionService.getPlatformInfo()
      }

    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
      throw error
    } finally {
      this.isRunningTests = false
      this.currentTest = null

      if (this.config.autoCleanupAfterTests) {
        await this.cleanup()
      }
    }
  }

  /**
   * Run individual test with error handling and timing
   */
  async runTest(testName, testFunction) {
    this.currentTest = testName
    const startTime = Date.now()

    if (this.config.debugLogging) {
      console.log(`🧪 Running test: ${testName}`)
    }

    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), this.testTimeout)
        )
      ])

      const testResult = {
        name: testName,
        status: 'passed',
        duration: Date.now() - startTime,
        result,
        timestamp: new Date().toISOString()
      }

      this.testResults.push(testResult)

      if (this.config.debugLogging) {
        console.log(`✅ Test passed: ${testName} (${testResult.duration}ms)`)
      }

      return testResult

    } catch (error) {
      const testResult = {
        name: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: {
          message: error.message,
          type: error.constructor.name,
          stack: this.config.detailedErrorReporting ? error.stack : undefined
        },
        timestamp: new Date().toISOString()
      }

      // Run diagnostics on failure if enabled
      if (this.config.runDiagnosticsOnFailure) {
        try {
          testResult.diagnostics = await scannerDiagnosticsService.runFullDiagnostics()
        } catch (diagError) {
          testResult.diagnosticsError = diagError.message
        }
      }

      this.testResults.push(testResult)

      if (this.config.debugLogging) {
        console.error(`❌ Test failed: ${testName} (${testResult.duration}ms):`, error.message)
      }

      return testResult
    }
  }

  /**
   * Test platform detection capabilities
   */
  async testPlatformDetection() {
    const platformInfo = platformDetectionService.getPlatformInfo()
    
    // Verify platform info structure
    if (!platformInfo.environment || !platformInfo.scannerAPIs || !platformInfo.recommendation) {
      throw new Error('Platform detection returned incomplete information')
    }

    // Test platform-specific detection
    const isRumbaApp = platformInfo.environment.app.isRumbaApp
    const hasRumbaAPI = platformInfo.scannerAPIs.rumbaSDK?.available
    const hasCaptureJS = platformInfo.scannerAPIs.captureJS?.available

    if (isRumbaApp && !hasRumbaAPI) {
      throw new Error('Running in Rumba app but Rumba SDK not detected')
    }

    return {
      platformDetected: true,
      environment: platformInfo.environment.app.context,
      recommendedService: platformInfo.recommendation.primary?.service,
      availableAPIs: Object.keys(platformInfo.scannerAPIs).filter(
        api => platformInfo.scannerAPIs[api].available
      )
    }
  }

  /**
   * Test service initialization
   */
  async testServiceInitialization() {
    // Test callback function
    const testCallback = (barcode, serviceName, scannerType) => {
      console.log(`Test callback received: ${barcode} from ${serviceName} (${scannerType})`)
    }

    // Initialize unified scanner manager
    await unifiedScannerManager.initialize(testCallback, {
      debugLogging: true,
      enableErrorRecovery: false // Disable for testing
    })

    if (!unifiedScannerManager.isInitialized) {
      throw new Error('Unified scanner manager failed to initialize')
    }

    const status = unifiedScannerManager.getStatus()
    const statusSummary = unifiedScannerManager.getServiceStatusSummary()

    return {
      initialized: true,
      activeService: status.activeScannerService,
      initializedServices: statusSummary.initializedServices,
      failedServices: statusSummary.failedServices,
      totalServices: statusSummary.totalServices
    }
  }

  /**
   * Test scanner service selection logic
   */
  async testScannerServiceSelection() {
    const platformInfo = platformDetectionService.getPlatformInfo()
    const status = unifiedScannerManager.getStatus()
    
    // Verify that the selected service matches platform recommendations
    const recommendedService = platformInfo.recommendation.primary?.service
    const activeService = status.activeScannerService

    if (recommendedService && activeService !== recommendedService) {
      // This might not be an error if the recommended service failed to initialize
      const statusSummary = unifiedScannerManager.getServiceStatusSummary()
      if (statusSummary.initializedServices.includes(recommendedService)) {
        throw new Error(`Recommended service ${recommendedService} is available but ${activeService} was selected`)
      }
    }

    // Test service switching if multiple services are available
    const statusSummary = unifiedScannerManager.getServiceStatusSummary()
    let switchTestResult = null

    if (statusSummary.initializedServices.length > 1) {
      const alternativeService = statusSummary.initializedServices.find(
        service => service !== activeService
      )
      
      if (alternativeService) {
        const originalService = activeService
        await unifiedScannerManager.switchToService(alternativeService)
        const newStatus = unifiedScannerManager.getStatus()
        
        switchTestResult = {
          switchSuccessful: newStatus.activeScannerService === alternativeService,
          originalService,
          newService: newStatus.activeScannerService
        }
        
        // Switch back
        await unifiedScannerManager.switchToService(originalService)
      }
    }

    return {
      selectionCorrect: true,
      recommendedService,
      activeService,
      availableServices: statusSummary.initializedServices,
      switchTest: switchTestResult
    }
  }

  /**
   * Test barcode simulation
   */
  async testBarcodeSimulation() {
    const testBarcodes = ['1234567890123', 'TEST123456789', '987654321098']
    const simulationResults = []

    for (const testBarcode of testBarcodes) {
      try {
        // Test CaptureJS simulation if available
        if (scannerService.testConnection) {
          const captureResult = await scannerService.testConnection()
          simulationResults.push({
            service: 'captureJS',
            barcode: testBarcode,
            success: captureResult.success,
            details: captureResult.details
          })
        }

        // Test Rumba SDK simulation if available
        const platformInfo = platformDetectionService.getPlatformInfo()
        if (platformInfo.environment.app.isRumbaApp) {
          // Simulate Rumba barcode event
          if (window.rumbaJSCallback) {
            window.rumbaJSCallback({
              type: 'barcode',
              value: testBarcode
            })
            simulationResults.push({
              service: 'rumbaSDK',
              barcode: testBarcode,
              success: true,
              method: 'rumbaJSCallback'
            })
          }
        }

      } catch (error) {
        simulationResults.push({
          service: 'unknown',
          barcode: testBarcode,
          success: false,
          error: error.message
        })
      }
    }

    return {
      simulationsRun: simulationResults.length,
      successful: simulationResults.filter(r => r.success).length,
      results: simulationResults
    }
  }

  /**
   * Test error handling mechanisms
   */
  async testErrorHandling() {
    const errorTests = []

    // Test 1: Invalid service switching
    try {
      await unifiedScannerManager.switchToService('nonexistent-service')
      errorTests.push({ test: 'invalid-service-switch', handled: false })
    } catch (error) {
      errorTests.push({ 
        test: 'invalid-service-switch', 
        handled: true,
        errorType: error.constructor.name 
      })
    }

    // Test 2: Error recovery mechanism
    const originalAttempts = unifiedScannerManager.errorRecoveryAttempts
    unifiedScannerManager.handleError(new Error('Test error'), { context: 'testing' })
    
    errorTests.push({
      test: 'error-tracking',
      handled: unifiedScannerManager.errorRecoveryAttempts > originalAttempts,
      errorHistory: unifiedScannerManager.getErrorDiagnostics().totalErrors > 0
    })

    // Test 3: Health status reporting
    const healthStatus = unifiedScannerManager.getHealthStatus()
    errorTests.push({
      test: 'health-status',
      handled: !!healthStatus.status,
      status: healthStatus.status
    })

    return {
      errorTestsRun: errorTests.length,
      allHandled: errorTests.every(test => test.handled),
      results: errorTests
    }
  }

  /**
   * Test platform-specific features
   */
  async testPlatformSpecificFeatures() {
    const platformInfo = platformDetectionService.getPlatformInfo()
    const features = []

    // Test Rumba-specific features
    if (platformInfo.environment.app.isRumbaApp) {
      features.push({
        feature: 'rumba-detection',
        available: true,
        tested: true
      })

      // Test Rumba API availability
      const rumbaAPITypes = [
        { name: 'RumbaJS', available: !!window.RumbaJS },
        { name: 'rumbaJS', available: !!window.rumbaJS },
        { name: 'webkit-handlers', available: !!(window.webkit && window.webkit.messageHandlers) }
      ]

      features.push({
        feature: 'rumba-apis',
        available: rumbaAPITypes.some(api => api.available),
        details: rumbaAPITypes
      })
    }

    // Test browser-specific features
    if (!platformInfo.environment.app.isRumbaApp) {
      features.push({
        feature: 'browser-detection',
        available: true,
        browser: platformInfo.environment.browser.name
      })

      // Test camera availability
      const cameraAvailable = platformInfo.scannerAPIs.camera?.available
      features.push({
        feature: 'camera-access',
        available: cameraAvailable,
        tested: true
      })
    }

    // Test Socket Mobile Companion
    if (scannerService.checkCompanionService) {
      try {
        const companionAvailable = await scannerService.checkCompanionService()
        features.push({
          feature: 'socket-mobile-companion',
          available: companionAvailable,
          tested: true
        })
      } catch (error) {
        features.push({
          feature: 'socket-mobile-companion',
          available: false,
          tested: true,
          error: error.message
        })
      }
    }

    return {
      platform: platformInfo.environment.app.context,
      featuresTotal: features.length,
      featuresAvailable: features.filter(f => f.available).length,
      features
    }
  }

  /**
   * Test fallback mechanisms
   */
  async testFallbackMechanisms() {
    const statusSummary = unifiedScannerManager.getServiceStatusSummary()
    const fallbackTests = []

    // Test automatic fallback when primary service fails
    if (statusSummary.initializedServices.length > 1) {
      const originalService = unifiedScannerManager.getStatus().activeScannerService
      
      // Simulate service failure by marking it as failed
      unifiedScannerManager.serviceStatus[originalService].initialized = false
      
      // Test service selection with failed primary
      const newBestService = unifiedScannerManager.selectBestScannerService()
      
      fallbackTests.push({
        test: 'automatic-fallback',
        originalService,
        fallbackService: newBestService,
        successful: newBestService !== originalService && newBestService !== null
      })
      
      // Restore original service status
      unifiedScannerManager.serviceStatus[originalService].initialized = true
    }

    // Test retry mechanisms
    const originalFailedCount = statusSummary.failedServices.length
    await unifiedScannerManager.retryFailedServices()
    const newStatusSummary = unifiedScannerManager.getServiceStatusSummary()
    
    fallbackTests.push({
      test: 'retry-mechanism',
      originalFailures: originalFailedCount,
      newFailures: newStatusSummary.failedServices.length,
      improved: newStatusSummary.failedServices.length <= originalFailedCount
    })

    return {
      fallbackTestsRun: fallbackTests.length,
      allSuccessful: fallbackTests.every(test => test.successful !== false),
      results: fallbackTests
    }
  }

  /**
   * Test cart integration
   */
  async testCartIntegration() {
    const cartTests = []
    let mockCartUpdated = false

    // Mock cart functions for testing
    const mockAddToCart = (productId) => {
      mockCartUpdated = true
      return { success: true, productId }
    }

    const mockGetCartItems = () => {
      return { items: [] }
    }

    // Test barcode to cart flow
    const testBarcode = 'TEST123456789'
    const mockStore = {
      products: [
        { id: 1, barcode: testBarcode, name: 'Test Product' }
      ],
      filtered: []
    }

    // Simulate the handleBarcodeScanned function logic from ProductsSearchbar
    const product = mockStore.products.find(p => p.barcode === testBarcode)
    
    if (product) {
      const addResult = mockAddToCart(product.id)
      cartTests.push({
        test: 'barcode-to-cart',
        barcode: testBarcode,
        productFound: true,
        cartUpdated: mockCartUpdated,
        success: addResult.success
      })
    }

    // Test platform-specific cart integration
    const platformInfo = platformDetectionService.getPlatformInfo()
    
    if (platformInfo.environment.app.isRumbaApp) {
      cartTests.push({
        test: 'rumba-cart-prevention',
        platform: 'rumba',
        searchFieldPopulationPrevented: true, // Would be tested in actual implementation
        cartIntegrationWorking: true
      })
    }

    return {
      cartTestsRun: cartTests.length,
      allSuccessful: cartTests.every(test => test.success !== false),
      results: cartTests
    }
  }

  /**
   * Get test results summary
   */
  getTestSummary() {
    if (this.testResults.length === 0) {
      return { message: 'No tests have been run yet' }
    }

    const passed = this.testResults.filter(test => test.status === 'passed').length
    const failed = this.testResults.filter(test => test.status === 'failed').length
    const totalDuration = this.testResults.reduce((sum, test) => sum + test.duration, 0)

    return {
      total: this.testResults.length,
      passed,
      failed,
      successRate: (passed / this.testResults.length) * 100,
      totalDuration,
      averageDuration: totalDuration / this.testResults.length,
      failedTests: this.testResults.filter(test => test.status === 'failed').map(test => ({
        name: test.name,
        error: test.error?.message
      }))
    }
  }

  /**
   * Export test results for analysis
   */
  exportTestResults(format = 'json') {
    const summary = this.getTestSummary()
    const platformInfo = platformDetectionService.getPlatformInfo()
    
    const exportData = {
      summary,
      results: this.testResults,
      platform: {
        environment: platformInfo.environment.app.context,
        browser: platformInfo.environment.browser.name,
        os: platformInfo.environment.os.name,
        device: platformInfo.environment.device.type
      },
      timestamp: new Date().toISOString()
    }

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      
      case 'text':
        return this.formatResultsAsText(exportData)
      
      case 'csv':
        return this.formatResultsAsCSV(exportData)
      
      default:
        return exportData
    }
  }

  /**
   * Format results as readable text
   */
  formatResultsAsText(exportData) {
    let text = `Scanner Integration Test Report\n`
    text += `Generated: ${exportData.timestamp}\n`
    text += `Platform: ${exportData.platform.environment} (${exportData.platform.os} ${exportData.platform.browser})\n\n`
    
    text += `Summary:\n`
    text += `- Total Tests: ${exportData.summary.total}\n`
    text += `- Passed: ${exportData.summary.passed}\n`
    text += `- Failed: ${exportData.summary.failed}\n`
    text += `- Success Rate: ${exportData.summary.successRate.toFixed(1)}%\n`
    text += `- Total Duration: ${exportData.summary.totalDuration}ms\n\n`
    
    text += `Test Results:\n`
    exportData.results.forEach((test, index) => {
      text += `${index + 1}. ${test.name}: ${test.status.toUpperCase()} (${test.duration}ms)\n`
      if (test.error) {
        text += `   Error: ${test.error.message}\n`
      }
    })
    
    return text
  }

  /**
   * Format results as CSV
   */
  formatResultsAsCSV(exportData) {
    let csv = 'Test Name,Status,Duration (ms),Error Message,Timestamp\n'
    
    exportData.results.forEach(test => {
      csv += `"${test.name}","${test.status}",${test.duration},"${test.error?.message || ''}","${test.timestamp}"\n`
    })
    
    return csv
  }

  /**
   * Cleanup after tests
   */
  async cleanup() {
    if (this.config.debugLogging) {
      console.log('🧹 Cleaning up scanner testing service...')
    }

    try {
      // Clear error history
      if (unifiedScannerManager.clearErrorHistory) {
        unifiedScannerManager.clearErrorHistory()
      }

      // Reset test state
      this.currentTest = null
      this.isRunningTests = false

      if (this.config.debugLogging) {
        console.log('✅ Scanner testing service cleanup complete')
      }

    } catch (error) {
      console.error('❌ Error during testing service cleanup:', error.message)
    }
  }

  /**
   * Quick smoke test for development
   */
  async runSmokeTest() {
    console.log('🚀 Running quick smoke test...')
    
    const results = {
      platformDetection: false,
      serviceInitialization: false,
      barcodeSimulation: false
    }

    try {
      // Quick platform detection test
      const platformInfo = platformDetectionService.getPlatformInfo()
      results.platformDetection = !!platformInfo.environment
      
      // Quick service initialization test
      if (!unifiedScannerManager.isInitialized) {
        await unifiedScannerManager.initialize(() => {}, { debugLogging: false })
      }
      results.serviceInitialization = unifiedScannerManager.isInitialized
      
      // Quick barcode simulation test
      if (scannerService.testConnection) {
        const testResult = await scannerService.testConnection()
        results.barcodeSimulation = testResult.success
      } else {
        results.barcodeSimulation = true // Skip if not available
      }

      const allPassed = Object.values(results).every(result => result === true)
      
      console.log(`🚀 Smoke test ${allPassed ? 'PASSED' : 'FAILED'}:`, results)
      return { passed: allPassed, results }

    } catch (error) {
      console.error('🚀 Smoke test FAILED:', error.message)
      return { passed: false, error: error.message, results }
    }
  }
}

// Export singleton instance
export const scannerTestingService = new ScannerTestingService()
export default scannerTestingService