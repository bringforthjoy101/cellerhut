// ** React Imports
import { useEffect, useState } from 'react'

// ** Reactstrap Imports
import { 
	Card, 
	CardBody, 
	CardHeader, 
	CardTitle,
	Table,
	Badge,
	Button,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Spinner
} from 'reactstrap'

// ** Icons
import { MoreVertical, Trash2, FileText, Download } from 'react-feather'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { getSupplyPayments, deleteSupplyPayment } from '../store/action'

// ** Third Party Components
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment'

const MySwal = withReactContent(Swal)

const SupplyPaymentHistory = ({ selectedSupply }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [payments, setPayments] = useState([])
	const [loading, setLoading] = useState(true)

	// ** Fetch payments
	const fetchPayments = async () => {
		setLoading(true)
		try {
			const result = await dispatch(getSupplyPayments(selectedSupply.id))
			if (result?.data) {
				setPayments(result.data)
			}
		} catch (error) {
			console.error('Error fetching payments:', error)
		} finally {
			setLoading(false)
		}
	}

	// ** Get payments on mount
	useEffect(() => {
		if (selectedSupply?.id) {
			fetchPayments()
		}
	}, [selectedSupply?.id])

	// ** Handle delete payment
	const handleDeletePayment = (paymentId) => {
		MySwal.fire({
			title: 'Are you sure?',
			text: "This will delete the payment record and update the supply balance!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			customClass: {
				confirmButton: 'btn btn-danger',
				cancelButton: 'btn btn-outline-secondary ml-1'
			},
			buttonsStyling: false
		}).then(async (result) => {
			if (result.value) {
				try {
					await dispatch(deleteSupplyPayment(selectedSupply.id, paymentId))
					fetchPayments() // Refresh payments list
					MySwal.fire({
						icon: 'success',
						title: 'Deleted!',
						text: 'Payment has been deleted.',
						customClass: {
							confirmButton: 'btn btn-primary'
						}
					})
				} catch (error) {
					MySwal.fire({
						icon: 'error',
						title: 'Error!',
						text: error.message || 'Failed to delete payment',
						customClass: {
							confirmButton: 'btn btn-primary'
						}
					})
				}
			}
		})
	}

	// ** Get payment method badge color
	const getPaymentMethodColor = (method) => {
		switch (method) {
			case 'cash':
				return 'light-success'
			case 'bank-transfer':
				return 'light-info'
			case 'credit':
				return 'light-warning'
			default:
				return 'light-secondary'
		}
	}

	// ** Format date
	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-ZA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle tag='h4'>Payment History</CardTitle>
				<div className='d-flex align-items-center'>
					{payments.length > 0 && (
						<Badge color='light-primary' pill>
							{payments.length} Payment{payments.length !== 1 ? 's' : ''}
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardBody>
				{loading ? (
					<div className='text-center py-3'>
						<Spinner color='primary' />
					</div>
				) : payments.length === 0 ? (
					<div className='text-center py-3'>
						<FileText size={48} className='text-muted mb-2' />
						<p className='text-muted'>No payments recorded yet</p>
					</div>
				) : (
					<div className='table-responsive'>
						<Table hover>
							<thead>
								<tr>
									<th>Date</th>
									<th>Amount</th>
									<th>Method</th>
									<th>Recorded By</th>
									<th>Reference</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{payments.map((payment) => (
									<tr key={payment.id}>
										<td>
											<div>
												<span className='d-block'>
													{formatDate(payment.createdAt)}
												</span>
												<small className='text-muted'>
													{moment(payment.createdAt).fromNow()}
												</small>
											</div>
										</td>
										<td>
											<span className='fw-bold'>
												R{parseFloat(payment.amount).toFixed(2)}
											</span>
										</td>
										<td>
											<Badge 
												color={getPaymentMethodColor(payment.paymentMethod)} 
												pill
											>
												{payment.paymentMethod.replace('-', ' ')}
											</Badge>
										</td>
										<td>
											{payment.admin 
												? `${payment.admin.firstName} ${payment.admin.lastName}`
												: 'Unknown'}
										</td>
										<td>
											<small className='text-muted'>
												{payment.reference ? payment.reference.slice(0, 8) : '-'}
											</small>
										</td>
										<td>
											<UncontrolledDropdown>
												<DropdownToggle tag='div' className='btn btn-sm'>
													<MoreVertical size={14} className='cursor-pointer' />
												</DropdownToggle>
												<DropdownMenu>
													{payment.notes && (
														<DropdownItem 
															tag='a' 
															href='/' 
															className='w-100' 
															onClick={e => {
																e.preventDefault()
																MySwal.fire({
																	title: 'Payment Notes',
																	text: payment.notes,
																	icon: 'info',
																	customClass: {
																		confirmButton: 'btn btn-primary'
																	}
																})
															}}
														>
															<FileText size={14} className='me-50' />
															<span className='align-middle'>View Notes</span>
														</DropdownItem>
													)}
													<DropdownItem
														tag='a'
														href='/'
														className='w-100'
														onClick={e => {
															e.preventDefault()
															handleDeletePayment(payment.id)
														}}
													>
														<Trash2 size={14} className='me-50' />
														<span className='align-middle'>Delete</span>
													</DropdownItem>
												</DropdownMenu>
											</UncontrolledDropdown>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr>
									<th>Total</th>
									<th colSpan='5'>
										<span className='fw-bold text-success'>
											R{payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
										</span>
									</th>
								</tr>
							</tfoot>
						</Table>
					</div>
				)}
			</CardBody>
		</Card>
	)
}

export default SupplyPaymentHistory