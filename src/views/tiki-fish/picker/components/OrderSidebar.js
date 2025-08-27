import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Plus, Minus, CreditCard, DollarSign, Smartphone, Wifi, WifiOff, Loader, ChevronLeft, ChevronRight, Menu, Archive } from 'react-feather'
import { Button, Collapse, Badge } from 'reactstrap'
import { updateQuantity, removeFromOrder, setPaymentMethod, holdOrder, placeOrder, clearOrder, showConfirmationModal, hideConfirmationModal } from '../store/actions'
import OrderConfirmationModal from './OrderConfirmationModal'
import PrintReceipt from './PrintReceipt'
import HoldOrderManager from './HoldOrderManager'
import { printReceipt } from '../utils/printUtils'

const OrderSidebar = ({ scannerStatus, collapsed = false, onToggleCollapse }) => {
  const dispatch = useDispatch()
  const { currentOrder, heldOrders, showConfirmationModal: showModal, isPlacingOrder, activeOrderId, orderTabs } = useSelector(state => state.picker)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [lastOrderData, setLastOrderData] = useState(null)
  const [lastOrderResult, setLastOrderResult] = useState(null)
  const [showHoldOrderManager, setShowHoldOrderManager] = useState(false)

  // Get the currently active order (could be current or a held order)
  const activeOrder = activeOrderId === 'current' ? currentOrder : 
    heldOrders.find(order => order.id === activeOrderId) || currentOrder

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromOrder(productId))
    } else {
      dispatch(updateQuantity(productId, newQuantity))
    }
  }

  const handlePaymentMethodChange = (method) => {
    dispatch(setPaymentMethod(method))
  }

  const handleHoldOrder = () => {
    if (activeOrder.items.length > 0) {
      dispatch(holdOrder())
    }
  }

  const handlePlaceOrder = () => {
    if (activeOrder.items.length > 0) {
      dispatch(showConfirmationModal())
    }
  }

  const handleConfirmOrder = async (confirmData) => {
    const result = await dispatch(placeOrder(confirmData))
    
    if (result.success) {
      // Store order data for printing
      setLastOrderData(confirmData)
      setLastOrderResult(result)
      
      // Show print modal
      setShowPrintModal(true)
      
      // Also trigger auto-print in background
      setTimeout(() => {
        printReceipt(confirmData, result, { autoPrint: true, autoClose: true })
      }, 500)
      
    } else {
      alert(`Error placing order: ${result.error}`)
    }
  }

  const handleCloseModal = () => {
    dispatch(hideConfirmationModal())
  }

  const handleClosePrintModal = () => {
    setShowPrintModal(false)
  }

  const handleClearOrder = () => {
    if (activeOrder.items.length > 0) {
      if (window.confirm('Are you sure you want to clear the current order?')) {
        dispatch(clearOrder())
      }
    }
  }

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
  }

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: DollarSign },
    { id: 'card', name: 'POS', icon: CreditCard },
    { id: 'mobile', name: 'Bank Transfer', icon: Smartphone }
  ]

  if (collapsed) {
    return (
      <div className="order-sidebar collapsed">
        <div className="sidebar-header-collapsed">
          <Button
            color="link"
            size="sm"
            onClick={onToggleCollapse}
            className="collapse-toggle"
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </Button>
          
          <div className="quick-stats">
            <div className="stat-item" title={`${activeOrder.items.length} items in current order`}>
              <ShoppingCart size={14} />
              <span>{activeOrder.items.length}</span>
            </div>
            {heldOrders.length > 0 && (
              <div className="stat-item" title={`${heldOrders.length} held orders`}>
                <Menu size={14} />
                <span>{heldOrders.length}</span>
              </div>
            )}
          </div>
          
          <div className="collapsed-total">
            <span className="total-amount">{formatPrice(activeOrder.total)}</span>
          </div>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="collapsed-actions">
          <Button
            color="outline-info"
            size="sm"
            onClick={() => setShowHoldOrderManager(true)}
            title="Manage Held Orders"
            className="collapsed-btn position-relative"
          >
            <Archive size={14} />
            {heldOrders.length > 0 && (
              <Badge color="danger" className="position-absolute" style={{ top: '-5px', right: '-5px' }} pill>
                {heldOrders.length}
              </Badge>
            )}
          </Button>
          <Button
            color="outline-secondary"
            size="sm"
            onClick={handleHoldOrder}
            disabled={activeOrder.items.length === 0}
            title="Hold Order"
            className="collapsed-btn"
          >
            <Menu size={14} />
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={handlePlaceOrder}
            disabled={activeOrder.items.length === 0}
            title="Place Order"
            className="collapsed-btn"
          >
            <ShoppingCart size={14} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-sidebar">
      <div className="sidebar-header">
        <div className="header-top">
          <h3 className="order-title">Current Order</h3>
          <Button
            color="link"
            size="sm"
            onClick={onToggleCollapse}
            className="collapse-toggle d-none d-md-inline-flex"
            title="Collapse sidebar"
          >
            <ChevronLeft size={18} />
          </Button>
        </div>
        
        <div className="order-info">
          <span>Items: {activeOrder.items.length}</span>
          {heldOrders.length > 0 && (
            <span className="held-orders-count">{heldOrders.length} held</span>
          )}
          {activeOrder.hasUnsavedChanges && (
            <span className="unsaved-indicator" title="Unsaved changes">•</span>
          )}
          {scannerStatus && (
            <div className="scanner-status">
              {scannerStatus.initializing ? (
                <span className="scanner-indicator initializing">
                  <Loader size={12} />
                  <small>Scanner Init...</small>
                </span>
              ) : scannerStatus.connected ? (
                <span className="scanner-indicator connected">
                  <Wifi size={12} />
                  <small>{scannerStatus.bestScanner || 'Scanner Ready'}</small>
                </span>
              ) : (
                <span className="scanner-indicator disconnected">
                  <WifiOff size={12} />
                  <small>No Scanner</small>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="order-items">
        {activeOrder.items.length > 0 ? (
          activeOrder.items.map(item => (
            <div key={item.id} className="order-item">
              <img
                src={item.image || '/images/placeholder.jpg'}
                alt={item.name}
                className="item-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg'
                }}
              />
              <div className="item-details">
                <div className="item-name" title={item.name}>{item.name}</div>
                <div className="item-price">{formatPrice(item.price)} each</div>
              </div>
              <div className="item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Minus size={12} />
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-order">
            <ShoppingCart className="empty-icon" />
            <div className="empty-message">No items in order</div>
          </div>
        )}
      </div>

      <div className="order-summary">
        <div className="summary-row">
          <span className="label">Subtotal:</span>
          <span className="value">{formatPrice(activeOrder.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span className="label">Tax (15% included):</span>
          <span className="value">{formatPrice(activeOrder.tax)}</span>
        </div>
        <div className="summary-row total-row">
          <span className="label">Total:</span>
          <span className="value">{formatPrice(activeOrder.total)}</span>
        </div>

        <div className="payment-methods">
          <div className="payment-method">
            {paymentMethods.map(method => {
              const IconComponent = method.icon
              return (
                <div
                  key={method.id}
                  className={`method-option ${activeOrder.paymentMethod === method.id ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange(method.id)}
                >
                  <IconComponent className="method-icon" size={18} />
                  <div>{method.name}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="order-actions">
          <button
            className="action-btn info"
            onClick={() => setShowHoldOrderManager(true)}
          >
            <Archive size={16} />
            Manage Held Orders
            {heldOrders.length > 0 && (
              <Badge color="danger" className="ml-2" pill>
                {heldOrders.length}
              </Badge>
            )}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className="action-btn secondary"
              onClick={handleHoldOrder}
              disabled={activeOrder.items.length === 0}
              style={{ flex: 1 }}
            >
              Hold Order
            </button>
            <button
              className="action-btn primary"
              onClick={handlePlaceOrder}
              disabled={activeOrder.items.length === 0}
              style={{ flex: 1 }}
            >
              Place Order
            </button>
          </div>
        </div>
        
        {activeOrder.items.length > 0 && (
          <button
            className="action-btn secondary"
            onClick={handleClearOrder}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            Clear Order
          </button>
        )}
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showModal}
        toggle={handleCloseModal}
        orderData={{
          items: activeOrder.items,
          subtotal: activeOrder.subtotal,
          tax: activeOrder.tax,
          total: activeOrder.total,
          paymentMethod: activeOrder.paymentMethod
        }}
        onConfirmOrder={handleConfirmOrder}
        isLoading={isPlacingOrder}
      />

      {/* Print Receipt Modal */}
      {lastOrderData && lastOrderResult && (
        <PrintReceipt
          isOpen={showPrintModal}
          toggle={handleClosePrintModal}
          orderData={lastOrderData}
          orderResult={lastOrderResult}
          autoPrint={false} // We handle auto-print separately
        />
      )}
      
      {/* Hold Order Manager Modal */}
      <HoldOrderManager
        isOpen={showHoldOrderManager}
        toggle={() => setShowHoldOrderManager(false)}
      />
    </div>
  )
}

export default OrderSidebar