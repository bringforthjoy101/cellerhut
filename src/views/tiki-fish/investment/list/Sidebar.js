// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { swal, apiRequest } from '@utils'
import { getAllData, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, Spinner, CustomInput } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const SidebarNewPackage = ({ open, toggleSidebar }) => {
	const dispatch = useDispatch()

	const [packageData, setPackageData] = useState({
		name: '',
		description: '',
		minimumAmount: '',
		durationType: '',
		durationValue: '',
		roi: ''
	})

	const [isSubmitting, setIsSubmitting] = useState(false)


	// ** Function to handle form submit
	const onSubmit = async (event, errors) => {
		setIsSubmitting(true)
		event.preventDefault()
		console.log({ errors })
		if (errors) setIsSubmitting(false)
		if (errors && !errors.length) {
			console.log({ packageData })
			setIsSubmitting(true)
			const body = JSON.stringify(packageData)
			try {
				const response = await apiRequest({ url: '/investments/packages/create', method: 'POST', body }, dispatch)
				console.log({ response })
				if (response.data.status) {
					setIsSubmitting(false)
					swal('Great job!', response.data.message, 'success')
					dispatch(getAllData())
					toggleSidebar()
				} else {
					setIsSubmitting(false)
					swal('Oops!', response.data.message, 'error')
				}
			} catch (error) {
				setIsSubmitting(false)
				console.error({ error })
			}
		}
	}

	return (
		<Sidebar size="lg" open={open} title="New Investment Package" headerClassName="mb-1" contentClassName="pt-0" toggleSidebar={toggleSidebar}>
			<AvForm onSubmit={onSubmit}>
				<FormGroup>
					<Label for="name">Name</Label>
					<AvInput
						name="name"
						id="name"
						placeholder="Name"
						value={packageData.name}
						onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for="description">Description</Label>
					<AvInput
						name="description"
						id="description"
						placeholder="Description"
						value={packageData.description}
						onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
						required
					/>
				</FormGroup>
				<FormGroup>
					<Label for='minimumAmount'>Minimum Amount</Label>
					<AvInput 
					name='minimumAmount' 
					id='minimumAmount' 
					placeholder='Minimum Amount' 
					value={packageData.minimumAmount}
					onChange={e => setPackageData({...packageData, minimumAmount: e.target.value})}
					required
					/>
				</FormGroup>
				<FormGroup>
					<Label for='durationType'>Duration Type</Label>
					<AvInput
						type="select"
						id="durationType"
						name="durationType"
						value={packageData.durationType}
						onChange={(e) => setPackageData({ ...packageData, durationType: e.target.value })}
						required
					>
						<option value="">Select Duration Type</option>
						<option value="days">Days</option>
						<option value="weeks">Weeks</option>
						<option value="months">Months</option>
						<option value="years">Years</option>
					</AvInput>
				</FormGroup>
				<FormGroup>
					<Label for='durationValue'>Duration Value</Label>
					<AvInput 
					name='durationValue' 
					id='durationValue' 
					placeholder='Duration Value' 
					value={packageData.durationValue}
					onChange={e => setPackageData({...packageData, durationValue: e.target.value})}
					required
					/>
				</FormGroup>
				<FormGroup>
					<Label for='roi'>ROI (%)</Label>
					<AvInput 
					name='roi' 
					id='roi' 
					placeholder='ROI' 
					value={packageData.roi}
					onChange={e => setPackageData({...packageData, roi: e.target.value})}
					required
					/>
				</FormGroup>

				<Button type="submit" className="mr-1" color="primary" disabled={isSubmitting}>
					{isSubmitting && <Spinner color="white" size="sm" />}
					<span className="ml-50">Submit</span>
				</Button>
				<Button type="reset" color="secondary" outline onClick={toggleSidebar}>
					Cancel
				</Button>
			</AvForm>
		</Sidebar>
	)
}

export default SidebarNewPackage
