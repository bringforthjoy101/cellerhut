import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Input,
	Label,
	Button,
	Badge,
	Spinner,
	UncontrolledCollapse,
} from 'reactstrap'
import DataTable from 'react-data-table-component'
import { RefreshCw, Code, CheckCircle, AlertCircle, Activity } from 'react-feather'
import moment from 'moment'
import { getPaymentWebhooks } from '../store/action'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const PaymentWebhooks = () => {
	const dispatch = useDispatch()
	const { webhooks, webhooksPagination, loading } = useSelector((state) => state.payments)

	// Filter states
	const [filters, setFilters] = useState({
		transactionId: '',
		event: '',
		verified: '',
		gateway: '',
		startDate: '',
		endDate: '',
	})

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [perPage, setPerPage] = useState(50)

	const fetchWebhooks = () => {
		const params = {
			page: currentPage,
			limit: perPage,
			...(filters.transactionId && { transactionId: filters.transactionId }),
			...(filters.event && { event: filters.event }),
			...(filters.verified !== '' && { verified: filters.verified === 'true' }),
			...(filters.gateway && { gateway: filters.gateway }),
			...(filters.startDate && { startDate: filters.startDate }),
			...(filters.endDate && { endDate: filters.endDate }),
		}
		dispatch(getPaymentWebhooks(params))
	}

	// Load webhooks on mount and when filters change
	useEffect(() => {
		fetchWebhooks()
	}, [currentPage, perPage])

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }))
	}

	const handleSearch = () => {
		setCurrentPage(1)
		fetchWebhooks()
	}

	const handleReset = () => {
		setFilters({
			transactionId: '',
			event: '',
			verified: '',
			gateway: '',
			startDate: '',
			endDate: '',
		})
		setCurrentPage(1)
	}

	const handlePerRowsChange = (newPerPage, page) => {
		setPerPage(newPerPage)
		setCurrentPage(page)
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	const columns = [
		{
			name: 'Received At',
			selector: 'createdAt',
			sortable: true,
			minWidth: '180px',
			cell: (row) => (
				<div className="d-flex flex-column">
					<span>{moment(row.createdAt).format('MMM DD, YYYY')}</span>
					<small className="text-muted">{moment(row.createdAt).format('HH:mm:ss')}</small>
				</div>
			),
		},
		{
			name: 'Event Type',
			selector: 'event',
			sortable: true,
			minWidth: '200px',
			cell: (row) => (
				<div className="d-flex align-items-center">
					<Activity size={16} className="text-primary mr-50" />
					<span className="font-weight-bold">{row.event}</span>
				</div>
			),
		},
		{
			name: 'Transaction ID',
			selector: 'transactionId',
			sortable: true,
			minWidth: '150px',
			cell: (row) => (
				<span className="text-truncate" style={{ maxWidth: '140px' }}>
					{row.transactionId || row.PaymentTransaction?.transactionId || '-'}
				</span>
			),
		},
		{
			name: 'Gateway',
			selector: 'gateway',
			sortable: true,
			minWidth: '120px',
			cell: (row) => (
				<span className="text-capitalize">{row.gateway || row.PaymentTransaction?.paymentGateway || '-'}</span>
			),
		},
		{
			name: 'Verification',
			selector: 'verified',
			sortable: true,
			minWidth: '140px',
			cell: (row) => {
				if (row.verified) {
					return (
						<Badge color="light-success" className="d-flex align-items-center">
							<CheckCircle size={14} />
							<span className="ml-50">Verified</span>
						</Badge>
					)
				}
				return (
					<Badge color="light-warning" className="d-flex align-items-center">
						<AlertCircle size={14} />
						<span className="ml-50">Unverified</span>
					</Badge>
				)
			},
		},
		{
			name: 'IP Address',
			selector: 'ipAddress',
			minWidth: '140px',
			cell: (row) => <span className="text-muted">{row.ipAddress || '-'}</span>,
		},
		{
			name: 'Payload',
			minWidth: '100px',
			cell: (row) => (
				<div>
					<Button color="flat-secondary" size="sm" id={`togglePayload${row.id}`}>
						<Code size={12} /> View
					</Button>
					<UncontrolledCollapse toggler={`#togglePayload${row.id}`}>
						<div
							className="mt-1 p-1"
							style={{
								backgroundColor: '#f8f8f8',
								borderRadius: '4px',
								maxWidth: '400px',
								maxHeight: '300px',
								overflow: 'auto',
							}}
						>
							<pre style={{ fontSize: '11px', margin: 0 }}>
								{JSON.stringify(row.payload, null, 2)}
							</pre>
						</div>
					</UncontrolledCollapse>
				</div>
			),
		},
	]

	const customStyles = {
		headCells: {
			style: {
				fontSize: '14px',
				fontWeight: 'bold',
				paddingLeft: '16px',
				paddingRight: '16px',
			},
		},
		cells: {
			style: {
				paddingLeft: '16px',
				paddingRight: '16px',
			},
		},
	}

	// Calculate webhook stats
	const totalWebhooks = webhooksPagination.total || 0
	const verifiedCount = webhooks.filter((w) => w.verified).length
	const unverifiedCount = webhooks.filter((w) => !w.verified).length

	return (
		<div className='app-payment-webhooks'>
			{/* Stats Cards */}
			<Row className="mb-2">
				<Col lg="4" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0">{totalWebhooks.toLocaleString()}</h2>
							<p className="font-small-3 mb-0">Total Webhooks</p>
						</CardBody>
					</Card>
				</Col>
				<Col lg="4" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0 text-success">
								{verifiedCount.toLocaleString()}
							</h2>
							<p className="font-small-3 mb-0">Verified</p>
						</CardBody>
					</Card>
				</Col>
				<Col lg="4" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0 text-warning">
								{unverifiedCount.toLocaleString()}
							</h2>
							<p className="font-small-3 mb-0">Unverified</p>
						</CardBody>
					</Card>
				</Col>
			</Row>

			<Card>
				<CardHeader className="border-bottom">
					<CardTitle tag="h4">Payment Webhooks</CardTitle>
					<div className="d-flex align-items-center">
						<Button
							color="primary"
							size="sm"
							onClick={fetchWebhooks}
							disabled={loading}
							className="mr-50"
						>
							<RefreshCw size={14} />
							<span className="ml-50">Refresh</span>
						</Button>
					</div>
				</CardHeader>
						<CardBody>
							{/* Filter Controls */}
							<Row className="mb-2">
								<Col md="3" sm="6" className="mb-1">
									<Label for="transactionId" className="form-label">
										Transaction ID
									</Label>
									<Input
										id="transactionId"
										placeholder="Enter transaction ID"
										value={filters.transactionId}
										onChange={(e) => handleFilterChange('transactionId', e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
									/>
								</Col>
								<Col md="2" sm="6" className="mb-1">
									<Label for="event" className="form-label">
										Event Type
									</Label>
									<Input
										type="select"
										id="event"
										value={filters.event}
										onChange={(e) => handleFilterChange('event', e.target.value)}
									>
										<option value="">All Events</option>
										<option value="payment.success">payment.success</option>
										<option value="payment.failed">payment.failed</option>
										<option value="payment.pending">payment.pending</option>
										<option value="refund.success">refund.success</option>
										<option value="refund.failed">refund.failed</option>
									</Input>
								</Col>
								<Col md="2" sm="6" className="mb-1">
									<Label for="verified" className="form-label">
										Verification
									</Label>
									<Input
										type="select"
										id="verified"
										value={filters.verified}
										onChange={(e) => handleFilterChange('verified', e.target.value)}
									>
										<option value="">All</option>
										<option value="true">Verified Only</option>
										<option value="false">Unverified Only</option>
									</Input>
								</Col>
								<Col md="2" sm="6" className="mb-1">
									<Label for="gateway" className="form-label">
										Gateway
									</Label>
									<Input
										type="select"
										id="gateway"
										value={filters.gateway}
										onChange={(e) => handleFilterChange('gateway', e.target.value)}
									>
										<option value="">All Gateways</option>
										<option value="peach">Peach Payments</option>
										<option value="stripe">Stripe</option>
										<option value="paypal">PayPal</option>
									</Input>
								</Col>
								<Col md="2" sm="6" className="mb-1">
									<Label for="startDate" className="form-label">
										Start Date
									</Label>
									<Input
										type="date"
										id="startDate"
										value={filters.startDate}
										onChange={(e) => handleFilterChange('startDate', e.target.value)}
									/>
								</Col>
								<Col md="1" sm="6" className="mb-1 d-flex align-items-end">
									<Button color="primary" block onClick={handleSearch} disabled={loading}>
										Search
									</Button>
								</Col>
							</Row>

							{/* Active Filters Display */}
							{(filters.transactionId ||
								filters.event ||
								filters.verified !== '' ||
								filters.gateway ||
								filters.startDate ||
								filters.endDate) && (
								<Row className="mb-1">
									<Col>
										<div className="d-flex align-items-center flex-wrap">
											<span className="mr-50 font-weight-bold">Active Filters:</span>
											{filters.transactionId && (
												<Badge color="light-primary" className="mr-50" pill>
													Transaction: {filters.transactionId}
												</Badge>
											)}
											{filters.event && (
												<Badge color="light-primary" className="mr-50" pill>
													Event: {filters.event}
												</Badge>
											)}
											{filters.verified !== '' && (
												<Badge color="light-primary" className="mr-50" pill>
													{filters.verified === 'true' ? 'Verified Only' : 'Unverified Only'}
												</Badge>
											)}
											{filters.gateway && (
												<Badge color="light-primary" className="mr-50" pill>
													Gateway: {filters.gateway}
												</Badge>
											)}
											{filters.startDate && (
												<Badge color="light-primary" className="mr-50" pill>
													From: {moment(filters.startDate).format('MMM DD, YYYY')}
												</Badge>
											)}
											{filters.endDate && (
												<Badge color="light-primary" className="mr-50" pill>
													To: {moment(filters.endDate).format('MMM DD, YYYY')}
												</Badge>
											)}
											<Button color="flat-danger" size="sm" onClick={handleReset}>
												Clear All
											</Button>
										</div>
									</Col>
								</Row>
							)}

							{/* Data Table */}
							<div className="react-dataTable">
								<DataTable
									noHeader
									pagination
									paginationServer
									columns={columns}
									data={webhooks}
									progressPending={loading}
									progressComponent={
										<div className="d-flex justify-content-center my-3">
											<Spinner color="primary" />
										</div>
									}
									paginationTotalRows={webhooksPagination.total}
									paginationDefaultPage={currentPage}
									onChangeRowsPerPage={handlePerRowsChange}
									onChangePage={handlePageChange}
									paginationRowsPerPageOptions={[25, 50, 100, 200]}
									customStyles={customStyles}
									noDataComponent={
										<div className="text-center my-3">
											<p className="mb-0">No webhooks found</p>
											{(filters.transactionId || filters.event || filters.verified !== '') && (
												<Button
													color="flat-primary"
													size="sm"
													className="mt-1"
													onClick={handleReset}
												>
													Clear filters to see all webhooks
												</Button>
											)}
										</div>
									}
								/>
							</div>
				</CardBody>
			</Card>
		</div>
	)
}

export default PaymentWebhooks
