// ** React Imports
import { Link } from 'react-router-dom'
import { useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { store } from '@store/storeConfig/store'
import { approveSupply, rejectSupply, paySupply, deleteSupply } from '../store/action'

// ** Icons Imports
import { Settings, Database, Edit, Eye, Check, X, DollarSign, Trash2, MoreVertical } from 'react-feather'

// ** Reactstrap Imports
import { 
	Badge, 
	UncontrolledDropdown, 
	DropdownToggle, 
	DropdownMenu, 
	DropdownItem, 
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Input
} from 'reactstrap'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// ** Payment Modal Component
const PaymentModal = ({ isOpen, toggle, supply }) => {
	const [paymentData, setPaymentData] = useState({
		amount: '',
		paymentMethod: 'cash'
	})

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (paymentData.amount && paymentData.amount > 0) {
			await store.dispatch(paySupply(supply.id, paymentData))
			toggle()
			setPaymentData({ amount: '', paymentMethod: 'cash' })
		}
	}

	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalHeader toggle={toggle}>Record Payment for {supply?.supplyNumber}</ModalHeader>
			<Form onSubmit={handleSubmit}>
				<ModalBody>
					<FormGroup>
						<Label for='amount'>Amount</Label>
						<Input
							type='number'
							id='amount'
							value={paymentData.amount}
							onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
							placeholder='Enter payment amount'
							step='0.01'
							min='0'
							required
						/>
					</FormGroup>
					<FormGroup>
						<Label for='paymentMethod'>Payment Method</Label>
						<Input
							type='select'
							id='paymentMethod'
							value={paymentData.paymentMethod}
							onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
						>
							<option value='cash'>Cash</option>
							<option value='bank-transfer'>Bank Transfer</option>
						</Input>
					</FormGroup>
					<div className='text-muted'>
						<small>Total Amount: R{supply?.totalAmount || 0}</small><br />
						<small>Amount Paid: R{supply?.amountPaid || 0}</small><br />
						<small>Amount Due: R{(supply?.totalAmount || 0) - (supply?.amountPaid || 0)}</small>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={toggle}>Cancel</Button>
					<Button color='primary' type='submit'>Record Payment</Button>
				</ModalFooter>
			</Form>
		</Modal>
	)
}

// ** Renders Client Columns
const renderClient = row => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.supplier?.name) {
		return (
			<div className='d-flex justify-content-left align-items-center'>
				<Avatar
					initials
					color={color || 'light-primary'}
					className='me-1'
					content={row.supplier.name}
				/>
				<div className='d-flex flex-column'>
					<Link
						to={`/supplier/view/${row.supplier.id}`}
						className='user_name text-truncate text-body'
					>
						<span className='fw-bolder'>{row.supplier.name}</span>
					</Link>
					<small className='text-truncate text-muted mb-0'>{row.supplier.email}</small>
				</div>
			</div>
		)
	} else {
		return (
			<div className='d-flex justify-content-left align-items-center'>
				<Avatar
					initials
					color={color || 'light-primary'}
					className='me-1'
					content='Unknown'
				/>
				<div className='d-flex flex-column'>
					<span className='fw-bolder'>Unknown Supplier</span>
					<small className='text-truncate text-muted mb-0'>-</small>
				</div>
			</div>
		)
	}
}

// ** Renders Status
const renderStatus = row => {
	const status = row.status
	const color = 
		status === 'approved' ? 'light-success' :
		status === 'rejected' ? 'light-danger' : 
		'light-warning'

	return (
		<Badge className='text-capitalize' color={color} pill>
			{status}
		</Badge>
	)
}

// ** Renders Payment Status
const renderPaymentStatus = row => {
	const status = row.paymentStatus
	const color = 
		status === 'paid' ? 'light-success' :
		status === 'partial' ? 'light-warning' : 
		'light-danger'

	return (
		<Badge className='text-capitalize' color={color} pill>
			{status}
		</Badge>
	)
}

// ** Renders Items Count
const renderItemsCount = row => {
	const itemsCount = row.supply_items ? row.supply_items.length : 0
	return (
		<div className='d-flex align-items-center'>
			<Database size={14} className='me-50' />
			<span>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
		</div>
	)
}

// ** Renders Total Amount
const renderTotalAmount = row => {
	const total = row.totalAmount || 0
	const paid = row.amountPaid || 0
	const due = total - paid
	
	return (
		<div className='d-flex flex-column'>
			<span className='fw-bolder'>R{parseFloat(total).toFixed(2)}</span>
			{due > 0 && (
				<small className='text-danger'>Due: R{parseFloat(due).toFixed(2)}</small>
			)}
		</div>
	)
}

