// ** React Import
import { useState } from 'react'

// ** Custom Components
import Sidebar from '@components/sidebar'

// ** Third Party Components
import { Button, FormGroup, Label, FormText, Form, Input } from 'reactstrap'
import { Check, X } from 'react-feather'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { createSupplier } from '../store/action'

const SidebarNewSupplier = ({ open, toggleSidebar }) => {
	// ** State
	const [data, setData] = useState({
		name: '',
		email: '',
		phone: '',
		address: '',
		accountNumber: '',
		bankName: '',
		accountName: ''
	})

	// ** Store Vars
	const dispatch = useDispatch()

	// ** Function to handle form submit
	const onSubmit = async (e) => {
		e.preventDefault()
		
		if (data.name && data.email && data.phone) {
			const result = await dispatch(createSupplier(data))
			if (result.status) {
				toggleSidebar()
				setData({
					name: '',
					email: '',
					phone: '',
					address: '',
					accountNumber: '',
					bankName: '',
					accountName: ''
				})
			}
		}
	}

	// ** Function to handle form reset
	const handleReset = () => {
		setData({
			name: '',
			email: '',
			phone: '',
			address: '',
			accountNumber: '',
			bankName: '',
			accountName: ''
		})
	}

	return (
		<Sidebar
			size="lg"
			open={open}
			title="New Supplier"
			headerClassName="mb-1"
			contentClassName="pt-0"
			toggleSidebar={toggleSidebar}
		>
			<Form onSubmit={onSubmit}>
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
				<Button type="submit" className="mr-1" color="primary">
					Add
				</Button>
				<Button type="reset" color="secondary" outline onClick={handleReset}>
					Reset
				</Button>
			</Form>
		</Sidebar>
	)
}

export default SidebarNewSupplier