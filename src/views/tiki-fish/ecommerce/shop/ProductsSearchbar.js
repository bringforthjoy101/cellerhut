// ** React Imports
import { useState, useCallback } from 'react'

// ** Third Party Components
import { Search, Camera, RefreshCcw } from 'react-feather'
import { Row, Col, InputGroup, InputGroupAddon, Input, InputGroupText, Button } from 'reactstrap'

// ** Custom Hooks
import { useUniversalScanner } from '../../../../hooks/useUniversalScanner'

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
              </InputGroupAddon>
            </InputGroup>
          </form>
        </Col>
      </Row>
    </div>
  )
}

export default ProductsSearchbar
