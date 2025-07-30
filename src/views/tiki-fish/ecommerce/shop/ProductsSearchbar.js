// ** React Imports
import { useState, useCallback } from 'react'

// ** Third Party Components
import { Search, Camera, RefreshCcw, Activity } from 'react-feather'
import { Row, Col, InputGroup, InputGroupAddon, Input, InputGroupText, Button } from 'reactstrap'

// ** Custom Hooks
import { useUniversalScanner } from '../../../../hooks/useUniversalScanner'
import scannerService from '../../../../services/scannerService'

const ProductsSearchbar = props => {
  // ** Props
  const { dispatch, getProducts, store, addToCart, getCartItems } = props
  
  // ** State
  const [barcodeInput, setBarcodeInput] = useState('')
  
  // Handle barcode scanning for cart operations
  const handleBarcodeScanned = useCallback((barcode, scannerType) => {
    // Find product by barcode
    const product = store.products?.find(p => p.barcode === barcode) || 
                   store.filtered?.find(p => p.barcode === barcode)
    
    if (product && addToCart && getCartItems) {
      // Add product to cart
      dispatch(addToCart(product.id))
      dispatch(getCartItems())
      dispatch(getProducts(store.params))
    } else {
      console.warn(`Product with barcode ${barcode} not found for cart addition`)
    }
  }, [dispatch, store.products, store.filtered, addToCart, getCartItems, getProducts, store.params])
  
  // Initialize universal scanner
  const {
    isConnected,
    isInitializing,
    isScanning,
    startScanning,
    retryInitialization,
    lastError,
    canRetry
  } = useUniversalScanner(handleBarcodeScanned)
  
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
                  <Button
                    color='warning'
                    onClick={handleTestSocketMobile}
                    title='Test Socket Mobile connection'
                    type='button'
                  >
                    <Activity size={14} />
                  </Button>
                )}
              </InputGroupAddon>
            </InputGroup>
          </form>
        </Col>
      </Row>
    </div>
  )
}

export default ProductsSearchbar
