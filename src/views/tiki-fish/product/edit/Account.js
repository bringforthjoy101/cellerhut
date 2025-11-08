// ** React Imports
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'
import Uppy from '@uppy/core'
import thumbnailGenerator from '@uppy/thumbnail-generator'
import { DragDrop } from '@uppy/react'

// ** Third Party Components
import { Lock, Edit, Trash2, Camera, X, RefreshCw, AlertCircle, CheckCircle, RefreshCcw } from 'react-feather'
import {
	Media,
	Row,
	Col,
	Button,
	Form,
	Input,
	Label,
	FormGroup,
	Table,
	CustomInput,
	InputGroup,
	InputGroupAddon,
	Spinner,
	Card,
	CardBody,
	Alert,
	Badge,
} from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, getProduct, getCategories } from '../store/action'
import { swal, apiRequest, apiUrl, Storage } from '@utils'
import { useScannerHandler, useScannerContext } from '../../../../contexts/ScannerContext'

const UserAccountTab = ({ selectedProduct }) => {
	const dispatch = useDispatch()
	const { categories, categoriesLoading, categoriesError } = useSelector((state) => state.products)

	// ** Uppy instance for image upload
	const [uppy] = useState(
		() =>
			new Uppy({
				meta: { type: 'product-image' },
				restrictions: { maxNumberOfFiles: 1 },
				autoProceed: true,
			})
	)

	// ** States
	const [img, setImg] = useState(null)
	const [imagePreview, setImagePreview] = useState('')
	const [productData, setProductData] = useState({
		name: selectedProduct.name,
		qty: selectedProduct.qty,
		price: selectedProduct.price,
		costPrice: selectedProduct.costPrice,
		discountPrice: selectedProduct.discountPrice || '',
		packagingPrice: selectedProduct.packagingPrice,
		unit: selectedProduct.unit,
		unitValue: selectedProduct.unitValue,
		category: selectedProduct.category,
		barcode: selectedProduct.barcode || '',
		description: selectedProduct.description || '',
		sku: selectedProduct.sku || '',
		alcohol_content: selectedProduct.alcohol_content || '',
		volume: selectedProduct.volume || '',
		origin: selectedProduct.origin || '',
		vintage: selectedProduct.vintage || '',
		tasting_notes: selectedProduct.tasting_notes || '',
		food_pairings: selectedProduct.food_pairings || '',
		serving_temperature: selectedProduct.serving_temperature || '',
		categoryId: selectedProduct.categoryId || '',
		image: selectedProduct.image || '',
		// Composite product fields
		product_type: selectedProduct.product_type || 'simple',
		base_product_id: selectedProduct.base_product_id || '',
		composite_quantity: selectedProduct.composite_quantity || 6,
		discount_percentage: selectedProduct.discount_percentage || 0,
	})

	// Handle barcode scanning for product edit form
	const handleBarcodeScanned = (barcode, serviceName, scannerType) => {
		console.log(`✏️ Product Edit: Barcode scanned ${barcode} from ${serviceName}`)
		setProductData((prev) => ({ ...prev, barcode }))
	}

	// Register as medium-priority scanner handler for product edit form
	useScannerHandler('product-edit', handleBarcodeScanned, 5, true)

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
		retryInitialization,
	} = useScannerContext()

	// Composite product states
	const [baseProducts, setBaseProducts] = useState([])
	const [loadingBaseProducts, setLoadingBaseProducts] = useState(false)
	const [calculatedPricing, setCalculatedPricing] = useState(null)
	const [loadingPricing, setLoadingPricing] = useState(false)

	// ** Image upload function
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

	// ** Function to remove uploaded image
	const removeImage = () => {
		setProductData((prev) => ({
			...prev,
			image: '',
		}))
		setImagePreview('')
		setImg(null)
		// Clear all files from Uppy
		uppy.getFiles().forEach((file) => {
			uppy.removeFile(file.id)
		})
	}

	// ** Function to replace image
	const replaceImage = () => {
		removeImage()
	}

	// Fetch base products for composite product editing
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

	const onSubmit = async (event, errors) => {
		event.preventDefault()
		console.log({ errors })
		if (errors && !errors.length) {
			console.log({ productData })
			const body = JSON.stringify(productData)
			try {
				const response = await apiRequest({ url: `/products/update/${selectedProduct.id}`, method: 'POST', body }, dispatch)
				console.log({ response })
				if (response.data.status) {
					swal('Great job!', response.data.message, 'success')
					dispatch(getAllData())
					dispatch(getProduct(selectedProduct.id))
					// Note: Don't reset productData here as we want to keep the updated values
				} else {
					swal('Oops!', response.data.message, 'error')
					// Reset to original values on error
					setProductData({
						name: selectedProduct.name,
						qty: selectedProduct.qty,
						price: selectedProduct.price,
						costPrice: selectedProduct.costPrice,
						discountPrice: selectedProduct.discountPrice || '',
						packagingPrice: selectedProduct.packagingPrice,
						unit: selectedProduct.unit,
						unitValue: selectedProduct.unitValue,
						category: selectedProduct.category,
						barcode: selectedProduct.barcode || '',
						description: selectedProduct.description || '',
						sku: selectedProduct.sku || '',
						alcohol_content: selectedProduct.alcohol_content || '',
						volume: selectedProduct.volume || '',
						origin: selectedProduct.origin || '',
						categoryId: selectedProduct.categoryId || '',
						image: selectedProduct.image || '',
					})
				}
			} catch (error) {
				console.error({ error })
			}
		}
	}

	// ** Function to change user image
	const onChange = (e) => {
		const reader = new FileReader(),
			files = e.target.files
		reader.onload = function () {
			setImg(reader.result)
		}
		reader.readAsDataURL(files[0])
	}

	// ** Setup Uppy for image upload
	useEffect(() => {
		uppy.use(thumbnailGenerator)

		uppy.on('thumbnail:generated', async (file, preview) => {
			console.log('Uppy file object:', file)
			setImagePreview(preview)

			// Get the actual file from Uppy
			const fileToUpload = uppy.getFile(file.id)
			console.log('File to upload:', fileToUpload)

			if (fileToUpload && fileToUpload.data) {
				// Create a new File object with the correct name
				const uploadFile = new File([fileToUpload.data], fileToUpload.name, {
					type: fileToUpload.type || 'image/jpeg',
				})
				const imageUrl = await uploadImage(uploadFile)
				if (imageUrl) {
					setProductData((prev) => ({ ...prev, image: imageUrl }))
					setImg(imageUrl)
				}
			} else {
				console.error('No file data found in Uppy file object')
				swal('Error!', 'Failed to get file data for upload', 'error')
			}
		})

		uppy.on('upload-success', (file, response) => {
			console.log('Upload success:', file, response)
		})

		uppy.on('upload-error', (file, error, response) => {
			console.error('Upload error:', file, error, response)
			swal('Error!', 'Failed to upload image', 'error')
		})

		return () => uppy.close()
	}, [])

	// ** Fetch categories on component mount
	useEffect(() => {
		if (categories.length === 0 && !categoriesLoading) {
			dispatch(getCategories())
		}
	}, [dispatch, categories.length, categoriesLoading])

	// ** Reset all state when selectedProduct changes
	useEffect(() => {
		if (selectedProduct !== null) {
			setProductData({
				name: selectedProduct.name || '',
				qty: selectedProduct.qty || '',
				price: selectedProduct.price || '',
				costPrice: selectedProduct.costPrice || '',
				discountPrice: selectedProduct.discountPrice || '',
				packagingPrice: selectedProduct.packagingPrice || '',
				unit: selectedProduct.unit || '',
				unitValue: selectedProduct.unitValue || '',
				category: selectedProduct.category || '',
				barcode: selectedProduct.barcode || '',
				description: selectedProduct.description || '',
				sku: selectedProduct.sku || '',
				alcohol_content: selectedProduct.alcohol_content || '',
				volume: selectedProduct.volume || '',
				origin: selectedProduct.origin || '',
				categoryId: selectedProduct.categoryId || '',
				image: selectedProduct.image || '',
				// Composite product fields
				product_type: selectedProduct.product_type || 'simple',
				base_product_id: selectedProduct.base_product_id || '',
				composite_quantity: selectedProduct.composite_quantity || 6,
				discount_percentage: selectedProduct.discount_percentage || 0,
			})
		}
	}, [selectedProduct])

	// ** Update user image on mount or change
	useEffect(() => {
		if (selectedProduct !== null) {
			if (selectedProduct.image?.length) {
				setImg(selectedProduct.image)
				setImagePreview(selectedProduct.image)
				setProductData((prev) => ({ ...prev, image: selectedProduct.image }))
			} else {
				setImg(null)
				setImagePreview('')
			}
		}
	}, [selectedProduct])

	// Fetch base products when product type changes to composite
	useEffect(() => {
		if (productData.product_type === 'composite') {
			fetchBaseProducts()
		}
	}, [productData.product_type])

	// Calculate pricing when composite product is loaded or parameters change
	useEffect(() => {
		if (
			productData.product_type === 'composite' &&
			productData.base_product_id &&
			productData.composite_quantity &&
			productData.discount_percentage !== undefined
		) {
			calculateCompositePrice(productData.base_product_id, productData.composite_quantity, productData.discount_percentage)
		}
	}, [productData.product_type, productData.base_product_id, productData.composite_quantity, productData.discount_percentage])

	// ** Renders User
	const renderUserAvatar = () => {
		if (img === null) {
			const stateNum = Math.floor(Math.random() * 6),
				states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
				color = states[stateNum]
			return (
				<Avatar
					initials
					color={color}
					className="rounded mr-2 my-25"
					content={selectedProduct.name}
					contentStyles={{
						borderRadius: 0,
						fontSize: 'calc(36px)',
						width: '100%',
						height: '100%',
					}}
					style={{
						height: '90px',
						width: '90px',
					}}
				/>
			)
		} else {
			return <img className="user-avatar rounded mr-2 my-25 cursor-pointer" src={img} alt="user profile avatar" height="90" width="90" />
		}
	}

	return (
		<Row>
			<Col sm="12">
				<Media className="mb-2">
					{renderUserAvatar()}
					<Media className="mt-50" body>
						<h4>{selectedProduct.fullName} </h4>
						<div className="d-flex flex-wrap mt-1 px-0">
							{img && (
								<>
									<Button color="warning" size="sm" outline onClick={replaceImage} className="mr-75 mb-0">
										<RefreshCw size={14} className="mr-50" />
										<span className="d-none d-sm-block">Replace</span>
									</Button>
									<Button color="danger" size="sm" outline onClick={removeImage}>
										<X size={14} className="mr-50" />
										<span className="d-none d-sm-block">Remove</span>
									</Button>
								</>
							)}
						</div>
					</Media>
				</Media>
			</Col>
			<Col sm="12">
				<AvForm onSubmit={onSubmit}>
					<Row>
						<Col md="6" sm="12">
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
								{/* <Input type='text' id='name' placeholder='Name' defaultValue={selectedProduct.name} /> */}
							</FormGroup>
						</Col>

						{/* Product Type - Full Width */}
						<Col md="12" sm="12">
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
						</Col>

						{/* Composite Product Fields */}
						{productData.product_type === 'composite' && (
							<>
								<Col md="6" sm="12">
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
													{product.name} -{' '}
													{Number(product.price).toLocaleString('en-ZA', {
														style: 'currency',
														currency: 'ZAR',
													})}{' '}
													(Stock: {product.qty})
												</option>
											))}
										</AvInput>
										<small className="text-muted">Choose the individual product that will be bundled</small>
									</FormGroup>
								</Col>

								<Col md="3" sm="12">
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
										<small className="text-muted">Units in bundle</small>
									</FormGroup>
								</Col>

								<Col md="3" sm="12">
									<FormGroup>
										<Label for="discount_percentage">Discount % *</Label>
										<AvInput
											type="number"
											name="discount_percentage"
											id="discount_percentage"
											placeholder="e.g., 10, 15"
											value={productData.discount_percentage}
											onChange={(e) => handleCompositeFieldChange('discount_percentage', parseFloat(e.target.value) || 0)}
											min="0"
											max="100"
											step="0.01"
											required={productData.product_type === 'composite'}
										/>
										<small className="text-muted">% discount</small>
									</FormGroup>
								</Col>

								{/* Pricing Preview */}
								{calculatedPricing && (
									<Col md="12" sm="12">
										<FormGroup>
											<Label>Pricing Preview</Label>
											<div className="border rounded p-2 bg-light">
												<Row>
													<Col md="3">
														<small className="d-block">
															<strong>Original:</strong>{' '}
															{Number(calculatedPricing.originalPrice).toLocaleString('en-ZA', {
																style: 'currency',
																currency: 'ZAR',
															})}
														</small>
													</Col>
													<Col md="3">
														<small className="d-block">
															<strong>Discount:</strong> -
															{Number(calculatedPricing.discountAmount).toLocaleString('en-ZA', {
																style: 'currency',
																currency: 'ZAR',
															})}
														</small>
													</Col>
													<Col md="3">
														<small className="d-block">
															<strong>Final:</strong>{' '}
															{Number(calculatedPricing.price).toLocaleString('en-ZA', {
																style: 'currency',
																currency: 'ZAR',
															})}
														</small>
													</Col>
													<Col md="3">
														<small className="d-block text-success">
															<strong>Savings:</strong> {productData.discount_percentage}% off
														</small>
													</Col>
												</Row>
											</div>
										</FormGroup>
									</Col>
								)}
							</>
						)}

						<Col md="6" sm="12">
							<FormGroup>
								<Label for="costPrice">Product Cost Price</Label>
								<AvInput
									name="costPrice"
									id="costPrice"
									placeholder="Product Cost Price"
									value={productData.costPrice || 0}
									onChange={(e) => setProductData({ ...productData, costPrice: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="price">Product Selling Price</Label>
								<AvInput
									name="price"
									id="price"
									placeholder="Product Selling Price"
									value={productData.price || 0}
									onChange={(e) => setProductData({ ...productData, price: e.target.value })}
									required
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="discountPrice">Product Discount Price (Optional)</Label>
								<AvInput
									name="discountPrice"
									id="discountPrice"
									type="number"
									step="0.01"
									placeholder="Discount/Sale Price"
									value={productData.discountPrice || ''}
									onChange={(e) => setProductData({ ...productData, discountPrice: e.target.value })}
								/>
								<small className="text-muted">
									Leave empty for no discount. Must be less than selling price.
								</small>
								{productData.discountPrice && productData.price && parseFloat(productData.discountPrice) < parseFloat(productData.price) && (
									<Alert color="success" className="mt-2 p-2">
										<small>
											<strong>Discount: </strong>
											{(((parseFloat(productData.price) - parseFloat(productData.discountPrice)) / parseFloat(productData.price)) * 100).toFixed(2)}% off
											(Save R{(parseFloat(productData.price) - parseFloat(productData.discountPrice)).toFixed(2)})
										</small>
									</Alert>
								)}
								{productData.discountPrice && productData.price && parseFloat(productData.discountPrice) >= parseFloat(productData.price) && (
									<Alert color="danger" className="mt-2 p-2">
										<small>
											<AlertCircle size={14} className="mr-1" />
											Discount price must be less than selling price
										</small>
									</Alert>
								)}
							</FormGroup>
						</Col>
						{/* <Col md="6" sm="12">
							<FormGroup>
								<Label for="smokeHousePrice">Smoke House Price</Label>
								<AvInput
									name="smokeHousePrice"
									id="smokeHousePrice"
									placeholder="Smoke House Price"
									value={selectedProduct.smokeHousePrice || 0}
									onChange={(e) => setProductData({ ...productData, smokeHousePrice: e.target.value })}
									required
								/>
							</FormGroup>
						</Col> */}
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="packagingPrice">Product Packaging Price</Label>
								<AvInput
									name="packagingPrice"
									id="packagingPrice"
									placeholder="Product Packaging Price"
									value={productData.packagingPrice || 0}
									onChange={(e) => setProductData({ ...productData, packagingPrice: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="unitValue">Product Unit Value</Label>
								<AvInput
									name="unitValue"
									id="unitValue"
									placeholder="Product Unit Value"
									value={productData.unitValue}
									onChange={(e) => setProductData({ ...productData, unitValue: e.target.value })}
									required
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="unit">Unit</Label>
								<AvInput
									type="select"
									id="unit"
									name="unit"
									value={productData.unit}
									onChange={(e) => setProductData({ ...productData, unit: e.target.value })}
									required
								>
									<option value={productData.unit} className="text-capitalize">
										{productData.unit}
									</option>
									<option value="wrap">Wrap</option>
									<option value="kg">Kilogram</option>
									<option value="pck">Pack</option>
									<option value="pcs">Pieces</option>
									<option value="l">Litre</option>
									<option value="g">Gram</option>
									<option value="crate">Crate</option>
									<option value="carton">Carton</option>
								</AvInput>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="barcode">Product Barcode</Label>
								<InputGroup>
									<AvInput
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
						</Col>

						{/* Image Upload Section */}
						{!img && (
							<Col md="12" sm="12">
								<FormGroup>
									<Label for="productImage">Product Image</Label>
									<Card>
										<CardBody>
											<DragDrop uppy={uppy} />
											<small className="text-muted">Drag and drop an image file here or click to browse</small>
										</CardBody>
									</Card>
								</FormGroup>
							</Col>
						)}

						{/* Additional Product Fields */}
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="categoryId">Product Category</Label>
								<div className="d-flex align-items-center">
									<div className="flex-grow-1">
										<AvInput
											type="select"
											id="categoryId"
											name="categoryId"
											value={productData.categoryId}
											onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
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
									</div>
									{productData.categoryId && categories.length > 0 && (
										<div className="ml-1">
											<Badge color="light-primary" pill className="d-flex align-items-center px-1 py-50">
												<span className="text-xs">{categories.find(c => c.id === parseInt(productData.categoryId))?.icon || 'Beverage'}</span>
											</Badge>
										</div>
									)}
								</div>
								{productData.categoryId && categories.length > 0 && (
									<small className="text-muted d-block mt-50">
										Icon: {categories.find(c => c.id === parseInt(productData.categoryId))?.icon || 'Beverage'}
									</small>
								)}
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="sku">Product SKU</Label>
								<AvInput
									name="sku"
									id="sku"
									placeholder="Product SKU"
									value={productData.sku}
									onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="alcohol_content">Product Alcohol Content (%)</Label>
								<AvInput
									type="number"
									name="alcohol_content"
									id="alcohol_content"
									placeholder="Product Alcohol Content"
									value={productData.alcohol_content}
									onChange={(e) => setProductData({ ...productData, alcohol_content: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="volume">Product Volume (ml)</Label>
								<AvInput
									type="number"
									name="volume"
									id="volume"
									placeholder="Product Volume"
									value={productData.volume}
									onChange={(e) => setProductData({ ...productData, volume: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="origin">Product Origin</Label>
								<AvInput
									name="origin"
									id="origin"
									placeholder="Product Origin"
									value={productData.origin}
									onChange={(e) => setProductData({ ...productData, origin: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="vintage">Vintage Year</Label>
								<AvInput
									type="number"
									name="vintage"
									id="vintage"
									placeholder="e.g., 2015"
									value={productData.vintage}
									onChange={(e) => setProductData({ ...productData, vintage: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="serving_temperature">Serving Temperature</Label>
								<AvInput
									name="serving_temperature"
									id="serving_temperature"
									placeholder="e.g., Serve chilled (8-10°C)"
									value={productData.serving_temperature}
									onChange={(e) => setProductData({ ...productData, serving_temperature: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="12" sm="12">
							<FormGroup>
								<Label for="tasting_notes">Tasting Notes</Label>
								<AvInput
									type="textarea"
									name="tasting_notes"
									id="tasting_notes"
									rows="3"
									placeholder="Describe the flavor profile, aroma, and tasting experience..."
									value={productData.tasting_notes}
									onChange={(e) => setProductData({ ...productData, tasting_notes: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="12" sm="12">
							<FormGroup>
								<Label for="food_pairings">Food Pairings</Label>
								<AvInput
									type="textarea"
									name="food_pairings"
									id="food_pairings"
									rows="3"
									placeholder="Suggest ideal food pairings for this product..."
									value={productData.food_pairings}
									onChange={(e) => setProductData({ ...productData, food_pairings: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md="6" sm="12">
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
						</Col>

						<Col className="d-flex flex-sm-row flex-column mt-2" sm="12">
							<Button className="mb-1 mb-sm-0 mr-0 mr-sm-1" type="submit" color="primary">
								Save Changes
							</Button>
						</Col>
					</Row>
				</AvForm>
			</Col>
		</Row>
	)
}
export default UserAccountTab
