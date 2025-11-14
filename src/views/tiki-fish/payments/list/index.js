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
} from 'reactstrap'
import DataTable from 'react-data-table-component'
import { RefreshCw, Download } from 'react-feather'
import { columns } from './columns'
import { getAllTransactions, getPaymentStats } from '../store/action'
import { TransactionStatusBadge, PaymentMethodIcon, PaymentGatewayBadge } from '../components'
import moment from 'moment'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const PaymentTransactionsList = () => {
	const dispatch = useDispatch()
	const { transactions, transactionsPagination, stats, loading } = useSelector((state) => state.payments)

	// Filter states
	const [filters, setFilters] = useState({
		status: '',
		gateway: '',
		search: '',
		startDate: '',
		endDate: '',
		sortBy: 'createdAt',
		sortOrder: 'DESC',
	})

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [perPage, setPerPage] = useState(20)

	const fetchTransactions = () => {
		const params = {
			page: currentPage,
			limit: perPage,
			...(filters.status && { status: filters.status }),
			...(filters.gateway && { gateway: filters.gateway }),
			...(filters.search && { search: filters.search }),
			...(filters.startDate && { startDate: filters.startDate }),
			...(filters.endDate && { endDate: filters.endDate }),
			sortBy: filters.sortBy,
			sortOrder: filters.sortOrder,
		}
		dispatch(getAllTransactions(params))
	}

	// Load transactions on mount and when filters change
	useEffect(() => {
		fetchTransactions()
	}, [currentPage, perPage, filters.status, filters.gateway, filters.sortBy, filters.sortOrder])

	// Load stats on mount
	useEffect(() => {
		dispatch(getPaymentStats())
	}, [])

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }))
		setCurrentPage(1) // Reset to first page when filter changes
	}

	const handleSearch = () => {
		setCurrentPage(1)
		fetchTransactions()
	}

	const handleReset = () => {
		setFilters({
			status: '',
			gateway: '',
			search: '',
			startDate: '',
			endDate: '',
			sortBy: 'createdAt',
			sortOrder: 'DESC',
		})
		setCurrentPage(1)
	}

	const handleSort = (column, sortDirection) => {
		setFilters((prev) => ({
			...prev,
			sortBy: column.selector,
			sortOrder: sortDirection.toUpperCase(),
		}))
	}

	const handlePerRowsChange = (newPerPage, page) => {
		setPerPage(newPerPage)
		setCurrentPage(page)
	}

	const handlePageChange = (page) => {
		setCurrentPage(page)
	}

	// Custom styles for DataTable
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
		<div className='app-payment-list'>
			{/* Stats Cards */}
			<Row className="mb-2">
				<Col lg="3" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0">
								{stats?.overview?.totalTransactions?.toLocaleString() || 0}
							</h2>
							<p className="font-small-3 mb-0">Total Transactions</p>
						</CardBody>
					</Card>
				</Col>
				<Col lg="3" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0 text-success">
								{stats?.overview?.successCount?.toLocaleString() || 0}
							</h2>
							<p className="font-small-3 mb-0">Successful</p>
						</CardBody>
					</Card>
				</Col>
				<Col lg="3" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0 text-danger">
								{stats?.overview?.failedCount?.toLocaleString() || 0}
							</h2>
							<p className="font-small-3 mb-0">Failed</p>
						</CardBody>
					</Card>
				</Col>
				<Col lg="3" sm="6" className="mb-1">
					<Card className="mb-0">
						<CardBody className="pb-50">
							<h2 className="font-weight-bolder mb-0 text-primary">
								{Number(stats?.overview?.totalRevenue || 0).toLocaleString('en-ZA', {
									style: 'currency',
									currency: 'ZAR',
								})}
							</h2>
							<p className="font-small-3 mb-0">Total Revenue</p>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Filters Card */}
			<Card>
				<CardHeader className="border-bottom">
					<CardTitle tag="h4">Payment Transactions</CardTitle>
					<div className="d-flex align-items-center">
						<Button
							color="primary"
							size="sm"
							onClick={fetchTransactions}
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
							<Label for="search" className="form-label">
								Search
							</Label>
							<Input
								id="search"
								placeholder="Transaction ID, Order #"
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
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
								<option value="cancelled">Cancelled</option>
								<option value="refunded">Refunded</option>
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
								<option value="cash">Cash</option>
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
							<Button
								color="primary"
								block
								onClick={handleSearch}
								disabled={loading}
							>
								Search
							</Button>
						</Col>
					</Row>

					{/* Active Filters Display */}
					{(filters.status || filters.gateway || filters.search || filters.startDate || filters.endDate) && (
						<Row className="mb-1">
							<Col>
								<div className="d-flex align-items-center flex-wrap">
									<span className="mr-50 font-weight-bold">Active Filters:</span>
									{filters.status && (
										<Badge color="light-primary" className="mr-50" pill>
											Status: {filters.status}
										</Badge>
									)}
									{filters.gateway && (
										<Badge color="light-primary" className="mr-50" pill>
											Gateway: {filters.gateway}
										</Badge>
									)}
									{filters.search && (
										<Badge color="light-primary" className="mr-50" pill>
											Search: {filters.search}
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
							data={transactions}
							sortServer
							onSort={handleSort}
							progressPending={loading}
							progressComponent={
								<div className="d-flex justify-content-center my-3">
									<Spinner color="primary" />
								</div>
							}
							paginationTotalRows={transactionsPagination.total}
							paginationDefaultPage={currentPage}
							onChangeRowsPerPage={handlePerRowsChange}
							onChangePage={handlePageChange}
							paginationRowsPerPageOptions={[10, 20, 50, 100]}
							customStyles={customStyles}
							noDataComponent={
								<div className="text-center my-3">
									<p className="mb-0">No payment transactions found</p>
									{(filters.status || filters.gateway || filters.search) && (
										<Button
											color="flat-primary"
											size="sm"
											className="mt-1"
											onClick={handleReset}
										>
											Clear filters to see all transactions
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

export default PaymentTransactionsList
