// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'
import { Badge } from 'reactstrap'

// ** Third Party Components

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.avatar) {
		return <Avatar className="mr-1" img={row.avatar} width="32" height="32" />
	} else {
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.name}` || 'Customer Name'} initials />
	}
}

const getItemNames = (items) => {
	const arr = []
	console.log(items)
	const _items = process.env.NODE_ENV === 'production' ? JSON.parse(items) : JSON.parse(items)
	_items.forEach((item) => {
		arr.push(item.name)
	})
	const string = arr.join(', ')
	if (string.length < 35) return string
	return `${string.substring(0, 35)}...`
}

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

export const columns = [
	{
		name: 'Order Id',
		width: '150px',
		selector: 'trans_amount',
		sortable: true,
		cell: (row) => (
			<Link to={`/order/preview/${row.id}`}>
				<span>#{row.orderNumber}</span>
			</Link>
		),
	},
	{
		name: 'Order Amount',
		width: '150px',
		selector: 'amount',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{Number(row?.amount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Status ',
		minWidth: '130px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge color={getStatusColor(row.status)} pill>
				{formatStatusText(row.status)}
			</Badge>
		),
	},
	{
		name: 'Customer',
		minWidth: '150px',
		selector: 'customer',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row.customer)}
				<div className="d-flex flex-column">
					<Link to={`/customer/view/${row.customer.id}`} className="user-name text-truncate mb-0">
						<span className="font-weight-bold">{row.customer.name}</span>
					</Link>
				</div>
			</div>
		),
	},
	{
		name: 'Order Date',
		minWidth: '150px',
		selector: 'createdAt',
		sortable: true,
		cell: (row) => moment(row.createdAt).format('lll'),
	},
	{
		name: 'Initiated By',
		minWidth: '200px',
		selector: 'admin',
		sortable: true,
		cell: (row) => (
			<span className="font-weight-bold">
				{row.admin.firstName} {row.admin.lastName}
			</span>
		),
	},
]
