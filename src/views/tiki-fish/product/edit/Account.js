// ** React Imports
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Lock, Edit, Trash2, Camera } from 'react-feather'
import { Media, Row, Col, Button, Form, Input, Label, FormGroup, Table, CustomInput, InputGroup, InputGroupAddon, Spinner } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, getProduct } from '../store/action'
import { swal, apiRequest } from '@utils'
import { useProductScanner } from '../../../../hooks/useProductScanner'

const UserAccountTab = ({ selectedProduct }) => {
	const dispatch = useDispatch()
	// ** States
	const [img, setImg] = useState(null)
	const [productData, setProductData] = useState({
		name: selectedProduct.name,
		qty: selectedProduct.qty,
		price: selectedProduct.price,
		costPrice: selectedProduct.costPrice,
		packagingPrice: selectedProduct.packagingPrice,
		unit: selectedProduct.unit,
		unitValue: selectedProduct.unitValue,
		category: selectedProduct.category,
		barcode: selectedProduct.barcode || ''
	})

	// Handle barcode scanning
	const handleBarcodeScanned = (barcode) => {
		setProductData(prev => ({...prev, barcode}))
	}

	// Initialize scanner hook
	const { isConnected, isScanning, startScanning } = useProductScanner(handleBarcodeScanned)

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
					setProductData({
						name: selectedProduct.name,
						qty: selectedProduct.qty,
						price: selectedProduct.price,
						costPrice: selectedProduct.costPrice,
						packagingPrice: selectedProduct.packagingPrice,
						unitValue: selectedProduct.unitValue,
						barcode: selectedProduct.barcode || ''
					})
				} else {
					swal('Oops!', response.data.message, 'error')
					setProductData({
						name: selectedProduct.name,
						qty: selectedProduct.qty,
						price: selectedProduct.price,
						costPrice: selectedProduct.costPrice,
						packagingPrice: selectedProduct.packagingPrice,
						unitValue: selectedProduct.unitValue,
						barcode: selectedProduct.barcode || ''
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

	// ** Update user image on mount or change
	useEffect(() => {
		if (selectedProduct !== null) {
			if (selectedProduct.image.length) {
				return setImg(selectedProduct.image)
			} else {
				return setImg(null)
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
							{/* <Button.Ripple id='change-img' tag={Label} className='mr-75 mb-0' color='primary'>
                <span className='d-none d-sm-block'>Change</span>
                <span className='d-block d-sm-none'>
                  <Edit size={14} />
                </span>
                <input type='file' hidden id='change-img' onChange={onChange} accept='image/*' />
              </Button.Ripple>
              <Button.Ripple color='secondary' outline>
                <span className='d-none d-sm-block'>Remove</span>
                <span className='d-block d-sm-none'>
                  <Trash2 size={14} />
                </span>
              </Button.Ripple> */}
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
									value={selectedProduct.name}
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
									value={selectedProduct.costPrice || 0}
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
									value={selectedProduct.price || 0}
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
									value={selectedProduct.packagingPrice || 0}
									onChange={(e) => setProductData({ ...productData, packagingPrice: e.target.value })}
								/>
							</FormGroup>
						</Col>
						<Col md='6' sm='12'>
							<FormGroup>
								<Label for='unitValue'>Product Unit Value</Label>
								<AvInput 
									name='unitValue' 
									id='unitValue' 
									placeholder='Product Unit Value' 
									value={selectedProduct.unitValue}
									onChange={e => setProductData({...productData, unitValue: e.target.value})}
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
									value={selectedProduct.unit}
									onChange={(e) => setProductData({ ...productData, unit: e.target.value })}
									required
								>
									<option value={selectedProduct.unit} className="text-cpitalize">
										{selectedProduct.unit}
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
									<InputGroupAddon addonType='append'>
										<Button 
											color={isConnected ? (isScanning ? 'warning' : 'success') : 'secondary'}
											onClick={startScanning}
											disabled={!isConnected}
											title={isConnected ? 'Scan Barcode' : 'Scanner not connected'}
										>
											<Camera size={16} />
											{isScanning && <Spinner size='sm' className='ml-1' />}
										</Button>
									</InputGroupAddon>
								</InputGroup>
								<small className='text-muted'>
									Scanner status: {isConnected ? 'Connected' : 'Disconnected'}
									{isScanning && ' - Ready to scan'}
								</small>
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
