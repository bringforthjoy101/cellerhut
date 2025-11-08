// ** React Imports
import { Link } from 'react-router-dom'
import moment from 'moment'
// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge, DropdownItem, DropdownMenu, UncontrolledDropdown, DropdownToggle } from 'reactstrap'
import { Slack, User, Database, Edit, DollarSign, MoreVertical } from 'react-feather'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { refundWithdrawal, getAllData } from '../store/action'
import { store } from '@store/storeConfig/store'

const MySwal = withReactContent(Swal)

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
	SUCCESS: 'light-success',
	REFUNDED: 'light-warning',
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
	cancelled: 'light-danger',
}

const handleRefund = async (id) => {
	// const dispatch = useDispatch()
	return MySwal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes, refund it!',
		customClass: {
			confirmButton: 'btn btn-primary',
			cancelButton: 'btn btn-outline-danger ml-1',
		},
		buttonsStyling: false,
	}).then(async function (result) {
		if (result.value) {
			const deleted = await store.dispatch(refundWithdrawal(id))
			if (deleted?.status) {
				await store.dispatch(getAllData())
				MySwal.fire({
					icon: 'success',
					title: 'Refunded!',
					text: 'Withdrawal has been refunded.',
					customClass: {
						confirmButton: 'btn btn-primary',
					},
				})
			}
		}
	})
}

export const columns = [
	// {
	// 	name: 'Order Id',
	// 	width: '150px',
	// 	selector: 'orderNumber',
	// 	sortable: true,
	// 	cell: (row) => (
	// 		<Link to={`/order/preview/${row.id}`}>
	// 			<span>#{row.orderNumber}</span>
	// 		</Link>
	// 	),
	// },
	{
		name: 'Amount',
		width: '250px',
		selector: 'amount',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
	},
	{
		name: 'Group',
		minWidth: '150px',
		selector: 'group',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.group}</span>,
	},
	{
		name: 'Wallet',
		minWidth: '150px',
		selector: 'wallet',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.wallet.name}</span>,
	},
	{
		name: 'Category',
		minWidth: '150px',
		selector: 'category',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.category}</span>,
	},
	{
		name: 'Status',
		minWidth: '150px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={statusObj[row.status]} pill>
				{row.status}
			</Badge>
		),
	},
	{
		name: 'Purpose',
		minWidth: '150px',
		selector: 'purpose',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row?.purpose}</span>,
	},
	{
		name: 'Withdrawal Date',
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
						<span className="font-weight-bold">
							{row.admin.firstName} {row.admin.lastName}
						</span>
					</Link>
				</div>
			</div>
		),
	},
	{
		name: 'Actions',
		selector: 'name',
		sortable: true,
		cell: (row) => (
			<UncontrolledDropdown>
				<DropdownToggle tag="div" className="btn btn-sm">
					<MoreVertical size={14} className="cursor-pointer" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem className="w-100" onClick={() => handleRefund(row.id)}>
						<DollarSign size={14} className="mr-50" />
						<span className="align-middle">Refund</span>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
		),
	},
]
