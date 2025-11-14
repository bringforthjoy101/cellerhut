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
import { RefreshCw, Code, CheckCircle, XCircle, Clock } from 'react-feather'
import moment from 'moment'
import { getPaymentLogs } from '../store/action'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const PaymentLogs = () => {
	const dispatch = useDispatch()
	const { logs, logsPagination, loading } = useSelector((state) => state.payments)

	// Filter states
	const [filters, setFilters] = useState({
		transactionId: '',
		status: '',
		action: '',
		startDate: '',
		endDate: '',
	})

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [perPage, setPerPage] = useState(50)

	const fetchLogs = () => {
		const params = {
			page: currentPage,
			limit: perPage,
			...(filters.transactionId && { transactionId: filters.transactionId }),
			...(filters.status && { status: filters.status }),
			...(filters.action && { action: filters.action }),
			...(filters.startDate && { startDate: filters.startDate }),
			...(filters.endDate && { endDate: filters.endDate }),
		}
		dispatch(getPaymentLogs(params))
	}

	// Load logs on mount and when filters change
	useEffect(() => {
		fetchLogs()
	}, [currentPage, perPage])

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }))
	}

	const handleSearch = () => {
		setCurrentPage(1)
		fetchLogs()
	}

	const handleReset = () => {
		setFilters({
			transactionId: '',
			status: '',
			action: '',
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

	const getStatusIcon = (status) => {
		switch (status) {
			case 'success':
				return <CheckCircle size={16} className="text-success" />
			case 'failed':
				return <XCircle size={16} className="text-danger" />
			default:
				return <Clock size={16} className="text-warning" />
		}
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'success':
				return 'success'
			case 'failed':
				return 'danger'
			case 'pending':
				return 'warning'
			case 'processing':
				return 'info'
			default:
				return 'secondary'
		}
	}

	const columns = [
		{
			name: 'Timestamp',
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
			name: 'Action / Event',
			selector: 'action',
			sortable: true,
			minWidth: '180px',
			cell: (row) => (
				<div className="d-flex flex-column">
					<span className="font-weight-bold">{row.action || row.event}</span>
					{row.message && (
						<small className="text-muted text-truncate" style={{ maxWidth: '160px' }}>
							{row.message}
						</small>
					)}
				</div>
			),
		},
		{
			name: 'Status',
			selector: 'status',
			sortable: true,
			minWidth: '120px',
			cell: (row) => (
				<Badge color={`light-${getStatusColor(row.status)}`} className="d-flex align-items-center">
					{getStatusIcon(row.status)}
					<span className="ml-50 text-capitalize">{row.status}</span>
				</Badge>
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
			name: 'Details',
			minWidth: '100px',
			cell: (row) => (
				<div>
					{row.metadata && (
						<div>
							<Button color="flat-secondary" size="sm" id={`toggleMetadata${row.id}`}>
								<Code size={12} /> View
							</Button>
							<UncontrolledCollapse toggler={`#toggleMetadata${row.id}`}>
								<div
									className="mt-1 p-1"
									style={{
										backgroundColor: '#f8f8f8',
										borderRadius: '4px',
										maxWidth: '300px',
										overflow: 'auto',
									}}
								>
									<pre style={{ fontSize: '11px', margin: 0 }}>
										{JSON.stringify(row.metadata, null, 2)}
									</pre>
								</div>
							</UncontrolledCollapse>
						</div>
					)}
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

	return (
		<div className='app-payment-logs'>
			<Card>
				<CardHeader className="border-bottom">
					<CardTitle tag="h4">Payment Logs</CardTitle>
					<div className="d-flex align-items-center">
						<Button
							color="primary"
							size="sm"
							onClick={fetchLogs}
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
									<Label for="status" className="form-label">
										Status
									</Label>
									<Input
										type="select"
										id="status"
										value={filters.status}
										onChange={(e) => handleFilterChange('status', e.target.value)}
									>
										<option value="">All Statuses</option>
										<option value="success">Success</option>
										<option value="pending">Pending</option>
										<option value="processing">Processing</option>
										<option value="failed">Failed</option>
									</Input>
								</Col>
								<Col md="2" sm="6" className="mb-1">
									<Label for="action" className="form-label">
										Action
									</Label>
									<Input
										id="action"
										placeholder="e.g. payment.initiated"
										value={filters.action}
										onChange={(e) => handleFilterChange('action', e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
									/>
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
								<Col md="2" sm="6" className="mb-1">
									<Label for="endDate" className="form-label">
										End Date
									</Label>
									<Input
										type="date"
										id="endDate"
										value={filters.endDate}
										onChange={(e) => handleFilterChange('endDate', e.target.value)}
									/>
								</Col>
								<Col md="1" sm="6" className="mb-1 d-flex align-items-end">
									<Button color="primary" block onClick={handleSearch} disabled={loading}>
										Search
									</Button>
								</Col>
							</Row>

							{/* Active Filters Display */}
							{(filters.transactionId || filters.status || filters.action || filters.startDate || filters.endDate) && (
								<Row className="mb-1">
									<Col>
										<div className="d-flex align-items-center flex-wrap">
											<span className="mr-50 font-weight-bold">Active Filters:</span>
											{filters.transactionId && (
												<Badge color="light-primary" className="mr-50" pill>
													Transaction: {filters.transactionId}
												</Badge>
											)}
											{filters.status && (
												<Badge color="light-primary" className="mr-50" pill>
													Status: {filters.status}
												</Badge>
											)}
											{filters.action && (
												<Badge color="light-primary" className="mr-50" pill>
													Action: {filters.action}
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
									data={logs}
									progressPending={loading}
									progressComponent={
										<div className="d-flex justify-content-center my-3">
											<Spinner color="primary" />
										</div>
									}
									paginationTotalRows={logsPagination.total}
									paginationDefaultPage={currentPage}
									onChangeRowsPerPage={handlePerRowsChange}
									onChangePage={handlePageChange}
									paginationRowsPerPageOptions={[25, 50, 100, 200]}
									customStyles={customStyles}
									noDataComponent={
										<div className="text-center my-3">
											<p className="mb-0">No payment logs found</p>
											{(filters.transactionId || filters.status || filters.action) && (
												<Button
													color="flat-primary"
													size="sm"
													className="mt-1"
													onClick={handleReset}
												>
													Clear filters to see all logs
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

export default PaymentLogs
