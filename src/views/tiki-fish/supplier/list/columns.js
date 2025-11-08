// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'
import { getAllData, deleteSupplier } from '../store/action'
import { store } from '@store/storeConfig/store'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// ** Third Party Components
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap'
import { MoreVertical, FileText, Trash2, Archive, Users, Phone, Mail, DollarSign, Edit } from 'react-feather'

// ** Renders Supplier Avatar
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	return <Avatar color={color || 'primary'} className="mr-1" content={`${row.name}` || 'Supplier'} initials />
}

const handleDelete = async (id) => {
	return MySwal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes, delete it!',
		customClass: {
			confirmButton: 'btn btn-primary',
			cancelButton: 'btn btn-outline-danger ml-1',
		},
		buttonsStyling: false,
	}).then(async function (result) {
		if (result.value) {
			const deleted = await store.dispatch(deleteSupplier(id))
			if (deleted.status) {
				await store.dispatch(getAllData())
				MySwal.fire({
					icon: 'success',
					title: 'Deleted!',
					text: 'Supplier has been deleted.',
					customClass: {
						confirmButton: 'btn btn-primary',
					},
				})
			}
		}
	})
}

export const getColumns = (handleEdit) => [
	{
		name: 'Supplier',
		selector: 'name',
		minWidth: '280px',
		wrap: true,
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row)}
				<div className="d-flex flex-column">
					<div className="d-flex align-items-center">
						<Link to={`/supplier/view/${row.id}`} className="user-name text-truncate mb-0 mr-1">
							<span className="font-weight-bold">
								{row.name.slice(0, 20).trim()}
								{row.name.length > 20 ? '...' : ''}
							</span>
						</Link>
						<Badge color={row.status === 'active' ? 'light-success' : 'light-secondary'} className="badge-sm">
							{row.status}
						</Badge>
					</div>
					<div className="d-flex align-items-center">
						<Mail size={12} className="mr-25 text-muted" />
						<small className="text-muted">{row.email}</small>
					</div>
				</div>
			</div>
		),
	},
	{
		name: 'Contact',
		selector: 'phone',
		minWidth: '150px',
		sortable: true,
		cell: (row) => (
			<div className="d-flex align-items-center">
				<Phone size={14} className="mr-50 text-muted" />
				<span>{row.phone}</span>
			</div>
		),
	},
	{
		name: 'Statistics',
		selector: 'statistics',
		minWidth: '200px',
		wrap: true,
		cell: (row) => (
			<div className="d-flex flex-column">
				<div className="d-flex align-items-center mb-25">
					<Users size={12} className="mr-25 text-primary" />
					<small>
						<span className="font-weight-bold text-primary">{row.statistics?.totalSupplies || 0}</span> supplies
					</small>
				</div>
				<div className="d-flex align-items-center mb-25">
					<span className="font-weight-bold text-success mr-25">{row.statistics?.approvedSupplies || 0}</span>
					<small className="text-success">approved</small>
					<span className="mx-25">•</span>
					<span className="font-weight-bold text-warning mr-25">{row.statistics?.pendingSupplies || 0}</span>
					<small className="text-warning">pending</small>
				</div>
				<div className="d-flex align-items-center">
					<DollarSign size={12} className="mr-25 text-success" />
					<small>
						Total:{' '}
						<span className="font-weight-bold">
							{Number(row.statistics?.totalAmount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
					</small>
				</div>
			</div>
		),
	},
	{
		name: 'Outstanding',
		selector: 'totalOwed',
		minWidth: '120px',
		sortable: true,
		cell: (row) => {
			const owed = Number(row.statistics?.totalOwed || 0)
			return (
				<div className="d-flex flex-column">
					<span className={`font-weight-bold ${owed > 0 ? 'text-danger' : 'text-success'}`}>
						{owed.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
					</span>
					{owed > 0 && <small className="text-danger">Outstanding</small>}
				</div>
			)
		},
	},
	{
		name: 'Last Supply',
		selector: 'lastSupplyDate',
		minWidth: '150px',
		wrap: true,
		sortable: true,
		cell: (row) => {
			const lastSupplyDate = row.statistics?.lastSupplyDate
			return lastSupplyDate ? (
				<div className="d-flex flex-column">
					<span className="font-weight-bold">{moment(lastSupplyDate).format('MMM DD, YYYY')}</span>
					<small className="text-muted">{moment(lastSupplyDate).fromNow()}</small>
				</div>
			) : (
				<span className="text-muted">No supplies yet</span>
			)
		},
	},
	{
		name: 'Created Date',
		selector: 'createdAt',
		sortable: true,
		minWidth: '150px',
		wrap: true,
		cell: (row) => moment(row.createdAt).format('MMM DD, YYYY'),
	},
	{
		name: 'Actions',
		selector: 'actions',
		sortable: false,
		cell: (row) => (
			<UncontrolledDropdown>
				<DropdownToggle tag="div" className="btn btn-sm">
					<MoreVertical size={14} className="cursor-pointer" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem tag={Link} to={`/supplier/view/${row.id}`} className="w-100">
						<FileText size={14} className="mr-50" />
						<span className="align-middle">Details</span>
					</DropdownItem>
					<DropdownItem className="w-100" onClick={() => handleEdit(row)}>
						<Edit size={14} className="mr-50" />
						<span className="align-middle">Edit</span>
					</DropdownItem>
					<DropdownItem className="w-100" onClick={() => handleDelete(row.id)}>
						<Trash2 size={14} className="mr-50" />
						<span className="align-middle">Delete</span>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
		),
	},
]

// Keep for backward compatibility
export const columns = getColumns(() => {})
