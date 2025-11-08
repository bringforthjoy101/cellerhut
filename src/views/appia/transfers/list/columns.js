// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getTransfer } from '../store/action'
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
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.trans_id}` || 'John Doe'} initials />
	}
}

const statusObj = {
	success: 'light-success',
	pending: 'light-warning',
	failed: 'light-danger',
}

export const columns = [
	{
		name: 'Transaction Id',
		minWidth: '250px',
		selector: 'trans_id',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row)}
				<div className="d-flex flex-column">
					<Link
						to={`/appia/transfers/view/${row.id}`}
						className="user-name text-truncate mb-0"
						onClick={() => store.dispatch(getTransfer(store.getState().appiaTransfers.allData, row.id))}
					>
						<span className="font-weight-bold">{row.trans_id}</span>
					</Link>
				</div>
			</div>
		),
	},
	{
		name: 'Sender',
		minWidth: '200px',
		selector: 'sender_name',
		sortable: true,
		cell: (row) => row.sender_name,
	},
	{
		name: 'Receiver',
		minWidth: '250px',
		selector: 'receiver_name',
		sortable: true,
		cell: (row) => row.receiver_name,
	},
	{
		name: 'Bank',
		minWidth: '200px',
		selector: 'bank',
		sortable: true,
		cell: (row) => row.bank,
	},
	{
		name: 'Transaction Type',
		minWidth: '200px',
		selector: 'trans_type',
		sortable: true,
		cell: (row) => row.trans_type,
	},
	{
		name: 'Transfer Amount',
		minWidth: '200px',
		selector: 'trans_amount',
		sortable: true,
		cell: (row) => <span>{(row.trans_amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Status',
		minWidth: '138px',
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
		selector: 'trans_date',
		sortable: true,
		cell: (row) => moment(row.trans_date).format('lll'),
	},
]
