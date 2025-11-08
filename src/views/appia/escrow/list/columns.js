// ** React Imports
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getEscrow } from '../store/action'
import { store } from '@store/storeConfig/store'
import moment from 'moment'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Slack, User, Settings, Database, Edit, MoreVertical, FileText, Trash2, Archive } from 'react-feather'

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.avatar) {
		return <Avatar className="mr-1" img={row.avatar} width="32" height="32" />
	} else {
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.escrow_id}` || 'John Doe'} initials />
	}
}

// ** Renders Role Columns

const renderRole = (row) => {
	const roleObj = {
		receiver: {
			class: 'text-primary',
			icon: User,
		},
		sender: {
			class: 'text-success',
			icon: Database,
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
	pending: 'light-warning',
	contested: 'light-danger',
	completed: 'light-success',
}
export const columns = [
	{
		name: 'Escrow Id',
		minWidth: '180px',
		selector: 'escrow_id',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row)}
				<div className="d-flex flex-column">
					<Link
						to={`/appia/escrow/view/${row.escrow_id}`}
						className="user-name text-truncate mb-0"
						onClick={() => store.dispatch(getEscrow(store.getState().appiaEscrow.allData, row.escrow_id))}
					>
						<span className="font-weight-bold">{row.escrow_id}</span>
					</Link>
				</div>
			</div>
		),
	},
	{
		name: 'Sender',
		minWidth: '200px',
		selector: 'sender',
		sortable: true,
		cell: (row) => row.sender.names,
	},
	{
		name: 'Receiver',
		minWidth: '200px',
		selector: 'receiver',
		sortable: true,
		cell: (row) => row.receiver.names,
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
		minWidth: '220px',
		selector: 'amount',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Transaction Status',
		minWidth: '220px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={statusObj[row.status]} pill>
				{row.status}
			</Badge>
		),
	},
	{
		name: 'Date',
		minWidth: '200px',
		selector: 'updated_at',
		sortable: true,
		cell: (row) => moment(row.updated_at).format('lll'),
	},
]
