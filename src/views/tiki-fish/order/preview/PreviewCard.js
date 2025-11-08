// ** Third Party Components
import { Badge, Card, CardBody, CardText, Button, Row, Col, Table, Media } from 'reactstrap'
import moment from 'moment'
import { isUserLoggedIn } from '@utils'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { completeOrder, nullifyOrder, getAllData, getOrder } from '../store/action'
import { ShoppingBag, Globe, User, Mail, Phone, MapPin, Truck, CreditCard, Package, DollarSign } from 'react-feather'

const PreviewCard = ({ data }) => {
	const [userData, setUserData] = useState(null)
	const MySwal = withReactContent(Swal)
	// const history = useHistory()
	const dispatch = useDispatch()
	useEffect(() => {
		if (isUserLoggedIn()) setUserData(JSON.parse(localStorage.getItem('userData')))
	}, [])

	// Order type detection
	const isStoreOrder = data?.location === 'Shop'
	const isOnlineOrder = !isStoreOrder
	const hasTracking = data?.tracking_enabled || data?.trackingEnabled
	const isDispatched = data?.delivery_service === 'tookan' && data?.tookan_job_id
	const renderTable = (products) => {
		console.log(process.env.NODE_ENV)
		// products = process.env.NODE_ENV === 'production' ? JSON.parse(products) : products
		// products = JSON.parse(products)
		return products.map((product) => {
			const productImage = product.product?.image || `${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`
			return (
				<tr key={product.productId}>
					<td className="py-1">
						<div className="d-flex align-items-center">
							<img
								src={productImage}
								alt={product.product?.name}
								style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
								className="mr-2"
							/>
							<p className="card-text font-weight-bold mb-0">{product.product?.name}</p>
						</div>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">{Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">{product.quantity.toLocaleString()}</span>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">
							{Number(Number(product.price) * Number(product.quantity)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
					</td>
				</tr>
			)
		})
	}

	// Enhanced status mapping for all order statuses
	const orderStatus = {
		'order-pending': 'light-info', // Blue - awaiting processing
		'order-processing': 'light-warning', // Yellow - being prepared
		'order-at-local-facility': 'light-primary', // Purple - at facility
		'order-out-for-delivery': 'light-secondary', // Gray - in transit
		'order-completed': 'light-success', // Green - delivered/completed
		'order-cancelled': 'light-danger', // Red - cancelled
		'order-refunded': 'light-dark', // Dark - refunded
		// Legacy support for old status values (without 'order-' prefix)
		pending: 'light-info',
		processing: 'light-warning',
		'at-local-facility': 'light-primary',
		'out-for-delivery': 'light-secondary',
		completed: 'light-success',
		cancelled: 'light-danger',
		refunded: 'light-dark',
	}

	// Helper function to format status text for display
	const formatStatusText = (status) => {
		if (!status) return 'Unknown'

		// Remove 'order-' prefix if present
		const cleanStatus = status.replace('order-', '')

		// Convert hyphens to spaces and capitalize each word
		return cleanStatus
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	}

	// Helper function to get status color with fallback
	const getStatusColor = (status) => {
		return orderStatus[status] || 'light-secondary' // Default to gray if status not found
	}

	// Payment status helper
	const getPaymentStatusColor = (status) => {
		const statusMap = {
			'payment-success': 'success',
			'payment-pending': 'warning',
			'payment-failed': 'danger',
			'payment-refunded': 'info',
		}
		return statusMap[status] || 'secondary'
	}

	const formatPaymentStatus = (status) => {
		if (!status) return 'Unknown'
		return status.replace('payment-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
	}

	// Get customer initials for avatar
	const getInitials = (name) => {
		if (!name) return '??'
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
	}

	// const discountedAmount = (Number(data.amount) - Number(orderData.discount))
	// const taxedAmount = ((Number(orderData.tax) / 100) * Number(discountedAmount))
	// const totalAmount = Number(discountedAmount) + Number(taxedAmount) + Number(orderData.shipping)

	return data !== null ? (
		<div>
			{/* Order Overview Card */}
			<Card className="mb-3">
				<CardBody>
					<div className="d-flex justify-content-between align-items-start flex-wrap">
						<div>
							<h3 className="mb-2">Order #{data.orderNumber}</h3>
							<div className="mb-2">
								{isStoreOrder ? (
									<Badge color="success" className="mr-1">
										<ShoppingBag size={14} className="mr-50" />
										In-Store Purchase
									</Badge>
								) : (
									<Badge color="primary" className="mr-1">
										<Globe size={14} className="mr-50" />
										Online Order
									</Badge>
								)}
								<Badge color={getStatusColor(data.status)} className="mr-1">
									{formatStatusText(data.status)}
								</Badge>
								{data.paymentStatus && (
									<Badge color={getPaymentStatusColor(data.paymentStatus)}>
										{formatPaymentStatus(data.paymentStatus)}
									</Badge>
								)}
							</div>
							<CardText className="mb-0 text-muted">
								<small>Created: {moment(data.createdAt).format('LLL')}</small>
							</CardText>
						</div>
						<div className="text-right">
							<h4 className="mb-1">{Number(data.amount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h4>
							<CardText className="mb-0 text-muted">
								<small>{data.orderItems?.length || 0} items</small>
							</CardText>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Customer & Address Row */}
			<Row className="mb-3">
				{/* Customer Information Card */}
				<Col md="6" className="mb-3 mb-md-0">
					<Card className="h-100">
						<CardBody>
							<h5 className="mb-3">
								<User size={18} className="mr-50" />
								Customer Information
							</h5>
							<div className="d-flex align-items-center mb-3">
								<div
									className="d-flex align-items-center justify-content-center rounded-circle mr-2"
									style={{
										width: '50px',
										height: '50px',
										backgroundColor: '#7367f0',
										color: 'white',
										fontWeight: 'bold',
										fontSize: '18px',
									}}
								>
									{getInitials(data.customer?.name)}
								</div>
								<div>
									<h6 className="mb-0">{data.customer?.name}</h6>
									<small className="text-muted">Customer</small>
								</div>
							</div>
							{data.customer?.email && (
								<div className="d-flex align-items-center mb-2">
									<Mail size={16} className="mr-1 text-muted" />
									<a href={`mailto:${data.customer.email}`} className="text-body">
										{data.customer.email}
									</a>
								</div>
							)}
							{data.customer?.phone && (
								<div className="d-flex align-items-center">
									<Phone size={16} className="mr-1 text-muted" />
									<a href={`tel:${data.customer.phone}`} className="text-body">
										{data.customer.phone}
									</a>
								</div>
							)}
						</CardBody>
					</Card>
				</Col>

				{/* Delivery Address Card */}
				<Col md="6">
					<Card className="h-100">
						<CardBody>
							<h5 className="mb-3">
								<MapPin size={18} className="mr-50" />
								Delivery Address
							</h5>
							<CardText className="mb-0">
								{data.address?.street && <div>{data.address.street}</div>}
								{data.address?.suburb && <div>{data.address.suburb}</div>}
								<div>
									{[data.address?.city, data.address?.province, data.address?.postalCode].filter(Boolean).join(', ')}
								</div>
							</CardText>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Order Items Card */}
			<Card className="mb-3">
				<CardBody>
					<h5 className="mb-3">
						<Package size={18} className="mr-50" />
						Order Items
					</h5>
					<Table responsive>
						<thead>
							<tr>
								<th className="py-1">Product</th>
								<th className="py-1">Price</th>
								<th className="py-1">Quantity</th>
								<th className="py-1">Total</th>
							</tr>
						</thead>
						<tbody>{renderTable(data.orderItems)}</tbody>
					</Table>
				</CardBody>
			</Card>

			{/* Financial & Payment Row */}
			<Row className="mb-3">
				{/* Financial Summary Card */}
				<Col md="6" className="mb-3 mb-md-0">
					<Card className="h-100">
						<CardBody>
							<h5 className="mb-3">
								<DollarSign size={18} className="mr-50" />
								Financial Summary
							</h5>
							<div className="invoice-total-wrapper">
								<div className="invoice-total-item">
									<p className="invoice-total-title">Subtotal:</p>
									<p className="invoice-total-amount">{Number(data.subTotal).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
								</div>
								{data.salesTax && Number(data.salesTax) > 0 && (
									<div className="invoice-total-item">
										<p className="invoice-total-title">Sales Tax:</p>
										<p className="invoice-total-amount">{Number(data.salesTax).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
									</div>
								)}
								{data.logistics && Number(data.logistics) > 0 && (
									<div className="invoice-total-item">
										<p className="invoice-total-title">Logistics:</p>
										<p className="invoice-total-amount">{Number(data.logistics).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
									</div>
								)}
								{data.discount && Number(data.discount) > 0 && (
									<div className="invoice-total-item">
										<p className="invoice-total-title">Discount:</p>
										<p className="invoice-total-amount text-success">
											-{Number(data.discount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
										</p>
									</div>
								)}
								<hr className="my-50" />
								<div className="invoice-total-item">
									<p className="invoice-total-title font-weight-bold">Total:</p>
									<p className="invoice-total-amount font-weight-bold">{Number(data.amount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				{/* Payment Information Card */}
				<Col md="6">
					<Card className="h-100">
						<CardBody>
							<h5 className="mb-3">
								<CreditCard size={18} className="mr-50" />
								Payment Information
							</h5>
							<div className="mb-2">
								<small className="text-muted d-block">Payment Method</small>
								<span className="font-weight-bold">{data.paymentMethod?.toUpperCase()}</span>
							</div>
							{data.paymentGateway && (
								<div className="mb-2">
									<small className="text-muted d-block">Payment Gateway</small>
									<span className="font-weight-bold">{data.paymentGateway}</span>
								</div>
							)}
							{data.paymentStatus && (
								<div className="mb-2">
									<small className="text-muted d-block">Payment Status</small>
									<Badge color={getPaymentStatusColor(data.paymentStatus)}>{formatPaymentStatus(data.paymentStatus)}</Badge>
								</div>
							)}
							<div className="mt-3">
								<small className="text-muted d-block">Initiated By</small>
								<span className="font-weight-bold">
									{data.admin?.firstName} {data.admin?.lastName}
								</span>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Delivery Tracking Card - Only for Online Orders with Tracking */}
			{isOnlineOrder && isDispatched && (
				<Card className="mb-3">
					<CardBody>
						<h5 className="mb-3">
							<Truck size={18} className="mr-50" />
							Delivery Tracking
						</h5>
						<Row>
							<Col md="6">
								<div className="mb-2">
									<small className="text-muted d-block">Delivery Service</small>
									<span className="font-weight-bold text-capitalize">{data.delivery_service || 'N/A'}</span>
								</div>
								{data.driver_name && (
									<div className="mb-2">
										<small className="text-muted d-block">Driver</small>
										<span className="font-weight-bold">{data.driver_name}</span>
									</div>
								)}
								{data.driver_phone && (
									<div className="mb-2">
										<small className="text-muted d-block">Driver Phone</small>
										<a href={`tel:${data.driver_phone}`} className="font-weight-bold">
											{data.driver_phone}
										</a>
									</div>
								)}
							</Col>
							<Col md="6">
								{data.estimated_delivery_time && (
									<div className="mb-2">
										<small className="text-muted d-block">Estimated Delivery</small>
										<span className="font-weight-bold">{moment(data.estimated_delivery_time).format('LLL')}</span>
									</div>
								)}
								{data.actual_delivery_time && (
									<div className="mb-2">
										<small className="text-muted d-block">Actual Delivery</small>
										<span className="font-weight-bold">{moment(data.actual_delivery_time).format('LLL')}</span>
									</div>
								)}
								{data.tracking_url && (
									<div className="mt-3">
										<Button.Ripple
											color="primary"
											size="sm"
											onClick={() => window.open(data.tracking_url, '_blank')}
										>
											<MapPin size={14} className="mr-50" />
											View Live Tracking
										</Button.Ripple>
									</div>
								)}
							</Col>
						</Row>
					</CardBody>
				</Card>
			)}

			{/* Thank You Note */}
			<Card>
				<CardBody>
					<CardText className="mb-0">
						<span className="font-weight-bold">Note: </span>
						<span>Thank you for your patronage, We hope to see you again.</span>
					</CardText>
				</CardBody>
			</Card>
		</div>
	) : null
}

export default PreviewCard
