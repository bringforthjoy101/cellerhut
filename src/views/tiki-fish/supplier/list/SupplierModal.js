// ** React Import
import { useState, useEffect } from 'react'

// ** Third Party Components
import { Button, FormGroup, Label, Form, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

// ** Styles
import '../../shared/ModalStyles.css'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { createSupplier, updateSupplier } from '../store/action'

const SupplierModal = ({ open, toggleSidebar, selectedSupplier }) => {
	// ** State
	const [data, setData] = useState({
		name: '',
		email: '',
		phone: '',
		address: '',
		accountNumber: '',
		bankName: '',
		accountName: '',
		status: 'active'
	})

	// ** Store Vars
	const dispatch = useDispatch()

	// ** Function to handle form reset
	const handleReset = () => {
		setData({
			name: '',
			email: '',
			phone: '',
			address: '',
			accountNumber: '',
			bankName: '',
			accountName: '',
			status: 'active'
		})
	}

	// ** Set data if editing
	useEffect(() => {
		if (selectedSupplier) {
			setData({
				name: selectedSupplier.name || '',
				email: selectedSupplier.email || '',
				phone: selectedSupplier.phone || '',
				address: selectedSupplier.address || '',
				accountNumber: selectedSupplier.accountNumber || '',
				bankName: selectedSupplier.bankName || '',
				accountName: selectedSupplier.accountName || '',
				status: selectedSupplier.status || 'active'
			})
		}
	}, [selectedSupplier])

	// ** Function to handle form submit
	const onSubmit = async (e) => {
		e.preventDefault()
		
		if (data.name && data.email && data.phone) {
			let result
			if (selectedSupplier) {
				result = await dispatch(updateSupplier(selectedSupplier.id, data))
			} else {
				result = await dispatch(createSupplier(data))
			}
			
			if (result && result.status) {
				toggleSidebar()
				handleReset()
			}
		}
	}

	return (
		<Modal
			isOpen={open}
			toggle={toggleSidebar}
			className="modal-dialog-centered modal-lg"
			backdrop="static"
			keyboard={false}
		>
			<ModalHeader toggle={toggleSidebar}>
				{selectedSupplier ? "Edit Supplier" : "New Supplier"}
			</ModalHeader>
			<Form onSubmit={onSubmit}>
				<ModalBody>
					<FormGroup>
						<Label for="name">
							Name <span className="text-danger">*</span>
						</Label>
						<Input
							name="name"
							id="name"
							placeholder="Supplier Name"
							value={data.name}
							onChange={(e) => setData({ ...data, name: e.target.value })}
							required
						/>
					</FormGroup>
					<FormGroup>
						<Label for="email">
							Email <span className="text-danger">*</span>
						</Label>
						<Input
							type="email"
							name="email"
							id="email"
							placeholder="supplier@example.com"
							value={data.email}
							onChange={(e) => setData({ ...data, email: e.target.value })}
							required
						/>
					</FormGroup>
					<FormGroup>
						<Label for="phone">
							Phone <span className="text-danger">*</span>
						</Label>
						<Input
							name="phone"
							id="phone"
							placeholder="+27 123 456 7890"
							value={data.phone}
							onChange={(e) => setData({ ...data, phone: e.target.value })}
							required
						/>
					</FormGroup>
					<FormGroup>
						<Label for="address">Address</Label>
						<Input
							type="textarea"
							name="address"
							id="address"
							rows="3"
							placeholder="Supplier Address"
							value={data.address}
							onChange={(e) => setData({ ...data, address: e.target.value })}
						/>
					</FormGroup>
					<div className="divider divider-primary">
						<div className="divider-text">Banking Details</div>
					</div>
					<FormGroup>
						<Label for="bankName">Bank Name</Label>
						<Input
							name="bankName"
							id="bankName"
							placeholder="Bank Name"
							value={data.bankName}
							onChange={(e) => setData({ ...data, bankName: e.target.value })}
						/>
					</FormGroup>
					<FormGroup>
						<Label for="accountName">Account Name</Label>
						<Input
							name="accountName"
							id="accountName"
							placeholder="Account Holder Name"
							value={data.accountName}
							onChange={(e) => setData({ ...data, accountName: e.target.value })}
						/>
					</FormGroup>
					<FormGroup>
						<Label for="accountNumber">Account Number</Label>
						<Input
							name="accountNumber"
							id="accountNumber"
							placeholder="Account Number"
							value={data.accountNumber}
							onChange={(e) => setData({ ...data, accountNumber: e.target.value })}
						/>
					</FormGroup>
					{selectedSupplier && (
						<FormGroup>
							<Label for="status">Status</Label>
							<Input
								type="select"
								name="status"
								id="status"
								value={data.status}
								onChange={(e) => setData({ ...data, status: e.target.value })}
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</Input>
						</FormGroup>
					)}
				</ModalBody>
				<ModalFooter>
					<Button type="reset" color="secondary" outline onClick={handleReset}>
						Reset
					</Button>
					<div>
						<Button color="secondary" className="me-1" onClick={toggleSidebar} outline>
							Cancel
						</Button>
						<Button type="submit" color="primary">
							{selectedSupplier ? 'Update' : 'Add'}
						</Button>
					</div>
				</ModalFooter>
			</Form>
		</Modal>
	)
}

export default SupplierModal