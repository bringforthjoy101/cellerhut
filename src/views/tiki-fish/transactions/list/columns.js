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

const transcactionTypeObj = {
	credit: 'light-success',
	debit: 'light-danger',
}

export const columns = [
	{
		name: 'Transaction Ref',
		width: '150px',
		selector: 'reference',
		sortable: true,
		cell: (row) => <span>#{row.reference}</span>,
	},
	{
		name: 'Opening Balance',
		width: '150px',
		selector: 'peningBalance',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.openingBalance?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Type',
		width: '100px',
		selector: 'transactionType',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={transcactionTypeObj[row.transactionType]} pill>
				{row.transactionType}
			</Badge>
		),
	},
	{
		name: 'Amount',
		width: '150px',
		selector: 'amount',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Closing Balance',
		width: '150px',
		selector: 'closingBalance',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.closingBalance?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Narration',
		width: '250px',
		selector: 'narration',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row.narration}</span>,
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
