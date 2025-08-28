import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label, Alert } from 'reactstrap'
import { DollarSign, CreditCard, Smartphone } from 'react-feather'

const OrderConfirmationModal = ({ isOpen, toggle, orderData, onConfirmOrder, isLoading }) => {
	const [cashCollected, setCashCollected] = useState('')
	const [error, setError] = useState('')

	// Calculate change amount
	const changeAmount = cashCollected ? parseFloat(cashCollected) - parseFloat(orderData.total) : 0
	const isCashPayment = orderData.paymentMethod === 'cash'
	const isValidCashAmount =
		!isCashPayment ||
		(cashCollected && cashCollected.trim() !== '' && !isNaN(parseFloat(cashCollected)) && parseFloat(cashCollected) >= parseFloat(orderData.total))

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			// Pre-populate cash collected with total amount for cash payments
			if (orderData.paymentMethod === 'cash') {
				setCashCollected(orderData.total.toString())
			} else {
				setCashCollected('')
			}
			setError('')
		}
	}, [isOpen, orderData.paymentMethod, orderData.total])

	// Auto-focus cash input when modal opens for cash payments
	useEffect(() => {
		if (isOpen && isCashPayment) {
			const timer = setTimeout(() => {
				const cashInput = document.getElementById('cashCollectedInput')
				if (cashInput) cashInput.focus()
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [isOpen, isCashPayment])

	const formatPrice = (price) => {
		return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
	}

	const handleCashChange = (e) => {
		const value = e.target.value
		setCashCollected(value)
		setError('')

		// Only show error if user has entered a value and it's insufficient
		if (value && value.trim() !== '' && !isNaN(parseFloat(value))) {
			const enteredAmount = parseFloat(value)
			const requiredAmount = parseFloat(orderData.total)

			if (enteredAmount < requiredAmount) {
				setError(`Insufficient cash. Minimum required: ${formatPrice(orderData.total)}`)
			}
		}
	}

	const handleConfirm = () => {
		if (isCashPayment && !isValidCashAmount) {
			setError(`Insufficient cash. Minimum required: ${formatPrice(orderData.total)}`)
			return
		}

		const confirmData = {
			...orderData,
			cashCollected: isCashPayment ? parseFloat(cashCollected) : null,
			changeAmount: isCashPayment ? changeAmount : null,
		}

		onConfirmOrder(confirmData)
	}

	const getPaymentIcon = () => {
		switch (orderData.paymentMethod) {
			case 'cash':
				return <DollarSign size={18} />
			case 'card':
				return <CreditCard size={18} />
			case 'mobile':
				return <Smartphone size={18} />
			default:
				return <DollarSign size={18} />
		}
	}

	const getPaymentMethodName = () => {
		switch (orderData.paymentMethod) {
			case 'cash':
				return 'Cash'
			case 'card':
				return 'POS'
			case 'mobile':
				return 'Bank Transfer'
			default:
				return 'Cash'
		}
	}

	return (
		<Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
			<ModalHeader toggle={toggle}>
				<div className="d-flex align-items-center">
					{getPaymentIcon()}
					<span className="ml-2">Confirm Order - {getPaymentMethodName()} Payment</span>
				</div>
			</ModalHeader>

			<ModalBody>
				{/* Order Summary */}
				<div className="order-confirmation-summary">
					<h5 className="mb-3">Order Summary</h5>

					{/* Order Items */}
					<div className="order-items mb-3">
						{orderData.items.map((item, index) => (
							<div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
								<div className="item-details">
									<div className="item-name font-weight-bold">{item.name}</div>
									<div className="item-unit text-muted small">
										{item.quantity} × {item.discountAmount > 0 ? (
											<>
												<span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{formatPrice(item.price)}</span>
												{' '}
												<span style={{ color: '#28a745' }}>{formatPrice(item.price - (item.discountAmount / item.quantity))}</span>
											</>
										) : (
											formatPrice(item.price)
										)}
									</div>
									{item.discountAmount > 0 && (
										<div className="text-success small">
											Discount: {formatPrice(item.discountAmount)} 
											{item.discountType === 'percentage' && ` (${item.discountValue}%)`}
										</div>
									)}
								</div>
								<div className="item-total font-weight-bold">
									{item.discountAmount > 0 ? (
										<div>
											<div style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.875rem' }}>
												{formatPrice(item.price * item.quantity)}
											</div>
											<div style={{ color: '#28a745' }}>
												{formatPrice((item.price * item.quantity) - item.discountAmount)}
											</div>
										</div>
									) : (
										formatPrice(item.price * item.quantity)
									)}
								</div>
							</div>
						))}
					</div>

					{/* Totals */}
					<div className="order-totals">
						<div className="d-flex justify-content-between py-1">
							<span>Subtotal:</span>
							<span>{formatPrice(orderData.subtotal + (orderData.totalDiscount || 0))}</span>
						</div>
						
						{orderData.totalItemDiscount > 0 && (
							<div className="d-flex justify-content-between py-1 text-success">
								<span>Item Discounts:</span>
								<span>-{formatPrice(orderData.totalItemDiscount)}</span>
							</div>
						)}
						
						{orderData.orderDiscount?.amount > 0 && (
							<div className="d-flex justify-content-between py-1 text-success">
								<span>Order Discount ({orderData.orderDiscount.type === 'percentage' ? `${orderData.orderDiscount.value}%` : 'Fixed'}):</span>
								<span>-{formatPrice(orderData.orderDiscount.amount)}</span>
							</div>
						)}
						
						{orderData.totalDiscount > 0 && (
							<div className="d-flex justify-content-between py-1 font-weight-bold text-success border-top">
								<span>Total Discount:</span>
								<span>-{formatPrice(orderData.totalDiscount)} ({orderData.discountPercentage?.toFixed(1)}%)</span>
							</div>
						)}
						
						<div className="d-flex justify-content-between py-1">
							<span>Tax (15% included):</span>
							<span>{formatPrice(orderData.tax)}</span>
						</div>
						
						<div className="d-flex justify-content-between py-2 border-top font-weight-bold h5">
							<span>Total:</span>
							<span>{formatPrice(orderData.total)}</span>
						</div>
					</div>

					{/* Payment Method */}
					<div className="payment-method-display mt-3 p-3 bg-light rounded">
						<div className="d-flex align-items-center mb-2">
							{getPaymentIcon()}
							<span className="ml-2 font-weight-bold">Payment Method: {getPaymentMethodName()}</span>
						</div>
					</div>

					{/* Cash Payment Section */}
					{isCashPayment && (
						<div className="cash-payment-section mt-3 p-3 border rounded">
							<h6 className="mb-3">Cash Payment Details</h6>

							<FormGroup>
								<Label for="cashCollectedInput">Cash Collected</Label>
								<Input
									type="number"
									id="cashCollectedInput"
									value={cashCollected}
									onChange={handleCashChange}
									placeholder={`Amount due: ${formatPrice(orderData.total)}`}
									// step="0.01"
									className={error ? 'is-invalid' : ''}
								/>
								{error && <div className="invalid-feedback d-block">{error}</div>}
							</FormGroup>

							{cashCollected && changeAmount >= 0 && (
								<div className="change-calculation mt-3 p-2 bg-success-light rounded">
									<div className="d-flex justify-content-between">
										<span>Amount Due:</span>
										<span className="font-weight-bold">{formatPrice(orderData.total)}</span>
									</div>
									<div className="d-flex justify-content-between">
										<span>Cash Received:</span>
										<span className="font-weight-bold">{formatPrice(cashCollected)}</span>
									</div>
									<div className="d-flex justify-content-between border-top pt-2 mt-2">
										<span className="font-weight-bold text-success">Change to Give:</span>
										<span className="font-weight-bold text-success h6">{formatPrice(changeAmount)}</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Error Alert */}
					{error && (
						<Alert color="danger" className="mt-3">
							{error}
						</Alert>
					)}
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="secondary" onClick={toggle} disabled={isLoading}>
					Cancel
				</Button>
				<Button color="primary" onClick={handleConfirm} disabled={!isValidCashAmount || isLoading}>
					{isLoading ? 'Processing...' : 'Confirm Order'}
				</Button>
			</ModalFooter>
		</Modal>
	)
}

export default OrderConfirmationModal
