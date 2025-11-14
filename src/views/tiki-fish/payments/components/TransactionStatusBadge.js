import { Badge } from 'reactstrap'
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'react-feather'

const TransactionStatusBadge = ({ status }) => {
	const statusConfig = {
		success: {
			color: 'success',
			icon: CheckCircle,
			text: 'Success',
		},
		pending: {
			color: 'warning',
			icon: Clock,
			text: 'Pending',
		},
		processing: {
			color: 'info',
			icon: RefreshCw,
			text: 'Processing',
		},
		failed: {
			color: 'danger',
			icon: XCircle,
			text: 'Failed',
		},
		cancelled: {
			color: 'secondary',
			icon: AlertCircle,
			text: 'Cancelled',
		},
		refunded: {
			color: 'dark',
			icon: AlertCircle,
			text: 'Refunded',
		},
	}

	const config = statusConfig[status] || statusConfig.pending
	const Icon = config.icon

	return (
		<Badge color={config.color} pill className="d-flex align-items-center">
			<Icon size={12} className="mr-25" />
			<span>{config.text}</span>
		</Badge>
	)
}

export default TransactionStatusBadge
