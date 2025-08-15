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
	Table,
	Alert,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	FormGroup,
	Label,
	Input,
	Progress,
	Spinner
} from 'reactstrap'
import {
	AlertTriangle,
	CheckCircle,
	XCircle,
	TrendingUp,
	TrendingDown,
	Package,
	DollarSign,
	FileText,
	ThumbsUp,
	X,
	Eye,
	Download
} from 'react-feather'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment'
import { getVarianceReport, approveCount, updateCountStatus } from '../store/action'
import { exportToExcel, exportToCSV, exportToPDF, formatVarianceDataForExport } from '../../../../utility/exportUtils'

const MySwal = withReactContent(Swal)

const VarianceReview = () => {
	const dispatch = useDispatch()
	const history = useHistory()
	const { id } = useParams()
	const store = useSelector(state => state.inventoryCount)
	
	// ** States
	const [approvalModal, setApprovalModal] = useState(false)
	const [selectedVariances, setSelectedVariances] = useState([])
	const [approvalNotes, setApprovalNotes] = useState('')
	const [isApproving, setIsApproving] = useState(false)
	const [filterCategory, setFilterCategory] = useState('all')
	const [sortBy, setSortBy] = useState('variance_value')
	const [viewMode, setViewMode] = useState('table')

	// ** Load variance report
	useEffect(() => {
		if (id) {
			dispatch(getVarianceReport(id))
		}
	}, [dispatch, id])

	// ** Filter variances by category
	const getFilteredVariances = () => {
		if (!store.varianceReport?.variances) return []
		
		let filtered = store.varianceReport.variances
		
		if (filterCategory !== 'all') {
			filtered = filtered.filter(v => v.varianceCategory === filterCategory)
		}

		// Sort variances
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'variance_value':
					return Math.abs(b.varianceValue || 0) - Math.abs(a.varianceValue || 0)
				case 'variance_percent':
					return Math.abs(b.variancePercent || 0) - Math.abs(a.variancePercent || 0)
				case 'product_name':
					const nameA = a.product?.name || 'Unknown'
					const nameB = b.product?.name || 'Unknown'
					return nameA.localeCompare(nameB)
				default:
					return 0
			}
		})

		return filtered
	}

	// ** Handle approve selected
	const handleApproveSelected = async () => {
		if (selectedVariances.length === 0) {
			MySwal.fire({
				icon: 'warning',
				title: 'No Items Selected',
				text: 'Please select items to approve'
			})
			return
		}

		setIsApproving(true)
		try {
			const result = await dispatch(approveCount(id, {
				itemIds: selectedVariances,
				notes: approvalNotes,
				approveAll: false
			}))
			
			if (result) {
				MySwal.fire({
					icon: 'success',
					title: 'Approved!',
					text: `${selectedVariances.length} adjustments approved successfully`,
					showConfirmButton: false,
					timer: 1500
				})
				setApprovalModal(false)
				setSelectedVariances([])
				setApprovalNotes('')
				// Refresh variance report
				dispatch(getVarianceReport(id))
			}
		} catch (error) {
			MySwal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to approve adjustments'
			})
		} finally {
			setIsApproving(false)
		}
	}

	// ** Handle approve all
	const handleApproveAll = () => {
		MySwal.fire({
			title: 'Approve All Adjustments?',
			html: `
				<p>This will approve all ${store.varianceReport?.variances?.length || 0} adjustments.</p>
				<p class="text-danger">Stock levels will be updated immediately.</p>
			`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, approve all',
			cancelButtonText: 'Cancel',
			confirmButtonColor: '#28a745',
			cancelButtonColor: '#6c757d'
		}).then(async (result) => {
			if (result.isConfirmed) {
				setIsApproving(true)
				try {
					const approveResult = await dispatch(approveCount(id, {
						approveAll: true,
						notes: 'Bulk approval of all variances'
					}))
					
					if (approveResult) {
						MySwal.fire({
							icon: 'success',
							title: 'Success!',
							text: 'All adjustments approved and stock updated',
							showConfirmButton: false,
							timer: 2000
						})
						// Navigate to count detail
						history.push(`/inventory/counts/${id}`)
					}
				} catch (error) {
					MySwal.fire({
						icon: 'error',
						title: 'Error',
						text: 'Failed to approve adjustments'
					})
				} finally {
					setIsApproving(false)
				}
			}
		})
	}

	// ** Handle reject count
	const handleRejectCount = () => {
		MySwal.fire({
			title: 'Reject Count?',
			text: 'This will send the count back for recounting',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Yes, reject',
			cancelButtonText: 'Cancel',
			confirmButtonColor: '#dc3545'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const updateResult = await dispatch(updateCountStatus(id, 'in_progress'))
				if (updateResult) {
					MySwal.fire({
						icon: 'info',
						title: 'Count Rejected',
						text: 'Count sent back for recounting',
						showConfirmButton: false,
						timer: 1500
					})
					history.push(`/inventory/counts/${id}/count-sheet`)
				}
			}
		})
	}

	// ** Export variance report
	const handleExportReport = (format = 'excel') => {
		const { count, summary } = store.varianceReport || {}
		const filteredVariances = getFilteredVariances()
		
		if (!store.varianceReport || !filteredVariances.length) {
			MySwal.fire({
				icon: 'warning',
				title: 'No Data',
				text: 'No variance data available to export'
			})
			return
		}

		const exportData = formatVarianceDataForExport({
			count,
			summary,
			variances: filteredVariances
		})

		if (format === 'excel') {
			// Export to Excel with multiple sheets
			const sheets = [
				{
					name: 'Summary',
					data: [
						{ Metric: 'Count Number', Value: count.countNumber },
						{ Metric: 'Count Date', Value: moment(count.countDate).format('YYYY-MM-DD') },
						{ Metric: 'Total Items', Value: summary.totalItems },
						{ Metric: 'Items with Variance', Value: summary.itemsWithVariance },
						{ Metric: 'Total Variance Value', Value: `R ${Math.abs(summary.totalVarianceValue || 0).toFixed(2)}` },
						{ Metric: 'Accuracy', Value: `${summary.accuracyPercent || 0}%` },
						{ Metric: 'Minor Variances', Value: summary.variancesByCategory?.minor || 0 },
						{ Metric: 'Moderate Variances', Value: summary.variancesByCategory?.moderate || 0 },
						{ Metric: 'Major Variances', Value: summary.variancesByCategory?.major || 0 }
					]
				},
				{
					name: 'Variance Details',
					data: exportData
				}
			]
			
			const result = exportToExcel(null, `VarianceReport_${count.countNumber}_${moment().format('YYYYMMDD')}`, sheets)
			if (result.success) {
				MySwal.fire({
					icon: 'success',
					title: 'Export Successful',
					text: `Report exported as ${result.filename}`,
					showConfirmButton: false,
					timer: 2000
				})
			}
		} else if (format === 'csv') {
			const result = exportToCSV(exportData, `VarianceReport_${count.countNumber}_${moment().format('YYYYMMDD')}`)
			if (result.success) {
				MySwal.fire({
					icon: 'success',
					title: 'Export Successful',
					text: `Report exported as ${result.filename}`,
					showConfirmButton: false,
					timer: 2000
				})
			}
		} else if (format === 'pdf') {
			// Generate PDF content
			const pdfContent = `
				<div class="header">
					<h1>Variance Report - ${count.countNumber}</h1>
					<p>Count Date: ${moment(count.countDate).format('MMMM DD, YYYY')}</p>
				</div>
				
				<div class="summary-card">
					<h2>Summary</h2>
					<table>
						<tr><td><strong>Total Items:</strong></td><td>${summary.totalItems}</td></tr>
						<tr><td><strong>Items with Variance:</strong></td><td>${summary.itemsWithVariance}</td></tr>
						<tr><td><strong>Total Variance Value:</strong></td><td class="${(summary.totalVarianceValue || 0) >= 0 ? 'text-success' : 'text-danger'}">R ${Math.abs(summary.totalVarianceValue || 0).toFixed(2)}</td></tr>
						<tr><td><strong>Accuracy:</strong></td><td>${summary.accuracyPercent || 0}%</td></tr>
					</table>
				</div>
				
				<h2>Variance Categories</h2>
				<table>
					<tr>
						<td><span class="badge badge-success">Minor</span></td>
						<td>${summary.variancesByCategory?.minor || 0}</td>
					</tr>
					<tr>
						<td><span class="badge badge-warning">Moderate</span></td>
						<td>${summary.variancesByCategory?.moderate || 0}</td>
					</tr>
					<tr>
						<td><span class="badge badge-danger">Major</span></td>
						<td>${summary.variancesByCategory?.major || 0}</td>
					</tr>
				</table>
				
				<h2>Variance Details</h2>
				<table>
					<thead>
						<tr>
							<th>Product</th>
							<th>SKU</th>
							<th>System Qty</th>
							<th>Counted Qty</th>
							<th>Variance</th>
							<th>Value</th>
							<th>Category</th>
						</tr>
					</thead>
					<tbody>
						${exportData.map(item => `
							<tr>
								<td>${item['Product Name']}</td>
								<td>${item['SKU']}</td>
								<td>${item['System Quantity']}</td>
								<td>${item['Counted Quantity']}</td>
								<td>${item['Variance Quantity']}</td>
								<td>${item['Variance Value']}</td>
								<td><span class="badge badge-${item['Category'] === 'minor' ? 'success' : item['Category'] === 'moderate' ? 'warning' : 'danger'}">${item['Category']}</span></td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			`
			
			const result = exportToPDF(`Variance Report - ${count.countNumber}`, pdfContent, { orientation: 'landscape' })
			if (result.success) {
				MySwal.fire({
					icon: 'success',
					title: 'PDF Export',
					text: 'Print dialog will open for PDF export',
					showConfirmButton: false,
					timer: 2000
				})
			}
		}
	}

	// ** Toggle variance selection
	const toggleVarianceSelection = (itemId) => {
		setSelectedVariances(prev => {
			if (prev.includes(itemId)) {
				return prev.filter(id => id !== itemId)
			}
			return [...prev, itemId]
		})
	}

	// ** Select all variances in category
	const selectAllInCategory = () => {
		const filtered = getFilteredVariances()
		const allIds = filtered.map(v => v.id)
		setSelectedVariances(allIds)
	}

	if (!store.varianceReport) {
		return (
			<div className='text-center p-5'>
				<Spinner />
				<div className='mt-2'>Loading variance report...</div>
			</div>
		)
	}

	const { count, summary, variances } = store.varianceReport
	const filteredVariances = getFilteredVariances()

	// ** Variance category badges
	const getCategoryBadge = (category) => {
		const badges = {
			minor: { color: 'success', icon: CheckCircle },
			moderate: { color: 'warning', icon: AlertTriangle },
			major: { color: 'danger', icon: XCircle }
		}
		const badge = badges[category] || badges.minor
		const Icon = badge.icon
		
		return (
			<Badge color={badge.color} pill className='d-flex align-items-center'>
				<Icon size={12} className='mr-25' />
				{category}
			</Badge>
		)
	}

	// ** Variance value display
	const getVarianceDisplay = (variance) => {
		const isPositive = variance.varianceQty > 0
		const Icon = isPositive ? TrendingUp : TrendingDown
		const color = isPositive ? 'text-success' : 'text-danger'
		
		return (
			<div className={`d-flex align-items-center ${color}`}>
				<Icon size={16} className='mr-1' />
				<div>
					<div className='font-weight-bold'>
						{isPositive ? '+' : ''}{variance.varianceQty} units
					</div>
					<small>R {Math.abs(variance.varianceValue).toFixed(2)}</small>
				</div>
			</div>
		)
	}

	return (
		<Fragment>
			{/* Header */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>
								Variance Review - {count.countNumber}
							</CardTitle>
							<div className='d-flex align-items-center'>
								<Badge color='info' className='mr-2'>
									{count.status}
								</Badge>
								<Button
									color='success'
									className='mr-1'
									onClick={() => setApprovalModal(true)}
									disabled={selectedVariances.length === 0}
								>
									<ThumbsUp size={14} className='mr-50' />
									Approve Selected ({selectedVariances.length})
								</Button>
								<Button
									color='primary'
									className='mr-1'
									onClick={handleApproveAll}
								>
									Approve All
								</Button>
								<Button
									color='danger'
									outline
									className='mr-1'
									onClick={handleRejectCount}
								>
									<X size={14} className='mr-50' />
									Reject
								</Button>
								<Button.Ripple
									color='success'
									outline
									className='mr-1'
									onClick={() => handleExportReport('excel')}
								>
									<Download size={14} className='mr-50' />
									Excel
								</Button.Ripple>
								<Button.Ripple
									color='info'
									outline
									className='mr-1'
									onClick={() => handleExportReport('csv')}
								>
									<Download size={14} className='mr-50' />
									CSV
								</Button.Ripple>
								<Button.Ripple
									color='danger'
									outline
									onClick={() => handleExportReport('pdf')}
								>
									<FileText size={14} className='mr-50' />
									PDF
								</Button.Ripple>
							</div>
						</CardHeader>
					</Card>
				</Col>
			</Row>

			{/* Summary Cards */}
			<Row>
				<Col lg='3' md='6'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-primary mr-2'>
									<Package size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Items</h6>
									<h4 className='mb-0'>{summary.totalItems}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-warning mr-2'>
									<AlertTriangle size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Items with Variance</h6>
									<h4 className='mb-0'>{summary.itemsWithVariance}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-danger mr-2'>
									<DollarSign size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Variance</h6>
									<h4 className={`mb-0 ${(summary.totalVarianceValue || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
										R {Math.abs(summary.totalVarianceValue || 0).toFixed(2)}
									</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-info mr-2'>
									<TrendingUp size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Accuracy</h6>
									<h4 className='mb-0'>{summary.accuracyPercent || 0}%</h4>
								</div>
							</div>
							<Progress 
								value={summary.accuracyPercent || 0} 
								color={(summary.accuracyPercent || 0) >= 95 ? 'success' : (summary.accuracyPercent || 0) >= 90 ? 'warning' : 'danger'}
								className='mt-1'
								style={{ height: '6px' }}
							/>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Variance Categories */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<div className='d-flex justify-content-between align-items-center mb-2'>
								<div>
									<h5>Variance by Category</h5>
								</div>
								<div className='d-flex'>
									<Button
										color={filterCategory === 'all' ? 'primary' : 'light'}
										size='sm'
										className='mr-1'
										onClick={() => setFilterCategory('all')}
									>
										All ({variances?.length || 0})
									</Button>
									<Button
										color={filterCategory === 'minor' ? 'success' : 'light'}
										size='sm'
										className='mr-1'
										onClick={() => setFilterCategory('minor')}
									>
										Minor ({summary.variancesByCategory?.minor || 0})
									</Button>
									<Button
										color={filterCategory === 'moderate' ? 'warning' : 'light'}
										size='sm'
										className='mr-1'
										onClick={() => setFilterCategory('moderate')}
									>
										Moderate ({summary.variancesByCategory?.moderate || 0})
									</Button>
									<Button
										color={filterCategory === 'major' ? 'danger' : 'light'}
										size='sm'
										onClick={() => setFilterCategory('major')}
									>
										Major ({summary.variancesByCategory?.major || 0})
									</Button>
								</div>
							</div>

							{summary.variancesByCategory?.major > 0 && (
								<Alert color='danger'>
									<AlertTriangle size={14} className='mr-1' />
									<strong>Attention:</strong> {summary.variancesByCategory.major} items have major variances requiring immediate review
								</Alert>
							)}
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Variance Table */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<div className='d-flex justify-content-between align-items-center mb-2'>
								<div className='d-flex align-items-center'>
									<Label for='sortBy' className='mb-0 mr-1'>Sort by:</Label>
									<Input
										type='select'
										id='sortBy'
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
										style={{ width: '200px' }}
									>
										<option value='variance_value'>Variance Value</option>
										<option value='variance_percent'>Variance %</option>
										<option value='product_name'>Product Name</option>
									</Input>
								</div>
								<Button
									color='link'
									size='sm'
									onClick={selectAllInCategory}
								>
									Select All Visible
								</Button>
							</div>

							<Table responsive hover>
								<thead>
									<tr>
										<th style={{ width: '50px' }}>
											<Input
												type='checkbox'
												checked={selectedVariances.length === filteredVariances.length && filteredVariances.length > 0}
												onChange={(e) => {
													if (e.target.checked) {
														selectAllInCategory()
													} else {
														setSelectedVariances([])
													}
												}}
											/>
										</th>
										<th>Product</th>
										<th>System Qty</th>
										<th>Counted Qty</th>
										<th>Variance</th>
										<th>Variance %</th>
										<th>Category</th>
										<th>Value</th>
										<th>Notes</th>
									</tr>
								</thead>
								<tbody>
									{filteredVariances.map(variance => (
										<tr 
											key={variance.id}
											className={selectedVariances.includes(variance.id) ? 'bg-light' : ''}
										>
											<td>
												<Input
													type='checkbox'
													checked={selectedVariances.includes(variance.id)}
													onChange={() => toggleVarianceSelection(variance.id)}
												/>
											</td>
											<td>
												<div>
													<span className='font-weight-bold'>{variance.product?.name || 'Unknown Product'}</span>
													<div>
														<small className='text-muted'>SKU: {variance.product?.sku || 'N/A'}</small>
													</div>
												</div>
											</td>
											<td>
												<Badge color='light-primary'>{variance.systemQty}</Badge>
											</td>
											<td>
												<Badge color='light-info'>{variance.countedQty}</Badge>
											</td>
											<td>{getVarianceDisplay(variance)}</td>
											<td>
												<span className={Math.abs(variance.variancePercent || 0) > 10 ? 'text-danger font-weight-bold' : ''}>
													{(variance.variancePercent || 0).toFixed(1)}%
												</span>
											</td>
											<td>{getCategoryBadge(variance.varianceCategory)}</td>
											<td>
												<span className={(variance.varianceValue || 0) >= 0 ? 'text-success' : 'text-danger'}>
													R {Math.abs(variance.varianceValue || 0).toFixed(2)}
												</span>
											</td>
											<td>
												<small>{variance.notes || '-'}</small>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
							
							{filteredVariances.length === 0 && (
								<div className='text-center p-4'>
									<CheckCircle size={48} className='text-success mb-2' />
									<p>No variances found in this category</p>
								</div>
							)}
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Approval Modal */}
			<Modal isOpen={approvalModal} toggle={() => setApprovalModal(!approvalModal)} size='lg'>
				<ModalHeader toggle={() => setApprovalModal(!approvalModal)}>
					Approve Adjustments
				</ModalHeader>
				<ModalBody>
					<Alert color='info'>
						<Eye size={14} className='mr-1' />
						You are about to approve {selectedVariances.length} adjustment(s).
						Stock levels will be updated immediately upon approval.
					</Alert>

					<div className='mb-2'>
						<h6>Selected Items Summary:</h6>
						<Table size='sm' bordered>
							<tbody>
								<tr>
									<td>Total Items:</td>
									<td className='font-weight-bold'>{selectedVariances.length}</td>
								</tr>
								<tr>
									<td>Total Variance Value:</td>
									<td className='font-weight-bold'>
										R {filteredVariances
											.filter(v => selectedVariances.includes(v.id))
											.reduce((sum, v) => sum + v.varianceValue, 0)
											.toFixed(2)}
									</td>
								</tr>
							</tbody>
						</Table>
					</div>

					<FormGroup>
						<Label for='approvalNotes'>Approval Notes (Optional)</Label>
						<Input
							type='textarea'
							id='approvalNotes'
							rows={3}
							value={approvalNotes}
							onChange={(e) => setApprovalNotes(e.target.value)}
							placeholder='Add any notes about this approval...'
						/>
					</FormGroup>
				</ModalBody>
				<ModalFooter>
					<Button 
						color='secondary' 
						onClick={() => setApprovalModal(false)}
						disabled={isApproving}
					>
						Cancel
					</Button>
					<Button 
						color='success' 
						onClick={handleApproveSelected}
						disabled={isApproving}
					>
						{isApproving ? (
							<>
								<Spinner size='sm' className='mr-1' />
								Approving...
							</>
						) : (
							'Approve & Update Stock'
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</Fragment>
	)
}

export default VarianceReview