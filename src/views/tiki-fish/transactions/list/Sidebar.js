// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { swal, apiRequest } from '@utils'
import { getAccountTransactions, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, FormText } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const SidebarNewUsers = ({ open, toggleSidebar }) => {
	const dispatch = useDispatch()

	const [userData, setUserData] = useState({
		fullName: '',
		password: '',
		phone: '',
		role: '',
	})
	// ** Function to handle form submit
	const onSubmit = async (event, errors) => {
		event?.preventDefault()
		if (errors && !errors.length) {
			const body = JSON.stringify(userData)
			try {
				const response = await apiRequest({ url: '/register', method: 'POST', body }, dispatch)
				if (response) {
					if (response.data.status) {
						swal('Great job!', response.data.message, 'success')
						dispatch(getAccountTransactions({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-') }))
						setUserData({
							fullName: '',
							password: '',
							phone: '',
							role: '',
						})
						toggleSidebar()
					} else {
						setUserData({
							fullName: '',
							password: '',
							phone: '',
							role: '',
						})
						swal('Oops!', response.data.message, 'error')
					}
				} else {
					swal('Oops!', 'Something went wrong with your network.', 'error')
				}
			} catch (error) {
				console.error({ error })
			}
		}
	}

	useEffect(() => {
		onSubmit()
		dispatch(getAccountTransactions({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-') }))
	}, [dispatch])

	return (
		<Sidebar size="lg" open={open} title="New User" headerClassName="mb-1" contentClassName="pt-0" toggleSidebar={toggleSidebar}>
			<AvForm onSubmit={onSubmit}>
				<FormGroup>
					<Label for="fullName">Full Name</Label>
					<AvInput
						name="fullName"
						id="fullName"
						placeholder="Full Name"
						value={userData.fullName}
						onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="phone">Phone</Label>
					<AvInput
						name="phone"
						id="phone"
						placeholder="08012345678"
						value={userData.phone}
						onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="password">Password</Label>
					<AvInput
						type="password"
						name="password"
						id="password"
						placeholder="Password"
						value={userData.password}
						onChange={(e) => setUserData({ ...userData, password: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="role">User Role</Label>
					<AvInput
						type="select"
						id="role"
						name="role"
						value={userData.role}
						onChange={(e) => setUserData({ ...userData, role: e.target.value })}
						required
					>
						<option value="">Select Role</option>
						<option value="SALES_REP">Sales Rep</option>
						<option value="STORE">Store</option>
						<option value="ADMIN">Admin</option>
					</AvInput>
				</FormGroup>
				<Button type="submit" className="mr-1" color="primary">
					Submit
				</Button>
				<Button type="reset" color="secondary" outline onClick={toggleSidebar}>
					Cancel
				</Button>
			</AvForm>
		</Sidebar>
	)
}

export default SidebarNewUsers
