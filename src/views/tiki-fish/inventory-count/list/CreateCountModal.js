import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
	Alert,
	Row,
	Col,
	CustomInput,
	Spinner
} from 'reactstrap'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import { AlertCircle, Info } from 'react-feather'
import { selectThemeColors, apiRequest } from '@utils'
import { createCount } from '../store/action'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// ** Styles
import 'flatpickr/dist/themes/material_blue.css'

const MySwal = withReactContent(Swal)

const CreateCountModal = ({ open, toggle, onSuccess }) => {
	const dispatch = useDispatch()
	
	// ** States
	const [formData, setFormData] = useState({
		countType: 'full',
		countDate: new Date(),
		deadlineDate: null,
		categoryId: null,
		blindCount: false,
		assignedTo: null,
		notes: '',
		productIds: []
	})
	const [categories, setCategories] = useState([])
	const [admins, setAdmins] = useState([])
	const [products, setProducts] = useState([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	// ** Load categories
	const loadCategories = async () => {
		try {
			const response = await apiRequest({ url: '/categories', method: 'GET' })
			if (response?.data?.data) {
				const categoryOptions = response.data.data.map(cat => ({
					value: cat.id,
					label: cat.name
				}))
				setCategories(categoryOptions)
			}
		} catch (error) {
			console.error('Error loading categories:', error)
		}
	}

	// ** Load admins
	const loadAdmins = async () => {
		try {
			const response = await apiRequest({ url: '/admins', method: 'GET' })
			if (response?.data?.data) {
				const adminOptions = response.data.data.map(admin => ({
					value: admin.id,
					label: `${admin.firstName} ${admin.lastName}`
				}))
				setAdmins(adminOptions)
			}
		} catch (error) {
			console.error('Error loading admins:', error)
		}
	}

	// ** Load products for spot check
	const loadProducts = async () => {
		try {
			const response = await apiRequest({ url: '/products', method: 'GET' })
			if (response?.data?.data) {
				const productOptions = response.data.data.map(product => ({
					value: product.id,
					label: `${product.name} (${product.sku})`
				}))
				setProducts(productOptions)
			}
		} catch (error) {
			console.error('Error loading products:', error)
		}
	}

	// ** Load data on mount
	useEffect(() => {
		if (open) {
			loadCategories()
			loadAdmins()
			if (formData.countType === 'spot') {
				loadProducts()
			}
		}
	}, [open, formData.countType])

	// ** Handle submit
	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setIsSubmitting(true)

		// Validation
		if (formData.countType === 'category' && !formData.categoryId) {
			setError('Please select a category for category-based count')
			setIsSubmitting(false)
			return
		}

		try {
			const submitData = {
				...formData,
				countDate: formData.countDate ? new Date(formData.countDate).toISOString() : new Date().toISOString(),
				deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate).toISOString() : null
			}

			const result = await dispatch(createCount(submitData))
			
			if (result) {
				MySwal.fire({
					icon: 'success',
					title: 'Success!',
					text: 'Inventory count created successfully',
					showConfirmButton: false,
					timer: 1500
				})
				
				// Reset form
				setFormData({
					countType: 'full',
					countDate: new Date(),
					deadlineDate: null,
					categoryId: null,
					blindCount: false,
					assignedTo: null,
					notes: '',
					productIds: []
				})
				
				if (onSuccess) onSuccess(result)
			} else {
				setError('Failed to create inventory count')
			}
		} catch (error) {
			setError(error.message || 'An error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	// ** Count type descriptions
	const countTypeInfo = {
		full: 'Count all products in inventory. Best for annual audits.',
		cycle: 'Count products not counted in last 30 days. Maintains ongoing accuracy.',
		spot: 'Random 10% sample of products. Quick accuracy check.',
		category: 'Count all products in a specific category. Targeted verification.'
	}

	return (
		<Modal isOpen={open} toggle={toggle} size='lg'>
			<ModalHeader toggle={toggle}>Create Inventory Count</ModalHeader>
			<Form onSubmit={handleSubmit}>
				<ModalBody>
					{error && (
						<Alert color='danger'>
							<AlertCircle size={14} className='mr-1' />
							{error}
						</Alert>
					)}

					<Row>
						<Col md={6}>
							<FormGroup>
								<Label for='countType'>Count Type</Label>
								<Input
									type='select'
									id='countType'
									value={formData.countType}
									onChange={(e) => setFormData({ ...formData, countType: e.target.value })}
								>
									<option value='full'>Full Count</option>
									<option value='cycle'>Cycle Count</option>
									<option value='spot'>Spot Check</option>
									<option value='category'>Category Count</option>
								</Input>
								<small className='text-muted d-block mt-1'>
									<Info size={12} className='mr-1' />
									{countTypeInfo[formData.countType]}
								</small>
							</FormGroup>
						</Col>
						<Col md={6}>
							<FormGroup>
								<Label for='countDate'>Count Date</Label>
								<Flatpickr
									id='countDate'
									className='form-control'
									value={formData.countDate}
									onChange={(date) => setFormData({ ...formData, countDate: date[0] })}
									options={{
										dateFormat: 'Y-m-d',
										minDate: 'today'
									}}
								/>
							</FormGroup>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<FormGroup>
								<Label for='deadlineDate'>Deadline Date</Label>
								<Flatpickr
									id='deadlineDate'
									className='form-control'
									value={formData.deadlineDate}
									onChange={(date) => setFormData({ ...formData, deadlineDate: date[0] })}
									options={{
										dateFormat: 'Y-m-d',
										minDate: formData.countDate || 'today'
									}}
									placeholder='Optional deadline'
								/>
							</FormGroup>
						</Col>
						<Col md={6}>
							<FormGroup>
								<Label for='assignedTo'>Assign To</Label>
								<Select
									id='assignedTo'
									theme={selectThemeColors}
									className='react-select'
									classNamePrefix='select'
									options={admins}
									isClearable
									placeholder='Select admin...'
									value={admins.find(a => a.value === formData.assignedTo)}
									onChange={(selected) => setFormData({ ...formData, assignedTo: selected?.value || null })}
								/>
							</FormGroup>
						</Col>
					</Row>

					{formData.countType === 'category' && (
						<Row>
							<Col md={12}>
								<FormGroup>
									<Label for='categoryId'>
										Category <span className='text-danger'>*</span>
									</Label>
									<Select
										id='categoryId'
										theme={selectThemeColors}
										className='react-select'
										classNamePrefix='select'
										options={categories}
										isClearable={false}
										placeholder='Select category...'
										value={categories.find(c => c.value === formData.categoryId)}
										onChange={(selected) => setFormData({ ...formData, categoryId: selected?.value })}
									/>
								</FormGroup>
							</Col>
						</Row>
					)}

					{formData.countType === 'spot' && (
						<Row>
							<Col md={12}>
								<FormGroup>
									<Label for='productIds'>
										Specific Products (Optional)
									</Label>
									<Select
										id='productIds'
										theme={selectThemeColors}
										className='react-select'
										classNamePrefix='select'
										options={products}
										isMulti
										placeholder='Leave empty for random selection...'
										value={products.filter(p => formData.productIds.includes(p.value))}
										onChange={(selected) => setFormData({ 
											...formData, 
											productIds: selected ? selected.map(s => s.value) : []
										})}
									/>
									<small className='text-muted'>
										If no products selected, system will randomly select 10% of inventory
									</small>
								</FormGroup>
							</Col>
						</Row>
					)}

					<Row>
						<Col md={12}>
							<FormGroup>
								<CustomInput
									type='checkbox'
									id='blindCount'
									label='Blind Count (Hide system quantities during counting)'
									checked={formData.blindCount}
									onChange={(e) => setFormData({ ...formData, blindCount: e.target.checked })}
								/>
								<small className='text-muted d-block mt-1'>
									Blind counting prevents bias by hiding expected quantities
								</small>
							</FormGroup>
						</Col>
					</Row>

					<Row>
						<Col md={12}>
							<FormGroup>
								<Label for='notes'>Notes</Label>
								<Input
									type='textarea'
									id='notes'
									rows={3}
									value={formData.notes}
									onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
									placeholder='Optional notes about this count...'
								/>
							</FormGroup>
						</Col>
					</Row>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={toggle} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button color='primary' type='submit' disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Spinner size='sm' className='mr-1' />
								Creating...
							</>
						) : (
							'Create Count'
						)}
					</Button>
				</ModalFooter>
			</Form>
		</Modal>
	)
}

export default CreateCountModal