import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, X, Grid, List, Filter } from 'react-feather'
import { Input, InputGroup, InputGroupText, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { debounce } from 'lodash'

const ProductSearch = ({ onViewChange, currentView = 'grid' }) => {
  const dispatch = useDispatch()
  const { products, selectedCategory } = useSelector(state => state.picker)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.length > 0) {
        const filtered = products?.filter(product =>
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          product.barcode?.includes(term) ||
          product.category?.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 5) || []
        
        setSuggestions(filtered)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
      
      // Dispatch search action to filter products
      dispatch({ type: 'PICKER_SEARCH_PRODUCTS', searchTerm: term, sortBy, sortOrder })
    }, 300),
    [products, dispatch, sortBy, sortOrder]
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
    dispatch({ type: 'PICKER_CLEAR_SEARCH' })
  }

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name)
    setShowSuggestions(false)
    dispatch({ type: 'PICKER_SEARCH_PRODUCTS', searchTerm: product.name, sortBy, sortOrder })
  }

  const handleSortChange = (newSortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc'
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    dispatch({ type: 'PICKER_SEARCH_PRODUCTS', searchTerm, sortBy: newSortBy, sortOrder: newSortOrder })
  }

  const getSortLabel = () => {
    const labels = {
      name: 'Name',
      price: 'Price',
      category: 'Category'
    }
    return `${labels[sortBy]} ${sortOrder === 'asc' ? '↑' : '↓'}`
  }

  return (
    <div className="product-search">
      <div className="search-container">
        <InputGroup className="search-input-group">
          <InputGroupText>
            <Search size={16} />
          </InputGroupText>
          <Input
            type="text"
            placeholder="Search products by name, barcode, or category..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm && (
            <Button
              color="link"
              size="sm"
              className="clear-search-btn"
              onClick={handleClearSearch}
            >
              <X size={16} />
            </Button>
          )}
        </InputGroup>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((product) => (
              <div
                key={product.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="suggestion-image">
                  <img
                    src={product.image || '/images/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg'
                    }}
                  />
                </div>
                <div className="suggestion-details">
                  <div className="suggestion-name">{product.name}</div>
                  <div className="suggestion-meta">
                    <span className="suggestion-price">
                      {parseFloat(product.price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
                    </span>
                    {product.barcode && (
                      <span className="suggestion-barcode">#{product.barcode}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-controls">
        {/* Sort Dropdown */}
        <UncontrolledDropdown>
          <DropdownToggle caret color="outline-secondary" size="sm" className="sort-btn">
            <Filter size={14} />
            <span className="d-none d-sm-inline ms-1">{getSortLabel()}</span>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handleSortChange('name')}>
              Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            <DropdownItem onClick={() => handleSortChange('price')}>
              Sort by Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownItem>
            <DropdownItem onClick={() => handleSortChange('category')}>
              Sort by Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>

        {/* View Toggle */}
        <div className="view-toggle">
          <Button
            color={currentView === 'grid' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => onViewChange('grid')}
            className="view-btn"
          >
            <Grid size={14} />
          </Button>
          <Button
            color={currentView === 'list' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => onViewChange('list')}
            className="view-btn"
          >
            <List size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductSearch