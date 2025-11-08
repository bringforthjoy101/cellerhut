// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { store } from '@store/storeConfig/store'
import { getAllData, deleteGuest } from '../store/action'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { MoreVertical, FileText, Trash2, Archive } from 'react-feather'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	return (
		<Avatar
			initials
			color={color}
			className="mr-1"
			content={row.fullName}
			contentStyles={{
				borderRadius: 0,
				fontSize: 'calc(20px)',
				width: '100%',
				height: '100%',
			}}
		/>
	)
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
			const deleted = await store.dispatch(deleteGuest(id))
			if (deleted) {
				await store.dispatch(getAllData())
				MySwal.fire({
					icon: 'success',
					title: 'Deleted!',
					text: 'Guest has been deleted.',
					customClass: {
						confirmButton: 'btn btn-success',
					},
				})
			}
		}
	})
}

export const columns = [
	{
		name: 'Guest',
		minWidth: '297px',
		selector: 'fullName',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{/* {renderClient(row)} */}
				<div className="d-flex flex-column">
					<Link to={`/investments/investors/view/${row.id}`} className="user-name text-truncate mb-0">
						<span className="font-weight-bold">{row.fullName}</span>
					</Link>
					<small className="text-truncate text-muted mb-0">{row.email}</small>
				</div>
			</div>
		),
	},
	{
		name: 'Phone',
		minWidth: '150px',
		selector: 'phone',
		sortable: true,
		cell: (row) => row.phone,
	},
	{
		name: 'Balance',
		minWidth: '150px',
		selector: 'balance',
		sortable: true,
		cell: (row) => (row.balance ?? 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
	},
	{
		name: 'Actions',
		minWidth: '100px',
		cell: (row) => (
			<UncontrolledDropdown>
				<DropdownToggle tag="div" className="btn btn-sm">
					<MoreVertical size={14} className="cursor-pointer" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem tag={Link} to={`/investments/investors/view/${row.id}`} className="w-100">
						<FileText size={14} className="mr-50" />
						<span className="align-middle">Details</span>
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
