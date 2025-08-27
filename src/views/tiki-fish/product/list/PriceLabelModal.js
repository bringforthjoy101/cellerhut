import React, { useState, useEffect } from 'react'
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Label,
	FormGroup,
	Row,
	Col,
	Card,
	CardBody,
	Badge,
	Alert,
	CustomInput,
	Spinner
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors, apiRequest } from '@utils'
import { X, Printer, Search, Package, Tag } from 'react-feather'
import { LABEL_FORMATS, exportPriceLabels, generateLabelPreview } from '@src/utility/labelUtils'
import { toast } from 'react-toastify'

const PriceLabelModal = ({ isOpen, toggle }) => {
	// State management
	const [loading, setLoading] = useState(false)
	const [searching, setSearching] = useState(false)
	const [products, setProducts] = useState([])
	const [selectedProducts, setSelectedProducts] = useState([])
	const [quantities, setQuantities] = useState({})
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedFormat, setSelectedFormat] = useState(LABEL_FORMATS.THERMAL_78x25)
	const [previewProduct, setPreviewProduct] = useState(null)
	
	// Label options - Basic
	const [labelOptions, setLabelOptions] = useState({
		showBarcode: true,
		showCostPrice: false,
		showDescription: false,
		showCategory: false,
		showUnit: true,
		// New options
		showStoreName: true,
		storeName: 'CELLERHUT',
		showExpiryDate: false,
		expiryDate: '',
		showBatchNumber: false,
		batchNumber: '',
		showPromotion: false,
		promotionText: 'SALE',
		wasPrice: null,
		currencySymbol: 'R'
	})
	
	// Format options for select dropdown
	const formatOptions = Object.values(LABEL_FORMATS).map(format => ({
		value: format.id,
		label: format.name,
		description: format.description,
		format
	}))
	
	// Search for products
	const searchProducts = async () => {
		if (!searchTerm.trim()) {
			toast.warning('Please enter a search term')
			return
		}
		
		setSearching(true)
		try {
			const response = await apiRequest({
				url: `/products/labels?search=${encodeURIComponent(searchTerm)}`,
				method: 'GET'
			})
			
			if (response?.data?.status) {
				setProducts(response.data.data || [])
				if (!response.data.data || response.data.data.length === 0) {
					toast.info('No products found matching your search')
				}
			} else {
				toast.error('Failed to search products')
			}
		} catch (error) {
			console.error('Search error:', error)
			toast.error('Error searching products')
		} finally {
			setSearching(false)
		}
	}
	
	// Load all products initially
	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true)
			try {
				const response = await apiRequest({
					url: '/products/labels',
					method: 'GET'
				})
				
				if (response?.data?.status) {
					setProducts(response.data.data || [])
				}
			} catch (error) {
				console.error('Load products error:', error)
			} finally {
				setLoading(false)
			}
		}
		
		if (isOpen) {
			loadProducts()
		}
	}, [isOpen])
	
	// Toggle product selection
	const toggleProductSelection = (product) => {
		setSelectedProducts(prev => {
			const isSelected = prev.some(p => p.id === product.id)
			
			if (isSelected) {
				// Remove from selection
				const newSelection = prev.filter(p => p.id !== product.id)
				// Remove quantity
				const newQuantities = { ...quantities }
				delete newQuantities[product.id]
				setQuantities(newQuantities)
				return newSelection
			} else {
				// Add to selection with default quantity
				setQuantities(prev => ({ ...prev, [product.id]: 1 }))
				return [...prev, product]
			}
		})
	}
	
	// Update quantity for a product
	const updateQuantity = (productId, value) => {
		const qty = Math.max(1, Math.min(100, parseInt(value) || 1))
		setQuantities(prev => ({ ...prev, [productId]: qty }))
	}
	
	// Calculate total labels
	const getTotalLabels = () => {
		return selectedProducts.reduce((total, product) => {
			return total + (quantities[product.id] || 1)
		}, 0)
	}
	
	// Reset and close modal
	const handleClose = () => {
		setSelectedProducts([])
		setQuantities({})
		setSearchTerm('')
		setPreviewProduct(null)
		toggle()
	}
	
	// Generate and print labels
	const handleGenerateLabels = () => {
		if (selectedProducts.length === 0) {
			toast.warning('Please select at least one product')
			return
		}
		
		const result = exportPriceLabels(selectedProducts, {
			format: selectedFormat,
			quantities,
			labelOptions,
			title: 'Product Price Labels'
		})
		
		if (result.success) {
			toast.success(`Generated ${result.labelCount} labels successfully`)
			// Close modal after successful generation
			setTimeout(() => {
				handleClose()
			}, 1500)
		} else {
			toast.error(result.error || 'Failed to generate labels')
		}
	}
	
	// Format change handler
	const handleFormatChange = (option) => {
		setSelectedFormat(option.format)
	}
	
	// Preview a label
	const handlePreview = (product) => {
		setPreviewProduct(product)
	}
	
	return (
		<Modal isOpen={isOpen} toggle={handleClose} size="xl">
			<ModalHeader toggle={handleClose}>
				<Tag size={20} className="mr-1" />
				Generate Price Tag Labels
			</ModalHeader>
			
			<ModalBody>
				{/* Search Section */}
				<Card className="mb-2">
					<CardBody>
						<Row>
							<Col md="8">
								<FormGroup>
									<Label>Search Products</Label>
									<div className="d-flex">
										<Input
											type="text"
											placeholder="Search by name, SKU, or barcode..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
										/>
										<Button
											color="primary"
											className="ml-1"
											onClick={searchProducts}
											disabled={searching}
										>
											{searching ? <Spinner size="sm" /> : <Search size={16} />}
										</Button>
									</div>
								</FormGroup>
							</Col>
							<Col md="4">
								<FormGroup>
									<Label>Label Format</Label>
									<Select
										theme={selectThemeColors}
										className="react-select"
										classNamePrefix="select"
										options={formatOptions}
										value={formatOptions.find(opt => opt.value === selectedFormat.id)}
										onChange={handleFormatChange}
										formatOptionLabel={(option) => (
											<div>
												<div>{option.label}</div>
												<small className="text-muted">{option.description}</small>
											</div>
										)}
									/>
								</FormGroup>
							</Col>
						</Row>
						
						{/* Label Options */}
						<Row className="mt-2">
							<Col md="12">
								<Label>Basic Options</Label>
								<div className="d-flex flex-wrap">
									<CustomInput
										type="checkbox"
										id="showBarcode"
										label="Show Barcode"
										checked={labelOptions.showBarcode}
										onChange={(e) => setLabelOptions(prev => ({ ...prev, showBarcode: e.target.checked }))}
										className="mr-2 mb-1"
									/>
									<CustomInput
										type="checkbox"
										id="showUnit"
										label="Show Unit"
										checked={labelOptions.showUnit}
										onChange={(e) => setLabelOptions(prev => ({ ...prev, showUnit: e.target.checked }))}
										className="mr-2 mb-1"
									/>
									<CustomInput
										type="checkbox"
										id="showCategory"
										label="Show Category"
										checked={labelOptions.showCategory}
										onChange={(e) => setLabelOptions(prev => ({ ...prev, showCategory: e.target.checked }))}
										className="mr-2 mb-1"
									/>
									<CustomInput
										type="checkbox"
										id="showCostPrice"
										label="Use Cost Price"
										checked={labelOptions.showCostPrice}
										onChange={(e) => setLabelOptions(prev => ({ ...prev, showCostPrice: e.target.checked }))}
										className="mr-2 mb-1"
									/>
								</div>
							</Col>
						</Row>
						
						{/* Advanced Options */}
						<Row className="mt-2">
							<Col md="6">
								<FormGroup>
									<div className="d-flex align-items-center">
										<CustomInput
											type="checkbox"
											id="showStoreName"
											label="Store Name"
											checked={labelOptions.showStoreName}
											onChange={(e) => setLabelOptions(prev => ({ ...prev, showStoreName: e.target.checked }))}
											className="mr-2"
										/>
										{labelOptions.showStoreName && (
											<Input
												type="text"
												placeholder="Store name"
												value={labelOptions.storeName}
												onChange={(e) => setLabelOptions(prev => ({ ...prev, storeName: e.target.value }))}
												style={{ width: '150px' }}
											/>
										)}
									</div>
								</FormGroup>
							</Col>
							<Col md="6">
								<FormGroup>
									<div className="d-flex align-items-center">
										<CustomInput
											type="checkbox"
											id="showPromotion"
											label="Promotion"
											checked={labelOptions.showPromotion}
											onChange={(e) => setLabelOptions(prev => ({ ...prev, showPromotion: e.target.checked }))}
											className="mr-2"
										/>
										{labelOptions.showPromotion && (
											<Input
												type="text"
												placeholder="Promo text"
												value={labelOptions.promotionText}
												onChange={(e) => setLabelOptions(prev => ({ ...prev, promotionText: e.target.value }))}
												style={{ width: '150px' }}
											/>
										)}
									</div>
								</FormGroup>
							</Col>
							<Col md="6">
								<FormGroup>
									<div className="d-flex align-items-center">
										<CustomInput
											type="checkbox"
											id="showExpiryDate"
											label="Expiry Date"
											checked={labelOptions.showExpiryDate}
											onChange={(e) => setLabelOptions(prev => ({ ...prev, showExpiryDate: e.target.checked }))}
											className="mr-2"
										/>
										{labelOptions.showExpiryDate && (
											<Input
												type="date"
												value={labelOptions.expiryDate}
												onChange={(e) => setLabelOptions(prev => ({ ...prev, expiryDate: e.target.value }))}
												style={{ width: '150px' }}
											/>
										)}
									</div>
								</FormGroup>
							</Col>
							<Col md="6">
								<FormGroup>
									<div className="d-flex align-items-center">
										<CustomInput
											type="checkbox"
											id="showBatchNumber"
											label="Batch/Lot"
											checked={labelOptions.showBatchNumber}
											onChange={(e) => setLabelOptions(prev => ({ ...prev, showBatchNumber: e.target.checked }))}
											className="mr-2"
										/>
										{labelOptions.showBatchNumber && (
											<Input
												type="text"
												placeholder="Batch number"
												value={labelOptions.batchNumber}
												onChange={(e) => setLabelOptions(prev => ({ ...prev, batchNumber: e.target.value }))}
												style={{ width: '150px' }}
											/>
										)}
									</div>
								</FormGroup>
							</Col>
						</Row>
					</CardBody>
				</Card>
				
				{/* Products List */}
				<Card>
					<CardBody>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<h5 className="mb-0">Available Products</h5>
							<Badge color="primary" pill>
								{selectedProducts.length} selected | {getTotalLabels()} labels
							</Badge>
						</div>
						
						{loading ? (
							<div className="text-center py-3">
								<Spinner />
								<p className="mt-2">Loading products...</p>
							</div>
						) : products.length === 0 ? (
							<Alert color="info">
								No products found. Try searching for specific products.
							</Alert>
						) : (
							<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
								{products.map(product => {
									const isSelected = selectedProducts.some(p => p.id === product.id)
									
									return (
										<div
											key={product.id}
											className={`border rounded p-2 mb-2 cursor-pointer ${isSelected ? 'border-primary bg-light' : ''}`}
											style={{ cursor: 'pointer' }}
										>
											<Row className="align-items-center">
												<Col md="1">
													<CustomInput
														type="checkbox"
														id={`product-${product.id}`}
														checked={isSelected}
														onChange={() => toggleProductSelection(product)}
													/>
												</Col>
												<Col md="4">
													<div>
														<strong>{product.name}</strong>
														<div className="text-muted small">
															SKU: {product.sku || 'N/A'} | Barcode: {product.barcode || 'N/A'}
														</div>
													</div>
												</Col>
												<Col md="2">
													<Badge color="light-primary">
														R {parseFloat(product.price).toFixed(2)}
													</Badge>
												</Col>
												<Col md="2">
													<span className="text-muted">{product.unit}</span>
												</Col>
												<Col md="2">
													{isSelected && (
														<FormGroup className="mb-0">
															<Input
																type="number"
																min="1"
																max="100"
																value={quantities[product.id] || 1}
																onChange={(e) => updateQuantity(product.id, e.target.value)}
																placeholder="Qty"
															/>
														</FormGroup>
													)}
												</Col>
												<Col md="1">
													<Button
														color="info"
														size="sm"
														outline
														onClick={(e) => {
															e.stopPropagation()
															handlePreview(product)
														}}
													>
														Preview
													</Button>
												</Col>
											</Row>
										</div>
									)
								})}
							</div>
						)}
					</CardBody>
				</Card>
				
				{/* Preview Section */}
				{previewProduct && (
					<Card className="mt-2">
						<CardBody>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<h5 className="mb-0">Label Preview: {previewProduct.name}</h5>
								<Button
									color="danger"
									size="sm"
									outline
									onClick={() => setPreviewProduct(null)}
								>
									<X size={14} />
								</Button>
							</div>
							<div 
								dangerouslySetInnerHTML={{ 
									__html: generateLabelPreview(previewProduct, {
										format: selectedFormat,
										labelOptions
									})
								}}
							/>
						</CardBody>
					</Card>
				)}
			</ModalBody>
			
			<ModalFooter>
				<div className="d-flex justify-content-between align-items-center w-100">
					<div className="text-muted">
						Format: {selectedFormat.name} ({selectedFormat.description})
					</div>
					<div>
						<Button color="secondary" outline onClick={handleClose} className="mr-1">
							Cancel
						</Button>
						<Button 
							color="primary" 
							onClick={handleGenerateLabels}
							disabled={selectedProducts.length === 0}
						>
							<Printer size={16} className="mr-1" />
							Generate {getTotalLabels()} Labels
						</Button>
					</div>
				</div>
			</ModalFooter>
		</Modal>
	)
}

export default PriceLabelModal