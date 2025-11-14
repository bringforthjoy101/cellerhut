import { useState, useEffect, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Badge,
	Button,
	Spinner,
	Table,
	UncontrolledCollapse,
	Alert,
} from 'reactstrap'
import {
	ArrowLeft,
	CheckCircle,
	XCircle,
	Clock,
	RefreshCw,
	Link2,
	Package,
	User,
	CreditCard,
	Calendar,
	DollarSign,
	Activity,
	Code,
	ChevronDown,
} from 'react-feather'
import moment from 'moment'
import { getTransactionDetail } from '../store/action'
import {
	TransactionStatusBadge,
	PaymentMethodIcon,
	PaymentGatewayBadge,
	AssignOrderModal,
} from '../components'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const PaymentTransactionDetail = () => {
	const { id } = useParams()
	const dispatch = useDispatch()
	const { transactionDetail, transactionWebhooks, loading } = useSelector((state) => state.payments)

	const [assignModalOpen, setAssignModalOpen] = useState(false)

	useEffect(() => {
		if (id) {
			dispatch(getTransactionDetail(id))
		}
	}, [id, dispatch])

	const toggleAssignModal = () => {
		setAssignModalOpen(!assignModalOpen)
	}

	const handleRefresh = () => {
		dispatch(getTransactionDetail(id))
	}

	if (loading && !transactionDetail) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
				<Spinner color="primary" size="lg" />
			</div>
		)
	}

	if (!transactionDetail) {
		return (
			<div className='app-payment-detail'>
				<Alert color="danger">
					<h4 className="alert-heading">Transaction Not Found</h4>
					<div className="alert-body">
						The requested payment transaction could not be found.
					</div>
				</Alert>
				<Link to="/payments/transactions">
					<Button color="primary">
						<ArrowLeft size={14} /> Back to Transactions
					</Button>
				</Link>
			</div>
		)
	}

	const transaction = transactionDetail
	const logs = transaction.logs || []
	const webhooks = transactionWebhooks || []

	return (
		<div className='app-payment-detail'>
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center mb-2">
				<div>
					<Link to="/payments/transactions">
						<Button color="flat-primary" size="sm">
							<ArrowLeft size={14} /> Back to Transactions
						</Button>
					</Link>
				</div>
				<div>
					<Button color="primary" size="sm" onClick={handleRefresh} disabled={loading}>
						<RefreshCw size={14} className={loading ? 'rotating' : ''} />
						<span className="ml-50">Refresh</span>
					</Button>
				</div>
			</div>

					{/* Transaction Overview */}
					<Row>
						<Col lg="8" md="12">
							<Card>
								<CardHeader className="border-bottom">
									<CardTitle tag="h4">Transaction Details</CardTitle>
									<div>
										<TransactionStatusBadge status={transaction.status} />
									</div>
								</CardHeader>
								<CardBody>
									<Row>
										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<CreditCard size={18} className="text-primary mr-1" />
												<h6 className="mb-0">Transaction ID</h6>
											</div>
											<p className="font-weight-bold mb-0">{transaction.transactionId}</p>
											{transaction.gatewayTransactionId && (
												<small className="text-muted">
													Gateway: {transaction.gatewayTransactionId}
												</small>
											)}
										</Col>

										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<DollarSign size={18} className="text-success mr-1" />
												<h6 className="mb-0">Amount</h6>
											</div>
											<h3 className="font-weight-bold text-success mb-0">
												{Number(transaction.amount || 0).toLocaleString('en-ZA', {
													style: 'currency',
													currency: transaction.currency || 'ZAR',
												})}
											</h3>
										</Col>

										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<Activity size={18} className="text-info mr-1" />
												<h6 className="mb-0">Payment Gateway</h6>
											</div>
											<PaymentGatewayBadge gateway={transaction.paymentGateway} />
										</Col>

										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<CreditCard size={18} className="text-warning mr-1" />
												<h6 className="mb-0">Payment Method</h6>
											</div>
											<PaymentMethodIcon method={transaction.paymentMethod} showLabel={true} />
										</Col>

										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<Calendar size={18} className="text-secondary mr-1" />
												<h6 className="mb-0">Created</h6>
											</div>
											<p className="mb-0">{moment(transaction.createdAt).format('MMMM DD, YYYY')}</p>
											<small className="text-muted">
												{moment(transaction.createdAt).format('HH:mm:ss')}
											</small>
										</Col>

										<Col md="6" className="mb-2">
											<div className="d-flex align-items-center mb-1">
												<Clock size={18} className="text-secondary mr-1" />
												<h6 className="mb-0">Last Updated</h6>
											</div>
											<p className="mb-0">{moment(transaction.updatedAt).format('MMMM DD, YYYY')}</p>
											<small className="text-muted">
												{moment(transaction.updatedAt).format('HH:mm:ss')}
											</small>
										</Col>
									</Row>

									{/* Customer Information */}
									{(transaction.order?.customer || transaction.customerInfo) && (
										<Fragment>
											<hr className="my-2" />
											<div className="d-flex align-items-center mb-1">
												<User size={18} className="text-primary mr-1" />
												<h6 className="mb-0">Customer Information</h6>
											</div>
											<Row>
												{(() => {
													const customer = transaction.order?.customer || transaction.customerInfo
													return (
														<Fragment>
															{customer.firstName && customer.lastName && (
																<Col md="6" className="mb-1">
																	<small className="text-muted">Name</small>
																	<p className="mb-0 font-weight-bold">
																		{customer.firstName} {customer.lastName}
																	</p>
																</Col>
															)}
															{customer.email && (
																<Col md="6" className="mb-1">
																	<small className="text-muted">Email</small>
																	<p className="mb-0">{customer.email}</p>
																</Col>
															)}
															{customer.phone && (
																<Col md="6" className="mb-1">
																	<small className="text-muted">Phone</small>
																	<p className="mb-0">{customer.phone}</p>
																</Col>
															)}
														</Fragment>
													)
												})()}
											</Row>
										</Fragment>
									)}

									{/* Raw Transaction Data (Collapsible) */}
									<hr className="my-2" />
									<div>
										<Button color="flat-secondary" size="sm" id="toggleRawData">
											<Code size={14} className="mr-50" />
											View Raw Data
											<ChevronDown size={14} className="ml-50" />
										</Button>
										<UncontrolledCollapse toggler="#toggleRawData">
											<div className="mt-1">
												<pre
													className="p-1"
													style={{
														backgroundColor: '#f8f8f8',
														borderRadius: '4px',
														maxHeight: '400px',
														overflow: 'auto',
													}}
												>
													{JSON.stringify(transaction, null, 2)}
												</pre>
											</div>
										</UncontrolledCollapse>
									</div>
								</CardBody>
							</Card>

							{/* Payment Logs Timeline */}
							<Card>
								<CardHeader className="border-bottom">
									<CardTitle tag="h4">Payment Logs Timeline</CardTitle>
									<Badge color="light-primary" pill>
										{logs.length} {logs.length === 1 ? 'Entry' : 'Entries'}
									</Badge>
								</CardHeader>
								<CardBody>
									{logs.length === 0 ? (
										<div className="text-center py-2">
											<p className="text-muted mb-0">No payment logs available</p>
										</div>
									) : (
										<div className="timeline">
											{logs.map((log, index) => (
												<div key={log.id} className="timeline-item">
													<div className="timeline-point">
														{log.status === 'success' ? (
															<CheckCircle size={16} className="text-success" />
														) : log.status === 'failed' ? (
															<XCircle size={16} className="text-danger" />
														) : (
															<Clock size={16} className="text-warning" />
														)}
													</div>
													<div className="timeline-event">
														<div className="d-flex justify-content-between align-items-start mb-50">
															<div>
																<h6 className="mb-25">{log.action || log.event}</h6>
																<Badge color={`light-${log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'}`}>
																	{log.status}
																</Badge>
															</div>
															<small className="text-muted">
																{moment(log.createdAt).format('MMM DD, HH:mm:ss')}
															</small>
														</div>
														{log.message && <p className="mb-50">{log.message}</p>}
														{log.metadata && (
															<div>
																<Button
																	color="flat-secondary"
																	size="sm"
																	id={`toggleLog${log.id}`}
																>
																	<Code size={12} /> Details
																</Button>
																<UncontrolledCollapse toggler={`#toggleLog${log.id}`}>
																	<pre
																		className="mt-50 p-50"
																		style={{
																			backgroundColor: '#f8f8f8',
																			borderRadius: '4px',
																			fontSize: '12px',
																		}}
																	>
																		{JSON.stringify(log.metadata, null, 2)}
																	</pre>
																</UncontrolledCollapse>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</CardBody>
							</Card>

							{/* Webhooks */}
							{webhooks.length > 0 && (
								<Card>
									<CardHeader className="border-bottom">
										<CardTitle tag="h4">Webhook History</CardTitle>
										<Badge color="light-primary" pill>
											{webhooks.length} {webhooks.length === 1 ? 'Event' : 'Events'}
										</Badge>
									</CardHeader>
									<CardBody>
										<div className="table-responsive">
											<Table>
												<thead>
													<tr>
														<th>Event</th>
														<th>Status</th>
														<th>Received At</th>
														<th>Actions</th>
													</tr>
												</thead>
												<tbody>
													{webhooks.map((webhook) => (
														<tr key={webhook.id}>
															<td>{webhook.event}</td>
															<td>
																<Badge
																	color={webhook.verified ? 'light-success' : 'light-warning'}
																	pill
																>
																	{webhook.verified ? 'Verified' : 'Unverified'}
																</Badge>
															</td>
															<td>{moment(webhook.createdAt).format('MMM DD, YYYY HH:mm:ss')}</td>
															<td>
																<Button
																	color="flat-primary"
																	size="sm"
																	id={`toggleWebhook${webhook.id}`}
																>
																	<Code size={12} /> View Payload
																</Button>
																<UncontrolledCollapse toggler={`#toggleWebhook${webhook.id}`}>
																	<pre
																		className="mt-1 p-1"
																		style={{
																			backgroundColor: '#f8f8f8',
																			borderRadius: '4px',
																			maxHeight: '300px',
																			overflow: 'auto',
																		}}
																	>
																		{JSON.stringify(webhook.payload, null, 2)}
																	</pre>
																</UncontrolledCollapse>
															</td>
														</tr>
													))}
												</tbody>
											</Table>
										</div>
									</CardBody>
								</Card>
							)}
						</Col>

						{/* Sidebar */}
						<Col lg="4" md="12">
							{/* Linked Order */}
							{transaction.order ? (
								<Card>
									<CardHeader className="border-bottom">
										<CardTitle tag="h6">
											<Package size={16} className="mr-50" />
											Linked Order
										</CardTitle>
									</CardHeader>
									<CardBody>
										<div className="mb-1">
											<small className="text-muted">Order Number</small>
											<h5 className="font-weight-bold mb-0">
												<Link to={`/order/preview/${transaction.order.id}`}>
													#{transaction.order.orderNumber}
												</Link>
											</h5>
										</div>
										<div className="mb-1">
											<small className="text-muted">Order Total</small>
											<p className="mb-0 font-weight-bold">
												{Number(transaction.order.total || 0).toLocaleString('en-ZA', {
													style: 'currency',
													currency: 'ZAR',
												})}
											</p>
										</div>
										<div className="mb-1">
											<small className="text-muted">Order Status</small>
											<p className="mb-0">
												<Badge color="light-primary" pill className="text-capitalize">
													{transaction.order.status}
												</Badge>
											</p>
										</div>
										<div>
											<small className="text-muted">Created</small>
											<p className="mb-0">
												{moment(transaction.order.createdAt).format('MMM DD, YYYY')}
											</p>
										</div>
										<hr />
										<Link to={`/order/preview/${transaction.order.id}`}>
											<Button color="primary" block outline>
												<Package size={14} /> View Full Order
											</Button>
										</Link>
									</CardBody>
								</Card>
							) : (
								<Card>
									<CardHeader className="border-bottom">
										<CardTitle tag="h6">
											<Link2 size={16} className="mr-50" />
											Order Assignment
										</CardTitle>
									</CardHeader>
									<CardBody>
										<Alert color="warning" className="mb-1">
											<div className="alert-body">
												This payment is not linked to any order.
											</div>
										</Alert>
										{transaction.status === 'success' && (
											<Button color="primary" block onClick={toggleAssignModal}>
												<Link2 size={14} /> Assign to Order
											</Button>
										)}
										{transaction.status !== 'success' && (
											<p className="text-muted small mb-0">
												Only successful payments can be assigned to orders.
											</p>
										)}
									</CardBody>
								</Card>
							)}

							{/* Quick Actions */}
							<Card>
								<CardHeader className="border-bottom">
									<CardTitle tag="h6">Quick Actions</CardTitle>
								</CardHeader>
								<CardBody>
									<Button color="flat-primary" block className="mb-50">
										<RefreshCw size={14} /> Sync with Gateway
									</Button>
									{transaction.status === 'success' && !transaction.refundedAt && (
										<Button color="flat-danger" block className="mb-50">
											<XCircle size={14} /> Request Refund
										</Button>
									)}
									<Link to="/payments/transactions">
										<Button color="flat-secondary" block>
											<ArrowLeft size={14} /> Back to List
										</Button>
									</Link>
								</CardBody>
							</Card>
						</Col>
					</Row>

			{/* Assign Order Modal */}
			<AssignOrderModal
				isOpen={assignModalOpen}
				toggle={toggleAssignModal}
				transaction={transaction}
			/>
		</div>
	)
}

export default PaymentTransactionDetail
