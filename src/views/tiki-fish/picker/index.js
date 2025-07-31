// ** React Imports
import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Components
import { Row, Col, Card } from 'reactstrap'

// ** Custom Components
import ProductGrid from './components/ProductGrid'
import OrderSidebar from './components/OrderSidebar'
import OrderTabs from './components/OrderTabs'
import FloatingActionButtons from './components/FloatingActionButtons'
import ScannerDebugInfo from './components/ScannerDebugInfo'

// ** Custom Hooks and Contexts
import { useScannerHandler, useScannerContext } from '../../../contexts/ScannerContext'

// ** Store & Actions
import { getProducts, getCategories, addToOrder } from './store/actions'
import { initializeOrderStorage } from './utils/orderStorage'

// ** Styles
import './styles/picker.scss'
import './styles/orderTabs.scss'
import './styles/orderSidebarEnhancements.scss'
import './styles/pickerEnhancements.scss'

const PickerPage = () => {
  const dispatch = useDispatch()
  const { products } = useSelector(state => state.picker)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchVisible, setSearchVisible] = useState(true)
  const [filterVisible, setFilterVisible] = useState(true)

  // ** Handle barcode scanning for adding products to order
  const handleBarcodeScanned = useCallback((barcode, serviceName, scannerType) => {
    console.log(`🛒 Picker: Barcode scanned ${barcode} from ${serviceName}`)
    
    // Find product by barcode
    const product = products?.find(p => p.barcode === barcode)
    
    if (product) {
      dispatch(addToOrder(product))
      console.log('✅ Picker: Product added to order via barcode scanning')
    } else {
      console.warn(`❌ Picker: Product with barcode ${barcode} not found`)
    }
  }, [dispatch, products])

  // ** Register as high-priority scanner handler for picker page
  useScannerHandler('picker', handleBarcodeScanned, 10, true)

  // ** Get scanner status from context
  const {
    isConnected: scannerConnected,
    isInitializing: scannerInitializing,
    activeScanners,
    bestScanner,
    activeHandlerId,
    getHandlerStatus
  } = useScannerContext()

  const scannerStatus = {
    connected: scannerConnected,
    initializing: scannerInitializing,
    activeScanners,
    bestScanner
  }

  useEffect(() => {
    dispatch(getProducts())
    dispatch(getCategories())
    
    // Initialize order storage
    initializeOrderStorage()
  }, [dispatch])

  // Debug: Log when picker becomes active scanner handler
  useEffect(() => {
    if (activeHandlerId) {
      console.log(`📱 Active scanner handler: ${activeHandlerId}`)
      const status = getHandlerStatus()
      console.log('📊 Scanner handler status:', status)
    }
  }, [activeHandlerId, getHandlerStatus])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
  }

  const toggleFilter = () => {
    setFilterVisible(!filterVisible)
  }

  return (
    <div className="picker-page">
      <Row className="h-100">
        <Col 
          lg={sidebarCollapsed ? "1" : "3"} 
          md={sidebarCollapsed ? "2" : "4"}
          className={`picker-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        >
          <Card className="h-100">
            {!sidebarCollapsed && <OrderTabs />}
            
            <OrderSidebar 
              scannerStatus={scannerStatus}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
          </Card>
        </Col>
        <Col 
          lg={sidebarCollapsed ? "11" : "9"}
          md={sidebarCollapsed ? "10" : "8"}
          className="picker-content"
        >
          <Card className="h-100">
            <ProductGrid 
              searchVisible={searchVisible}
              filterVisible={filterVisible}
            />
          </Card>
          
          {/* Scanner Debug Info - Development Only */}
          <ScannerDebugInfo />
        </Col>
      </Row>

      {/* Floating Action Buttons for Mobile */}
      <div className="d-md-none">
        <FloatingActionButtons
          onToggleSearch={toggleSearch}
          onToggleFilter={toggleFilter}
          searchVisible={searchVisible}
          filterVisible={filterVisible}
        />
      </div>
    </div>
  )
}

export default PickerPage