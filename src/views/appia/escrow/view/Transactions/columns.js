// ** React Imports
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'
import { Link } from 'react-router-dom'
import { getUserEscrow } from '../../store/action'
import { store } from '@store/storeConfig/store'

// ** Third Party Components
import { Badge } from 'reactstrap'
import { Eye, TrendingUp, Send, MoreVertical, Download, Edit, Trash, Copy, CheckCircle, Save, ArrowDownCircle, Info, PieChart } from 'react-feather'

// ** Vars
const invoiceStatusObj = {
	Sent: { color: 'light-secondary', icon: Send },
	Paid: { color: 'light-success', icon: CheckCircle },
	Draft: { color: 'light-primary', icon: Save },
	Downloaded: { color: 'light-info', icon: ArrowDownCircle },
	'Past Due': { color: 'light-danger', icon: Info },
	'Partial Payment': { color: 'light-warning', icon: PieChart },
}

// ** renders client column
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.avatar) {
		return <Avatar className="mr-50" img={row.avatar} width="32" height="32" />
	} else {
		return <Avatar color={color} className="mr-50" content={row.sender.id ? row.sender.id : 'John Doe'} initials />
	}
}

const statusObj = {
	pending: 'light-warning',
	contested: 'light-danger',
	completed: 'light-success',
}

// ** Table columns
export const columns = [
	{
		name: 'User',
		minWidth: '180px',
		selector: 'escrow_id',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row)}
				<div className="d-flex flex-column">
					<span className="font-weight-bold">{row.sender.username}</span>
					<small className="text-truncate text-muted mb-0">{row.sender.id}</small>
				</div>
			</div>
		),
	},
	{
		name: 'Transaction Name',
		minWidth: '220px',
		selector: 'subject',
		sortable: true,
		cell: (row) => row.subject,
	},
	{
		name: 'Transaction Amount',
		selector: 'amount',
		sortable: true,
		minWidth: '220px',
		cell: (row) => <span>{(row.amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Status',
		minWidth: '120px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={statusObj[row.status]} pill>
				{row.status}
			</Badge>
		),
	},
	{
		name: 'Details',
		minWidth: '200px',
		selector: 'description',
		sortable: true,
		cell: (row) => row.description,
	},
	{
		name: 'Date',
		selector: 'updated_at',
		sortable: true,
		minWidth: '200px',
		cell: (row) => moment(row.updated_at).format('lll'),
	},
]
