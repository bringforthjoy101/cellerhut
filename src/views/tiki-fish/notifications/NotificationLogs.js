// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

// ** Store & Actions
import { getNotificationLogs, getNotificationStats } from './store/action'

// ** Third Party Components
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import Chart from 'react-apexcharts'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
	ChevronDown,
	Bell,
	TrendingUp,
	CheckCircle,
	XCircle,
	Users,
	Filter,
	X,
	Activity,
	Smartphone,
	Package,
	Copy,
	Eye,
	AlertTriangle,
	Mail,
	ShoppingCart,
} from 'react-feather'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	CardText,
	Button,
	Badge,
	Spinner,
	Row,
	Col,
	Label,
	CustomInput,
	Input,
	FormGroup,
	Media,
	Progress,
	UncontrolledTooltip,
} from 'reactstrap'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import moment from 'moment'
import { toast } from 'react-toastify'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/charts/recharts.scss'

const NotificationLogs = () => {
	const dispatch = useDispatch()
	const history = useHistory()

	// ** Store state
	const { logs, logsPagination, stats, loading } = useSelector((state) => state.notifications)

	// ** Local state
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(50)
	const [filters, setFilters] = useState({
		customer_id: '',
		type: '',
		status: '',
	})

	// ** Get data on mount
	useEffect(() => {
		dispatch(getNotificationStats())
		dispatch(
			getNotificationLogs({
				page: currentPage,
				limit: rowsPerPage,
				...filters,
			})
		)
	}, [dispatch])

	// ** Handle pagination
	const handlePagination = (page) => {
		const nextPage = page.selected + 1
		setCurrentPage(nextPage)
		dispatch(
			getNotificationLogs({
				page: nextPage,
				limit: rowsPerPage,
				...filters,
			})
		)
	}

	// ** Handle rows per page
	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		setRowsPerPage(value)
		setCurrentPage(1)
		dispatch(
			getNotificationLogs({
				page: 1,
				limit: value,
				...filters,
			})
		)
	}

	// ** Handle filter change
	const handleFilterChange = (field, value) => {
		const newFilters = { ...filters, [field]: value }
		setFilters(newFilters)
		setCurrentPage(1)
		dispatch(
			getNotificationLogs({
				page: 1,
				limit: rowsPerPage,
				...newFilters,
			})
		)
	}

	// ** Clear all filters
	const clearFilters = () => {
		setFilters({
			customer_id: '',
			type: '',
			status: '',
		})
		setCurrentPage(1)
		dispatch(
			getNotificationLogs({
				page: 1,
				limit: rowsPerPage,
			})
		)
	}

	// ** Copy to clipboard
	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text)
		toast.success('Copied to clipboard!')
	}

	// ** Status badge renderer
	const renderStatus = (status) => {
		const statusConfig = {
			sent: { color: 'success', icon: CheckCircle, text: 'Sent' },
			failed: { color: 'danger', icon: XCircle, text: 'Failed' },
			pending: { color: 'warning', icon: Bell, text: 'Pending' },
		}

		const config = statusConfig[status] || { color: 'secondary', icon: Bell, text: status }
		const Icon = config.icon

		return (
			<Badge color={config.color} className='text-capitalize' pill>
				<Icon size={12} className='mr-25' />
				{config.text}
			</Badge>
		)
	}

	// ** Notification type badge
	const renderType = (type) => {
		const typeConfig = {
			order_status_update: { color: 'primary', icon: Package },
			broadcast: { color: 'info', icon: Bell },
			new_order: { color: 'success', icon: ShoppingCart },
			promotion: { color: 'warning', icon: Activity },
			reminder: { color: 'secondary', icon: AlertTriangle },
		}

		const config = typeConfig[type] || { color: 'secondary', icon: Bell }
		const Icon = config.icon

		return (
			<Badge color={config.color} className='text-capitalize' pill>
				<Icon size={12} className='mr-25' />
				{type.replace(/_/g, ' ')}
			</Badge>
		)
	}

	// ** Expandable Row Component
	const ExpandedComponent = ({ data }) => (
		<div className='p-2' style={{ backgroundColor: '#f8f8f8' }}>
			<Row>
				<Col md='6'>
					<h6 className='font-weight-bold mb-1'>Notification Details</h6>
					<div className='mb-1'>
						<small className='text-muted d-block'>Full Message:</small>
						<p className='mb-0'>{data.body}</p>
					</div>
					<div className='mb-1'>
						<small className='text-muted d-block'>Notification ID:</small>
						<code>#{data.id}</code>
					</div>
					{data.error_message && (
						<div className='mb-1'>
							<small className='text-muted d-block'>Error Message:</small>
							<Badge color='light-danger'>{data.error_message}</Badge>
						</div>
					)}
				</Col>
				<Col md='6'>
					<h6 className='font-weight-bold mb-1'>Metadata</h6>
					{data.data && (
						<div className='mb-1'>
							{Object.keys(data.data).map((key) => (
								<div key={key} className='d-flex justify-content-between mb-50'>
									<small className='text-muted text-capitalize'>{key.replace(/_/g, ' ')}:</small>
									<code>{data.data[key]}</code>
								</div>
							))}
						</div>
					)}
					<div className='mb-1'>
						<small className='text-muted d-block'>Device Token ID:</small>
						<code>#{data.push_token_id}</code>
					</div>
					<div className='mb-1'>
						<small className='text-muted d-block'>Timestamps:</small>
						<div className='d-flex justify-content-between'>
							<small>Created:</small>
							<small>{moment(data.created_at).format('MMM DD, YYYY HH:mm:ss')}</small>
						</div>
						{data.sent_at && (
							<div className='d-flex justify-content-between'>
								<small>Sent:</small>
								<small>{moment(data.sent_at).format('MMM DD, YYYY HH:mm:ss')}</small>
							</div>
						)}
					</div>
				</Col>
			</Row>
		</div>
	)

	// ** Table columns
	const columns = [
		{
			name: 'Customer',
			minWidth: '200px',
			selector: 'customer',
			sortable: true,
			cell: (row) => (
				<Media>
					<div
						className='avatar bg-light-primary rounded mr-1'
						style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
					>
						<Users size={18} />
					</div>
					<Media body>
						<div className='font-weight-bold'>
							{row.customer?.firstName} {row.customer?.lastName}
						</div>
						<small className='text-muted'>{row.customer?.email}</small>
					</Media>
				</Media>
			),
		},
		{
			name: 'Type',
			minWidth: '180px',
			selector: 'notification_type',
			sortable: true,
			cell: (row) => renderType(row.notification_type),
		},
		{
			name: 'Title',
			minWidth: '150px',
			selector: 'title',
			sortable: true,
			cell: (row) => <span className='font-weight-bold'>{row.title}</span>,
		},
		{
			name: 'Message',
			minWidth: '250px',
			selector: 'body',
			cell: (row) => (
				<span className='text-truncate' style={{ maxWidth: '250px' }}>
					{row.body}
				</span>
			),
		},
		{
			name: 'Status',
			minWidth: '120px',
			selector: 'status',
			sortable: true,
			cell: (row) => renderStatus(row.status),
		},
		{
			name: 'Sent At',
			minWidth: '180px',
			selector: 'created_at',
			sortable: true,
			cell: (row) => (
				<span className='text-muted'>{moment(row.created_at).format('MMM DD, YYYY HH:mm')}</span>
			),
		},
		{
			name: 'Actions',
			minWidth: '120px',
			cell: (row) => (
				<div className='d-flex align-items-center'>
					<Copy
						size={16}
						className='cursor-pointer mr-50'
						id={`copy-${row.id}`}
						onClick={() => copyToClipboard(row.body)}
					/>
					<UncontrolledTooltip placement='top' target={`copy-${row.id}`}>
						Copy Message
					</UncontrolledTooltip>
					<Eye
						size={16}
						className='cursor-pointer'
						id={`view-${row.id}`}
						onClick={() => history.push(`/tiki-fish/customer/view/${row.customer_id}`)}
					/>
					<UncontrolledTooltip placement='top' target={`view-${row.id}`}>
						View Customer
					</UncontrolledTooltip>
				</div>
			),
		},
	]

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = logsPagination.totalPages || 1

		return (
			<ReactPaginate
				previousLabel={''}
				nextLabel={''}
				pageCount={count}
				activeClassName='active'
				forcePage={currentPage !== 0 ? currentPage - 1 : 0}
				onPageChange={(page) => handlePagination(page)}
				pageClassName={'page-item'}
				nextLinkClassName={'page-link'}
				nextClassName={'page-item next'}
				previousClassName={'page-item prev'}
				previousLinkClassName={'page-link'}
				pageLinkClassName={'page-link'}
				containerClassName={'pagination react-paginate justify-content-end my-2 pr-1'}
			/>
		)
	}

	// ** Calculate stats
	const overallStats = stats.overall || {}
	const totalNotifications = parseInt(overallStats.total_notifications) || 0
	const successful = parseInt(overallStats.successful) || 0
	const failed = parseInt(overallStats.failed) || 0
	const uniqueCustomers = parseInt(overallStats.unique_customers) || 0
	const successRate = totalNotifications > 0 ? ((successful / totalNotifications) * 100).toFixed(1) : 0

	// ** Type breakdown data
	const typeBreakdown = stats.by_type || []
	const deviceStats = stats.devices || []
	const broadcastStats = stats.broadcasts || {}

	// ** Prepare timeline data (group by hour)
	const prepareTimelineData = () => {
		if (!logs || logs.length === 0) return []

		const hourlyData = {}
		logs.forEach((log) => {
			const hour = moment(log.created_at).format('MMM DD HH:00')
			if (!hourlyData[hour]) {
				hourlyData[hour] = { time: hour, sent: 0, failed: 0 }
			}
			if (log.status === 'sent') {
				hourlyData[hour].sent++
			} else if (log.status === 'failed') {
				hourlyData[hour].failed++
			}
		})

		return Object.values(hourlyData).slice(0, 24) // Last 24 hours
	}

	const timelineData = prepareTimelineData()

	// ** Success Rate Radial Chart Options
	const successRateOptions = {
		chart: {
			sparkline: {
				enabled: true,
			},
			dropShadow: {
				enabled: true,
				blur: 3,
				left: 1,
				top: 1,
				opacity: 0.1,
			},
		},
		colors: ['#28c76f'],
		plotOptions: {
			radialBar: {
				offsetY: 10,
				startAngle: -150,
				endAngle: 150,
				hollow: {
					size: '77%',
				},
				track: {
					background: '#ebe9f1',
					strokeWidth: '50%',
				},
				dataLabels: {
					name: {
						show: false,
					},
					value: {
						color: '#5e5873',
						fontFamily: 'Montserrat',
						fontSize: '2.86rem',
						fontWeight: '600',
					},
				},
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'dark',
				type: 'horizontal',
				shadeIntensity: 0.5,
				gradientToColors: ['#28c76f'],
				inverseColors: true,
				opacityFrom: 1,
				opacityTo: 1,
				stops: [0, 100],
			},
		},
		stroke: {
			lineCap: 'round',
		},
		grid: {
			padding: {
				bottom: 30,
			},
		},
	}

	const hasActiveFilters = filters.customer_id || filters.type || filters.status

	return (
		<Fragment>
			{/* Enhanced Statistics Section */}
			<Row className='match-height'>
				{/* Success Rate Card */}
				<Col lg='4' md='6' sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>Delivery Success Rate</CardTitle>
							<Activity size={18} className='text-muted cursor-pointer' />
						</CardHeader>
						<CardBody className='p-0'>
							<Chart options={successRateOptions} series={[parseFloat(successRate)]} type='radialBar' height={245} />
						</CardBody>
						<Row className='border-top text-center mx-0'>
							<Col xs='6' className='border-right py-1'>
								<CardText className='text-muted mb-0'>Successful</CardText>
								<h3 className='font-weight-bolder mb-0 text-success'>{successful}</h3>
							</Col>
							<Col xs='6' className='py-1'>
								<CardText className='text-muted mb-0'>Failed</CardText>
								<h3 className='font-weight-bolder mb-0 text-danger'>{failed}</h3>
							</Col>
						</Row>
					</Card>
				</Col>

				{/* Notifications by Type */}
				<Col lg='8' md='6' sm='12'>
					<Card className='card-browser-states'>
						<CardHeader>
							<div>
								<CardTitle tag='h4'>Notifications by Type</CardTitle>
								<CardText className='font-small-2'>Breakdown by notification category</CardText>
							</div>
						</CardHeader>
						<CardBody>
							{typeBreakdown.length > 0 ? (
								typeBreakdown.map((type) => {
									const percentage = totalNotifications > 0 ? ((type.count / totalNotifications) * 100).toFixed(1) : 0
									const typeConfig = {
										order_status_update: { color: '#7367f0', icon: Package, label: 'Order Status' },
										broadcast: { color: '#00cfe8', icon: Bell, label: 'Broadcast' },
										new_order: { color: '#28c76f', icon: ShoppingCart, label: 'New Order' },
										promotion: { color: '#ff9f43', icon: Activity, label: 'Promotion' },
										reminder: { color: '#ea5455', icon: AlertTriangle, label: 'Reminder' },
									}
									const config = typeConfig[type.notification_type] || { color: '#6c757d', icon: Bell, label: type.notification_type }
									const Icon = config.icon

									return (
										<div key={type.notification_type} className='browser-states mb-1'>
											<Media>
												<div
													className='avatar rounded mr-1'
													style={{ width: '38px', height: '38px', backgroundColor: `${config.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
												>
													<Icon size={20} color={config.color} />
												</div>
												<h6 className='align-self-center mb-0 text-capitalize'>{config.label}</h6>
											</Media>
											<div className='d-flex flex-column' style={{ width: '140px' }}>
												<div className='d-flex justify-content-between mb-50'>
													<small className='font-weight-bold'>{type.count} notifications</small>
													<small className='text-muted'>{percentage}%</small>
												</div>
												<Progress value={percentage} style={{ height: '6px' }} color='primary' />
											</div>
										</div>
									)
								})
							) : (
								<div className='text-center text-muted py-2'>
									<Bell size={30} className='mb-1' />
									<p className='mb-0'>No notification data yet</p>
								</div>
							)}
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Timeline Chart */}
			{timelineData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle tag='h4'>
							<Activity size={20} className='mr-50' />
							Delivery Timeline
						</CardTitle>
						<CardText className='font-small-2 text-muted'>Notifications sent over time</CardText>
					</CardHeader>
					<CardBody>
						<ResponsiveContainer width='100%' height={300}>
							<AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id='colorSent' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='5%' stopColor='#28c76f' stopOpacity={0.8} />
										<stop offset='95%' stopColor='#28c76f' stopOpacity={0} />
									</linearGradient>
									<linearGradient id='colorFailed' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='5%' stopColor='#ea5455' stopOpacity={0.8} />
										<stop offset='95%' stopColor='#ea5455' stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='time' />
								<YAxis />
								<Tooltip />
								<Area type='monotone' dataKey='sent' stroke='#28c76f' fillOpacity={1} fill='url(#colorSent)' />
								<Area type='monotone' dataKey='failed' stroke='#ea5455' fillOpacity={1} fill='url(#colorFailed)' />
							</AreaChart>
						</ResponsiveContainer>
					</CardBody>
				</Card>
			)}

			{/* Device & Broadcast Stats Row */}
			<Row className='match-height'>
				{/* Device Stats */}
				<Col lg='6' sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>
								<Smartphone size={20} className='mr-50' />
								Device Breakdown
							</CardTitle>
						</CardHeader>
						<CardBody>
							{deviceStats.length > 0 ? (
								deviceStats.map((device) => {
									const activePercentage = device.total > 0 ? ((parseInt(device.active) / device.total) * 100).toFixed(1) : 0
									return (
										<div key={device.platform} className='mb-2'>
											<div className='d-flex justify-content-between mb-50'>
												<span className='text-capitalize font-weight-bold'>{device.platform}</span>
												<span>{device.active} / {device.total} active</span>
											</div>
											<Progress value={activePercentage} className='mb-50'>
												{activePercentage}%
											</Progress>
										</div>
									)
								})
							) : (
								<div className='text-center text-muted py-2'>
									<Smartphone size={30} className='mb-1' />
									<p className='mb-0'>No device data available</p>
								</div>
							)}
						</CardBody>
					</Card>
				</Col>

				{/* Broadcast Stats */}
				<Col lg='6' sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>
								<Mail size={20} className='mr-50' />
								Broadcast Performance
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Row>
								<Col xs='6' className='mb-1'>
									<CardText className='text-muted mb-25'>Total Broadcasts</CardText>
									<h3 className='font-weight-bolder mb-0'>{broadcastStats.total_broadcasts || 0}</h3>
								</Col>
								<Col xs='6' className='mb-1'>
									<CardText className='text-muted mb-25'>Completed</CardText>
									<h3 className='font-weight-bolder mb-0 text-success'>{broadcastStats.completed || 0}</h3>
								</Col>
								<Col xs='6' className='mb-1'>
									<CardText className='text-muted mb-25'>Messages Sent</CardText>
									<h3 className='font-weight-bolder mb-0'>{broadcastStats.total_sent || 0}</h3>
								</Col>
								<Col xs='6' className='mb-1'>
									<CardText className='text-muted mb-25'>Failed</CardText>
									<h3 className='font-weight-bolder mb-0 text-danger'>{broadcastStats.total_failed || 0}</h3>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Basic Stats Row */}
			<Row className='match-height'>
				<Col lg='3' sm='6'>
					<StatsHorizontal
						color='primary'
						statTitle='Total Sent'
						icon={<TrendingUp size={20} />}
						renderStats={<h3 className='font-weight-bolder mb-0'>{totalNotifications}</h3>}
					/>
				</Col>
				<Col lg='3' sm='6'>
					<StatsHorizontal
						color='success'
						statTitle='Successful'
						icon={<CheckCircle size={20} />}
						renderStats={<h3 className='font-weight-bolder mb-0'>{successful}</h3>}
					/>
				</Col>
				<Col lg='3' sm='6'>
					<StatsHorizontal
						color='danger'
						statTitle='Failed'
						icon={<XCircle size={20} />}
						renderStats={<h3 className='font-weight-bolder mb-0'>{failed}</h3>}
					/>
				</Col>
				<Col lg='3' sm='6'>
					<StatsHorizontal
						color='info'
						statTitle='Unique Customers'
						icon={<Users size={20} />}
						renderStats={<h3 className='font-weight-bolder mb-0'>{uniqueCustomers}</h3>}
					/>
				</Col>
			</Row>

			{/* Filters Card */}
			<Card>
				<CardHeader>
					<CardTitle tag='h4'>
						<Filter size={20} className='mr-50' />
						Filters
					</CardTitle>
					{hasActiveFilters && (
						<Button color='flat-danger' size='sm' onClick={clearFilters}>
							<X size={15} className='mr-50' />
							Clear Filters
						</Button>
					)}
				</CardHeader>
				<CardBody>
					<Row>
						<Col md='4'>
							<FormGroup>
								<Label for='filter-customer'>Customer ID</Label>
								<Input
									id='filter-customer'
									type='text'
									placeholder='Enter customer ID...'
									value={filters.customer_id}
									onChange={(e) => handleFilterChange('customer_id', e.target.value)}
								/>
							</FormGroup>
						</Col>
						<Col md='4'>
							<FormGroup>
								<Label for='filter-type'>Notification Type</Label>
								<CustomInput
									type='select'
									id='filter-type'
									value={filters.type}
									onChange={(e) => handleFilterChange('type', e.target.value)}
								>
									<option value=''>All Types</option>
									<option value='order_status_update'>Order Status Update</option>
									<option value='broadcast'>Broadcast</option>
									<option value='new_order'>New Order</option>
									<option value='promotion'>Promotion</option>
									<option value='reminder'>Reminder</option>
								</CustomInput>
							</FormGroup>
						</Col>
						<Col md='4'>
							<FormGroup>
								<Label for='filter-status'>Status</Label>
								<CustomInput
									type='select'
									id='filter-status'
									value={filters.status}
									onChange={(e) => handleFilterChange('status', e.target.value)}
								>
									<option value=''>All Statuses</option>
									<option value='sent'>Sent</option>
									<option value='failed'>Failed</option>
									<option value='pending'>Pending</option>
								</CustomInput>
							</FormGroup>
						</Col>
					</Row>
				</CardBody>
			</Card>

			{/* Enhanced Logs Table */}
			<Card>
				<CardHeader className='border-bottom'>
					<CardTitle tag='h4'>
						<Bell size={20} className='mr-50' />
						Notification Logs
					</CardTitle>
					{hasActiveFilters && (
						<div className='d-flex align-items-center'>
							<Badge color='light-primary' className='mr-50'>
								Filtered Results
							</Badge>
							<small className='text-muted'>
								{logs.length} of {logsPagination.total} notifications
							</small>
						</div>
					)}
				</CardHeader>

				<Row className='mx-0 mt-1 mb-50'>
					<Col sm='6'>
						<div className='d-flex align-items-center'>
							<Label for='rows-per-page' className='mb-0'>
								Show
							</Label>
							<CustomInput
								className='form-control mx-50'
								type='select'
								id='rows-per-page'
								value={rowsPerPage}
								onChange={handlePerPage}
								style={{
									width: '5rem',
									padding: '0 0.8rem',
									backgroundPosition: 'calc(100% - 3px) 11px, calc(100% - 20px) 13px, 100% 0',
								}}
							>
								<option value='25'>25</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
							</CustomInput>
							<Label for='rows-per-page' className='mb-0'>
								Entries
							</Label>
						</div>
					</Col>
					<Col sm='6'>
						<div className='d-flex justify-content-end align-items-center'>
							{loading && (
								<div className='d-flex align-items-center mr-2'>
									<Spinner size='sm' className='mr-50' />
									<span>Loading...</span>
								</div>
							)}
							<span className='text-muted'>Total: {logsPagination.total || 0} logs</span>
						</div>
					</Col>
				</Row>

				<DataTable
					noHeader
					pagination
					responsive
					paginationServer
					columns={columns}
					sortIcon={<ChevronDown />}
					className='react-dataTable'
					paginationComponent={CustomPagination}
					data={logs}
					expandableRows
					expandOnRowClicked
					expandableRowsComponent={<ExpandedComponent />}
					noDataComponent={
						<div className='p-2 text-center'>
							<Bell size={40} className='text-muted mb-1' />
							<h5>No notification logs found</h5>
							<p className='text-muted'>
								{hasActiveFilters
									? 'Try adjusting your filters to see more results.'
									: 'Notification logs will appear here once notifications are sent.'}
							</p>
						</div>
					}
				/>
			</Card>
		</Fragment>
	)
}

export default NotificationLogs
