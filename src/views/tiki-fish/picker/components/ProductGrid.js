import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Package } from 'react-feather'
import ProductCard from './ProductCard'
import CategoryFilter from './CategoryFilter'
import ProductSearch from './ProductSearch'
import LoadingSpinner from '../../../../@core/components/spinner/Loading-spinner'

const ProductGrid = ({ searchVisible = true, filterVisible = true }) => {
  const { filteredProducts, loading } = useSelector(state => state.picker)
  const [viewMode, setViewMode] = useState('grid')

  const handleViewChange = (newView) => {
    setViewMode(newView)
  }

  if (loading) {
    return (
      <div className="picker-content">
        {searchVisible && <ProductSearch onViewChange={handleViewChange} currentView={viewMode} />}
        {filterVisible && <CategoryFilter />}
        <div className="product-grid">
          <div className="loading-state">
            <LoadingSpinner />
            <div className="message">Loading products...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="picker-content">
      {searchVisible && <ProductSearch onViewChange={handleViewChange} currentView={viewMode} />}
      {filterVisible && <CategoryFilter />}
      <div className={`product-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {filteredProducts.length > 0 ? (
          <div className={`products-container ${viewMode === 'list' ? 'products-list' : 'products-grid'}`}>
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Package className="icon" />
            <div className="message">No products found</div>
            <div className="submessage">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductGrid