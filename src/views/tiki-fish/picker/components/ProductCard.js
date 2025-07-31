import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Minus, ShoppingCart, Package } from 'react-feather'
import { Badge } from 'reactstrap'
import { addToOrder, updateQuantity } from '../store/actions'

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const dispatch = useDispatch()
  const { currentOrder } = useSelector(state => state.picker)

  const orderItem = currentOrder.items.find(item => item.id === product.id)
  const quantity = orderItem ? orderItem.quantity : 0

  const handleAddToOrder = () => {
    dispatch(addToOrder(product))
  }

  const handleQuantityChange = (newQuantity) => {
    dispatch(updateQuantity(product.id, newQuantity))
  }

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
  }

  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized'
    if (typeof category === 'string') return category
    if (typeof category === 'object' && category.name) return category.name
    return 'Uncategorized'
  }

  const isInOrder = quantity > 0

  if (viewMode === 'list') {
    return (
      <div className={`product-card-list ${isInOrder ? 'in-order' : ''}`}>
        <div className="product-image-container">
          <img
            src={product.image || '/images/placeholder.jpg'}
            alt={product.name}
            className="product-image-list"
            onError={(e) => {
              e.target.src = '/images/placeholder.jpg'
            }}
          />
          {isInOrder && (
            <Badge color="primary" className="quantity-badge" pill>
              {quantity}
            </Badge>
          )}
        </div>
        
        <div className="product-details">
          <div className="product-main-info">
            <h4 className="product-name">{product.name}</h4>
            <div className="product-meta">
              <span className="product-category">
                <Package size={12} />
                {getCategoryName(product.category)}
              </span>
              {product.barcode && (
                <span className="product-barcode">#{product.barcode}</span>
              )}
            </div>
          </div>
          
          <div className="product-price-section">
            <div className="product-price">{formatPrice(product.price)}</div>
            {isInOrder && (
              <div className="item-total">
                Total: {formatPrice(product.price * quantity)}
              </div>
            )}
          </div>
        </div>
        
        <div className="product-actions">
          {isInOrder ? (
            <div className="quantity-controls-list">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 0}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <div className="quantity-display">{quantity}</div>
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToOrder}
              aria-label={`Add ${product.name} to order`}
            >
              <ShoppingCart size={16} />
              Add to Order
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`product-card ${isInOrder ? 'in-order' : ''}`} 
      onClick={handleAddToOrder}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} - ${formatPrice(product.price)}${isInOrder ? ` - ${quantity} in order` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAddToOrder()
        }
      }}
    >
      <div className="product-image-container">
        <img
          src={product.image || '/images/placeholder.jpg'}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg'
          }}
        />
        {isInOrder && (
          <Badge color="primary" className="quantity-badge" pill>
            {quantity}
          </Badge>
        )}
      </div>
      
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="product-price">{formatPrice(product.price)}</div>
        
        <div className="product-meta">
          <span className="product-category">
            <Package size={10} />
            {getCategoryName(product.category)}
          </span>
        </div>
        
        {isInOrder ? (
          <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className="quantity-btn"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 0}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <div className="quantity-display">{quantity}</div>
            <button
              className="quantity-btn"
              onClick={() => handleQuantityChange(quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <div className="quantity-controls">
            <button className="quantity-btn" disabled>
              <Minus size={14} />
            </button>
            <div className="quantity-display">0</div>
            <button className="quantity-btn">
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard