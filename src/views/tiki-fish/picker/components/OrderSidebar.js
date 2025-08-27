import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Plus, Minus, CreditCard, DollarSign, Smartphone, Wifi, WifiOff, Loader, ChevronLeft, ChevronRight, Menu, Archive, ChevronDown, ChevronUp, Percent } from 'react-feather'
import { Button, Collapse, Badge } from 'reactstrap'
import { updateQuantity, removeFromOrder, setPaymentMethod, holdOrder, placeOrder, clearOrder, showConfirmationModal, hideConfirmationModal, setItemDiscount, setOrderDiscount } from '../store/actions'
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
  
  // Collapsible section states
  const [discountSectionCollapsed, setDiscountSectionCollapsed] = useState(true)
  const [paymentMethodCollapsed, setPaymentMethodCollapsed] = useState(false)
  const [itemDiscountsVisible, setItemDiscountsVisible] = useState({})

  // Get the currently active order (could be current or a held order)
  const activeOrder = activeOrderId === 'current' ? currentOrder : 
    heldOrders.find(order => order.id === activeOrderId) || currentOrder
  
  // Show discount section if there's an active discount
  const hasActiveDiscount = activeOrder?.orderDiscount?.amount > 0 || activeOrder?.totalItemDiscount > 0

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

  const toggleItemDiscount = (itemId) => {
    setItemDiscountsVisible(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
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
                <div className="item-price">
                  {item.discountAmount > 0 ? (
                    <>
                      <span className="price-original">{formatPrice(item.price)}</span>
                      <span className="price-discounted">{formatPrice(item.price - (item.discountAmount / item.quantity))}</span>
                    </>
                  ) : (
                    <span>{formatPrice(item.price)} each</span>
                  )}
                </div>
                
                {/* Discount toggle button */}
                {!itemDiscountsVisible[item.id] && !item.discountAmount && (
                  <button
                    className="item-discount-toggle"
                    onClick={() => toggleItemDiscount(item.id)}
                    title="Add discount"
                  >
                    <Percent size={12} /> Discount
                  </button>
                )}
                
                {/* Show discount badge if discount exists */}
                {item.discountAmount > 0 && !itemDiscountsVisible[item.id] && (
                  <div 
                    className="item-discount-badge"
                    onClick={() => toggleItemDiscount(item.id)}
                  >
                    <Percent size={12} />
                    {item.discountType === 'percentage' ? `${item.discountValue}%` : formatPrice(item.discountAmount)}
                  </div>
                )}
                
                {/* Collapsible discount input */}
                {(itemDiscountsVisible[item.id] || item.discountAmount > 0) && (
                  <div className="item-discount">
                    <input
                      type="number"
                      className="discount-input"
                      placeholder="0"
                      value={item.discountValue || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        dispatch(setItemDiscount(item.id, item.discountType || 'percentage', value))
                      }}
                      min="0"
                      max={item.discountType === 'percentage' ? 100 : item.price * item.quantity}
                    />
                    <button
                      className="discount-type-toggle"
                      onClick={() => {
                        const newType = item.discountType === 'percentage' ? 'fixed' : 'percentage'
                        dispatch(setItemDiscount(item.id, newType, item.discountValue || 0))
                      }}
                    >
                      {item.discountType === 'percentage' ? '%' : 'R'}
                    </button>
                    <button
                      className="discount-close"
                      onClick={() => {
                        if (item.discountAmount > 0) {
                          dispatch(setItemDiscount(item.id, 'percentage', 0))
                        }
                        toggleItemDiscount(item.id)
                      }}
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                )}
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
                {item.discountAmount > 0 ? (
                  <div>
                    <div className="total-original">{formatPrice(item.price * item.quantity)}</div>
                    <div className="total-discounted">{formatPrice((item.price * item.quantity) - item.discountAmount)}</div>
                  </div>
                ) : (
                  formatPrice(item.price * item.quantity)
                )}
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
          <span className="value">{formatPrice(activeOrder.subtotal + (activeOrder.totalDiscount || 0))}</span>
        </div>
        
        {activeOrder.totalItemDiscount > 0 && (
          <div className="summary-row discount-row">
            <span className="label">Item Discounts:</span>
            <span className="value discount">-{formatPrice(activeOrder.totalItemDiscount)}</span>
          </div>
        )}
        
        <div className="order-discount-section">
          <div 
            className="discount-header"
            onClick={() => setDiscountSectionCollapsed(!discountSectionCollapsed)}
          >
            <div className="discount-label">
              <Percent size={16} />
              <span>Order Discount</span>
              {activeOrder.orderDiscount?.amount > 0 && (
                <span className="discount-preview">
                  -{formatPrice(activeOrder.orderDiscount.amount)}
                  {activeOrder.orderDiscount?.type === 'percentage' && ` (${activeOrder.orderDiscount.value}%)`}
                </span>
              )}
            </div>
            {discountSectionCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
          
          {!discountSectionCollapsed && (
            <div className="discount-controls">
              <div className="quick-discount-buttons">
                {[5, 10, 15, 20].map(percent => (
                  <button
                    key={percent}
                    className="quick-discount-btn"
                    onClick={() => dispatch(setOrderDiscount('percentage', percent))}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              <div className="custom-discount">
                <input
                  type="number"
                  className="discount-input"
                  placeholder="0"
                  value={activeOrder.orderDiscount?.value || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    dispatch(setOrderDiscount(activeOrder.orderDiscount?.type || 'fixed', value))
                  }}
                  min="0"
                  max={activeOrder.orderDiscount?.type === 'percentage' ? 100 : activeOrder.subtotal}
                />
                <button
                  className="discount-type-toggle"
                  onClick={() => {
                    const newType = activeOrder.orderDiscount?.type === 'percentage' ? 'fixed' : 'percentage'
                    dispatch(setOrderDiscount(newType, activeOrder.orderDiscount?.value || 0))
                  }}
                >
                  {activeOrder.orderDiscount?.type === 'percentage' ? '%' : 'R'}
                </button>
                {activeOrder.orderDiscount?.amount > 0 && (
                  <button
                    className="discount-clear"
                    onClick={() => dispatch(setOrderDiscount('percentage', 0))}
                    title="Clear discount"
                  >
                    Clear
                  </button>
                )}
              </div>
              {activeOrder.orderDiscount?.amount > 0 && (
                <div className="discount-amount">Discount Applied: -{formatPrice(activeOrder.orderDiscount.amount)}</div>
              )}
            </div>
          )}
        </div>
        
        {activeOrder.totalDiscount > 0 && (
          <div className="summary-row total-discount-row">
            <span className="label">Total Discount:</span>
            <span className="value discount">
              -{formatPrice(activeOrder.totalDiscount)} 
              ({activeOrder.discountPercentage?.toFixed(1)}%)
            </span>
          </div>
        )}
        
        <div className="summary-row">
          <span className="label">Tax (15% included):</span>
          <span className="value">{formatPrice(activeOrder.tax)}</span>
        </div>
        <div className="summary-row total-row">
          <span className="label">Total:</span>
          <span className="value">{formatPrice(activeOrder.total)}</span>
        </div>

        <div className="payment-methods">
          <div 
            className="payment-header"
            onClick={() => setPaymentMethodCollapsed(!paymentMethodCollapsed)}
          >
            <div className="payment-label">
              {(() => {
                const selectedMethod = paymentMethods.find(m => m.id === activeOrder.paymentMethod)
                const SelectedIcon = selectedMethod?.icon || DollarSign
                return (
                  <>
                    <SelectedIcon size={16} />
                    <span>Payment: {selectedMethod?.name || 'Cash'}</span>
                  </>
                )
              })()}
            </div>
            {paymentMethodCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
          
          {!paymentMethodCollapsed && (
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
          )}
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
          paymentMethod: activeOrder.paymentMethod,
          orderDiscount: activeOrder.orderDiscount,
          totalItemDiscount: activeOrder.totalItemDiscount,
          totalDiscount: activeOrder.totalDiscount,
          discountPercentage: activeOrder.discountPercentage
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