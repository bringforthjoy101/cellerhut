// ** Custom Components
import Avatar from '@components/avatar'
import { apiRequest } from '@utils'

// ** Third Party Components
import {
	Card,
	CardBody,
	Row,
	Col,
	Button,
	Label,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Badge,
	CardHeader,
	CardTitle,
} from 'reactstrap'
import { useState, Fragment } from 'react'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { Package, DollarSign, TrendingUp, Calendar, Eye, Edit3, Trash2 } from 'react-feather'

import { useHistory, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// cSpell:ignore Swal sweetalert
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { deleteProduct, getAllData } from '../store/action'
import moment from 'moment/moment'

const MySwal = withReactContent(Swal)

const UserInfoCard = ({ selectedProduct }) => {
	const [picker, setPicker] = useState([new Date(), new Date()])
	const [modal, setModal] = useState(false)
	const [imageModal, setImageModal] = useState(false)
	const [profit, setProfit] = useState({ qty: 0, sales: 0, profit: 0 })

	const renderImg = () => {
		if (selectedProduct !== null && selectedProduct.image) {
			return (
				<div className="product-image-container position-relative" style={{ cursor: 'pointer' }} onClick={() => setImageModal(true)}>
					<img
						src={selectedProduct.image}
						alt={selectedProduct.name}
						className="img-fluid rounded shadow-sm border"
						style={{
							height: '120px',
							width: '120px',
							objectFit: 'cover',
							transition: 'transform 0.2s ease-in-out',
						}}
						onMouseEnter={(e) => {
							e.target.style.transform = 'scale(1.05)'
						}}
						onMouseLeave={(e) => {
							e.target.style.transform = 'scale(1)'
						}}
					/>
					<div className="position-absolute" style={{ top: '5px', right: '5px' }}>
						<Badge color="light" className="p-1">
							<Eye size={12} />
						</Badge>
					</div>
				</div>
			)
		} else {
			const stateNum = Math.floor(Math.random() * 6),
				states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
				color = states[stateNum]
			return (
				<Avatar
					initials
					color={color}
					className="rounded shadow-sm"
					content={selectedProduct.name}
					contentStyles={{
						borderRadius: '8px',
						fontSize: 'calc(48px)',
						width: '100%',
						height: '100%',
						fontWeight: 'bold',
					}}
					style={{
						height: '120px',
						width: '120px',
					}}
				/>
			)
		}
	}
	const history = useHistory()
	const dispatch = useDispatch()

	// ** Get stock status
	const getStockStatus = () => {
		const qty = Number(selectedProduct.qty) || 0
		if (qty === 0) return { color: 'danger', text: 'Out of Stock' }
		if (qty <= 10) return { color: 'warning', text: 'Low Stock' }
		return { color: 'success', text: 'In Stock' }
	}

	// ** Get category name safely (handles both string and object formats)
	const getCategoryName = (category) => {
		if (!category) return ''
		if (typeof category === 'string') return category
		if (typeof category === 'object' && category.name) return category.name
		return String(category)
	}

	// ** Get category badge color
	const getCategoryColor = (category) => {
		const categoryColors = {
			wines: 'primary',
			spirits: 'secondary',
			beer: 'warning',
			'red wines': 'danger',
			'white wines': 'light',
			'rose wines': 'info',
		}
		
		// Extract name from object or use string directly
		const categoryName = getCategoryName(category)
		
		if (!categoryName || typeof categoryName !== 'string') {
			return 'secondary'
		}
		
		return categoryColors[categoryName.toLowerCase()] || 'secondary'
	}

	// ** Handle Delete
	const handleDelete = async (id) => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ml-1',
			},
			buttonsStyling: false,
		}).then(async function (result) {
			if (result.value) {
				const deleted = await dispatch(deleteProduct(id))
				if (deleted) {
					dispatch(getAllData())
					MySwal.fire({
						icon: 'success',
						title: 'Deleted!',
						text: 'Product has been deleted.',
						customClass: {
							confirmButton: 'btn btn-primary',
						},
					})
					history.push(`/products/list`)
				}
			}
		})
	}

	const handleRangeSearch = (date) => {
		console.log({ date })
		const range = date.map((d) => new Date(d).getTime())
		setPicker(range)
		const body = JSON.stringify({
			startDate: moment(picker[0]).format('L').split('/').join('-'),
			endDate: moment(picker[1]).format('L').split('/').join('-'),
		})
		if (date.length === 2) {
			apiRequest({ url: `/products/get-profit/${selectedProduct.id}`, method: 'POST', body }).then((response) => {
				console.log({ response })
				if (response) {
					if (response.data.data && response.data.status) {
						setProfit(response.data.data)
					} else {
						console.log(response.error)
						MySwal.fire({
							icon: 'error',
							title: 'Oops!',
							text: response.data.message,
							customClass: {
								confirmButton: 'btn btn-primary',
							},
						})
					}
				} else {
					MySwal.fire({
						icon: 'error',
						title: 'Oops!',
						text: 'Something went wrong! Please try again.',
						customClass: {
							confirmButton: 'btn btn-primary',
						},
					})
				}
			})
		}

		// dispatch(
		// 	getSalesReport({ startDate: moment(date[0]).format('L').split('/').join('-'), endDate: moment(date[1]).format('L').split('/').join('-'), category: currentCategory.value })
		// )
	}

	const stockStatus = getStockStatus()

	return (
		<Fragment>
			{/* Hero Section */}
			<Card className="shadow-sm">
				<CardBody>
					<Row className="align-items-center">
						<Col md="3" className="text-center mb-3 mb-md-0">
							{renderImg()}
						</Col>
						<Col md="6">
							<div className="product-info">
								<h3 className="mb-2 font-weight-bold">{selectedProduct.name}</h3>
								<div className="mb-3">
									<Badge color={stockStatus.color} className="mr-2 p-2">
										<Package size={14} className="mr-1" />
										{stockStatus.text}
									</Badge>
									{selectedProduct.category && (
										<Badge color={getCategoryColor(selectedProduct.category)} className="mr-2 p-2">
											{getCategoryName(selectedProduct.category)}
										</Badge>
									)}
									{selectedProduct.alcohol_content && (
										<Badge color="info" className="p-2">
											{selectedProduct.alcohol_content}% ABV
										</Badge>
									)}
								</div>
								{selectedProduct.description && <p className="text-muted mb-3">{selectedProduct.description}</p>}
								<div className="price-info">
									<h4 className="text-success mb-1">
										<DollarSign size={18} className="mr-1" />
										{Number(selectedProduct.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
									</h4>
									<small className="text-muted">Selling Price</small>
								</div>
							</div>
						</Col>
						<Col md="3">
							<div className="action-buttons d-flex flex-column">
								<Button tag={Link} to={`/product/edit/${selectedProduct.id}`} color="primary" className="mb-2">
									<Edit3 size={16} className="mr-1" />
									Edit Product
								</Button>
								<Button color="danger" outline onClick={() => handleDelete(selectedProduct.id)} className="mb-2">
									<Trash2 size={16} className="mr-1" />
									Delete
								</Button>
								<Button color="info" outline onClick={() => setModal((prev) => !prev)}>
									<TrendingUp size={16} className="mr-1" />
									Calculate Profit
								</Button>
							</div>
						</Col>
					</Row>
				</CardBody>
			</Card>

			{/* Detailed Information Grid */}
			<Row className="mt-3">
				{/* Pricing Information */}
				<Col lg="6" md="12" className="mb-3">
					<Card className="h-100">
						<CardHeader>
							<CardTitle className="d-flex align-items-center">
								<DollarSign size={20} className="mr-2 text-success" />
								Pricing Details
							</CardTitle>
						</CardHeader>
						<CardBody>
							<div className="pricing-grid">
								<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
									<span className="font-weight-medium">Cost Price:</span>
									<span className="text-muted">
										{Number(selectedProduct.costPrice || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
									</span>
								</div>
								<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
									<span className="font-weight-medium">Selling Price:</span>
									<span className="text-success font-weight-bold">
										{Number(selectedProduct.price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
									</span>
								</div>
								<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
									<span className="font-weight-medium">Packaging Price:</span>
									<span className="text-muted">
										{Number(selectedProduct.packagingPrice || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
									</span>
								</div>
								<div className="d-flex justify-content-between align-items-center py-2">
									<span className="font-weight-medium">Profit Margin:</span>
									<span className="text-primary font-weight-bold">
										{(
											Number(selectedProduct.price || 0) -
											(Number(selectedProduct.costPrice || 0) + Number(selectedProduct.packagingPrice || 0))
										).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
									</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				{/* Inventory & Specifications */}
				<Col lg="6" md="12" className="mb-3">
					<Card className="h-100">
						<CardHeader>
							<CardTitle className="d-flex align-items-center">
								<Package size={20} className="mr-2 text-info" />
								Inventory & Specifications
							</CardTitle>
						</CardHeader>
						<CardBody>
							<div className="specs-grid">
								<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
									<span className="font-weight-medium">Stock Quantity:</span>
									<Badge color={stockStatus.color}>
										{selectedProduct.qty || 0} {selectedProduct.unit}
									</Badge>
								</div>
								<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
									<span className="font-weight-medium">Unit Size:</span>
									<span className="text-muted">
										{selectedProduct.unitValue}
										{selectedProduct.unit}
									</span>
								</div>
								{selectedProduct.sku && (
									<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
										<span className="font-weight-medium">SKU:</span>
										<span className="text-muted">{selectedProduct.sku}</span>
									</div>
								)}
								{selectedProduct.volume && (
									<div className="d-flex justify-content-between align-items-center py-2 border-bottom">
										<span className="font-weight-medium">Volume:</span>
										<span className="text-muted">{selectedProduct.volume}ml</span>
									</div>
								)}
								{selectedProduct.origin && (
									<div className="d-flex justify-content-between align-items-center py-2">
										<span className="font-weight-medium">Origin:</span>
										<span className="text-muted">{selectedProduct.origin}</span>
									</div>
								)}
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Profit Analysis Section */}
			<Row className="mt-3">
				<Col md="12">
					<Card>
						<CardHeader>
							<CardTitle className="d-flex align-items-center">
								<Calendar size={20} className="mr-2 text-warning" />
								Profit Analysis Tool
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Row className="align-items-center">
								<Col md="8">
									<Label for="range-picker">Select Date Range for Profit Analysis:</Label>
									<Flatpickr
										value={picker}
										id="range-picker"
										className="form-control"
										onChange={(date) => handleRangeSearch(date)}
										options={{
											mode: 'range',
											defaultDate: ['2020-02-01', '2020-02-15'],
										}}
									/>
								</Col>
								<Col md="4" className="text-md-right mt-2 mt-md-0">
									<Button color="primary" onClick={() => setModal((prev) => !prev)}>
										<TrendingUp size={16} className="mr-1" />
										View Profit Report
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Profit Analysis Modal */}
			<Modal isOpen={modal} toggle={() => setModal((prev) => !prev)} className={'modal-dialog-centered modal-lg'}>
				<ModalHeader toggle={() => setModal((prev) => !prev)}>
					<div className="d-flex align-items-center">
						<TrendingUp size={20} className="mr-2 text-primary" />
						{selectedProduct.name}'s Profit Analysis
					</div>
					<small className="text-muted">
						From {moment(picker[0]).format('LL')} to {moment(picker[1]).format('LL')}
					</small>
				</ModalHeader>
				<ModalBody>
					<Row>
						<Col md="4" className="text-center mb-3">
							<Card className="bg-light border-0">
								<CardBody className="py-3">
									<h3 className="text-primary mb-1">{profit.qty.toLocaleString()}</h3>
									<small className="text-muted">Units Sold</small>
								</CardBody>
							</Card>
						</Col>
						<Col md="4" className="text-center mb-3">
							<Card className="bg-light border-0">
								<CardBody className="py-3">
									<h3 className="text-success mb-1">{profit.sales.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h3>
									<small className="text-muted">Total Sales</small>
								</CardBody>
							</Card>
						</Col>
						<Col md="4" className="text-center mb-3">
							<Card className="bg-light border-0">
								<CardBody className="py-3">
									<h3 className="text-info mb-1">{profit.profit.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h3>
									<small className="text-muted">Net Profit</small>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={() => setModal((prev) => !prev)}>
						Close
					</Button>
				</ModalFooter>
			</Modal>

			{/* Image Zoom Modal */}
			<Modal isOpen={imageModal} toggle={() => setImageModal(!imageModal)} className="modal-dialog-centered modal-lg" size="lg">
				<ModalHeader toggle={() => setImageModal(!imageModal)}>{selectedProduct.name} - Product Image</ModalHeader>
				<ModalBody className="text-center p-4">
					{selectedProduct.image ? (
						<img
							src={selectedProduct.image}
							alt={selectedProduct.name}
							className="img-fluid rounded shadow"
							style={{ maxHeight: '500px', maxWidth: '100%' }}
						/>
					) : (
						<div className="text-muted">
							<Package size={64} className="mb-3" />
							<p>No image available for this product</p>
						</div>
					)}
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={() => setImageModal(!imageModal)}>
						Close
					</Button>
				</ModalFooter>
			</Modal>
		</Fragment>
	)
}

export default UserInfoCard
