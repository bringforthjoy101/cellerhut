// ** React Import
import { useState, useEffect } from 'react'

// ** Custom Components
import Sidebar from '@components/sidebar'
import AsyncSelect from 'react-select/async'

// ** Third Party Components
import { Button, FormGroup, Label, Form, Input, Row, Col, FormFeedback } from 'reactstrap'
import { Plus, X, Trash, Package } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import { selectThemeColors, apiRequest } from '@utils'

// ** Flatpickr Styles
import 'flatpickr/dist/themes/material_blue.css'

// ** Custom Styles
import './SupplyItemsStyles.css'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { createSupply, updateSupply, getAllData } from '../store/action'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const SidebarNewSupply = ({ open, toggleSidebar, selectedSupply }) => {
	// ** State
	const [suppliers, setSuppliers] = useState([])
	const [products, setProducts] = useState([])
	const [data, setData] = useState({
		supplierId: null,
		supplyDate: new Date(),
		paymentDueDate: null,
		notes: '',
		items: [
			{
				productId: null,
				quantity: 1,
				unitPrice: 0.00,
				vatRate: 15.00,
				netAmount: 0.00,
				vatAmount: 0.00,
				totalAmount: 0.00
			}
		]
	})
	const [errors, setErrors] = useState({})

	// ** Store Vars
	const dispatch = useDispatch()

	// ** Load suppliers
	const loadSuppliers = async () => {
		try {
			const response = await apiRequest({ url: '/suppliers', method: 'GET' })
			if (response?.data?.data) {
				const supplierOptions = response.data.data.map(supplier => ({
					value: supplier.id,
					label: `${supplier.name} - ${supplier.email}`,
					data: supplier
				}))
				setSuppliers(supplierOptions)
			}
		} catch (error) {
			console.error('Error loading suppliers:', error)
		}
	}

	// ** Load products
	const loadProducts = async () => {
		try {
			const response = await apiRequest({ url: '/products', method: 'GET' })
			if (response?.data?.data) {
				const productOptions = response.data.data.map(product => ({
					value: product.id,
					label: `${product.name} - ${product.sku}`,
					data: product
				}))
				setProducts(productOptions)
			}
		} catch (error) {
			console.error('Error loading products:', error)
		}
	}

	// ** Load suppliers and products on mount
	useEffect(() => {
		loadSuppliers()
		loadProducts()
	}, [])

	// ** Set data if editing
	useEffect(() => {
		if (selectedSupply) {
			setData({
				supplierId: selectedSupply.supplierId,
				supplyDate: new Date(selectedSupply.supplyDate),
				paymentDueDate: selectedSupply.paymentDueDate ? new Date(selectedSupply.paymentDueDate) : null,
				notes: selectedSupply.notes || '',
				items: selectedSupply.supply_items?.map(item => ({
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: parseFloat(item.unitPrice),
					vatRate: parseFloat(item.vatRate),
					netAmount: parseFloat(item.netAmount),
					vatAmount: parseFloat(item.vatAmount),
					totalAmount: parseFloat(item.totalAmount)
				})) || []
			})
		}
	}, [selectedSupply])

	// ** Calculate item amounts
	const calculateItemAmounts = (item) => {
		const netAmount = parseFloat(item.quantity) * parseFloat(item.unitPrice)
		const vatAmount = (netAmount * parseFloat(item.vatRate)) / 100
		const totalAmount = netAmount + vatAmount
		
		return {
			...item,
			netAmount: netAmount.toFixed(2),
			vatAmount: vatAmount.toFixed(2),
			totalAmount: totalAmount.toFixed(2)
		}
	}

	// ** Add new item
	const addItem = () => {
		setData({
			...data,
			items: [
				...data.items,
				{
					productId: null,
					quantity: 1,
					unitPrice: 0.00,
					vatRate: 15.00,
					netAmount: 0.00,
					vatAmount: 0.00,
					totalAmount: 0.00
				}
			]
		})
	}

	// ** Remove item
	const removeItem = (index) => {
		const newItems = data.items.filter((_, i) => i !== index)
		setData({ ...data, items: newItems })
	}

	// ** Update item
	const updateItem = (index, field, value) => {
		const newItems = [...data.items]
		newItems[index] = { ...newItems[index], [field]: value }
		
		// If quantity, unitPrice, or vatRate changed, recalculate amounts
		if (['quantity', 'unitPrice', 'vatRate'].includes(field)) {
			newItems[index] = calculateItemAmounts(newItems[index])
		}
		
		// If product changed, update unit price from product cost price
		if (field === 'productId') {
			const product = products.find(p => p.value === value)
			if (product?.data?.costPrice) {
				newItems[index].unitPrice = parseFloat(product.data.costPrice)
				newItems[index] = calculateItemAmounts(newItems[index])
			}
		}
		
		setData({ ...data, items: newItems })
	}

	// ** Validate form
	const validateForm = () => {
		const newErrors = {}
		
		if (!data.supplierId) {
			newErrors.supplierId = 'Supplier is required'
		}
		
		if (!data.supplyDate) {
			newErrors.supplyDate = 'Supply date is required'
		}
		
		if (data.items.length === 0) {
			newErrors.items = 'At least one item is required'
		} else {
			data.items.forEach((item, index) => {
				if (!item.productId) {
					newErrors[`item_${index}_productId`] = 'Product is required'
				}
				if (!item.quantity || parseInt(item.quantity) <= 0 || !Number.isInteger(parseFloat(item.quantity))) {
					newErrors[`item_${index}_quantity`] = 'Quantity must be a positive whole number'
				}
				if (item.unitPrice === undefined || item.unitPrice === '' || parseFloat(item.unitPrice) < 0) {
					newErrors[`item_${index}_unitPrice`] = 'Unit price must be 0 or greater'
				}
				if (item.vatRate !== undefined && item.vatRate !== '' && (parseFloat(item.vatRate) < 0 || parseFloat(item.vatRate) > 100)) {
					newErrors[`item_${index}_vatRate`] = 'VAT rate must be between 0 and 100'
				}
			})
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// ** Calculate totals
	const calculateTotals = () => {
		const totals = data.items.reduce((acc, item) => {
			acc.netAmount += parseFloat(item.netAmount || 0)
			acc.vatAmount += parseFloat(item.vatAmount || 0)
			acc.totalAmount += parseFloat(item.totalAmount || 0)
			return acc
		}, { netAmount: 0, vatAmount: 0, totalAmount: 0 })
		
		return totals
	}

	// ** Function to handle form reset
	const handleReset = () => {
		setData({
			supplierId: null,
			supplyDate: new Date(),
			paymentDueDate: null,
			notes: '',
			items: [
				{
					productId: null,
					quantity: 1,
					unitPrice: 0.00,
					vatRate: 15.00,
					netAmount: 0.00,
					vatAmount: 0.00,
					totalAmount: 0.00
				}
			]
		})
		setErrors({})
	}

	// ** Function to handle form submit
	const onSubmit = async (e) => {
		e.preventDefault()
		
		if (!validateForm()) {
			return
		}

		const submitData = {
			supplierId: data.supplierId,
			supplyDate: data.supplyDate ? new Date(data.supplyDate).toISOString() : new Date().toISOString(),
			paymentDueDate: data.paymentDueDate ? new Date(data.paymentDueDate).toISOString() : null,
			notes: data.notes || '',
			items: data.items.map(item => ({
				productId: parseInt(item.productId),
				quantity: parseInt(item.quantity),
				unitPrice: parseFloat(item.unitPrice),
				vatRate: item.vatRate !== undefined && item.vatRate !== '' ? parseFloat(item.vatRate) : 15.00
			}))
		}

		try {
			let result
			if (selectedSupply) {
				result = await dispatch(updateSupply(selectedSupply.id, submitData))
			} else {
				result = await dispatch(createSupply(submitData))
			}
			
			if (result) {
				MySwal.fire({
					icon: 'success',
					title: selectedSupply ? 'Supply Updated!' : 'Supply Created!',
					text: selectedSupply ? 'Supply has been updated successfully.' : 'Supply has been created successfully.',
					customClass: {
						confirmButton: 'btn btn-primary'
					}
				})
				
				dispatch(getAllData())
				toggleSidebar()
				handleReset()
			}
		} catch (error) {
			MySwal.fire({
				icon: 'error',
				title: 'Error!',
				text: error.message || 'Something went wrong',
				customClass: {
					confirmButton: 'btn btn-primary'
				}
			})
		}
	}

	const totals = calculateTotals()

	return (
		<Sidebar
			size="xl"
			open={open}
			title={selectedSupply ? 'Edit Supply' : 'New Supply'}
			headerClassName="mb-1"
			contentClassName="pt-0"
			toggleSidebar={toggleSidebar}
		>
			<Form onSubmit={onSubmit}>
				<Row>
					<Col md={6}>
						<FormGroup>
							<Label for="supplierId">
								Supplier <span className="text-danger">*</span>
							</Label>
							<Select
								id="supplierId"
								theme={selectThemeColors}
								className="react-select"
								classNamePrefix="select"
								options={suppliers}
								isClearable={false}
								value={suppliers.find(s => s.value === data.supplierId)}
								onChange={(selected) => setData({ ...data, supplierId: selected?.value })}
								invalid={errors.supplierId}
							/>
							{errors.supplierId && <FormFeedback className="d-block">{errors.supplierId}</FormFeedback>}
						</FormGroup>
					</Col>
					<Col md={6}>
						<FormGroup>
							<Label for="supplyDate">
								Supply Date <span className="text-danger">*</span>
							</Label>
							<Flatpickr
								id="supplyDate"
								className={`form-control ${errors.supplyDate ? 'is-invalid' : ''}`}
								value={data.supplyDate}
								onChange={(date) => setData({ ...data, supplyDate: date[0] })}
								options={{ 
									dateFormat: 'Y-m-d',
									static: true,
									position: 'auto center'
								}}
							/>
							{errors.supplyDate && <FormFeedback>{errors.supplyDate}</FormFeedback>}
						</FormGroup>
					</Col>
				</Row>

				<Row>
					<Col md={6}>
						<FormGroup>
							<Label for="paymentDueDate">Payment Due Date</Label>
							<Flatpickr
								id="paymentDueDate"
								className="form-control"
								value={data.paymentDueDate}
								onChange={(date) => setData({ ...data, paymentDueDate: date[0] || null })}
								options={{ 
									dateFormat: 'Y-m-d',
									static: true,
									position: 'auto center'
								}}
							/>
						</FormGroup>
					</Col>
					<Col md={6}>
						<FormGroup>
							<Label for="notes">Notes</Label>
							<Input
								type="textarea"
								name="notes"
								id="notes"
								rows="2"
								value={data.notes}
								onChange={(e) => setData({ ...data, notes: e.target.value })}
								placeholder="Additional notes..."
							/>
						</FormGroup>
					</Col>
				</Row>

				<div className="divider divider-left">
					<div className="divider-text">Supply Items</div>
				</div>

				{/* Supply Items Table Header */}
				<div className="supply-items-container">
					{data.items.length > 0 ? (
						<>
							<div className="d-none d-md-block">
								<Row className="border-bottom pb-2 mb-2">
									<Col md={5}>
										<small className="text-muted fw-bold">Product</small>
									</Col>
									<Col md={1} className="text-center">
										<small className="text-muted fw-bold">Qty</small>
									</Col>
									<Col md={2} className="text-center">
										<small className="text-muted fw-bold">Unit Price</small>
									</Col>
									<Col md={1} className="text-center">
										<small className="text-muted fw-bold">VAT %</small>
									</Col>
									<Col md={2} className="text-end">
										<small className="text-muted fw-bold">Total</small>
									</Col>
									<Col md={1}></Col>
								</Row>
							</div>

							{/* Supply Items */}
							<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
								{data.items.map((item, index) => (
							<div key={index} className={`supply-item mb-2 p-2 ${index % 2 === 0 ? 'bg-light' : ''} rounded`}>
								<Row className="align-items-center">
									<Col xs={12} md={5} className="mb-2 mb-md-0">
										<Label for={`product-${index}`} className="d-md-none">
											Product <span className="text-danger">*</span>
										</Label>
										<Select
											id={`product-${index}`}
											theme={selectThemeColors}
											className="react-select"
											classNamePrefix="select"
											options={products}
											isClearable={false}
											value={products.find(p => p.value === item.productId)}
											onChange={(selected) => updateItem(index, 'productId', selected?.value)}
											placeholder="Select product..."
										/>
										{errors[`item_${index}_productId`] && (
											<FormFeedback className="d-block">{errors[`item_${index}_productId`]}</FormFeedback>
										)}
									</Col>
									<Col xs={6} md={1} className="mb-2 mb-md-0">
										<Label for={`quantity-${index}`} className="d-md-none">
											Qty <span className="text-danger">*</span>
										</Label>
										<Input
											type="number"
											id={`quantity-${index}`}
											value={item.quantity}
											onChange={(e) => updateItem(index, 'quantity', e.target.value)}
											min="1"
											className="text-center"
											invalid={errors[`item_${index}_quantity`]}
										/>
										{errors[`item_${index}_quantity`] && (
											<FormFeedback>{errors[`item_${index}_quantity`]}</FormFeedback>
										)}
									</Col>
									<Col xs={6} md={2} className="mb-2 mb-md-0">
										<Label for={`unitPrice-${index}`} className="d-md-none">
											Unit Price <span className="text-danger">*</span>
										</Label>
										<div className="input-group">
											<span className="input-group-text">R</span>
											<Input
												type="number"
												id={`unitPrice-${index}`}
												value={item.unitPrice}
												onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
												min="0"
												step="0.01"
												className="text-center"
												invalid={errors[`item_${index}_unitPrice`]}
											/>
										</div>
										{errors[`item_${index}_unitPrice`] && (
											<FormFeedback className="d-block">{errors[`item_${index}_unitPrice`]}</FormFeedback>
										)}
									</Col>
									<Col xs={6} md={1} className="mb-2 mb-md-0">
										<Label for={`vatRate-${index}`} className="d-md-none">VAT %</Label>
										<Input
											type="number"
											id={`vatRate-${index}`}
											value={item.vatRate}
											onChange={(e) => updateItem(index, 'vatRate', e.target.value)}
											min="0"
											max="100"
											step="0.01"
											className="text-center"
											invalid={errors[`item_${index}_vatRate`]}
										/>
										{errors[`item_${index}_vatRate`] && <FormFeedback>{errors[`item_${index}_vatRate`]}</FormFeedback>}
									</Col>
									<Col xs={6} md={2} className="mb-2 mb-md-0">
										<Label className="d-md-none">Total</Label>
										<div className="text-end fw-bold">
											<span className="text-primary">R{item.totalAmount}</span>
											<div className="small text-muted">
												<small>Net: R{item.netAmount}</small>
											</div>
										</div>
									</Col>
									<Col xs={12} md={1} className="text-center text-md-end">
										{data.items.length > 1 && (
											<Button
												color="danger"
												size="sm"
												className="btn-icon"
												onClick={() => removeItem(index)}
												title="Remove item"
											>
												<Trash size={14} />
											</Button>
										)}
									</Col>
								</Row>
							</div>
						))}
					</div>
						</>
					) : (
						<div className="supply-items-empty">
							<Package size={48} />
							<h5>No items added yet</h5>
							<p className="text-muted">Click "Add Item" below to start adding products to this supply</p>
						</div>
					)}
				</div>

				<Button color="primary" size="sm" onClick={addItem} className="mb-2 mt-2">
					<Plus size={14} className="me-1" />
					Add Item
				</Button>

				<div className="border-top pt-3 mt-3 bg-light rounded p-3">
					<Row>
						<Col xs={6} md={8} className="text-end">
							<strong>Net Amount:</strong>
						</Col>
						<Col xs={6} md={4} className="text-end">
							<span>R{totals.netAmount.toFixed(2)}</span>
						</Col>
					</Row>
					<Row className="mt-1">
						<Col xs={6} md={8} className="text-end">
							<strong>VAT Amount:</strong>
						</Col>
						<Col xs={6} md={4} className="text-end">
							<span className="text-warning">R{totals.vatAmount.toFixed(2)}</span>
						</Col>
					</Row>
					<hr className="my-2" />
					<Row>
						<Col xs={6} md={8} className="text-end">
							<h5 className="mb-0">Total Amount:</h5>
						</Col>
						<Col xs={6} md={4} className="text-end">
							<h5 className="mb-0 text-primary">R{totals.totalAmount.toFixed(2)}</h5>
						</Col>
					</Row>
				</div>

				<div className="d-flex justify-content-between mt-2">
					<Button color="secondary" onClick={handleReset} outline>
						Reset
					</Button>
					<div>
						<Button color="secondary" className="me-1" onClick={toggleSidebar} outline>
							Cancel
						</Button>
						<Button type="submit" color="primary">
							{selectedSupply ? 'Update' : 'Create'}
						</Button>
					</div>
				</div>
			</Form>
		</Sidebar>
	)
}

export default SidebarNewSupply