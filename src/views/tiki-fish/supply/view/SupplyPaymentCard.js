// ** React Imports
import { useState } from 'react'

// ** Reactstrap Imports
import { 
	Card, 
	CardBody, 
	CardHeader, 
	CardTitle, 
	Row, 
	Col, 
	Badge, 
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Input,
	FormFeedback,
	Alert
} from 'reactstrap'

// ** Icons
import { DollarSign, Calendar, CreditCard, Plus } from 'react-feather'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { paySupply } from '../store/action'

// ** Third Party Components
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const SupplyPaymentCard = ({ selectedSupply }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [paymentModal, setPaymentModal] = useState(false)
	const [paymentData, setPaymentData] = useState({
		amount: '',
		paymentMethod: 'cash',
		notes: ''
	})
	const [errors, setErrors] = useState({})

	// ** Toggle Payment Modal
	const togglePaymentModal = () => {
		setPaymentModal(!paymentModal)
		if (!paymentModal) {
			// Reset form when opening
			setPaymentData({
				amount: '',
				paymentMethod: 'cash',
				notes: ''
			})
			setErrors({})
		}
	}

	// ** Calculate amounts
	const totalAmount = parseFloat(selectedSupply?.totalAmount || 0)
	const amountPaid = parseFloat(selectedSupply?.amountPaid || 0)
	const amountDue = totalAmount - amountPaid
	const totalNetAmount = parseFloat(selectedSupply?.totalNetAmount || 0)
	const totalVatAmount = parseFloat(selectedSupply?.totalVatAmount || 0)

	// ** Get payment status color
	const getPaymentStatusColor = (status) => {
		switch (status) {
			case 'paid':
				return 'light-success'
			case 'partial':
				return 'light-warning'
			case 'unpaid':
				return 'light-danger'
			default:
				return 'light-secondary'
		}
	}

	// ** Validate payment form
	const validateForm = () => {
		const newErrors = {}
		
		if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
			newErrors.amount = 'Amount must be greater than 0'
		}
		
		if (parseFloat(paymentData.amount) > amountDue) {
			newErrors.amount = `Amount cannot exceed R${amountDue.toFixed(2)}`
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// ** Handle payment submission
	const handlePaymentSubmit = async (e) => {
		e.preventDefault()
		
		if (!validateForm()) {
			return
		}

		try {
			await dispatch(paySupply(selectedSupply.id, paymentData))
			togglePaymentModal()
			MySwal.fire({
				icon: 'success',
				title: 'Payment Recorded!',
				text: `Payment of R${parseFloat(paymentData.amount).toFixed(2)} has been recorded successfully.`,
				customClass: {
					confirmButton: 'btn btn-primary'
				}
			})
		} catch (error) {
			MySwal.fire({
				icon: 'error',
				title: 'Error!',
				text: error.message || 'Failed to record payment',
				customClass: {
					confirmButton: 'btn btn-primary'
				}
			})
		}
	}

	// ** Can record payment check
	const canRecordPayment = selectedSupply?.status === 'approved' && amountDue > 0

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle tag='h4'>Payment Information</CardTitle>
					{canRecordPayment && (
						<Button color='primary' size='sm' onClick={togglePaymentModal}>
							<Plus size={14} className='me-50' />
							Record Payment
						</Button>
					)}
				</CardHeader>
				<CardBody>
					{/* Payment Status */}
					<div className='mb-2'>
						<h6 className='mb-1'>Payment Status</h6>
						<Badge 
							color={getPaymentStatusColor(selectedSupply?.paymentStatus)} 
							className='text-capitalize'
							pill
						>
							{selectedSupply?.paymentStatus || 'unpaid'}
						</Badge>
					</div>

					{/* Financial Summary */}
					<Row className='mt-2'>
						<Col sm={6} className='mb-1'>
							<div className='d-flex justify-content-between'>
								<span>Net Amount:</span>
								<span className='fw-bold'>R{totalNetAmount.toFixed(2)}</span>
							</div>
						</Col>
						<Col sm={6} className='mb-1'>
							<div className='d-flex justify-content-between'>
								<span>VAT Amount:</span>
								<span className='fw-bold'>R{totalVatAmount.toFixed(2)}</span>
							</div>
						</Col>
						<Col sm={6} className='mb-1'>
							<div className='d-flex justify-content-between'>
								<span>Total Amount:</span>
								<span className='fw-bold text-primary'>R{totalAmount.toFixed(2)}</span>
							</div>
						</Col>
						<Col sm={6} className='mb-1'>
							<div className='d-flex justify-content-between'>
								<span>Amount Paid:</span>
								<span className='fw-bold text-success'>R{amountPaid.toFixed(2)}</span>
							</div>
						</Col>
					</Row>

					<hr className='my-1' />

					{/* Amount Due */}
					<div className='d-flex justify-content-between align-items-center'>
						<h5 className='mb-0'>Amount Due:</h5>
						<h5 className='mb-0 text-danger'>R{amountDue.toFixed(2)}</h5>
					</div>

					{/* Payment Due Date */}
					{selectedSupply?.paymentDueDate && (
						<div className='mt-2'>
							<div className='d-flex align-items-center'>
								<Calendar size={16} className='me-50' />
								<span className='text-muted'>
									Payment Due: {new Date(selectedSupply.paymentDueDate).toLocaleDateString()}
								</span>
							</div>
						</div>
					)}

					{/* Notes */}
					{selectedSupply?.notes && (
						<Alert color='info' className='mt-2'>
							<div className='alert-body'>
								<strong>Notes:</strong> {selectedSupply.notes}
							</div>
						</Alert>
					)}
				</CardBody>
			</Card>

			{/* Payment Modal */}
			<Modal isOpen={paymentModal} toggle={togglePaymentModal}>
				<ModalHeader toggle={togglePaymentModal}>
					Record Payment for {selectedSupply?.supplyNumber}
				</ModalHeader>
				<Form onSubmit={handlePaymentSubmit}>
					<ModalBody>
						<FormGroup>
							<Label for='amount'>
								Amount <span className='text-danger'>*</span>
							</Label>
							<div className='input-group'>
								<span className='input-group-text'>R</span>
								<Input
									type='number'
									id='amount'
									value={paymentData.amount}
									onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
									placeholder='0.00'
									step='0.01'
									min='0.01'
									max={amountDue}
									invalid={errors.amount}
								/>
								{errors.amount && <FormFeedback>{errors.amount}</FormFeedback>}
							</div>
							<small className='text-muted'>Maximum: R{amountDue.toFixed(2)}</small>
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
								<option value='credit'>Credit</option>
							</Input>
						</FormGroup>

						<FormGroup>
							<Label for='notes'>Notes (Optional)</Label>
							<Input
								type='textarea'
								id='notes'
								rows='3'
								value={paymentData.notes}
								onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
								placeholder='Payment reference or notes...'
							/>
						</FormGroup>

						{/* Payment Summary */}
						<Alert color='light'>
							<div className='d-flex justify-content-between mb-1'>
								<span>Total Amount:</span>
								<span>R{totalAmount.toFixed(2)}</span>
							</div>
							<div className='d-flex justify-content-between mb-1'>
								<span>Already Paid:</span>
								<span>R{amountPaid.toFixed(2)}</span>
							</div>
							<div className='d-flex justify-content-between mb-1'>
								<span>This Payment:</span>
								<span className='fw-bold'>
									R{paymentData.amount ? parseFloat(paymentData.amount).toFixed(2) : '0.00'}
								</span>
							</div>
							<hr />
							<div className='d-flex justify-content-between'>
								<span>Remaining After Payment:</span>
								<span className='fw-bold text-danger'>
									R{paymentData.amount 
										? Math.max(0, amountDue - parseFloat(paymentData.amount)).toFixed(2)
										: amountDue.toFixed(2)}
								</span>
							</div>
						</Alert>
					</ModalBody>
					<ModalFooter>
						<Button color='secondary' onClick={togglePaymentModal}>
							Cancel
						</Button>
						<Button color='primary' type='submit'>
							<CreditCard size={14} className='me-50' />
							Record Payment
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</>
	)
}

export default SupplyPaymentCard