import { Link } from 'react-router-dom'
import moment from 'moment'
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { Eye } from 'react-feather'
import { TransactionStatusBadge, PaymentMethodIcon, PaymentGatewayBadge } from '../components'

export const columns = [
	{
		name: 'Transaction ID',
		minWidth: '180px',
		selector: 'transactionId',
		sortable: true,
		cell: (row) => (
			<Link to={`/payments/transactions/${row.id}`} className="font-weight-bold">
				<span className="text-truncate" style={{ maxWidth: '160px', display: 'inline-block' }}>
					{row.transactionId}
				</span>
			</Link>
		),
	},
	{
		name: 'Order',
		minWidth: '120px',
		selector: 'order',
		sortable: true,
		cell: (row) => {
			if (row.order) {
				return (
					<Link to={`/order/preview/${row.order.id}`} className="text-primary">
						#{row.order.orderNumber}
					</Link>
				)
			}
			return <span className="text-muted">-</span>
		},
	},
	{
		name: 'Customer',
		minWidth: '180px',
		selector: 'customer',
		sortable: false,
		cell: (row) => {
			// Get customer from order or from metadata
			const customer = row.order?.customer || row.customerInfo
			if (customer) {
				const name = customer.firstName && customer.lastName
					? `${customer.firstName} ${customer.lastName}`
					: customer.email || customer.phone || 'N/A'
				return (
					<div className="d-flex flex-column">
						<span className="font-weight-bold text-truncate" style={{ maxWidth: '160px' }}>
							{name}
						</span>
						{customer.email && (
							<small className="text-muted text-truncate" style={{ maxWidth: '160px' }}>
								{customer.email}
							</small>
						)}
					</div>
				)
			}
			return <span className="text-muted">-</span>
		},
	},
	{
		name: 'Amount',
		minWidth: '130px',
		selector: 'amount',
		sortable: true,
		cell: (row) => (
			<span className="font-weight-bold">
				{Number(row.amount || 0).toLocaleString('en-ZA', {
					style: 'currency',
					currency: row.currency || 'ZAR',
				})}
			</span>
		),
	},
	{
		name: 'Status',
		minWidth: '130px',
		selector: 'status',
		sortable: true,
		cell: (row) => <TransactionStatusBadge status={row.status} />,
	},
	{
		name: 'Gateway',
		minWidth: '140px',
		selector: 'paymentGateway',
		sortable: true,
		cell: (row) => <PaymentGatewayBadge gateway={row.paymentGateway} />,
	},
	{
		name: 'Method',
		minWidth: '120px',
		selector: 'paymentMethod',
		sortable: true,
		cell: (row) => (
			<div className="d-flex align-items-center">
				<PaymentMethodIcon method={row.paymentMethod} showLabel={true} />
			</div>
		),
	},
	{
		name: 'Date',
		minWidth: '180px',
		selector: 'createdAt',
		sortable: true,
		cell: (row) => (
			<div className="d-flex flex-column">
				<span>{moment(row.createdAt).format('MMM DD, YYYY')}</span>
				<small className="text-muted">{moment(row.createdAt).format('HH:mm:ss')}</small>
			</div>
		),
	},
	{
		name: 'Actions',
		minWidth: '100px',
		cell: (row) => (
			<div className="d-flex align-items-center">
				<Link to={`/payments/transactions/${row.id}`} id={`view-${row.id}`}>
					<Eye size={18} className="text-primary cursor-pointer" />
				</Link>
				<UncontrolledTooltip placement="top" target={`view-${row.id}`}>
					View Details
				</UncontrolledTooltip>
			</div>
		),
	},
]
