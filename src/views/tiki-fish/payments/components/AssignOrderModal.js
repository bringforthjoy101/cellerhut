import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Alert } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { assignPaymentToOrder } from '../store/action'

const AssignOrderModal = ({ isOpen, toggle, transaction }) => {
	const dispatch = useDispatch()
	const [orderId, setOrderId] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError(null)

		if (!orderId || !orderId.trim()) {
			setError('Please enter an order ID')
			return
		}

		setLoading(true)
		const result = await dispatch(assignPaymentToOrder(transaction.id, orderId.trim()))
		setLoading(false)

		if (result.success) {
			setOrderId('')
			toggle()
		} else {
			setError(result.error)
		}
	}

	const handleCancel = () => {
		setOrderId('')
		setError(null)
		toggle()
	}

	return (
		<Modal isOpen={isOpen} toggle={handleCancel} className="modal-dialog-centered">
			<ModalHeader toggle={handleCancel}>Assign Payment to Order</ModalHeader>
			<form onSubmit={handleSubmit}>
				<ModalBody>
					{error && <Alert color="danger">{error}</Alert>}

					<div className="mb-2">
						<p className="mb-1">
							<strong>Transaction ID:</strong> {transaction?.transactionId}
						</p>
						<p className="mb-1">
							<strong>Amount:</strong> {Number(transaction?.amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: transaction?.currency || 'ZAR' })}
						</p>
						<p className="mb-1">
							<strong>Status:</strong> <span className="text-capitalize">{transaction?.status}</span>
						</p>
					</div>

					<FormGroup>
						<Label for="orderId">Order ID or Order Number</Label>
						<Input
							type="text"
							id="orderId"
							name="orderId"
							value={orderId}
							onChange={(e) => setOrderId(e.target.value)}
							placeholder="Enter order ID or order number"
							disabled={loading}
						/>
						<small className="text-muted">
							Enter the numeric ID or the order number (e.g., "123" or "ORD-2024-001")
						</small>
					</FormGroup>

					<Alert color="warning" className="mb-0">
						<strong>Warning:</strong> This action will link this payment to the specified order and mark the order as paid. Make sure the order amount matches the payment amount.
					</Alert>
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" outline onClick={handleCancel} disabled={loading}>
						Cancel
					</Button>
					<Button color="primary" type="submit" disabled={loading}>
						{loading ? 'Assigning...' : 'Assign to Order'}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	)
}

export default AssignOrderModal
