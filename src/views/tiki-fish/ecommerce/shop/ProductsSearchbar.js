// ** React Imports
import { useState, useCallback, useEffect } from 'react'

// ** Third Party Components
import { Search, Camera, RefreshCcw, Activity, CheckCircle, AlertTriangle } from 'react-feather'
import { Row, Col, InputGroup, InputGroupAddon, Input, InputGroupText, Button } from 'reactstrap'

// ** Custom Hooks and Contexts
import { useScannerHandler, useScannerContext } from '../../../../contexts/ScannerContext'
import unifiedScannerManager from '../../../../services/unifiedScannerManager'
import platformDetectionService from '../../../../services/platformDetectionService'
import scannerTestingService from '../../../../services/scannerTestingService'
import scannerDiagnosticsService from '../../../../services/scannerDiagnosticsService'

const ProductsSearchbar = props => {
  // ** Props
  const { dispatch, getProducts, store, addToCart, getCartItems } = props
  
  // ** State
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isMobileScanner, setIsMobileScanner] = useState(false)
  
  // Check if running on mobile device on component mount
  useEffect(() => {
    const platformInfo = platformDetectionService.getPlatformInfo()
    setIsMobileScanner(platformInfo.environment.device.isMobile)
    
    if (platformInfo.environment.device.isMobile) {
      console.log('🔵 Running on mobile device - direct cart integration enabled')
      
      // Cleanup function
      return () => {
        document.removeEventListener('change', preventRumbaAutoFill, true)
        document.removeEventListener('keydown', preventRumbaAutoFill, true)
      }
    }
  }, [])
  
  // Handle barcode scanning for cart operations with platform-specific behavior
  const handleBarcodeScanned = useCallback((barcode, serviceName, scannerType) => {
    console.log(`🛍️ ProductsSearchbar: Barcode received from ${serviceName} (${scannerType}):`, barcode)
    
    // For mobile scanning, add to cart directly
    if (isMobileScanner && serviceName === 'browserAPI') {
      console.log('🔵 ProductsSearchbar: Mobile scanner detected - adding to cart directly')
      
      // Find product by barcode
      const product = store.products?.find(p => p.barcode === barcode) || 
                     store.filtered?.find(p => p.barcode === barcode)
      
      if (product && addToCart && getCartItems) {
        // Add product to cart
        dispatch(addToCart(product.id))
        dispatch(getCartItems())
        dispatch(getProducts(store.params))
        console.log('✅ ProductsSearchbar: Product added to cart via mobile scanning')
      } else {
        console.warn(`❌ ProductsSearchbar: Product with barcode ${barcode} not found for cart addition`)
      }
      
      // Prevent any search field population for mobile scanning
      return
    }
    
    // For regular browser scanning, add to cart (don't populate search field)
    const product = store.products?.find(p => p.barcode === barcode) || 
                   store.filtered?.find(p => p.barcode === barcode)
    
    if (product && addToCart && getCartItems) {
      // Add product to cart
      dispatch(addToCart(product.id))
      dispatch(getCartItems())
      dispatch(getProducts(store.params))
      console.log('✅ ProductsSearchbar: Product added to cart via regular scanning')
    } else {
      console.warn(`❌ ProductsSearchbar: Product with barcode ${barcode} not found for cart addition`)
      // REMOVED: No longer populate search field as fallback - let higher priority handlers manage this
      console.log('ℹ️ ProductsSearchbar: Deferring to higher priority scanner handlers')
    }
  }, [dispatch, store.products, store.filtered, addToCart, getCartItems, getProducts, store.params, isMobileScanner])
  
  // Register as lower-priority scanner handler (only active when no higher priority handlers)
  useScannerHandler('ecommerce-shop', handleBarcodeScanned, 1, true)
  
  // Get scanner status from context
  const {
    isConnected,
    isInitializing,
    isScanning,
    startScanning,
    retryInitialization,
    lastError,
    canRetry,
    activeHandlerId
  } = useScannerContext()
  
  // Handle manual barcode input
  const handleBarcodeInputSubmit = useCallback((e) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      handleBarcodeScanned(barcodeInput.trim(), 'manual')
      setBarcodeInput('')
    }
  }, [barcodeInput, handleBarcodeScanned])
  
  // Test Scanner connection (for development/testing)
  const handleTestScanner = useCallback(async () => {
    try {
      console.log('🧪 Testing Scanner connection...')
      
      // Get diagnostics from unified scanner manager
      const diagnostics = unifiedScannerManager.getDiagnostics()
      console.log('📋 Scanner Diagnostics:', diagnostics)
      
      // Get status from unified scanner manager
      const status = unifiedScannerManager.getStatus()
      console.log('🧪 Scanner status:', status)
      
      // Provide detailed feedback
      const message = `Scanner Test: ${status.isInitialized ? 'Initialized' : 'Not Initialized'}\n\n` +
                     `✅ Active Service: ${status.activeScannerService || 'None'}\n` +
                     `🔌 Available Services: ${Object.keys(status.serviceStatus || {}).filter(s => status.serviceStatus[s].initialized).join(', ') || 'None'}\n` +
                     `📡 Platform: ${status.platformInfo?.environment || 'Unknown'}\n` +
                     `🔄 Attempts: ${status.initializationAttempts}`
      
      alert(message)
    } catch (error) {
      console.error('Scanner test failed:', error)
      
      // Get diagnostics even on failure
      try {
        const diagnostics = unifiedScannerManager.getDiagnostics()
        console.log('📋 Scanner Diagnostics (on failure):', diagnostics)
      } catch (diagError) {
        console.error('Could not get diagnostics:', diagError)
      }
      
      alert(`Scanner Test Failed: ${error.message}\n\nCheck browser console for details.`)
    }
  }, [])

  // Run comprehensive scanner integration tests
  const handleRunAllTests = useCallback(async () => {
    try {
      console.log('🧪 Running comprehensive scanner integration tests...')
      
      const testResults = await scannerTestingService.runAllTests()
      
      const summary = testResults.summary
      const message = `Scanner Integration Test Results:\n\n` +
                     `✅ Passed: ${summary.passed}/${summary.totalTests}\n` +
                     `❌ Failed: ${summary.failed}/${summary.totalTests}\n` +
                     `📊 Success Rate: ${summary.successRate.toFixed(1)}%\n` +
                     `⏱️ Total Time: ${summary.executionTime}ms\n\n` +
                     `Platform: ${testResults.platformInfo.environment.app.context}\n` +
                     `Recommended Service: ${testResults.platformInfo.recommendation.primary?.service || 'None'}`
      
      console.log('🧪 Full test results:', testResults)
      alert(message)
      
    } catch (error) {
      console.error('❌ Comprehensive tests failed:', error)
      alert(`Test Suite Failed: ${error.message}\n\nCheck browser console for details.`)
    }
  }, [])

  // Run quick smoke test
  const handleSmokeTest = useCallback(async () => {
    try {
      console.log('🚀 Running smoke test...')
      
      const result = await scannerTestingService.runSmokeTest()
      
      const message = `Smoke Test ${result.passed ? 'PASSED' : 'FAILED'}:\n\n` +
                     `📱 Platform Detection: ${result.results.platformDetection ? '✅' : '❌'}\n` +
                     `🔧 Service Initialization: ${result.results.serviceInitialization ? '✅' : '❌'}\n` +
                     `📊 Barcode Simulation: ${result.results.barcodeSimulation ? '✅' : '❌'}`
      
      console.log('🚀 Smoke test result:', result)
      alert(message)
      
    } catch (error) {
      console.error('❌ Smoke test failed:', error)
      alert(`Smoke Test Failed: ${error.message}`)
    }
  }, [])

  // Run diagnostics
  const handleRunDiagnostics = useCallback(async () => {
    try {
      console.log('🔍 Running scanner diagnostics...')
      
      const diagnostics = await scannerDiagnosticsService.runFullDiagnostics()
      
      const issues = diagnostics.commonIssues || []
      const highIssues = issues.filter(issue => issue.severity === 'high')
      
      const message = `Scanner Diagnostics Complete:\n\n` +
                     `🌐 Platform: ${diagnostics.platform?.detected?.os} ${diagnostics.platform?.detected?.browser}\n` +
                     `📱 Context: ${diagnostics.platform?.detected?.context}\n` +
                     `🔧 Available APIs: ${diagnostics.platform?.scannerAPIs?.filter(api => api.available)?.length || 0}\n` +
                     `⚠️ High Priority Issues: ${highIssues.length}\n` +
                     `📋 Total Issues: ${issues.length}\n\n` +
                     `Recommended Service: ${diagnostics.platform?.recommendation?.primary?.service || 'None'}`
      
      console.log('🔍 Full diagnostics:', diagnostics)
      alert(message)
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error)
      alert(`Diagnostics Failed: ${error.message}`)
    }
  }, [])

  return (
    <div id='ecommerce-searchbar' className='ecommerce-searchbar'>
      <Row className='mt-1'>
        <Col sm='6'>
          <InputGroup className='input-group-merge'>
            <Input
              className='search-product'
              placeholder='Search Product'
              onChange={e => dispatch(getProducts({ ...store.params, q: e.target.value }))}
            />
            <InputGroupAddon addonType='append'>
              <InputGroupText>
                <Search className='text-muted' size={14} />
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Col>
        <Col sm='6'>
          <form onSubmit={handleBarcodeInputSubmit}>
            <InputGroup className='input-group-merge'>
              <Input
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                placeholder='Enter or scan product barcode'
                className='barcode-input'
              />
              <InputGroupAddon addonType='append'>
                <Button
                  color={isConnected ? 'success' : 'secondary'}
                  onClick={startScanning}
                  disabled={!isConnected || isInitializing}
                  title={isConnected ? 'Start Camera Scanning' : 'Scanner not available'}
                  type='button'
                >
                  <Camera size={14} />
                </Button>
                {lastError && canRetry && (
                  <Button
                    color='info'
                    onClick={retryInitialization}
                    title='Retry scanner connection'
                    type='button'
                  >
                    <RefreshCcw size={14} />
                  </Button>
                )}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Button
                      color='warning'
                      onClick={handleTestScanner}
                      title='Test Scanner connection'
                      type='button'
                    >
                      <Activity size={14} />
                    </Button>
                    <Button
                      color='success'
                      onClick={handleSmokeTest}
                      title='Run quick smoke test'
                      type='button'
                    >
                      <CheckCircle size={14} />
                    </Button>
                    <Button
                      color='info'
                      onClick={handleRunDiagnostics}
                      title='Run full diagnostics'
                      type='button'
                    >
                      <AlertTriangle size={14} />
                    </Button>
                  </>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
        </Col>
      </Row>
      {process.env.NODE_ENV === 'development' && (
        <Row className='mt-2'>
          <Col sm='12'>
            <div className='d-flex justify-content-center'>
              <Button
                color='primary'
                onClick={handleRunAllTests}
                className='mr-2'
                title='Run comprehensive integration tests'
              >
                🧪 Run All Tests
              </Button>
              <small className='text-muted align-self-center'>
                Development Testing Tools - Platform: {isMobileScanner ? 'Mobile Device' : 'Desktop Browser'}
              </small>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ProductsSearchbar
