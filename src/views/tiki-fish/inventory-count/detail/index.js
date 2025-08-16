import { Fragment, useEffect, useState } from 'react'
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
	Table,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	Alert,
	Spinner
} from 'reactstrap'
import {
	Package,
	Clock,
	CheckCircle,
	AlertTriangle,
	TrendingUp,
	FileText,
	User,
	Calendar,
	Edit3,
	Play,
	Eye,
	ThumbsUp,
	XCircle,
	BarChart,
	Printer
} from 'react-feather'
import moment from 'moment'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { getCountDetail, updateCountStatus, cancelCount } from '../store/action'
import { exportCountSheet } from '../../../../utility/exportUtils'

const MySwal = withReactContent(Swal)

const CountDetail = () => {
	const dispatch = useDispatch()
	const history = useHistory()
	const { id } = useParams()
	const store = useSelector(state => state.inventoryCount)
	
	// ** States
	const [activeTab, setActiveTab] = useState('overview')

	// ** Load count details
	useEffect(() => {
		if (id) {
			dispatch(getCountDetail(id))
		}
	}, [dispatch, id])

	// ** Handle status actions
	const handleStartCount = () => {
		MySwal.fire({
			title: 'Start Counting?',
			text: 'This will begin the inventory counting process',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Yes, start',
			cancelButtonText: 'Cancel'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const updateResult = await dispatch(updateCountStatus(id, 'in_progress'))
				if (updateResult) {
					MySwal.fire({
						icon: 'success',
						title: 'Count Started!',
						text: 'You can now begin counting items',
						showConfirmButton: false,
						timer: 1500
					})
					history.push(`/inventory/counts/${id}/count-sheet`)
				}
			}
		})
	}

	const handleCancelCount = () => {
		MySwal.fire({
			title: 'Cancel Count?',
			text: 'This action cannot be undone',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, cancel it',
			cancelButtonText: 'No, keep it',
			confirmButtonColor: '#dc3545'
		}).then(async (result) => {
			if (result.isConfirmed) {
				const cancelResult = await dispatch(cancelCount(id))
				if (cancelResult) {
					MySwal.fire({
						icon: 'info',
						title: 'Count Cancelled',
						text: 'The inventory count has been cancelled',
						showConfirmButton: false,
						timer: 1500
					})
					history.push('/inventory/counts')
				}
			}
		})
	}

	const handleResumeCount = () => {
		history.push(`/inventory/counts/${id}/count-sheet`)
	}

	const handleViewVariances = () => {
		history.push(`/inventory/counts/${id}/variance`)
	}

	const handlePrintCountSheet = () => {
		const result = exportCountSheet(store.countDetail)
		if (result.success) {
			MySwal.fire({
				icon: 'success',
				title: 'Count Sheet Ready',
				text: 'The print dialog will open for your count sheet',
				showConfirmButton: false,
				timer: 2000
			})
		} else {
			MySwal.fire({
				icon: 'error',
				title: 'Export Failed',
				text: result.error || 'Failed to generate count sheet'
			})
		}
	}

	if (!store.countDetail) {
		return (
			<div className='text-center p-5'>
				<Spinner />
				<div className='mt-2'>Loading count details...</div>
			</div>
		)
	}

	const { count, summary, recentActivity } = store.countDetail

	// ** Status badge color
	const getStatusBadge = (status) => {
		const statusConfig = {
			draft: { color: 'secondary', icon: FileText },
			in_progress: { color: 'warning', icon: Clock },
			review: { color: 'info', icon: Eye },
			approved: { color: 'primary', icon: ThumbsUp },
			completed: { color: 'success', icon: CheckCircle },
			cancelled: { color: 'danger', icon: XCircle }
		}
		const config = statusConfig[status] || statusConfig.draft
		const Icon = config.icon
		
		return (
			<Badge color={config.color} className='d-flex align-items-center' pill>
				<Icon size={12} className='mr-25' />
				{status.replace('_', ' ').toUpperCase()}
			</Badge>
		)
	}

	// ** Progress calculation
	const progress = count.totalItems > 0 
		? Math.round((count.countedItems / count.totalItems) * 100) 
		: 0

	// ** Render action buttons based on status
	const renderActionButtons = () => {
		switch (count.status) {
			case 'draft':
				return (
					<>
						<Button color='primary' onClick={handleStartCount}>
							<Play size={14} className='mr-50' />
							Start Counting
						</Button>
						<Button color='info' outline className='ml-1' onClick={handlePrintCountSheet}>
							<Printer size={14} className='mr-50' />
							Print Count Sheet
						</Button>
						<Button color='danger' outline className='ml-1' onClick={handleCancelCount}>
							Cancel Count
						</Button>
					</>
				)
			case 'in_progress':
				return (
					<>
						<Button color='primary' onClick={handleResumeCount}>
							<Edit3 size={14} className='mr-50' />
							Continue Counting
						</Button>
						<Button color='info' outline className='ml-1' onClick={handlePrintCountSheet}>
							<Printer size={14} className='mr-50' />
							Print Count Sheet
						</Button>
						{progress === 100 && (
							<Button color='success' className='ml-1' onClick={handleViewVariances}>
								<Eye size={14} className='mr-50' />
								Review Variances
							</Button>
						)}
					</>
				)
			case 'review':
				return (
					<Button color='primary' onClick={handleViewVariances}>
						<BarChart size={14} className='mr-50' />
						Review & Approve
					</Button>
				)
			case 'approved':
			case 'completed':
				return (
					<Button color='secondary' onClick={handleViewVariances}>
						<FileText size={14} className='mr-50' />
						View Report
					</Button>
				)
			default:
				return null
		}
	}

	return (
		<Fragment>
			{/* Header Card */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader>
							<div className='d-flex justify-content-between align-items-center w-100'>
								<div>
									<CardTitle tag='h4'>
										{count.countNumber}
									</CardTitle>
									<div className='d-flex align-items-center mt-1'>
										{getStatusBadge(count.status)}
										<Badge color='light-primary' className='ml-1' pill>
											{count.countType}
										</Badge>
										{count.blindCount && (
											<Badge color='light-warning' className='ml-1' pill>
												Blind Count
											</Badge>
										)}
									</div>
								</div>
								<div>
									{renderActionButtons()}
								</div>
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
									<h4 className='mb-0'>{count.totalItems}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-success mr-2'>
									<CheckCircle size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Counted Items</h6>
									<h4 className='mb-0'>{count.countedItems}</h4>
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
									<h6 className='mb-0'>Variances</h6>
									<h4 className='mb-0'>{summary?.itemsWithVariance || 0}</h4>
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
									<h6 className='mb-0'>Progress</h6>
									<h4 className='mb-0'>{progress}%</h4>
								</div>
							</div>
							<Progress 
								value={progress} 
								color={progress === 100 ? 'success' : progress > 50 ? 'primary' : 'warning'}
								className='mt-1'
								style={{ height: '6px' }}
							/>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Tabs */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<Nav tabs>
								<NavItem>
									<NavLink
										active={activeTab === 'overview'}
										onClick={() => setActiveTab('overview')}
									>
										Overview
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={activeTab === 'items'}
										onClick={() => setActiveTab('items')}
									>
										Count Items ({count.totalItems})
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										active={activeTab === 'activity'}
										onClick={() => setActiveTab('activity')}
									>
										Activity Log
									</NavLink>
								</NavItem>
							</Nav>

							<TabContent activeTab={activeTab}>
								{/* Overview Tab */}
								<TabPane tabId='overview'>
									<Row className='mt-2'>
										<Col md='6'>
											<h5>Count Information</h5>
											<Table size='sm' borderless>
												<tbody>
													<tr>
														<td className='text-muted'>Count Date:</td>
														<td className='font-weight-bold'>
															{moment(count.countDate).format('DD MMM YYYY')}
														</td>
													</tr>
													<tr>
														<td className='text-muted'>Count Type:</td>
														<td className='font-weight-bold text-capitalize'>
															{count.countType}
														</td>
													</tr>
													{count.category && (
														<tr>
															<td className='text-muted'>Category:</td>
															<td className='font-weight-bold'>
																{count.category.name}
															</td>
														</tr>
													)}
													{count.deadlineDate && (
														<tr>
															<td className='text-muted'>Deadline:</td>
															<td className='font-weight-bold'>
																{moment(count.deadlineDate).format('DD MMM YYYY')}
															</td>
														</tr>
													)}
													<tr>
														<td className='text-muted'>Blind Count:</td>
														<td className='font-weight-bold'>
															{count.blindCount ? 'Yes' : 'No'}
														</td>
													</tr>
													{count.assignee && (
														<tr>
															<td className='text-muted'>Assigned To:</td>
															<td className='font-weight-bold'>
																{count.assignee.firstName} {count.assignee.lastName}
															</td>
														</tr>
													)}
												</tbody>
											</Table>
										</Col>
										<Col md='6'>
											<h5>Variance Summary</h5>
											{summary ? (
												<Table size='sm' borderless>
													<tbody>
														<tr>
															<td className='text-muted'>Total Variance Value:</td>
															<td className={`font-weight-bold ${summary.totalVarianceValue >= 0 ? 'text-success' : 'text-danger'}`}>
																R {Math.abs(summary.totalVarianceValue || 0).toFixed(2)}
															</td>
														</tr>
														<tr>
															<td className='text-muted'>Accuracy:</td>
															<td className='font-weight-bold'>
																{summary.accuracyPercent || 0}%
															</td>
														</tr>
														<tr>
															<td className='text-muted'>Minor Variances:</td>
															<td className='font-weight-bold text-success'>
																{summary.variancesByCategory?.minor || 0}
															</td>
														</tr>
														<tr>
															<td className='text-muted'>Moderate Variances:</td>
															<td className='font-weight-bold text-warning'>
																{summary.variancesByCategory?.moderate || 0}
															</td>
														</tr>
														<tr>
															<td className='text-muted'>Major Variances:</td>
															<td className='font-weight-bold text-danger'>
																{summary.variancesByCategory?.major || 0}
															</td>
														</tr>
													</tbody>
												</Table>
											) : (
												<Alert color='info'>
													<AlertTriangle size={14} className='mr-1' />
													Variance summary will be available after counting is complete
												</Alert>
											)}
										</Col>
									</Row>
									{count.notes && (
										<Row className='mt-2'>
											<Col sm='12'>
												<h5>Notes</h5>
												<p className='text-muted'>{count.notes}</p>
											</Col>
										</Row>
									)}
								</TabPane>

								{/* Count Items Tab */}
								<TabPane tabId='items'>
									<div className='mt-2'>
										{count.countItems && count.countItems.length > 0 ? (
											<Table responsive hover>
												<thead>
													<tr>
														<th>Product</th>
														<th>SKU</th>
														<th>System Qty</th>
														<th>Counted Qty</th>
														<th>Variance</th>
														<th>Status</th>
													</tr>
												</thead>
												<tbody>
													{count.countItems.map(item => (
														<tr key={item.id}>
															<td>{item.product?.name}</td>
															<td>{item.product?.sku}</td>
															<td>
																<Badge color='light-primary'>{item.systemQty}</Badge>
															</td>
															<td>
																{item.countedQty !== null ? (
																	<Badge color='light-info'>{item.countedQty}</Badge>
																) : (
																	<span className='text-muted'>-</span>
																)}
															</td>
															<td>
																{item.varianceQty !== null ? (
																	<span className={item.varianceQty > 0 ? 'text-success' : item.varianceQty < 0 ? 'text-danger' : ''}>
																		{item.varianceQty > 0 ? '+' : ''}{item.varianceQty}
																	</span>
																) : (
																	<span className='text-muted'>-</span>
																)}
															</td>
															<td>
																<Badge color={item.status === 'counted' ? 'success' : 'secondary'} pill>
																	{item.status}
																</Badge>
															</td>
														</tr>
													))}
												</tbody>
											</Table>
										) : (
											<Alert color='info'>
												No items in this count
											</Alert>
										)}
									</div>
								</TabPane>

								{/* Activity Tab */}
								<TabPane tabId='activity'>
									<div className='mt-2'>
										{recentActivity && recentActivity.length > 0 ? (
											<div className='timeline'>
												{recentActivity.map((activity, index) => (
													<div key={index} className='timeline-item'>
														<div className='timeline-point'>
															<User size={14} />
														</div>
														<div className='timeline-event'>
															<div className='d-flex justify-content-between mb-1'>
																<h6 className='mb-0'>{activity.action}</h6>
																<small className='text-muted'>
																	{moment(activity.createdAt).fromNow()}
																</small>
															</div>
															<p className='mb-0 text-muted'>
																{activity.description}
															</p>
															{activity.user && (
																<small className='text-muted'>
																	By: {activity.user.firstName} {activity.user.lastName}
																</small>
															)}
														</div>
													</div>
												))}
											</div>
										) : (
											<Alert color='info'>
												No activity recorded yet
											</Alert>
										)}
									</div>
								</TabPane>
							</TabContent>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Fragment>
	)
}

export default CountDetail