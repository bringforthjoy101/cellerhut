// ** React Imports
import { Card, CardBody, Badge, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Eye, MoreVertical, MapPin, Navigation } from 'react-feather'
import moment from 'moment'
import { useHistory } from 'react-router-dom'

const OrderCard = ({ order, onDispatch, onTrack }) => {
	const history = useHistory()

	// ** Status Badge Color
	const getStatusBadgeColor = (status) => {
		switch (status) {
			case 'order-completed':
				return 'success'
			case 'order-processing':
			case 'processing':
				return 'info'
			case 'order-pending':
				return 'warning'
			case 'order-cancelled':
			case 'order-refunded':
				return 'danger'
			case 'order-at-local-facility':
			case 'order-out-for-delivery':
				return 'primary'
			case 'held':
				return 'secondary'
			default:
				return 'light'
		}
	}

	// ** Format Status Text
	const formatStatus = (status) => {
		if (!status) return 'Unknown'
		return status.replace('order-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
	}

	// ** Format Payment Method
	const formatPaymentMethod = (method) => {
		if (!method) return 'N/A'
		const methodMap = {
			cash: 'Cash',
			mpesa: 'M-Pesa',
			card: 'Card',
			'bank-transfer': 'Bank Transfer',
			pos: 'POS',
			dynamic: 'Dynamic',
			cod: 'COD'
		}
		return methodMap[method] || method.toUpperCase()
	}

	// ** Handle View Details
	const handleViewDetails = () => {
		history.push(`/order/preview/${order.id}`)
	}

	// ** Can dispatch check - only for online orders
	const canDispatch = order.location !== 'Shop' && (order.status === 'order-pending' || order.status === 'order-processing' || order.status === 'processing')
	const canTrack = order.location !== 'Shop' && order.tracking_enabled && order.tookan_job_id

	return (
		<Card className="order-card mb-1">
			<CardBody className="p-1">
				<div className="d-flex justify-content-between align-items-start mb-75">
					<div>
						<h6 className="mb-25">
							#{order.orderNumber}
						</h6>
						<small className="text-muted">
							{moment(order.createdAt).format('MMM DD, YYYY h:mm A')}
						</small>
					</div>
					<div className="d-flex align-items-center">
						<Badge color={getStatusBadgeColor(order.status)} pill className="mr-50">
							{formatStatus(order.status)}
						</Badge>
						<UncontrolledDropdown>
							<DropdownToggle tag="div" className="cursor-pointer">
								<MoreVertical size={16} />
							</DropdownToggle>
							<DropdownMenu right>
								<DropdownItem onClick={handleViewDetails}>
									<Eye size={14} className="mr-50" />
									<span>View Details</span>
								</DropdownItem>
								{canDispatch && (
									<DropdownItem onClick={() => onDispatch(order)}>
										<Navigation size={14} className="mr-50" />
										<span>Dispatch</span>
									</DropdownItem>
								)}
								{canTrack && (
									<DropdownItem onClick={() => onTrack(order)}>
										<MapPin size={14} className="mr-50" />
										<span>Track</span>
									</DropdownItem>
								)}
							</DropdownMenu>
						</UncontrolledDropdown>
					</div>
				</div>

				<div className="mb-75">
					<div className="d-flex justify-content-between align-items-center mb-25">
						<span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>Customer:</span>
						<span className="text-muted" style={{ fontSize: '0.85rem' }}>
							{order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.name : 'N/A'}
						</span>
					</div>
					{order.customer?.phone && (
						<div className="d-flex justify-content-between align-items-center mb-25">
							<span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>Phone:</span>
							<span className="text-muted" style={{ fontSize: '0.85rem' }}>{order.customer.phone}</span>
						</div>
					)}
					<div className="d-flex justify-content-between align-items-center mb-25">
						<span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>Payment:</span>
						<span className="text-muted" style={{ fontSize: '0.85rem' }}>{formatPaymentMethod(order.paymentMethod)}</span>
					</div>
					<div className="d-flex justify-content-between align-items-center">
						<span className="font-weight-bold" style={{ fontSize: '0.9rem' }}>Amount:</span>
						<span className="font-weight-bold text-success" style={{ fontSize: '1rem' }}>
							{parseFloat(order.amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
					</div>
				</div>

				{order.admin && (
					<div className="mt-75 pt-75 border-top">
						<small className="text-muted">
							Created by: {order.admin.firstName} {order.admin.lastName}
						</small>
					</div>
				)}
			</CardBody>
		</Card>
	)
}

export default OrderCard
