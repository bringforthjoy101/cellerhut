// ** React Imports
import { Link } from 'react-router-dom'
import moment from 'moment'
// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge } from 'reactstrap'
import { Slack, User, Database, Edit } from 'react-feather'

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row?.avatar) {
		return <Avatar className="mr-1" img={row.avatar} width="32" height="32" />
	} else {
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.firstName} ${row.lastName}` || 'Client Name'} initials />
	}
}

// ** Renders Role Columns
const renderRole = (row) => {
	const roleObj = {
		customerSupport: {
			class: 'text-primary',
			icon: User,
		},
		superAdmin: {
			class: 'text-success',
			icon: Database,
		},
		controlAdmin: {
			class: 'text-info',
			icon: Edit,
		},
		admin: {
			class: 'text-danger',
			icon: Slack,
		},
	}

	const Icon = roleObj[row.role] ? roleObj[row.role].icon : User

	return (
		<span className="text-truncate text-capitalize align-middle">
			<Icon size={18} className={`${roleObj[row.role] ? roleObj[row.role].class : 'text-primary'} mr-50`} />
			{row.role}
		</span>
	)
}

const statusObj = {
	CASH: 'light-success',
	REVOKED: 'light-danger',
}

const modeObj = {
	cash: 'light-success',
	transfer: 'light-primary',
	pos: 'light-warning',
	dynamic: 'light-info',
}

const orderStatus = {
	processing: 'light-warning',
	completed: 'light-success',
	cancelled: 'light-danger'
}

export const columns = [
	{
		name: 'Order Id',
		width: '150px',
		selector: 'orderNumber',
		sortable: true,
		cell: (row) => (
			<Link to={`/order/preview/${row.id}`}>
				<span>#{row.orderNumber}</span>
			</Link>
		),
	},
	{
		name: 'Amount',
		width: '150px',
		selector: 'amount',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	// {
	//   name: 'Products ',
	//   minWidth: '150px',
	//   selector: 'products',
	//   sortable: true,
	//   cell: row => <span className="text-capitalize">{getItemNames(row.products)}</span>
	// },
	// {
	// 	name: 'Amount Paid',
	// 	width: '150px',
	// 	selector: 'amountPaid',
	// 	sortable: true,
	// 	cell: (row) => <span className="text-capitalize">{(row?.amountPaid || 0)?.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>,
	// },
	{
		name: 'Payment Mode',
		width: '200px',
		selector: 'paymentMode',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={modeObj[row.paymentMode]} pill>
				{row.paymentMode}
			</Badge>
		),
	},
	{
		name: 'Status',
		width: '100px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={orderStatus[row.status]} pill>
				{row.status}
			</Badge>
		),
	},
	{
		name: 'Service Charge',
		width: '250px',
		selector: 'charges',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{(row?.charges || 0)?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
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
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row.admin)}
				<div className="d-flex flex-column">
					<Link to={`/admin/view/${row.admin.id}`} className="user-name text-truncate mb-0">
						<span className="font-weight-bold">{row.admin.firstName} {row.admin.lastName}</span>
					</Link>
				</div>
			</div>
		),
	},
]