// ** Renders Action Buttons
const ActionsColumn = ({ row, handleEdit }) => {
	const [paymentModalOpen, setPaymentModalOpen] = useState(false)
	
	const handleApprove = () => {
		MySwal.fire({
			title: 'Are you sure?',
			text: `You want to approve supply ${row.supplyNumber}?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, approve it!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ms-1'
			},
			buttonsStyling: false
		}).then(async (result) => {
			if (result.value) {
				await store.dispatch(approveSupply(row.id))
			}
		})
	}

	const handleReject = () => {
		MySwal.fire({
			title: 'Are you sure?',
			text: `You want to reject supply ${row.supplyNumber}?`,
			input: 'textarea',
			inputPlaceholder: 'Enter rejection reason...',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, reject it!',
			customClass: {
				confirmButton: 'btn btn-danger',
				cancelButton: 'btn btn-outline-secondary ms-1'
			},
			buttonsStyling: false
		}).then(async (result) => {
			if (result.value) {
				await store.dispatch(rejectSupply(row.id, result.value))
			}
		})
	}

	const handleDelete = () => {
		MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ms-1'
			},
			buttonsStyling: false
		}).then(async (result) => {
			if (result.value) {
				await store.dispatch(deleteSupply(row.id))
			}
		})
	}

	return (
		<>
			<div className='column-action d-flex align-items-center'>
				{row.status === 'pending' && (
					<>
						<Button
							size='sm'
							color='success'
							className='me-50 btn-icon'
							onClick={handleApprove}
							title='Approve Supply'
						>
							<Check size={14} />
						</Button>
						<Button
							size='sm'
							color='danger'
							className='me-50 btn-icon'
							onClick={handleReject}
							title='Reject Supply'
						>
							<X size={14} />
						</Button>
					</>
				)}
				{row.status === 'approved' && row.paymentStatus !== 'paid' && (
					<Button
						size='sm'
						color='warning'
						className='me-50 btn-icon'
						onClick={() => setPaymentModalOpen(true)}
						title='Record Payment'
					>
						<DollarSign size={14} />
					</Button>
				)}
				<UncontrolledDropdown>
					<DropdownToggle tag='span' className='cursor-pointer'>
						<MoreVertical size={17} />
					</DropdownToggle>
					<DropdownMenu right>
						<DropdownItem
							tag={Link}
							to={`/supply/view/${row.id}`}
							className='w-100'
						>
							<Eye size={14} className='me-50' />
							<span className='align-middle'>View Details</span>
						</DropdownItem>
						{row.status === 'pending' && (
							<DropdownItem
								className='w-100'
								onClick={() => handleEdit(row)}
							>
								<Edit size={14} className='me-50' />
								<span className='align-middle'>Edit</span>
							</DropdownItem>
						)}
						{row.status !== 'approved' && (
							<DropdownItem
								className='w-100'
								onClick={handleDelete}
							>
								<Trash2 size={14} className='me-50' />
								<span className='align-middle'>Delete</span>
							</DropdownItem>
						)}
					</DropdownMenu>
				</UncontrolledDropdown>
			</div>
			<PaymentModal isOpen={paymentModalOpen} toggle={() => setPaymentModalOpen(false)} supply={row} />
		</>
	)
}

export const getColumns = (handleEdit) => [
	{
		name: 'Supply Number',
		sortable: true,
		minWidth: '150px',
		sortField: 'supplyNumber',
		selector: row => row.supplyNumber,
		cell: row => (
			<div className='d-flex flex-column'>
				<Link
					to={`/supply/view/${row.id}`}
					className='user_name text-truncate text-body fw-bolder'
				>
					{row.supplyNumber}
				</Link>
				<small className='text-truncate text-muted mb-0'>
					{new Date(row.supplyDate).toLocaleDateString()}
				</small>
			</div>
		)
	},
	{
		name: 'Supplier',
		sortable: true,
		minWidth: '230px',
		sortField: 'supplier.name',
		selector: row => row.supplier?.name,
		cell: row => renderClient(row)
	},
	{
		name: 'Items',
		sortable: true,
		minWidth: '100px',
		sortField: 'supply_items.length',
		selector: row => row.supply_items?.length || 0,
		cell: row => renderItemsCount(row)
	},
	{
		name: 'Total Amount',
		sortable: true,
		minWidth: '150px',
		sortField: 'totalAmount',
		selector: row => row.totalAmount,
		cell: row => renderTotalAmount(row)
	},
	{
		name: 'Status',
		sortable: true,
		minWidth: '120px',
		sortField: 'status',
		selector: row => row.status,
		cell: row => renderStatus(row)
	},
	{
		name: 'Payment',
		sortable: true,
		minWidth: '120px',
		sortField: 'paymentStatus',
		selector: row => row.paymentStatus,
		cell: row => renderPaymentStatus(row)
	},
	{
		name: 'Actions',
		minWidth: '150px',
		cell: row => <ActionsColumn row={row} handleEdit={handleEdit} />
	}
]

// Keep for backward compatibility
export const columns = getColumns(() => {})