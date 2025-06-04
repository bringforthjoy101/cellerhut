// ** React Imports
import moment from 'moment'
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import { Send, CheckCircle, Save, ArrowDownCircle, Info, PieChart } from 'react-feather'

const getItemNames = (items) => {
	const arr = []
	// console.log({items})
	// const _items = process.env.NODE_ENV === 'production' ? JSON.parse(items) : JSON.parse(items)
	items.forEach((item) => {
		arr.push(item.name)
	})
	const string = arr.join(', ')
	if (string.length < 35) return string
	return `${string.substring(0, 35)}...`
}

const orderStatus = {
	processing: 'light-warning',
	completed: 'light-success',
	cancelled: 'light-danger'
}

// ** Table columns
export const columns = [
	{
		name: 'Order ID',
		minWidth: '180px',
		selector: 'orderNumber',
		cell: (row) => (
			<Link to={`/order/preview/${row.id}`}>
				<span>#{row.orderNumber}</span>
			</Link>
		),
	},
	{
		name: 'Amount',
		selector: 'amount',
		sortable: true,
		minWidth: '150px',
		cell: (row) => <span>{(row.amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Status',
		selector: 'status',
		sortable: true,
		minWidth: '100px',
		cell: row => <Badge color={orderStatus[row.status]} pill>{row.status.toUpperCase()}</Badge>
	},
	{
		name: 'Products ',
		minWidth: '150px',
		selector: 'products',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{getItemNames(row.products)}</span>,
	},
	{
		name: 'Date',
		selector: 'createdAt',
		sortable: true,
		minWidth: '200px',
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
