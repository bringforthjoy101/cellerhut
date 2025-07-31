// ** React Imports
import { useState, useCallback, useEffect } from 'react'

// ** Third Party Components
import { Search, Camera, RefreshCcw, Activity, CheckCircle, AlertTriangle } from 'react-feather'
import { Row, Col, InputGroup, InputGroupAddon, Input, InputGroupText, Button } from 'reactstrap'

// ** Custom Hooks and Contexts
import { useScannerHandler, useScannerContext } from '../../../../contexts/ScannerContext'
import scannerService from '../../../../services/scannerService'
import platformDetectionService from '../../../../services/platformDetectionService'
import scannerTestingService from '../../../../services/scannerTestingService'
import scannerDiagnosticsService from '../../../../services/scannerDiagnosticsService'

const ProductsSearchbar = props => {
  // ** Props
  const { dispatch, getProducts, store, addToCart, getCartItems } = props
  
  // ** State
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isRumbaApp, setIsRumbaApp] = useState(false)
  
  // Check if running in Rumba app on component mount
  useEffect(() => {
    const platformInfo = platformDetectionService.getPlatformInfo()
    setIsRumbaApp(platformInfo.environment.app.isRumbaApp)
    
    if (platformInfo.environment.app.isRumbaApp) {
      console.log('🔵 Running in Rumba app - cart integration enabled')
      
      // Prevent Rumba app from auto-populating search input
      const preventRumbaAutoFill = (event) => {
        const target = event.target
        if (target && target.classList && target.classList.contains('search-product')) {
          console.log('🔵 Preventing Rumba auto-fill in search field')
          event.preventDefault()
          event.stopPropagation()
          target.blur() // Remove focus to prevent input
          return false
        }
      }
      
      // Add event listeners to prevent auto-fill
      document.addEventListener('input', preventRumbaAutoFill, true)
      document.addEventListener('change', preventRumbaAutoFill, true)
      document.addEventListener('keydown', preventRumbaAutoFill, true)
      
      // Cleanup function
      return () => {
        document.removeEventListener('input', preventRumbaAutoFill, true)
        document.removeEventListener('change', preventRumbaAutoFill, true)
        document.removeEventListener('keydown', preventRumbaAutoFill, true)
      }
    }
  }, [])
  
  // Handle barcode scanning for cart operations with platform-specific behavior
  const handleBarcodeScanned = useCallback((barcode, serviceName, scannerType) => {
    console.log(`🛍️ ProductsSearchbar: Barcode received from ${serviceName} (${scannerType}):`, barcode)
    
    // For Rumba app, always add to cart and prevent search field population
    if (isRumbaApp || serviceName === 'rumbaSDK') {
      console.log('🔵 ProductsSearchbar: Rumba app detected - adding to cart directly')
      
      // Find product by barcode
      const product = store.products?.find(p => p.barcode === barcode) || 
                     store.filtered?.find(p => p.barcode === barcode)
      
      if (product && addToCart && getCartItems) {
        // Add product to cart
        dispatch(addToCart(product.id))
        dispatch(getCartItems())
        dispatch(getProducts(store.params))
        console.log('✅ ProductsSearchbar: Product added to cart via Rumba scanning')
      } else {
        console.warn(`❌ ProductsSearchbar: Product with barcode ${barcode} not found for cart addition`)
      }
      
      // Prevent any search field population for Rumba app
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
  }, [dispatch, store.products, store.filtered, addToCart, getCartItems, getProducts, store.params, isRumbaApp])
  
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
  
  // Test Socket Mobile connection (for development/testing)
  const handleTestSocketMobile = useCallback(async () => {
    try {
      console.log('🧪 Testing Socket Mobile connection...')
      
      // Get diagnostics first
      const diagnostics = scannerService.getDiagnostics()
      console.log('📋 Scanner Diagnostics:', diagnostics)
      
      // Run connection test
      const result = await scannerService.testConnection()
      console.log('🧪 Test result:', result)
      
      // Provide detailed feedback
      const message = `Socket Mobile Test: ${result.message}\n\n` +
                     `✅ Initialized: ${result.details.initialization}\n` +
                     `🔌 Connected: ${result.details.isConnected}\n` +
                     `📡 Has Callback: ${result.details.hasCallback}\n` +
                     `🔄 Attempts: ${result.details.attempts}`
      
      alert(message)
    } catch (error) {
      console.error('Socket Mobile test failed:', error)
      
      // Get diagnostics even on failure
      try {
        const diagnostics = scannerService.getDiagnostics()
        console.log('📋 Scanner Diagnostics (on failure):', diagnostics)
      } catch (diagError) {
        console.error('Could not get diagnostics:', diagError)
      }
      
      alert(`Socket Mobile Test Failed: ${error.message}\n\nCheck browser console for details.`)
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
                      onClick={handleTestSocketMobile}
                      title='Test Socket Mobile connection'
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
                Development Testing Tools - Platform: {isRumbaApp ? 'Rumba App' : 'Regular Browser'}
              </small>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ProductsSearchbar
