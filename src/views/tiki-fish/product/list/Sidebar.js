// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Uppy from '@uppy/core'
import thumbnailGenerator from '@uppy/thumbnail-generator'
import { DragDrop } from '@uppy/react'
// import FileUploaderBasic from '@views/forms/form-elements/file-uploader/FileUploaderBasic'

import { swal, apiUrl, Storage, apiRequest } from '@utils'
import { getAllData, getFilteredData, getCategories } from '../store/action'
import { useScannerHandler, useScannerContext } from '../../../../contexts/ScannerContext'

// ** Third Party Components
import { Button, FormGroup, Label, Spinner, CustomInput, Card, CardBody, InputGroup, InputGroupAddon, Alert, Badge } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { Camera, X, RefreshCw, AlertCircle, CheckCircle, RefreshCcw } from 'react-feather'

const SidebarNewUsers = ({ open, toggleSidebar }) => {
	const dispatch = useDispatch()
	const { categories, categoriesLoading, categoriesError } = useSelector((state) => state.products)

	const [uppy] = useState(
		() =>
			new Uppy({
				meta: { type: 'product-image' },
				restrictions: { maxNumberOfFiles: 1 },
				autoProceed: true,
			})
	)

	const [productData, setProductData] = useState({
		name: '',
		description: '',
		qty: '',
		unit: '',
		unitValue: '',
		category: '',
		price: '',
		costPrice: '',
		packagingPrice: '',
		barcode: '',
		image: '',
		sku: '',
		alcohol_content: '',
		volume: '',
		origin: '',
		vintage: '',
		// Composite product fields
		product_type: 'simple',
		base_product_id: '',
		composite_quantity: 6,
		discount_percentage: 0,
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [baseProducts, setBaseProducts] = useState([])
	const [loadingBaseProducts, setLoadingBaseProducts] = useState(false)
	const [calculatedPricing, setCalculatedPricing] = useState(null)
	const [loadingPricing, setLoadingPricing] = useState(false)

	// Handle barcode scanning for product creation form
	const handleBarcodeScanned = (barcode, serviceName, scannerType) => {
		console.log(`📝 Product Form: Barcode scanned ${barcode} from ${serviceName}`)
		setProductData((prev) => ({ ...prev, barcode }))
	}

	// Register as medium-priority scanner handler for product form
	useScannerHandler('product-form', handleBarcodeScanned, 5, open)

	// Get scanner status from context
	const {
		isConnected,
		isScanning,
		isInitializing,
		activeScanners,
		bestScanner,
		scannerCount,
		statusSummary,
		statusLevel,
		recommendations,
		lastError,
		canRetry,
		startScanning,
		stopScanning,
		retryInitialization
	} = useScannerContext()

	const uploadImage = async (file) => {
		console.log('Uploading file:', file)
		const formData = new FormData()
		formData.append('image', file)

		const userData = Storage.getItem('userData')
		const { accessToken } = userData

		try {
			const response = await fetch(`${apiUrl}/upload-images`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
					// Don't set Content-Type, let the browser set it with the boundary
				},
				body: formData,
			})

			const data = await response.json()
			console.log('Upload response:', data)

			if (data.status) {
				const imageUrl = data.data.url
				setProductData((prev) => ({ ...prev, image: imageUrl }))
				return imageUrl
			} else {
				swal('Oops!', data.message || 'Failed to upload image', 'error')
				return null
			}
		} catch (error) {
			console.error('Upload error details:', error)
			swal('Error!', 'Failed to upload image. Please try again.', 'error')
			return null
		}
	}

	// Fetch base products for composite product creation
	const fetchBaseProducts = async () => {
		setLoadingBaseProducts(true)
		try {
			const userData = Storage.getItem('userData')
			const { accessToken } = userData

			const response = await fetch(`${apiUrl}/products/base-products`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
			})

			const data = await response.json()
			if (data.status) {
				setBaseProducts(data.data || [])
			} else {
				swal('Error!', data.message || 'Failed to fetch base products', 'error')
			}
		} catch (error) {
			console.error('Error fetching base products:', error)
			swal('Error!', 'Failed to fetch base products', 'error')
		} finally {
			setLoadingBaseProducts(false)
		}
	}

	// Calculate composite pricing
	const calculateCompositePrice = async (baseProductId, compositeQty, discountPercent) => {
		if (!baseProductId || !compositeQty || discountPercent === undefined) return

		setLoadingPricing(true)
		try {
			const userData = Storage.getItem('userData')
			const { accessToken } = userData

			const response = await fetch(`${apiUrl}/products/composite-price`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					base_product_id: baseProductId,
					composite_quantity: compositeQty,
					discount_percentage: discountPercent,
				}),
			})

			const data = await response.json()
			if (data.status) {
				setCalculatedPricing(data.data)
				// Auto-update price fields if not manually set
				if (!productData.price) {
					setProductData((prev) => ({
						...prev,
						price: data.data.price,
						costPrice: data.data.costPrice,
						packagingPrice: data.data.packagingPrice,
					}))
				}
			} else {
				swal('Error!', data.message || 'Failed to calculate pricing', 'error')
			}
		} catch (error) {
			console.error('Error calculating pricing:', error)
			swal('Error!', 'Failed to calculate pricing', 'error')
		} finally {
			setLoadingPricing(false)
		}
	}

	// Handle composite product field changes
	const handleCompositeFieldChange = (field, value) => {
		setProductData((prev) => {
			const updated = { ...prev, [field]: value }

			// Trigger price calculation when relevant fields change
			if (['base_product_id', 'composite_quantity', 'discount_percentage'].includes(field)) {
				setTimeout(() => {
					calculateCompositePrice(updated.base_product_id, updated.composite_quantity, updated.discount_percentage)
				}, 100)
			}

			return updated
		})
	}

	// Fetch categories on component mount
	useEffect(() => {
		if (categories.length === 0 && !categoriesLoading) {
			dispatch(getCategories())
		}
	}, [dispatch, categories.length, categoriesLoading])

	// Fetch base products when product type changes to composite
	useEffect(() => {
		if (productData.product_type === 'composite') {
			fetchBaseProducts()
		}
	}, [productData.product_type])

	useEffect(() => {
		uppy.use(thumbnailGenerator)

		uppy.on('thumbnail:generated', async (file, preview) => {
			console.log('Uppy file object:', file)
			console.log('Uppy state before upload:', {
				filesCount: uppy.getFiles().length,
				uppyState: uppy.getState(),
			})
			setProductData((prev) => ({ ...prev, imagePreview: preview }))

			// Get the actual file from Uppy
			const fileToUpload = uppy.getFile(file.id)
			console.log('File to upload:', fileToUpload)

			if (fileToUpload && fileToUpload.data) {
				// Create a new File object with the correct name
				const uploadFile = new File([fileToUpload.data], fileToUpload.name, {
					type: fileToUpload.type || 'image/jpeg',
				})
				console.log('Calling uploadImage with file:', uploadFile)
				const imageUrl = await uploadImage(uploadFile)
				if (imageUrl) {
					console.log('Image uploaded successfully:', imageUrl)
					setProductData((prev) => ({ ...prev, image: imageUrl }))
				} else {
					console.error('Upload failed - no image URL returned')
				}
			} else {
				console.error('No file data found in Uppy file object')
				swal('Error!', 'Failed to get file data for upload', 'error')
			}
		})

		// Add file upload success and error handlers
		uppy.on('upload-success', (file, response) => {
			console.log('Upload success:', file, response)
		})

		uppy.on('upload-error', (file, error, response) => {
			console.error('Upload error:', file, error, response)
			swal('Error!', 'Failed to upload image', 'error')
		})

		// Only cleanup on component unmount, not on re-renders
		return () => {
			console.log('Cleaning up Uppy event listeners')
			uppy.off('thumbnail:generated')
			uppy.off('upload-success')
			uppy.off('upload-error')
			// Don't close uppy here - it might be needed for subsequent uploads
		}
	}, [])

	// Separate useEffect for component unmount cleanup
	useEffect(() => {
		return () => {
			console.log('Component unmounting - closing Uppy instance')
			if (uppy) {
				uppy.close()
			}
		}
	}, [])

	// ** Function to remove uploaded image
	const removeImage = () => {
		setProductData((prev) => ({
			...prev,
			image: '',
			imagePreview: '',
		}))
		// Clear all files from Uppy
		uppy.getFiles().forEach((file) => {
			uppy.removeFile(file.id)
		})
	}

	// ** Function to replace image (same as remove, user can upload new one)
	const replaceImage = () => {
		removeImage()
		// Force a small delay to ensure state is updated before showing drag-drop again
		setTimeout(() => {
			// Trigger a re-render by focusing on the component
		}, 100)
	}

	// ** Function to handle form submit
	const onSubmit = async (event, errors) => {
		setIsSubmitting(true)
		event.preventDefault()
		if (errors) setIsSubmitting(false)
		if (errors && !errors.length) {
			try {
				const productPayload = {
					...productData,
				}
				delete productPayload.imagePreview // Remove the preview URL as it's not needed in the API

				const body = JSON.stringify(productPayload)
				const response = await apiRequest(
					{
						url: '/products/create',
						method: 'POST',
						body,
					},
					dispatch
				)

				if (response.data.status) {
					setIsSubmitting(false)
					swal('Great job!', response.data.message, 'success')
					dispatch(getAllData())
					setProductData({
						name: '',
						description: '',
						qty: '',
						unit: '',
						unitValue: '',
						category: '',
						price: '',
						costPrice: '',
						packagingPrice: '',
						barcode: '',
						image: '',
						imagePreview: '',
						sku: '',
						alcohol_content: '',
						volume: '',
						origin: '',
						vintage: '',
						// Reset composite fields
						product_type: 'simple',
						base_product_id: '',
						composite_quantity: 6,
						discount_percentage: 0,
					})
					// Clear Uppy files to ensure clean state for next upload
					uppy.getFiles().forEach((file) => {
						uppy.removeFile(file.id)
					})
					toggleSidebar()
				} else {
					setIsSubmitting(false)
					swal('Oops!', response.data.message, 'error')
					setProductData({
						name: '',
						description: '',
						qty: '',
						unit: '',
						unitValue: '',
						category: '',
						price: '',
						costPrice: '',
						packagingPrice: '',
						barcode: '',
						image: '',
						imagePreview: '',
						sku: '',
						alcohol_content: '',
						volume: '',
						origin: '',
						vintage: '',
						// Reset composite fields
						product_type: 'simple',
						base_product_id: '',
						composite_quantity: 6,
						discount_percentage: 0,
					})
					// Clear Uppy files to ensure clean state for next upload
					uppy.getFiles().forEach((file) => {
						uppy.removeFile(file.id)
					})
					toggleSidebar()
				}
			} catch (error) {
				setIsSubmitting(false)
				console.error({ error })
				swal('Error!', 'Failed to process the request. Please try again.', 'error')
			}
		}
	}

	return (
		<Sidebar size="lg" open={open} title="New Product" headerClassName="mb-1" contentClassName="pt-0" toggleSidebar={toggleSidebar}>
			<AvForm onSubmit={onSubmit}>
				<FormGroup>
					<Label for="name">Product Name</Label>
					<AvInput
						name="name"
						id="name"
						placeholder="Product Name"
						value={productData.name}
						onChange={(e) => setProductData({ ...productData, name: e.target.value })}
						required
					/>
				</FormGroup>

				{/* Product Type Selector */}
				<FormGroup>
					<Label for="product_type">Product Type</Label>
					<AvInput
						type="select"
						name="product_type"
						id="product_type"
						value={productData.product_type}
						onChange={(e) => handleCompositeFieldChange('product_type', e.target.value)}
						required
					>
						<option value="simple">Simple Product</option>
						<option value="composite">Composite Product (Bundle/Pack)</option>
					</AvInput>
					<small className="text-muted">Simple: Individual product | Composite: Bundle of multiple units with discount</small>
				</FormGroup>

				{/* Composite Product Fields */}
				{productData.product_type === 'composite' && (
					<>
						<FormGroup>
							<Label for="base_product_id">Base Product *</Label>
							<AvInput
								type="select"
								name="base_product_id"
								id="base_product_id"
								value={productData.base_product_id}
								onChange={(e) => handleCompositeFieldChange('base_product_id', e.target.value)}
								required={productData.product_type === 'composite'}
								disabled={loadingBaseProducts}
							>
								<option value="">{loadingBaseProducts ? 'Loading products...' : 'Select Base Product'}</option>
								{baseProducts.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name} - {Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })} (Stock: {product.qty})
									</option>
								))}
							</AvInput>
							<small className="text-muted">Choose the individual product that will be bundled</small>
						</FormGroup>

						<FormGroup>
							<Label for="composite_quantity">Bundle Quantity *</Label>
							<AvInput
								type="number"
								name="composite_quantity"
								id="composite_quantity"
								placeholder="e.g., 6, 12, 24"
								value={productData.composite_quantity}
								onChange={(e) => handleCompositeFieldChange('composite_quantity', parseInt(e.target.value) || 1)}
								min="2"
								required={productData.product_type === 'composite'}
							/>
							<small className="text-muted">Number of base product units in this bundle</small>
						</FormGroup>

						<FormGroup>
							<Label for="discount_percentage">Discount Percentage *</Label>
							<AvInput
								type="number"
								name="discount_percentage"
								id="discount_percentage"
								placeholder="e.g., 10, 15, 20"
								value={productData.discount_percentage}
								onChange={(e) => handleCompositeFieldChange('discount_percentage', parseFloat(e.target.value) || 0)}
								min="0"
								max="100"
								step="0.01"
								required={productData.product_type === 'composite'}
							/>
							<small className="text-muted">Percentage discount compared to individual unit pricing</small>
						</FormGroup>

						{/* Pricing Preview */}
						{calculatedPricing && (
							<FormGroup>
								<Label>Pricing Preview</Label>
								<div className="border rounded p-2 bg-light">
									<small className="d-block">
										<strong>Original Price:</strong>{' '}
										{Number(calculatedPricing.originalPrice).toLocaleString('en-ZA', {
											style: 'currency',
											currency: 'ZAR',
										})}
									</small>
									<small className="d-block">
										<strong>Discount:</strong> -
										{Number(calculatedPricing.discountAmount).toLocaleString('en-ZA', {
											style: 'currency',
											currency: 'ZAR',
										})}
									</small>
									<small className="d-block">
										<strong>Final Price:</strong>{' '}
										{Number(calculatedPricing.price).toLocaleString('en-ZA', {
											style: 'currency',
											currency: 'ZAR',
										})}
									</small>
									<small className="d-block text-success">
										<strong>Savings:</strong>{' '}
										{Number(calculatedPricing.discountAmount).toLocaleString('en-ZA', {
											style: 'currency',
											currency: 'ZAR',
										})}
										({productData.discount_percentage}% off)
									</small>
								</div>
							</FormGroup>
						)}
					</>
				)}

				<FormGroup>
					<Label for="qty">Quantity</Label>
					<AvInput
						name="qty"
						id="qty"
						placeholder="Quantity"
						value={productData.qty}
						onChange={(e) => setProductData({ ...productData, qty: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="costPrice">Product Cost Price</Label>
					<AvInput
						type="number"
						name="costPrice"
						id="costPrice"
						placeholder="Product Cost Price"
						value={productData.costPrice}
						onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
					/>
				</FormGroup>
				{/* <FormGroup>
            <Label for='smokeHousePrice'>Smoke House Price</Label>
            <AvInput 
              type='number' 
              name='smokeHousePrice' 
              id='smokeHousePrice' 
              placeholder='Smoke House Price' 
              value={productData.smokeHousePrice}
              onChange={e => setProductData({...productData, smokeHousePrice: e.target.value})}
            />
          </FormGroup> */}
				<FormGroup>
					<Label for="packagingPrice">Product Packaging Price</Label>
					<AvInput
						type="number"
						name="packagingPrice"
						id="packagingPrice"
						placeholder="Product Packagaing Price"
						value={productData.packagingPrice}
						onChange={(e) => setProductData({ ...productData, packagingPrice: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="price">Product Selling Price</Label>
					<AvInput
						type="number"
						name="price"
						id="price"
						placeholder="Product Price"
						value={productData.price}
						onChange={(e) => setProductData({ ...productData, price: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="unit">Product Unit</Label>
					<AvInput
						type="select"
						id="unit"
						name="unit"
						value={productData.unit}
						onChange={(e) => setProductData({ ...productData, unit: e.target.value })}
						required
					>
						<option value="">Select Product Unit</option>
						<option value="bottle">Bottle</option>
						<option value="case">Case</option>
						<option value="box">Box</option>
						<option value="can">Can</option>
						<option value="dozen">Dozen</option>
						<option value="kg">Kilogram</option>
						<option value="pck">Pack</option>
						<option value="pcs">Pieces</option>
						<option value="l">Litre</option>
						<option value="g">Gram</option>
						<option value="crate">Crate</option>
						<option value="carton">Carton</option>
					</AvInput>
				</FormGroup>
				<FormGroup>
					<Label for="uniteValue">Product Unit Value</Label>
					<AvInput
						type="number"
						name="unitValue"
						id="unitValue"
						placeholder="Product Unit Value"
						value={productData.unitValue}
						onChange={(e) => setProductData({ ...productData, unitValue: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="categoryId">Product Category</Label>
					<AvInput
						type="select"
						id="categoryId"
						name="categoryId"
						value={productData.categoryId}
						onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
						required
						disabled={categoriesLoading}
					>
						<option value="">{categoriesLoading ? 'Loading categories...' : 'Select Product Category'}</option>
						{categoriesError ? (
							<option value="" disabled>
								Error loading categories
							</option>
						) : (
							categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
								</option>
							))
						)}
					</AvInput>
				</FormGroup>
				<FormGroup>
					<Label for="productImage">Product Image</Label>
					<Card>
						<CardBody>
							{!productData.imagePreview ? (
								<DragDrop uppy={uppy} />
							) : (
								<div>
									<img className="rounded mb-2" src={productData.imagePreview} alt="product" style={{ maxWidth: '200px', display: 'block' }} />
									<div className="d-flex gap-1">
										<Button size="sm" color="warning" outline onClick={replaceImage} className="mr-1">
											<RefreshCw size={14} className="mr-50" />
											Replace
										</Button>
										<Button size="sm" color="danger" outline onClick={removeImage}>
											<X size={14} className="mr-50" />
											Remove
										</Button>
									</div>
									<small className="text-muted d-block mt-1">Click "Replace" to upload a different image or "Remove" to delete this image</small>
								</div>
							)}
							{!productData.imagePreview && <small className="text-muted">Drag and drop an image file here or click to browse</small>}
						</CardBody>
					</Card>
				</FormGroup>
				<FormGroup>
					<Label for="sku">Product SKU</Label>
					<AvInput
						type="text"
						name="sku"
						id="sku"
						placeholder="Product SKU"
						value={productData.sku}
						onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="alcohol_content">Product Alcohol Content</Label>
					<AvInput
						type="number"
						name="alcohol_content"
						id="alcohol_content"
						placeholder="Product Alcohol Content"
						value={productData.alcohol_content}
						onChange={(e) => setProductData({ ...productData, alcohol_content: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="volume">Product Volume</Label>
					<AvInput
						type="number"
						name="volume"
						id="volume"
						placeholder="Product Volume"
						value={productData.volume}
						onChange={(e) => setProductData({ ...productData, volume: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="origin">Product Origin</Label>
					<AvInput
						type="text"
						name="origin"
						id="origin"
						placeholder="Product Origin"
						value={productData.origin}
						onChange={(e) => setProductData({ ...productData, origin: e.target.value })}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="barcode">Product Barcode</Label>
					<InputGroup>
						<AvInput
							type="text"
							name="barcode"
							id="barcode"
							placeholder="Enter or scan product barcode"
							value={productData.barcode}
							onChange={(e) => setProductData({ ...productData, barcode: e.target.value })}
						/>
						<InputGroupAddon addonType="append">
							{isScanning ? (
								<Button color="warning" onClick={stopScanning} title="Stop scanning">
									<X size={16} />
									<Spinner size="sm" className="ml-1" />
								</Button>
							) : (
								<Button
									color={isConnected ? 'success' : 'secondary'}
									onClick={startScanning}
									disabled={!isConnected || isInitializing}
									title={isConnected ? 'Scan Barcode' : 'Scanner not available'}
								>
									<Camera size={16} />
									{isInitializing && <Spinner size="sm" className="ml-1" />}
								</Button>
							)}
							{lastError && canRetry && (
								<Button color="info" onClick={retryInitialization} title="Retry scanner connection" className="ml-1">
									<RefreshCcw size={16} />
								</Button>
							)}
						</InputGroupAddon>
					</InputGroup>

					{/* Enhanced Universal Scanner Status */}
					<div className="mt-2">
						<div className="d-flex align-items-center mb-1">
							{isInitializing && (
								<Badge color="info" className="mr-2">
									<Spinner size="sm" className="mr-1" />
									Initializing...
								</Badge>
							)}
							{isConnected && !isInitializing && (
								<Badge color="success" className="mr-2">
									<CheckCircle size={12} className="mr-1" />
									{scannerCount > 1 ? `${scannerCount} Scanners` : 'Scanner Ready'}
								</Badge>
							)}
							{!isConnected && !isInitializing && (
								<Badge color="secondary" className="mr-2">
									<AlertCircle size={12} className="mr-1" />
									No Scanners
								</Badge>
							)}
							{isScanning && (
								<Badge color="warning">
									<Camera size={12} className="mr-1" />
									Scanning Active
								</Badge>
							)}
						</div>

						{/* Scanner Selection for Multiple Scanners */}
						{scannerCount > 1 && (
							<div className="mb-2">
								<small className="text-muted d-block mb-1">Available scanners:</small>
								<div className="d-flex flex-wrap">
									{activeScanners.map((scanner) => {
										const scannerNames = {
											socketMobile: 'Socket Mobile',
											keyboardWedge: 'USB Scanner',
											browserAPI: 'Camera',
											manual: 'Manual',
										}
										const isActive = scanner === bestScanner
										return (
											<Button
												key={scanner}
												size="sm"
												color={isActive ? 'primary' : 'outline-primary'}
												className="mr-1 mb-1"
												onClick={() => setPreferredScanner(scanner)}
											>
												{scannerNames[scanner] || scanner}
												{isActive && ' ✓'}
											</Button>
										)
									})}
								</div>
							</div>
						)}

						{lastError && (
							<Alert color="warning" className="mb-2 p-2">
								<div className="d-flex justify-content-between align-items-start">
									<div>
										<strong>Scanner Issue</strong>
										<div className="small">{lastError.message}</div>
									</div>
									{canRetry && (
										<Button size="sm" color="warning" outline onClick={retryInitialization} className="ml-2">
											<RefreshCcw size={14} className="mr-1" />
											Retry
										</Button>
									)}
								</div>
							</Alert>
						)}

						{/* Recommendations */}
						{recommendations && recommendations.length > 0 && (
							<div className="mb-2">
								<small className="text-info">💡 {recommendations[0]}</small>
							</div>
						)}

						<small className="text-muted">
							{isConnected
								? isScanning
									? `📷 Scanning with ${
											bestScanner === 'socketMobile'
												? 'Socket Mobile'
												: bestScanner === 'keyboardWedge'
												? 'USB scanner'
												: bestScanner === 'browserAPI'
												? 'camera'
												: bestScanner
									  }...`
									: `✅ ${statusSummary} - click scan button or enter manually`
								: '⚠️ No scanners available - manual entry only'}
						</small>
					</div>
				</FormGroup>
				<FormGroup>
					<Label for="description">Product Description</Label>
					<AvInput
						type="textarea"
						name="description"
						id="description"
						placeholder="Product Description"
						value={productData.description}
						onChange={(e) => setProductData({ ...productData, description: e.target.value })}
					/>
				</FormGroup>
				<Button type="submit" className="mr-1" color="primary" disabled={isSubmitting}>
					{isSubmitting && <Spinner color="white" size="sm" />}
					<span className="ml-50">Submit</span>
				</Button>
				<Button type="reset" color="secondary" outline onClick={toggleSidebar}>
					Cancel
				</Button>
			</AvForm>
		</Sidebar>
	)
}

export default SidebarNewUsers
