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

const subscriptionStatus = {
	matured: 'light-secondary',
	completed: 'light-primary',
	active: 'light-success'
}

// ** Table columns
export const columns = [
	{
		name: 'Order ID',
		minWidth: '180px',
		selector: 'id',
		cell: (row) => (
			<Link to={`/investment/subscription/preview/${row.id}`}>
				<span>#{row.id}</span>
			</Link>
		),
	},
	{
		name: 'Investor',
		minWidth: '200px',
		selector: 'investor',
		sortable: true,
		cell: (row) => (
			<span className="font-weight-bold">
				{row.investor.fullName}
			</span>
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
		name: 'Start Date',
		selector: 'startDate',
		sortable: true,
		minWidth: '200px',
		cell: (row) => moment(row.startDate).format('lll'),
	},
	{
		name: 'End Date',
		selector: 'endDate',
		sortable: true,
		minWidth: '200px',
		cell: (row) => moment(row.endDate).format('lll'),
	},	
	{
		name: 'Status',
		selector: 'status',
		sortable: true,
		minWidth: '100px',
		cell: row => <Badge color={subscriptionStatus[row.status]} pill>{row.status.toUpperCase()}</Badge>
	},
	// {
	// 	name: 'Products ',
	// 	minWidth: '150px',
	// 	selector: 'products',
	// 	sortable: true,
	// 	cell: (row) => <span className="text-capitalize">{getItemNames(row.products)}</span>,
	// },
	{
		name: 'Date',
		selector: 'createdAt',
		sortable: true,
		minWidth: '200px',
		cell: (row) => moment(row.createdAt).format('lll'),
	}
]
