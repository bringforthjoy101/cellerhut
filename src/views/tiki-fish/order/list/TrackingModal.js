import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Card, CardBody, Badge, Spinner, Collapse, UncontrolledTooltip } from 'reactstrap'
import { Map, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { MapPin, Phone, Truck, RefreshCw, Navigation, Package, Clock, X, User, Mail, Copy, ChevronDown, ChevronUp, Download, Share2, Printer, ExternalLink, DollarSign, CreditCard, ShoppingBag, Star, MessageCircle, Award } from 'react-feather'
import { useDispatch } from 'react-redux'
import { getOrderTracking } from '../store/action'
import moment from 'moment'
import L from 'leaflet'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

// Custom marker icons
const driverIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

const deliveryIcon = new L.Icon({
	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
})

const TrackingModal = ({ isOpen, toggle, order }) => {
	const dispatch = useDispatch()
	const [trackingData, setTrackingData] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [error, setError] = useState(null)
	const [autoRefresh, setAutoRefresh] = useState(true)
	const [showOrderItems, setShowOrderItems] = useState(false)
	const [showMetrics, setShowMetrics] = useState(true)
	const [copiedText, setCopiedText] = useState('')

	// Fetch tracking data
	const fetchTracking = async (showRefreshing = false) => {
		if (!order || !order.id) return

		if (showRefreshing) {
			setIsRefreshing(true)
		} else {
			setIsLoading(true)
		}
		setError(null)

		try {
			const response = await dispatch(getOrderTracking(order.id))
			if (response) {
				setTrackingData(response)
			} else {
				setError('No tracking data available')
			}
		} catch (err) {
			console.error('Tracking fetch error:', err)
			setError('Failed to load tracking information')
		} finally {
			setIsLoading(false)
			setIsRefreshing(false)
		}
	}

	// Initial load
	useEffect(() => {
		if (isOpen && order) {
			fetchTracking()
		}
	}, [isOpen, order])

	// Auto-refresh every 15 seconds
	useEffect(() => {
		if (!isOpen || !autoRefresh || !order) return

		const interval = setInterval(() => {
			fetchTracking(true)
		}, 15000)

		return () => clearInterval(interval)
	}, [isOpen, autoRefresh, order])

	const handleManualRefresh = () => {
		fetchTracking(true)
	}

	const formatStatusText = (status) => {
		if (!status) return 'Unknown'
		return status
			.replace('order-', '')
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	}

	const getStatusColor = (status) => {
		const statusColors = {
			'order-completed': 'success',
			'order-out-for-delivery': 'primary',
			'order-processing': 'warning',
			'order-pending': 'info',
			'order-cancelled': 'danger',
		}
		return statusColors[status] || 'secondary'
	}

	const getTimelineIcon = (eventType) => {
		const icons = {
			request_received: '📦',
			agent_assigned: '👤',
			agent_started: '🚗',
			agent_arrived: '📍',
			successful: '✅',
			delivered: '✅',
			picked_up: '📦',
			in_transit: '🚚',
		}
		return icons[eventType?.toLowerCase()] || '📌'
	}

	const copyToClipboard = (text, label) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedText(label)
			setTimeout(() => setCopiedText(''), 2000)
		})
	}

	const formatCurrency = (amount) => {
		return `R ${parseFloat(amount || 0).toFixed(2)}`
	}

	// Loading state
	if (isLoading) {
		return (
			<Modal isOpen={isOpen} toggle={toggle} size="xl" className="modal-fullscreen">
				<ModalHeader toggle={toggle}>Track Order #{order?.orderNumber}</ModalHeader>
				<ModalBody>
					<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
						<div className="text-center">
							<Spinner color="primary" size="lg" />
							<p className="mt-3">Loading tracking information...</p>
						</div>
					</div>
				</ModalBody>
			</Modal>
		)
	}

	// Error state
	if (error || !trackingData) {
		return (
			<Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
				<ModalHeader toggle={toggle}>Track Order #{order?.orderNumber}</ModalHeader>
				<ModalBody>
					<div className="text-center py-5">
						<MapPin size={48} className="text-muted mb-3" />
						<h5 className="text-muted">{error || 'No Tracking Data Available'}</h5>
						<p className="text-muted">
							{error
								? 'Please try again later or contact support if the problem persists.'
								: 'Tracking information will be available once the order is dispatched.'}
						</p>
						<Button color="primary" onClick={toggle} className="mt-3">
							Close
						</Button>
					</div>
				</ModalBody>
			</Modal>
		)
	}

	// Extract data from API response (handle both old and new formats)
	const rawData = trackingData
	const tookanData = rawData?.tookan_webhook_data || {}

	// Driver information
	const driver = {
		name: rawData?.driver_name || tookanData?.fleet_name,
		phone: rawData?.driver_phone || tookanData?.fleet_phone,
		photo: rawData?.driver_photo || tookanData?.fleet_image,
		vehicleNumber: rawData?.driver_vehicle_number || tookanData?.license,
		vehicleType: tookanData?.fleet_vehicle_type,
		vehicleColor: tookanData?.fleet_vehicle_color,
		vehicleDescription: tookanData?.fleet_vehicle_description || tookanData?.transport_desc,
		email: rawData?.driver_email || tookanData?.fleet_email,
		rating: tookanData?.fleet_rating,
		location: tookanData?.fleet_latitude && tookanData?.fleet_longitude
			? [parseFloat(tookanData.fleet_latitude), parseFloat(tookanData.fleet_longitude)]
			: rawData?.driver?.location
	}

	// Delivery information
	const delivery = {
		address: rawData?.address ?
			`${rawData.address.street || ''}${rawData.address.street && rawData.address.city ? ', ' : ''}${rawData.address.city || ''}, ${rawData.address.province || ''} ${rawData.address.postalCode || ''}`.trim()
			: tookanData?.job_address,
		latitude: rawData?.delivery_latitude || tookanData?.job_latitude,
		longitude: rawData?.delivery_longitude || tookanData?.job_longitude,
		estimatedTime: rawData?.estimated_delivery_time || tookanData?.job_delivery_datetime,
		actualTime: rawData?.actual_delivery_time || tookanData?.completed_datetime,
		notes: rawData?.delivery_notes || tookanData?.job_description,
		proofOfDelivery: {
			photo: rawData?.delivery_photo_url,
			signature: rawData?.delivery_signature_url
		},
		location: rawData?.delivery_latitude && rawData?.delivery_longitude
			? [parseFloat(rawData.delivery_latitude), parseFloat(rawData.delivery_longitude)]
			: rawData?.delivery?.location
	}

	// Order and customer information
	const orderInfo = {
		orderNumber: rawData?.orderNumber || order?.orderNumber,
		amount: rawData?.amount,
		subTotal: rawData?.subTotal,
		salesTax: rawData?.salesTax,
		logistics: rawData?.logistics,
		discount: rawData?.discount,
		paymentGateway: rawData?.paymentGateway,
		paymentMethod: rawData?.paymentMethod,
		status: rawData?.status,
		paymentStatus: rawData?.paymentStatus,
		customer: rawData?.customer,
		orderItems: rawData?.orderItems || []
	}

	// Performance metrics
	const metrics = {
		totalDistance: tookanData?.total_distance,
		distanceTravelled: tookanData?.total_distance_travelled,
		timeSpent: tookanData?.total_time_spent_at_task_till_completion,
		jobState: tookanData?.job_state || tookanData?.task_state,
		customerRating: tookanData?.customer_rating
	}

	// Timeline/Timestamps
	const timestamps = {
		created: rawData?.createdAt || tookanData?.creation_datetime,
		acknowledged: rawData?.acknowledged_datetime || tookanData?.acknowledged_datetime,
		started: tookanData?.started_datetime,
		arrived: rawData?.arrived_datetime || tookanData?.arrived_datetime,
		completed: rawData?.actual_delivery_time || tookanData?.completed_datetime
	}

	// Comments and feedback
	const feedback = {
		driverComment: tookanData?.driver_comment,
		customerComment: tookanData?.customer_comment
	}

	// Customer data from Tookan webhook (different from order customer)
	const tookanCustomer = {
		email: tookanData?.customer_email,
		phone: tookanData?.customer_phone,
		username: tookanData?.customer_username
	}

	// Custom fields from Tookan
	const customFields = tookanData?.custom_fields || []

	const orderStatus = rawData?.status || rawData?.orderStatus
	const trackingUrl = rawData?.tracking_url || rawData?.trackingUrl || tookanData?.tracking_link
	const fullTrackingUrl = tookanData?.full_tracking_link
	const timeline = rawData?.timeline || [] // For backward compatibility with old API format

	// Validate location data - ensure arrays have valid numeric values
	const isValidLocation = (loc) => {
		return Array.isArray(loc) &&
			loc.length === 2 &&
			typeof loc[0] === 'number' &&
			typeof loc[1] === 'number' &&
			!isNaN(loc[0]) &&
			!isNaN(loc[1])
	}

	const driverLocation = isValidLocation(driver?.location) ? driver.location : null
	const deliveryLocation = isValidLocation(delivery?.location) ? delivery.location : null
	const mapCenter = driverLocation || deliveryLocation || [-33.9249, 18.4241]

	// Create route path if both locations exist
	const routePath = driverLocation && deliveryLocation ? [driverLocation, deliveryLocation] : []

	// Calculate distance if both locations exist
	let calculatedDistance = null
	if (driverLocation && deliveryLocation) {
		const R = 6371 // Earth's radius in km
		const dLat = (deliveryLocation[0] - driverLocation[0]) * Math.PI / 180
		const dLon = (deliveryLocation[1] - driverLocation[1]) * Math.PI / 180
		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(driverLocation[0] * Math.PI / 180) * Math.cos(deliveryLocation[0] * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
		calculatedDistance = (R * c).toFixed(2)
	}

	return (
		<Modal isOpen={isOpen} toggle={toggle} size="xl" className="modal-fullscreen">
			<ModalHeader toggle={toggle}>
				<div className="d-flex align-items-center justify-content-between w-100">
					<div className="d-flex align-items-center">
						<MapPin size={20} className="mr-2" />
						<span>Track Order #{order?.orderNumber}</span>
					</div>
					<div className="d-flex align-items-center gap-2">
						<Button
							color="link"
							size="sm"
							onClick={handleManualRefresh}
							disabled={isRefreshing}
							className="d-flex align-items-center"
						>
							<RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'spin' : ''}`} />
							{isRefreshing ? 'Refreshing...' : 'Refresh'}
						</Button>
					</div>
				</div>
			</ModalHeader>

			<ModalBody>
				<Row>
					{/* Map Section */}
					<Col lg="8" className="mb-3">
						<Card>
							<CardBody className="p-0">
								<div style={{ height: '500px', width: '100%' }}>
									{(driverLocation || deliveryLocation) ? (
										<Map
											center={mapCenter}
											zoom={13}
											className="leaflet-map"
											style={{ height: '100%', width: '100%' }}
											key={`${driverLocation?.[0]}-${deliveryLocation?.[0]}`}
										>
										<TileLayer
											attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
											url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
										/>

										{/* Delivery Location Marker */}
										{deliveryLocation && (
											<Marker position={deliveryLocation} icon={deliveryIcon}>
												<Popup>
													<div>
														<strong>Delivery Location</strong>
														<br />
														{delivery?.address || 'Delivery destination'}
													</div>
												</Popup>
											</Marker>
										)}

										{/* Driver Location Marker */}
										{driverLocation && orderStatus !== 'order-completed' && (
											<Marker position={driverLocation} icon={driverIcon}>
												<Popup>
													<div>
														<strong>{driver?.name || 'Driver'}</strong>
														<br />
														Current Location
														{driver?.vehicleNumber && (
															<>
																<br />
																Vehicle: {driver.vehicleNumber}
															</>
														)}
													</div>
												</Popup>
											</Marker>
										)}

										{/* Route Line */}
										{routePath.length > 0 && <Polyline positions={routePath} color="#3B82F6" weight={4} opacity={0.7} />}
									</Map>
									) : (
										<div className="d-flex align-items-center justify-content-center h-100 bg-light">
											<div className="text-center p-4">
												<MapPin size={48} className="text-muted mb-3" />
												<h6 className="text-muted">Location data not yet available</h6>
												<p className="text-muted small">Map will appear once tracking begins</p>
											</div>
										</div>
									)}
								</div>
							</CardBody>
						</Card>

						{/* Proof of Delivery & Feedback */}
						{orderStatus === 'order-completed' && (
							<>
								{/* Proof of Delivery */}
								{(delivery?.proofOfDelivery?.photo || delivery?.proofOfDelivery?.signature) && (
									<Card className="mt-3">
										<CardBody>
											<div className="d-flex justify-content-between align-items-center mb-3">
												<h5 className="mb-0">Proof of Delivery</h5>
												{delivery.actualTime && (
													<Badge color="success" pill>
														{moment(delivery.actualTime).format('MMM DD, h:mm A')}
													</Badge>
												)}
											</div>
											<Row>
												{delivery.proofOfDelivery.photo && (
													<Col md="6" className="mb-3">
														<div>
															<div className="d-flex justify-content-between align-items-center mb-2">
																<p className="text-muted mb-0">Delivery Photo</p>
																<Button
																	color="link"
																	size="sm"
																	className="p-0"
																	onClick={() => window.open(delivery.proofOfDelivery.photo, '_blank')}
																	id="download-photo-btn"
																>
																	<Download size={14} />
																</Button>
																<UncontrolledTooltip placement="top" target="download-photo-btn">
																	Download Photo
																</UncontrolledTooltip>
															</div>
															<img
																src={delivery.proofOfDelivery.photo}
																alt="Delivery proof"
																className="img-fluid rounded border"
																style={{ cursor: 'pointer' }}
																onClick={() => window.open(delivery.proofOfDelivery.photo, '_blank')}
															/>
														</div>
													</Col>
												)}
												{delivery.proofOfDelivery.signature && (
													<Col md="6" className="mb-3">
														<div>
															<div className="d-flex justify-content-between align-items-center mb-2">
																<p className="text-muted mb-0">Signature</p>
																<Button
																	color="link"
																	size="sm"
																	className="p-0"
																	onClick={() => window.open(delivery.proofOfDelivery.signature, '_blank')}
																	id="download-signature-btn"
																>
																	<Download size={14} />
																</Button>
																<UncontrolledTooltip placement="top" target="download-signature-btn">
																	Download Signature
																</UncontrolledTooltip>
															</div>
															<img
																src={delivery.proofOfDelivery.signature}
																alt="Signature"
																className="img-fluid rounded border bg-white"
																style={{ cursor: 'pointer' }}
																onClick={() => window.open(delivery.proofOfDelivery.signature, '_blank')}
															/>
														</div>
													</Col>
												)}
											</Row>
										</CardBody>
									</Card>
								)}

								{/* Feedback & Communication */}
								{(feedback.driverComment || feedback.customerComment || metrics.customerRating) && (
									<Card className="mt-3">
										<CardBody>
											<h5 className="mb-3 d-flex align-items-center">
												<MessageCircle size={18} className="mr-2" />
												Feedback & Communication
											</h5>

											{/* Customer Rating */}
											{metrics.customerRating && (
												<div className="mb-3 p-3 bg-warning-light rounded">
													<div className="d-flex justify-content-between align-items-center">
														<small className="text-muted">Customer Rating</small>
														<div className="d-flex align-items-center">
															{[...Array(5)].map((_, i) => (
																<Star
																	key={i}
																	size={16}
																	className={i < metrics.customerRating ? 'text-warning' : 'text-muted'}
																	fill={i < metrics.customerRating ? 'currentColor' : 'none'}
																/>
															))}
															<span className="ml-2 font-weight-bold">{metrics.customerRating}/5</span>
														</div>
													</div>
												</div>
											)}

											{/* Driver Comment */}
											{feedback.driverComment && (
												<div className="mb-3 p-3 bg-light rounded">
													<div className="d-flex align-items-start">
														<Truck size={16} className="mr-2 mt-1 text-primary" />
														<div className="flex-grow-1">
															<small className="text-muted d-block mb-1">Driver's Note</small>
															<div className="font-size-14">{feedback.driverComment}</div>
														</div>
													</div>
												</div>
											)}

											{/* Customer Comment */}
											{feedback.customerComment && (
												<div className="p-3 bg-light rounded">
													<div className="d-flex align-items-start">
														<User size={16} className="mr-2 mt-1 text-info" />
														<div className="flex-grow-1">
															<small className="text-muted d-block mb-1">Customer's Feedback</small>
															<div className="font-size-14">{feedback.customerComment}</div>
														</div>
													</div>
												</div>
											)}
										</CardBody>
									</Card>
								)}
							</>
						)}
					</Col>

					{/* Info Sidebar */}
					<Col lg="4">
						{/* Order Summary Card */}
						<Card className="mb-3">
							<CardBody>
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h6 className="mb-0">Order Summary</h6>
									<Badge color={getStatusColor(orderStatus)} pill>
										{formatStatusText(orderStatus)}
									</Badge>
								</div>

								{/* Order Number */}
								<div className="mb-3 p-2 bg-light rounded">
									<div className="d-flex justify-content-between align-items-center">
										<div>
											<small className="text-muted d-block">Order Number</small>
											<strong className="font-size-14">{orderInfo.orderNumber}</strong>
										</div>
										<Button
											color="link"
											size="sm"
											className="p-0"
											onClick={() => copyToClipboard(orderInfo.orderNumber, 'order')}
											id="copy-order-btn"
										>
											<Copy size={14} />
										</Button>
										<UncontrolledTooltip placement="top" target="copy-order-btn">
											{copiedText === 'order' ? 'Copied!' : 'Copy order number'}
										</UncontrolledTooltip>
									</div>
								</div>

								{/* Order Amount */}
								<div className="mb-3">
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted">Subtotal</span>
										<span>{formatCurrency(orderInfo.subTotal)}</span>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted">Tax</span>
										<span>{formatCurrency(orderInfo.salesTax)}</span>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted">Delivery Fee</span>
										<span>{formatCurrency(orderInfo.logistics)}</span>
									</div>
									{parseFloat(orderInfo.discount || 0) > 0 && (
										<div className="d-flex justify-content-between mb-2 text-success">
											<span>Discount</span>
											<span>-{formatCurrency(orderInfo.discount)}</span>
										</div>
									)}
									<hr />
									<div className="d-flex justify-content-between">
										<strong>Total Amount</strong>
										<strong className="text-primary">{formatCurrency(orderInfo.amount)}</strong>
									</div>
								</div>

								{/* Payment Method */}
								<div className="d-flex align-items-center mb-3">
									<CreditCard size={16} className="mr-2 text-muted" />
									<div className="flex-grow-1">
										<small className="text-muted d-block">Payment Method</small>
										<span className="font-size-14">{orderInfo.paymentGateway || 'N/A'}</span>
									</div>
									<Badge color={orderInfo.paymentStatus === 'payment-success' ? 'success' : 'warning'} pill>
										{formatStatusText(orderInfo.paymentStatus)}
									</Badge>
								</div>

								{/* Customer Info */}
								{orderInfo.customer && (
									<div className="border-top pt-3">
										<small className="text-muted d-block mb-2">Customer Information</small>
										<div className="d-flex align-items-center mb-2">
											<User size={14} className="mr-2 text-muted" />
											<span className="font-size-14">{orderInfo.customer.name}</span>
										</div>
										{orderInfo.customer.phone && (
											<div className="d-flex align-items-center mb-2">
												<Phone size={14} className="mr-2 text-muted" />
												<a href={`tel:${orderInfo.customer.phone}`} className="font-size-14">
													{orderInfo.customer.phone}
												</a>
											</div>
										)}
										{orderInfo.customer.email && (
											<div className="d-flex align-items-center">
												<Mail size={14} className="mr-2 text-muted" />
												<a href={`mailto:${orderInfo.customer.email}`} className="font-size-14 text-truncate">
													{orderInfo.customer.email}
												</a>
											</div>
										)}
									</div>
								)}

								{/* Tookan Customer Data (if different from order customer) */}
								{(tookanCustomer.email || tookanCustomer.phone || tookanCustomer.username) && (
									<div className="border-top pt-3 mt-2">
										<small className="text-muted d-block mb-2">Delivery Contact (Tookan)</small>
										{tookanCustomer.username && (
											<div className="d-flex align-items-center mb-2">
												<User size={14} className="mr-2 text-muted" />
												<span className="font-size-14">{tookanCustomer.username}</span>
											</div>
										)}
										{tookanCustomer.phone && (
											<div className="d-flex align-items-center mb-2">
												<Phone size={14} className="mr-2 text-muted" />
												<a href={`tel:${tookanCustomer.phone}`} className="font-size-14">
													{tookanCustomer.phone}
												</a>
											</div>
										)}
										{tookanCustomer.email && (
											<div className="d-flex align-items-center">
												<Mail size={14} className="mr-2 text-muted" />
												<a href={`mailto:${tookanCustomer.email}`} className="font-size-14 text-truncate">
													{tookanCustomer.email}
												</a>
											</div>
										)}
									</div>
								)}
							</CardBody>
						</Card>

						{/* Order Items Card */}
						{orderInfo.orderItems && orderInfo.orderItems.length > 0 && (
							<Card className="mb-3">
								<CardBody>
									<div
										className="d-flex justify-content-between align-items-center mb-2"
										style={{ cursor: 'pointer' }}
										onClick={() => setShowOrderItems(!showOrderItems)}
									>
										<div className="d-flex align-items-center">
											<ShoppingBag size={16} className="mr-2" />
											<h6 className="mb-0">Order Items</h6>
											<Badge color="primary" pill className="ml-2">
												{orderInfo.orderItems.length}
											</Badge>
										</div>
										{showOrderItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
									</div>
									<Collapse isOpen={showOrderItems}>
										<div style={{ maxHeight: '300px', overflowY: 'auto' }}>
											{orderInfo.orderItems.map((item, index) => (
												<div key={item.id || index} className="border-bottom py-2">
													<div className="d-flex align-items-start">
														{item.product?.image && (
															<img
																src={item.product.image}
																alt={item.product?.name}
																className="rounded mr-2"
																style={{ width: '50px', height: '50px', objectFit: 'cover' }}
															/>
														)}
														<div className="flex-grow-1">
															<div className="font-size-14 font-weight-bold">{item.product?.name}</div>
															<div className="d-flex justify-content-between align-items-center">
																<small className="text-muted">
																	Qty: {item.quantity} × {formatCurrency(item.price)}
																</small>
																<strong className="text-primary">
																	{formatCurrency(parseFloat(item.quantity) * parseFloat(item.price))}
																</strong>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</Collapse>
								</CardBody>
							</Card>
						)}

						{/* Driver Info */}
						{driver && driver.name && (
							<Card className="mb-3">
								<CardBody>
									<h6 className="mb-3">Driver Information</h6>
									<div className="d-flex align-items-center mb-3">
										<div
											className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white mr-3"
											style={{ width: '50px', height: '50px', fontSize: '20px' }}
										>
											{driver.photo ? (
												<img src={driver.photo} alt={driver.name} className="rounded-circle" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
											) : (
												<span>{driver.name?.charAt(0) || 'D'}</span>
											)}
										</div>
										<div className="flex-grow-1">
											<div className="d-flex align-items-center">
												<h6 className="mb-0 mr-2">{driver.name || 'Driver'}</h6>
												{driver.rating && (
													<div className="d-flex align-items-center">
														<Star size={12} className="text-warning mr-1" />
														<small className="text-warning font-weight-bold">{driver.rating}</small>
													</div>
												)}
											</div>
											{(driver.vehicleNumber || driver.vehicleDescription || driver.vehicleType) && (
												<div className="d-flex align-items-center">
													<Truck size={12} className="mr-1 text-muted" />
													<small className="text-muted">
														{driver.vehicleType && `${driver.vehicleType}${(driver.vehicleDescription || driver.vehicleNumber || driver.vehicleColor) ? ' - ' : ''}`}
														{driver.vehicleDescription || ''}
														{driver.vehicleNumber && `${driver.vehicleDescription ? ' - ' : ''}${driver.vehicleNumber}`}
														{driver.vehicleColor && ` (${driver.vehicleColor})`}
													</small>
												</div>
											)}
										</div>
									</div>

									{/* Contact Buttons */}
									<Row className="mb-3">
										{driver.phone && (
											<Col xs="6">
												<Button
													color="success"
													block
													size="sm"
													onClick={() => (window.location.href = `tel:${driver.phone}`)}
													className="d-flex align-items-center justify-content-center"
												>
													<Phone size={14} className="mr-1" />
													Call
												</Button>
											</Col>
										)}
										{driver.email && (
											<Col xs="6">
												<Button
													color="info"
													block
													size="sm"
													onClick={() => (window.location.href = `mailto:${driver.email}`)}
													className="d-flex align-items-center justify-content-center"
												>
													<Mail size={14} className="mr-1" />
													Email
												</Button>
											</Col>
										)}
									</Row>

									{/* Driver Location Coordinates */}
									{driverLocation && (
										<div className="mb-2 p-2 bg-light rounded">
											<div className="d-flex align-items-center justify-content-between">
												<div>
													<small className="text-muted d-block">Current Location</small>
													<small className="font-size-12">
														{driverLocation[0].toFixed(5)}, {driverLocation[1].toFixed(5)}
													</small>
												</div>
												<Button
													color="link"
													size="sm"
													className="p-0"
													onClick={() => window.open(`https://www.google.com/maps?q=${driverLocation[0]},${driverLocation[1]}`, '_blank')}
												>
													<ExternalLink size={14} />
												</Button>
											</div>
										</div>
									)}

									{/* ETA & Distance */}
									{(delivery?.estimatedTime || calculatedDistance) && (
										<div className="mt-2 p-2 bg-primary-light rounded">
											{delivery?.estimatedTime && (
												<div className="d-flex align-items-center mb-1">
													<Clock size={14} className="mr-2 text-primary" />
													<small className="font-weight-bold">ETA: {moment(delivery.estimatedTime).format('h:mm A')}</small>
												</div>
											)}
											{calculatedDistance && (
												<div className="d-flex align-items-center">
													<MapPin size={14} className="mr-2 text-primary" />
													<small className="font-weight-bold">Distance: {calculatedDistance} km</small>
												</div>
											)}
										</div>
									)}
								</CardBody>
							</Card>
						)}

						{/* Delivery Details Card */}
						<Card className="mb-3">
							<CardBody>
								<h6 className="mb-3 d-flex align-items-center">
									<MapPin size={16} className="mr-2" />
									Delivery Details
								</h6>

								{/* Delivery Address */}
								{delivery.address && (
									<div className="mb-3 p-2 bg-light rounded">
										<small className="text-muted d-block mb-1">Delivery Address</small>
										<div className="d-flex justify-content-between align-items-start">
											<div className="flex-grow-1">
												<div className="font-size-14">{delivery.address}</div>
												{(delivery.latitude && delivery.longitude) && (
													<small className="text-muted">
														{parseFloat(delivery.latitude).toFixed(5)}, {parseFloat(delivery.longitude).toFixed(5)}
													</small>
												)}
											</div>
											{(delivery.latitude && delivery.longitude) && (
												<Button
													color="link"
													size="sm"
													className="p-0 ml-2"
													onClick={() => window.open(`https://www.google.com/maps?q=${delivery.latitude},${delivery.longitude}`, '_blank')}
												>
													<ExternalLink size={14} />
												</Button>
											)}
										</div>
									</div>
								)}

								{/* Delivery Notes */}
								{delivery.notes && (
									<div className="mb-2">
										<small className="text-muted d-block mb-1">Delivery Notes</small>
										<div className="font-size-14">{delivery.notes}</div>
									</div>
								)}

								{/* Delivery Times */}
								{(delivery.estimatedTime || delivery.actualTime) && (
									<div className="border-top pt-2 mt-2">
										{delivery.estimatedTime && !delivery.actualTime && (
											<div className="d-flex justify-content-between mb-1">
												<small className="text-muted">Estimated Delivery</small>
												<small className="font-weight-bold">{moment(delivery.estimatedTime).format('MMM DD, h:mm A')}</small>
											</div>
										)}
										{delivery.actualTime && (
											<div className="d-flex justify-content-between">
												<small className="text-muted">Delivered At</small>
												<small className="font-weight-bold text-success">{moment(delivery.actualTime).format('MMM DD, h:mm A')}</small>
											</div>
										)}
									</div>
								)}
							</CardBody>
						</Card>

						{/* Custom Fields from Tookan */}
						{customFields && customFields.length > 0 && (
							<Card className="mb-3">
								<CardBody>
									<h6 className="mb-3 d-flex align-items-center">
										<Package size={16} className="mr-2" />
										Additional Information
									</h6>
									<div>
										{customFields.map((field, index) => (
											<div key={index} className="mb-2 p-2 bg-light rounded">
												<div className="d-flex justify-content-between align-items-start">
													<div className="flex-grow-1">
														<small className="text-muted d-block mb-1">
															{field.label || `Field ${index + 1}`}
														</small>
														<div className="font-size-14">
															{field.data || field.value || 'N/A'}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardBody>
							</Card>
						)}

						{/* Performance Metrics Card */}
						{(metrics.totalDistance || metrics.timeSpent || metrics.distanceTravelled) && (
							<Card className="mb-3">
								<CardBody>
									<div
										className="d-flex justify-content-between align-items-center mb-2"
										style={{ cursor: 'pointer' }}
										onClick={() => setShowMetrics(!showMetrics)}
									>
										<h6 className="mb-0 d-flex align-items-center">
											<Award size={16} className="mr-2" />
											Delivery Metrics
										</h6>
										{showMetrics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
									</div>
									<Collapse isOpen={showMetrics}>
										<Row className="text-center">
											{metrics.totalDistance && (
												<Col xs="6" className="mb-3">
													<div className="p-2 bg-light rounded">
														<div className="text-primary font-weight-bold" style={{ fontSize: '20px' }}>
															{metrics.totalDistance}
														</div>
														<small className="text-muted">Total Distance</small>
													</div>
												</Col>
											)}
											{metrics.distanceTravelled && (
												<Col xs="6" className="mb-3">
													<div className="p-2 bg-light rounded">
														<div className="text-primary font-weight-bold" style={{ fontSize: '20px' }}>
															{(parseFloat(metrics.distanceTravelled) / 1000).toFixed(2)} km
														</div>
														<small className="text-muted">Travelled</small>
													</div>
												</Col>
											)}
											{metrics.timeSpent && (
												<Col xs="12" className="mb-2">
													<div className="p-2 bg-success-light rounded">
														<div className="text-success font-weight-bold" style={{ fontSize: '16px' }}>
															{metrics.timeSpent}
														</div>
														<small className="text-muted">Time Spent</small>
													</div>
												</Col>
											)}
											{metrics.jobState && (
												<Col xs="12">
													<div className="d-flex justify-content-between align-items-center">
														<small className="text-muted">Job Status</small>
														<Badge color={metrics.jobState === 'Successful' ? 'success' : 'primary'} pill>
															{metrics.jobState}
														</Badge>
													</div>
												</Col>
											)}
										</Row>
									</Collapse>
								</CardBody>
							</Card>
						)}

						{/* Timeline */}
						{(timestamps.created || timestamps.acknowledged || timestamps.started || timestamps.arrived || timestamps.completed) && (
							<Card className="mb-3">
								<CardBody>
									<h6 className="mb-3">Delivery Timeline</h6>
									<div className="timeline">
										{timestamps.completed && (
											<div className="timeline-item mb-3">
												<div className="d-flex align-items-start">
													<div className="timeline-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}>
														✅
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>Completed</h6>
																<small className="text-muted">Order delivered successfully</small>
															</div>
															<small className="text-muted">{moment(timestamps.completed).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(timestamps.completed).format('MMM DD, YYYY')}</small>
													</div>
												</div>
												<Badge color="success" pill className="mt-1 ml-5">Current</Badge>
											</div>
										)}
										{timestamps.arrived && (
											<div className="timeline-item mb-3">
												<div className="d-flex align-items-start">
													<div className="timeline-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}>
														📍
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>Arrived</h6>
																<small className="text-muted">Driver arrived at destination</small>
															</div>
															<small className="text-muted">{moment(timestamps.arrived).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(timestamps.arrived).format('MMM DD, YYYY')}</small>
													</div>
												</div>
												{!timestamps.completed && <Badge color="primary" pill className="mt-1 ml-5">Current</Badge>}
											</div>
										)}
										{timestamps.started && (
											<div className="timeline-item mb-3">
												<div className="d-flex align-items-start">
													<div className="timeline-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}>
														🚗
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>Started</h6>
																<small className="text-muted">Driver started the delivery</small>
															</div>
															<small className="text-muted">{moment(timestamps.started).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(timestamps.started).format('MMM DD, YYYY')}</small>
													</div>
												</div>
												{!timestamps.arrived && !timestamps.completed && <Badge color="primary" pill className="mt-1 ml-5">Current</Badge>}
											</div>
										)}
										{timestamps.acknowledged && (
											<div className="timeline-item mb-3">
												<div className="d-flex align-items-start">
													<div className="timeline-icon bg-info text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}>
														👤
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>Acknowledged</h6>
																<small className="text-muted">Driver acknowledged the order</small>
															</div>
															<small className="text-muted">{moment(timestamps.acknowledged).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(timestamps.acknowledged).format('MMM DD, YYYY')}</small>
													</div>
												</div>
												{!timestamps.started && !timestamps.arrived && !timestamps.completed && <Badge color="info" pill className="mt-1 ml-5">Current</Badge>}
											</div>
										)}
										{timestamps.created && (
											<div className="timeline-item">
												<div className="d-flex align-items-start">
													<div className="timeline-icon bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}>
														📦
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>Created</h6>
																<small className="text-muted">Order created and dispatched</small>
															</div>
															<small className="text-muted">{moment(timestamps.created).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(timestamps.created).format('MMM DD, YYYY')}</small>
													</div>
												</div>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						)}

						{/* Old Timeline - fallback for old data format */}
						{timeline && timeline.length > 0 && (
							<Card>
								<CardBody>
									<h6 className="mb-3">Delivery Timeline</h6>
									<div className="timeline">
										{timeline.map((event, index) => (
											<div key={event.id || index} className="timeline-item mb-3">
												<div className="d-flex align-items-start">
													<div
														className="timeline-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mr-2"
														style={{ width: '32px', height: '32px', fontSize: '16px' }}
													>
														{getTimelineIcon(event.eventType)}
													</div>
													<div className="flex-grow-1">
														<div className="d-flex justify-content-between align-items-start">
															<div>
																<h6 className="mb-0" style={{ fontSize: '14px' }}>
																	{formatStatusText(event.status)}
																</h6>
																{event.notes && <small className="text-muted">{event.notes}</small>}
															</div>
															<small className="text-muted">{moment(event.timestamp).format('HH:mm')}</small>
														</div>
														<small className="text-muted">{moment(event.timestamp).format('MMM DD')}</small>
													</div>
												</div>
												{index === 0 && (
													<Badge color="success" pill className="mt-1 ml-5">
														Current
													</Badge>
												)}
											</div>
										))}
									</div>
								</CardBody>
							</Card>
						)}

						{/* External Tracking Link */}
						{trackingUrl && (
							<Card className="mt-3">
								<CardBody>
									<Button
										color="primary"
										block
										tag="a"
										href={trackingUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="d-flex align-items-center justify-content-center"
									>
										<Navigation size={14} className="mr-1" />
										Open in Tookan App
									</Button>
								</CardBody>
							</Card>
						)}
					</Col>
				</Row>
			</ModalBody>

			{/* Modal Footer - Advanced Options */}
			<ModalFooter className="d-flex justify-content-between">
				<div className="d-flex gap-2">
					{/* Share Tracking Link */}
					{(trackingUrl || fullTrackingUrl) && (
						<>
							<Button
								color="secondary"
								size="sm"
								onClick={() => copyToClipboard(trackingUrl || fullTrackingUrl, 'tracking')}
								className="d-flex align-items-center"
								id="share-tracking-btn"
							>
								<Share2 size={14} className="mr-1" />
								{copiedText === 'tracking' ? 'Copied!' : 'Share Link'}
							</Button>
							<UncontrolledTooltip placement="top" target="share-tracking-btn">
								Copy tracking link to clipboard
							</UncontrolledTooltip>
						</>
					)}

					{/* View Full Tracking */}
					{fullTrackingUrl && (
						<Button
							color="info"
							size="sm"
							tag="a"
							href={fullTrackingUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="d-flex align-items-center"
						>
							<ExternalLink size={14} className="mr-1" />
							Full Tracking
						</Button>
					)}
				</div>

				<div className="d-flex gap-2">
					{/* Print Receipt */}
					<Button
						color="secondary"
						size="sm"
						onClick={() => window.print()}
						className="d-flex align-items-center"
					>
						<Printer size={14} className="mr-1" />
						Print
					</Button>

					{/* Close Button */}
					<Button color="primary" size="sm" onClick={toggle}>
						Close
					</Button>
				</div>
			</ModalFooter>
		</Modal>
	)
}

export default TrackingModal
