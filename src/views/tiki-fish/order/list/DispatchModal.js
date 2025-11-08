import React, { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label, Alert, Row, Col } from 'reactstrap'
import { Truck, MapPin, Phone, User } from 'react-feather'
import { apiRequest, swal } from '@utils'

// Helper function to format address object into a string
const formatAddress = (address) => {
	if (!address) return ''
	const parts = [
		address.street,
		address.suburb,
		address.city,
		address.province,
		address.postalCode
	].filter(Boolean)
	return parts.join(', ')
}

const DispatchModal = ({ isOpen, toggle, order, onDispatchSuccess }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [formData, setFormData] = useState({
		customerName: '',
		customerPhone: '',
		deliveryAddress: '',
		deliveryNotes: '',
	})

	// Pre-populate form when modal opens
	useEffect(() => {
		if (isOpen && order) {
			// Format address from order.address object or use existing string fields
			const addressString = order.address
				? formatAddress(order.address)
				: (order.shippingAddress || order.deliveryAddress || '')

			setFormData({
				customerName: order.customer?.name || order.customer?.fullName || '',
				customerPhone: order.customer?.phoneNumber || order.customer?.phone || '',
				deliveryAddress: addressString,
				deliveryNotes: '',
			})
			setError('')
		}
	}, [isOpen, order])

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
		setError('')
	}

	const validateForm = () => {
		if (!formData.customerName.trim()) {
			setError('Customer name is required')
			return false
		}
		if (!formData.customerPhone.trim()) {
			setError('Customer phone number is required')
			return false
		}
		if (!formData.deliveryAddress.trim()) {
			setError('Delivery address is required')
			return false
		}
		return true
	}

	const handleDispatch = async () => {
		if (!validateForm()) {
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const response = await apiRequest(
				{
					url: `/orders/${order.id}/create-delivery`,
					method: 'POST',
					body: JSON.stringify({
						customer_name: formData.customerName,
						customer_phone: formData.customerPhone,
						delivery_address: formData.deliveryAddress,
						delivery_notes: formData.deliveryNotes,
					}),
				},
				null
			)

			if (response && response.data && response.data.status) {
				await swal('Success!', 'Order dispatched for GPS-tracked delivery successfully.', 'success')
				toggle()
				if (onDispatchSuccess) {
					onDispatchSuccess(response.data.data)
				}
			} else {
				const errorMessage = response?.data?.message || 'Failed to dispatch order'
				setError(errorMessage)
				swal('Error', errorMessage, 'error')
			}
		} catch (err) {
			console.error('Dispatch error:', err)
			const errorMessage = err.response?.data?.message || 'An error occurred while dispatching the order'
			setError(errorMessage)
			swal('Error', errorMessage, 'error')
		} finally {
			setIsLoading(false)
		}
	}

	if (!order) return null

	return (
		<Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
			<ModalHeader toggle={toggle}>
				<div className="d-flex align-items-center">
					<Truck size={20} />
					<span className="ml-2">Dispatch Order for GPS Tracking</span>
				</div>
			</ModalHeader>

			<ModalBody>
				{/* Order Info */}
				<div className="order-info mb-4 p-3 bg-light rounded">
					<h6 className="mb-2">Order Details</h6>
					<div className="d-flex justify-content-between">
						<span>Order Number:</span>
						<span className="font-weight-bold">#{order.orderNumber}</span>
					</div>
					<div className="d-flex justify-content-between">
						<span>Order Amount:</span>
						<span className="font-weight-bold">
							{Number(order.amount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
					</div>
				</div>

				{/* Delivery Information Form */}
				<div className="delivery-form">
					<h6 className="mb-3">Delivery Information</h6>

					<Row>
						<Col md="6">
							<FormGroup>
								<Label for="customerName">
									<User size={14} className="mr-1" />
									Customer Name *
								</Label>
								<Input
									type="text"
									id="customerName"
									name="customerName"
									value={formData.customerName}
									onChange={handleInputChange}
									placeholder="Enter customer name"
									disabled={isLoading}
								/>
							</FormGroup>
						</Col>
						<Col md="6">
							<FormGroup>
								<Label for="customerPhone">
									<Phone size={14} className="mr-1" />
									Customer Phone *
								</Label>
								<Input
									type="tel"
									id="customerPhone"
									name="customerPhone"
									value={formData.customerPhone}
									onChange={handleInputChange}
									placeholder="Enter phone number"
									disabled={isLoading}
								/>
							</FormGroup>
						</Col>
					</Row>

					<FormGroup>
						<Label for="deliveryAddress">
							<MapPin size={14} className="mr-1" />
							Delivery Address *
						</Label>
						<Input
							type="textarea"
							id="deliveryAddress"
							name="deliveryAddress"
							value={formData.deliveryAddress}
							onChange={handleInputChange}
							placeholder="Enter complete delivery address"
							rows="3"
							disabled={isLoading}
						/>
					</FormGroup>

					<FormGroup>
						<Label for="deliveryNotes">Delivery Notes (Optional)</Label>
						<Input
							type="textarea"
							id="deliveryNotes"
							name="deliveryNotes"
							value={formData.deliveryNotes}
							onChange={handleInputChange}
							placeholder="Add any special delivery instructions"
							rows="2"
							disabled={isLoading}
						/>
					</FormGroup>
				</div>

				{/* Error Alert */}
				{error && (
					<Alert color="danger" className="mt-3">
						{error}
					</Alert>
				)}

				{/* Info Note */}
				<div className="info-note mt-3 p-3 border rounded bg-info-light">
					<small>
						<strong>Note:</strong> Once dispatched, you'll be able to track the driver's location in real-time and receive
						delivery status updates.
					</small>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button color="secondary" onClick={toggle} disabled={isLoading}>
					Cancel
				</Button>
				<Button color="primary" onClick={handleDispatch} disabled={isLoading}>
					{isLoading ? 'Dispatching...' : 'Dispatch Order'}
				</Button>
			</ModalFooter>
		</Modal>
	)
}

export default DispatchModal
