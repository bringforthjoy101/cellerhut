import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Badge } from 'reactstrap'
import { Package, Layers } from 'react-feather'
import { filterProducts } from '../store/actions'

const CategoryFilter = () => {
  const dispatch = useDispatch()
  const { categories, selectedCategory, products, filteredProducts } = useSelector(state => state.picker)

  const handleCategoryChange = (categoryId) => {
    dispatch(filterProducts(categoryId))
  }

  const getCategoryId = (category) => {
    if (!category) return null
    if (typeof category === 'string') return category
    if (typeof category === 'object' && category.id) return category.id
    return null
  }

  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized'
    if (typeof category === 'string') return category
    if (typeof category === 'object' && category.name) return category.name
    return 'Uncategorized'
  }

  const getProductCount = (categoryId) => {
    if (categoryId === 'all') return products?.length || 0
    return products?.filter(product => getCategoryId(product.category) === categoryId).length || 0
  }

  const getCategoryIcon = (categoryId) => {
    if (categoryId === 'all') return <Layers size={14} />
    return <Package size={14} />
  }

  // Ensure categories are properly formatted
  const safeCategories = categories?.map(category => ({
    id: getCategoryId(category) || category,
    name: getCategoryName(category)
  })) || []

  const allCategories = [{ id: 'all', name: 'All Products' }, ...safeCategories]

  return (
    <div className="category-filter">
      <div className="category-filter-header">
        <h6 className="filter-title">
          <Layers size={16} />
          Categories
        </h6>
        <Badge color="light" className="results-count">
          {filteredProducts?.length || 0} products
        </Badge>
      </div>
      
      <div className="category-tabs">
        {allCategories.map(category => {
          const productCount = getProductCount(category.id)
          const isActive = selectedCategory === category.id
          
          return (
            <button
              key={category.id}
              className={`category-chip ${isActive ? 'active' : ''} ${productCount === 0 ? 'disabled' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
              disabled={productCount === 0}
              aria-label={`Filter by ${category.name}, ${productCount} products`}
            >
              <span className="chip-icon">
                {getCategoryIcon(category.id)}
              </span>
              <span className="chip-label">{category.name}</span>
              <Badge 
                color={isActive ? 'light' : 'secondary'} 
                className="chip-count"
                pill
              >
                {productCount}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFilter