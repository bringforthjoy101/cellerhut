import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Button,
	Badge,
	Progress,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Table,
	Alert,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	FormGroup,
	Label,
	CustomInput,
	Spinner
} from 'reactstrap'
import {
	Save,
	Check,
	X,
	AlertCircle,
	Search,
	Package,
	BarChart,
	Eye,
	EyeOff,
	Clipboard,
	Camera
} from 'react-feather'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { getCountDetail, recordCount, bulkRecordCounts, updateCountStatus } from '../store/action'

const MySwal = withReactContent(Swal)

const CountSheet = () => {
	const dispatch = useDispatch()
	const history = useHistory()
	const { id } = useParams()
	const store = useSelector(state => state.inventoryCount)
	
	// ** States
	const [searchTerm, setSearchTerm] = useState('')
	const [showSystemQty, setShowSystemQty] = useState(true)
	const [editingItem, setEditingItem] = useState(null)
	const [countedItems, setCountedItems] = useState({})
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [savingItem, setSavingItem] = useState(null)
	const [scannerModal, setScannerModal] = useState(false)
	const [currentScanItem, setCurrentScanItem] = useState(null)

	// ** Load count details
	useEffect(() => {
		if (id) {
			dispatch(getCountDetail(id))
		}
	}, [dispatch, id])

	// ** Initialize counted items from store
	useEffect(() => {
		if (store.countDetail?.count?.countItems) {
			const initialCounts = {}
			store.countDetail.count.countItems.forEach(item => {
				if (item.countedQty !== null) {
					initialCounts[item.id] = {
						countedQty: item.countedQty,
						notes: item.notes || '',
						countMethod: item.countMethod || 'manual',
						itemCondition: item.itemCondition || 'good'
					}
				}
			})
			setCountedItems(initialCounts)
		}
	}, [store.countDetail])

	// ** Handle blind count setting
	useEffect(() => {
		if (store.countDetail?.count?.blindCount) {
			setShowSystemQty(false)
		}
	}, [store.countDetail])

	// ** Filter items based on search
	const filteredItems = store.countDetail?.count?.countItems?.filter(item => {
		const searchLower = searchTerm.toLowerCase()
		return (
			item.product?.name?.toLowerCase().includes(searchLower) ||
			item.product?.sku?.toLowerCase().includes(searchLower) ||
			item.product?.barcode?.includes(searchTerm)
		)
	}) || []

	// ** Calculate progress
	const totalItems = store.countDetail?.count?.totalItems || 0
	const countedItemsCount = Object.keys(countedItems).length
	const progress = totalItems > 0 ? Math.round((countedItemsCount / totalItems) * 100) : 0

	// ** Handle count input
	const handleCountInput = (itemId, value, field = 'countedQty') => {
		setCountedItems(prev => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				[field]: field === 'countedQty' ? parseInt(value) || 0 : value
			}
		}))
		setHasUnsavedChanges(true)
	}

	// ** Save single item count
	const handleSaveItem = async (itemId) => {
		if (!countedItems[itemId]) return
		
		setSavingItem(itemId)
		try {
			const result = await dispatch(recordCount(id, itemId, countedItems[itemId]))
			if (result) {
				MySwal.fire({
					icon: 'success',
					title: 'Saved!',
					text: 'Count recorded successfully',
					showConfirmButton: false,
					timer: 1000
				})
				setEditingItem(null)
			}
		} catch (error) {
			MySwal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to save count'
			})
		} finally {
			setSavingItem(null)
		}
	}

	// ** Save all counts
	const handleSaveAll = async () => {
		const itemsToSave = Object.entries(countedItems).map(([itemId, data]) => ({
			itemId: parseInt(itemId),
			...data
		}))

		if (itemsToSave.length === 0) {
			MySwal.fire({
				icon: 'warning',
				title: 'No counts to save',
				text: 'Please enter at least one count before saving'
			})
			return
		}

		MySwal.fire({
			title: 'Save All Counts?',
			text: `Save ${itemsToSave.length} counted items?`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Yes, save all',
			cancelButtonText: 'Cancel'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const saveResult = await dispatch(bulkRecordCounts(id, itemsToSave))
				if (saveResult) {
					MySwal.fire({
						icon: 'success',
						title: 'Success!',
						text: 'All counts saved successfully',
						showConfirmButton: false,
						timer: 1500
					})
					setHasUnsavedChanges(false)
					// Refresh count details
					dispatch(getCountDetail(id))
				}
			}
		})
	}

	// ** Submit for review
	const handleSubmitForReview = () => {
		MySwal.fire({
			title: 'Submit for Review?',
			text: 'This will mark the count as ready for review and variance analysis',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Yes, submit',
			cancelButtonText: 'Cancel'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const updateResult = await dispatch(updateCountStatus(id, 'review'))
				if (updateResult) {
					MySwal.fire({
						icon: 'success',
						title: 'Submitted!',
						text: 'Count submitted for review',
						showConfirmButton: false,
						timer: 1500
					})
					history.push(`/inventory/counts/${id}/variance`)
				}
			}
		})
	}

	// ** Scanner modal handler (placeholder for barcode scanning)
	const handleScan = (item) => {
		setCurrentScanItem(item)
		setScannerModal(true)
		// In production, integrate with barcode scanner library
	}

	// ** Quick count buttons
	const QuickCountButtons = ({ itemId, currentValue }) => (
		<div className='d-flex'>
			<Button
				size='sm'
				color='light'
				className='mr-1'
				onClick={() => handleCountInput(itemId, (currentValue || 0) - 1)}
			>
				-1
			</Button>
			<Button
				size='sm'
				color='light'
				className='mr-1'
				onClick={() => handleCountInput(itemId, (currentValue || 0) + 1)}
			>
				+1
			</Button>
			<Button
				size='sm'
				color='light'
				className='mr-1'
				onClick={() => handleCountInput(itemId, (currentValue || 0) + 10)}
			>
				+10
			</Button>
			<Button
				size='sm'
				color='light'
				onClick={() => handleCountInput(itemId, 0)}
			>
				Clear
			</Button>
		</div>
	)

	if (!store.countDetail) {
		return (
			<div className='text-center p-5'>
				<Spinner />
				<div className='mt-2'>Loading count sheet...</div>
			</div>
		)
	}

	const { count, summary } = store.countDetail

	return (
		<Fragment>
			{/* Header */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>
								Count Sheet - {count.countNumber}
							</CardTitle>
							<div className='d-flex align-items-center'>
								<Badge color={count.blindCount ? 'warning' : 'info'} className='mr-2'>
									{count.blindCount ? 'Blind Count' : 'Standard Count'}
								</Badge>
								<Button
									color='link'
									size='sm'
									onClick={() => setShowSystemQty(!showSystemQty)}
									disabled={count.blindCount}
								>
									{showSystemQty ? <EyeOff size={16} /> : <Eye size={16} />}
									{showSystemQty ? 'Hide' : 'Show'} System Qty
								</Button>
							</div>
						</CardHeader>
						<CardBody>
							<Row>
								<Col md='8'>
									<div className='d-flex align-items-center mb-2'>
										<Package className='mr-2' />
										<div>
											<h6 className='mb-0'>Progress: {countedItemsCount} / {totalItems} items counted</h6>
											<Progress value={progress} className='mt-1' style={{ height: '8px' }}>
												{progress}%
											</Progress>
										</div>
									</div>
								</Col>
								<Col md='4' className='text-right'>
									{hasUnsavedChanges && (
										<Badge color='warning' className='mr-2'>
											<AlertCircle size={12} className='mr-1' />
											Unsaved Changes
										</Badge>
									)}
									<Button
										color='success'
										className='mr-1'
										onClick={handleSaveAll}
										disabled={!hasUnsavedChanges}
									>
										<Save size={14} className='mr-50' />
										Save All
									</Button>
									{progress === 100 && (
										<Button
											color='primary'
											onClick={handleSubmitForReview}
										>
											Submit for Review
										</Button>
									)}
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Search and filters */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<Row>
								<Col md='6'>
									<InputGroup>
										<InputGroupAddon addonType='prepend'>
											<InputGroupText>
												<Search size={14} />
											</InputGroupText>
										</InputGroupAddon>
										<Input
											type='text'
											placeholder='Search by product name, SKU, or barcode...'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
										/>
									</InputGroup>
								</Col>
								<Col md='6' className='text-right'>
									<Button
										color='secondary'
										outline
										onClick={() => history.push(`/inventory/counts/${id}`)}
									>
										<BarChart size={14} className='mr-50' />
										View Summary
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Count items table */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<Table responsive hover>
								<thead>
									<tr>
										<th>Product</th>
										<th>SKU</th>
										<th>Unit</th>
										{showSystemQty && <th>System Qty</th>}
										<th>Counted Qty</th>
										<th>Condition</th>
										<th>Notes</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredItems.map(item => (
										<tr key={item.id} className={item.status === 'counted' ? 'bg-light' : ''}>
											<td>
												<div>
													<span className='font-weight-bold'>{item.product?.name}</span>
													{item.product?.barcode && (
														<div>
															<small className='text-muted'>Barcode: {item.product.barcode}</small>
														</div>
													)}
												</div>
											</td>
											<td>{item.product?.sku}</td>
											<td>{item.product?.unit}</td>
											{showSystemQty && (
												<td>
													<Badge color='light-primary'>{item.systemQty}</Badge>
												</td>
											)}
											<td style={{ minWidth: '150px' }}>
												{editingItem === item.id ? (
													<Input
														type='number'
														min='0'
														value={countedItems[item.id]?.countedQty || ''}
														onChange={(e) => handleCountInput(item.id, e.target.value)}
														autoFocus
													/>
												) : (
													<div className='d-flex align-items-center'>
														<span className='mr-2'>
															{countedItems[item.id]?.countedQty ?? '-'}
														</span>
														{item.status === 'counted' && (
															<Check size={16} className='text-success' />
														)}
													</div>
												)}
											</td>
											<td>
												{editingItem === item.id ? (
													<Input
														type='select'
														size='sm'
														value={countedItems[item.id]?.itemCondition || 'good'}
														onChange={(e) => handleCountInput(item.id, e.target.value, 'itemCondition')}
													>
														<option value='good'>Good</option>
														<option value='damaged'>Damaged</option>
														<option value='expired'>Expired</option>
														<option value='not_found'>Not Found</option>
													</Input>
												) : (
													<Badge color={
														countedItems[item.id]?.itemCondition === 'good' ? 'success' :
														countedItems[item.id]?.itemCondition === 'damaged' ? 'warning' :
														countedItems[item.id]?.itemCondition === 'expired' ? 'danger' :
														'secondary'
													}>
														{countedItems[item.id]?.itemCondition || 'N/A'}
													</Badge>
												)}
											</td>
											<td style={{ minWidth: '200px' }}>
												{editingItem === item.id ? (
													<Input
														type='text'
														size='sm'
														placeholder='Optional notes...'
														value={countedItems[item.id]?.notes || ''}
														onChange={(e) => handleCountInput(item.id, e.target.value, 'notes')}
													/>
												) : (
													<small>{countedItems[item.id]?.notes || '-'}</small>
												)}
											</td>
											<td>
												{editingItem === item.id ? (
													<div className='d-flex'>
														<Button
															color='success'
															size='sm'
															className='mr-1'
															onClick={() => handleSaveItem(item.id)}
															disabled={savingItem === item.id}
														>
															{savingItem === item.id ? (
																<Spinner size='sm' />
															) : (
																<Check size={14} />
															)}
														</Button>
														<Button
															color='secondary'
															size='sm'
															onClick={() => {
																setEditingItem(null)
																// Reset to original value
																const original = store.countDetail.count.countItems.find(i => i.id === item.id)
																if (original.countedQty !== null) {
																	setCountedItems(prev => ({
																		...prev,
																		[item.id]: {
																			countedQty: original.countedQty,
																			notes: original.notes || '',
																			countMethod: original.countMethod || 'manual',
																			itemCondition: original.itemCondition || 'good'
																		}
																	}))
																} else {
																	setCountedItems(prev => {
																		const newItems = { ...prev }
																		delete newItems[item.id]
																		return newItems
																	})
																}
															}}
														>
															<X size={14} />
														</Button>
													</div>
												) : (
													<div>
														<Button
															color='primary'
															size='sm'
															className='mr-1'
															onClick={() => setEditingItem(item.id)}
														>
															Count
														</Button>
														<Button
															color='light'
															size='sm'
															onClick={() => handleScan(item)}
														>
															<Camera size={14} />
														</Button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>
							{filteredItems.length === 0 && (
								<div className='text-center p-4'>
									<Package size={48} className='text-muted mb-2' />
									<p>No items found matching your search</p>
								</div>
							)}
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Scanner Modal (Placeholder) */}
			<Modal isOpen={scannerModal} toggle={() => setScannerModal(!scannerModal)}>
				<ModalHeader toggle={() => setScannerModal(!scannerModal)}>
					Barcode Scanner
				</ModalHeader>
				<ModalBody>
					<Alert color='info'>
						<AlertCircle size={14} className='mr-1' />
						Barcode scanning feature coming soon!
					</Alert>
					<p>Product: {currentScanItem?.product?.name}</p>
					<p>Barcode: {currentScanItem?.product?.barcode || 'No barcode'}</p>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={() => setScannerModal(false)}>
						Close
					</Button>
				</ModalFooter>
			</Modal>
		</Fragment>
	)
}

export default CountSheet