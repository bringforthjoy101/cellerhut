// ** React Imports
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'
import Uppy from '@uppy/core'
import thumbnailGenerator from '@uppy/thumbnail-generator'
import { DragDrop } from '@uppy/react'

// ** Third Party Components
import { Lock, Edit, Trash2, Camera, X, RefreshCw } from 'react-feather'
import { Media, Row, Col, Button, Form, Input, Label, FormGroup, Table, CustomInput, InputGroup, InputGroupAddon, Spinner, Card, CardBody } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, getProduct, getCategories } from '../store/action'
import { swal, apiRequest, apiUrl, Storage } from '@utils'
import { useProductScanner } from '../../../../hooks/useProductScanner'

const UserAccountTab = ({ selectedProduct }) => {
	const dispatch = useDispatch()
	const { categories, categoriesLoading, categoriesError } = useSelector(state => state.products)
	
	// ** Uppy instance for image upload
	const [uppy] = useState(() => new Uppy({
		meta: { type: 'product-image' },
		restrictions: { maxNumberOfFiles: 1 },
		autoProceed: true
	}))

	// ** States
	const [img, setImg] = useState(null)
	const [imagePreview, setImagePreview] = useState('')
	const [productData, setProductData] = useState({
		name: selectedProduct.name,
		qty: selectedProduct.qty,
		price: selectedProduct.price,
		costPrice: selectedProduct.costPrice,
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

	// Handle barcode scanning
	const handleBarcodeScanned = (barcode) => {
		setProductData((prev) => ({ ...prev, barcode }))
	}

	// Initialize scanner hook
	const { isConnected, isScanning, startScanning } = useProductScanner(handleBarcodeScanned)

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
					Accept: 'application/json'
				},
				body: formData
			})

			const data = await response.json()
			console.log('Upload response:', data)
			
			if (data.status) {
				const imageUrl = data.data.url
				setProductData(prev => ({...prev, image: imageUrl}))
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
		setProductData(prev => ({
			...prev, 
			image: ''
		}))
		setImagePreview('')
		setImg(null)
		// Clear all files from Uppy
		uppy.getFiles().forEach(file => {
			uppy.removeFile(file.id)
		})
	}

	// ** Function to replace image
	const replaceImage = () => {
		removeImage()
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
					type: fileToUpload.type || 'image/jpeg'
				})
				const imageUrl = await uploadImage(uploadFile)
				if (imageUrl) {
					setProductData(prev => ({...prev, image: imageUrl}))
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
			})
		}
	}, [selectedProduct])

	// ** Update user image on mount or change
	useEffect(() => {
		if (selectedProduct !== null) {
			if (selectedProduct.image?.length) {
				setImg(selectedProduct.image)
				setImagePreview(selectedProduct.image)
				setProductData(prev => ({...prev, image: selectedProduct.image}))
			} else {
				setImg(null)
				setImagePreview('')
			}
		}
	}, [selectedProduct])

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
									<Button color='warning' size='sm' outline onClick={replaceImage} className='mr-75 mb-0'>
										<RefreshCw size={14} className='mr-50' />
										<span className='d-none d-sm-block'>Replace</span>
									</Button>
									<Button color='danger' size='sm' outline onClick={removeImage}>
										<X size={14} className='mr-50' />
										<span className='d-none d-sm-block'>Remove</span>
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
										placeholder="Product Barcode"
										value={productData.barcode}
										onChange={(e) => setProductData({ ...productData, barcode: e.target.value })}
									/>
									<InputGroupAddon addonType="append">
										<Button
											color={isConnected ? (isScanning ? 'warning' : 'success') : 'secondary'}
											onClick={startScanning}
											disabled={!isConnected}
											title={isConnected ? 'Scan Barcode' : 'Scanner not connected'}
										>
											<Camera size={16} />
											{isScanning && <Spinner size="sm" className="ml-1" />}
										</Button>
									</InputGroupAddon>
								</InputGroup>
								<small className="text-muted">
									Scanner status: {isConnected ? 'Connected' : 'Disconnected'}
									{isScanning && ' - Ready to scan'}
								</small>
							</FormGroup>
						</Col>

						{/* Image Upload Section */}
						{!img && (
							<Col md="12" sm="12">
								<FormGroup>
									<Label for='productImage'>Product Image</Label>
									<Card>
										<CardBody>
											<DragDrop uppy={uppy} />
											<small className='text-muted'>
												Drag and drop an image file here or click to browse
											</small>
										</CardBody>
									</Card>
								</FormGroup>
							</Col>
						)}

						{/* Additional Product Fields */}
						<Col md="6" sm="12">
							<FormGroup>
								<Label for="categoryId">Product Category</Label>
								<AvInput
									type="select"
									id="categoryId"
									name="categoryId"
									value={productData.categoryId}
									onChange={(e) => setProductData({ ...productData, categoryId: e.target.value })}
									disabled={categoriesLoading}
								>
									<option value="">
										{categoriesLoading ? 'Loading categories...' : 'Select Product Category'}
									</option>
									{categoriesError ? (
										<option value='' disabled>Error loading categories</option>
									) : (
										categories.map(category => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))
									)}
								</AvInput>
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
