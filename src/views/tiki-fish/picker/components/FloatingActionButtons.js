import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Badge, UncontrolledTooltip } from 'reactstrap'
import { ShoppingCart, Menu, Plus, Search, Filter, X } from 'react-feather'
import { showConfirmationModal, holdOrder } from '../store/actions'

const FloatingActionButtons = ({ onToggleSearch, onToggleFilter, searchVisible, filterVisible }) => {
  const dispatch = useDispatch()
  const { currentOrder, heldOrders } = useSelector(state => state.picker)
  const [fabExpanded, setFabExpanded] = useState(false)

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
  }

  const handlePlaceOrder = () => {
    if (currentOrder.items.length > 0) {
      dispatch(showConfirmationModal())
    }
  }

  const handleHoldOrder = () => {
    if (currentOrder.items.length > 0) {
      dispatch(holdOrder())
    }
  }

  const toggleFab = () => {
    setFabExpanded(!fabExpanded)
  }

  const getTotalItems = () => {
    return parseInt(currentOrder.items?.length || 0)
  }

  const getOrderTotal = () => {
    return parseFloat(currentOrder.total || 0)
  }

  return (
    <>
      {/* Main FAB */}
      <div className={`fab-container ${fabExpanded ? 'expanded' : ''}`}>
        {/* Secondary Action Buttons */}
        <div className={`fab-secondary ${fabExpanded ? 'visible' : ''}`}>
          {/* Search Toggle */}
          <Button
            color={searchVisible ? 'primary' : 'secondary'}
            className="fab-secondary-btn"
            id="fab-search"
            onClick={onToggleSearch}
          >
            <Search size={18} />
          </Button>
          <UncontrolledTooltip placement="left" target="fab-search">
            {searchVisible ? 'Hide Search' : 'Show Search'}
          </UncontrolledTooltip>

          {/* Filter Toggle */}
          <Button
            color={filterVisible ? 'primary' : 'secondary'}
            className="fab-secondary-btn"
            id="fab-filter"
            onClick={onToggleFilter}
          >
            <Filter size={18} />
          </Button>
          <UncontrolledTooltip placement="left" target="fab-filter">
            {filterVisible ? 'Hide Filters' : 'Show Filters'}
          </UncontrolledTooltip>

          {/* Hold Order */}
          {getTotalItems() > 0 && (
            <>
              <Button
                color="info"
                className="fab-secondary-btn"
                id="fab-hold"
                onClick={handleHoldOrder}
              >
                <Menu size={18} />
              </Button>
              <UncontrolledTooltip placement="left" target="fab-hold">
                Hold Current Order
              </UncontrolledTooltip>
            </>
          )}

          {/* Place Order */}
          {getTotalItems() > 0 && (
            <>
              <Button
                color="success"
                className="fab-secondary-btn"
                id="fab-place-order"
                onClick={handlePlaceOrder}
              >
                <ShoppingCart size={18} />
              </Button>
              <UncontrolledTooltip placement="left" target="fab-place-order">
                Place Order - {formatPrice(getOrderTotal())}
              </UncontrolledTooltip>
            </>
          )}
        </div>

        {/* Main FAB Button */}
        <Button
          color="primary"
          className="fab-main"
          onClick={toggleFab}
          id="fab-main"
        >
          {fabExpanded ? <X size={24} /> : <Plus size={24} />}
          {getTotalItems() > 0 && (
            <Badge color="light" className="fab-badge" pill>
              {getTotalItems()}
            </Badge>
          )}
        </Button>
        <UncontrolledTooltip placement="left" target="fab-main">
          {fabExpanded ? 'Close Menu' : 'Quick Actions'}
        </UncontrolledTooltip>
      </div>

      {/* Order Summary FAB (when items in cart) */}
      {getTotalItems() > 0 && (
        <div className="fab-order-summary">
          <div className="order-summary-content">
            <div className="summary-items">
              <ShoppingCart size={16} />
              <span>{String(getTotalItems())} items</span>
            </div>
            <div className="summary-total">
              {String(formatPrice(getOrderTotal()))}
            </div>
            {heldOrders.length > 0 && (
              <div className="summary-held">
                <Menu size={12} />
                <span>{String(heldOrders.length)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {fabExpanded && (
        <div 
          className="fab-backdrop" 
          onClick={() => setFabExpanded(false)}
        />
      )}
    </>
  )
}

export default FloatingActionButtons