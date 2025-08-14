import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
	Alert
} from 'reactstrap'
import { 
	Plus, 
	RefreshCw, 
	TrendingUp, 
	Package,
	CheckCircle,
	Clock,
	AlertCircle,
	XCircle,
	ChevronDown
} from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import { useHistory } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { getCounts, getCountAnalytics } from '../store/action'

// ** Components
import CreateCountModal from './CreateCountModal'
import CountFilters from './CountFilters'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'

const InventoryCountList = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const history = useHistory()
	const store = useSelector(state => state.inventoryCount)

	// ** States
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [filters, setFilters] = useState({
		status: '',
		countType: '',
		startDate: '',
		endDate: ''
	})

	// ** Get data on mount
	useEffect(() => {
		dispatch(getCounts({
			page: currentPage,
			limit: rowsPerPage,
			...filters
		}))
		dispatch(getCountAnalytics())
	}, [dispatch, currentPage, rowsPerPage])

	// ** Function to handle filter
	const handleFilter = () => {
		dispatch(getCounts({
			page: 1,
			limit: rowsPerPage,
			...filters
		}))
		setCurrentPage(1)
	}

	// ** Function to handle Pagination
	const handlePagination = page => {
		setCurrentPage(page.selected + 1)
		dispatch(getCounts({
			page: page.selected + 1,
			limit: rowsPerPage,
			...filters
		}))
	}

	// ** Function to handle per page
	const handlePerPage = e => {
		setRowsPerPage(parseInt(e.target.value))
		dispatch(getCounts({
			page: 1,
			limit: parseInt(e.target.value),
			...filters
		}))
	}

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = Math.ceil(store.pagination.total / rowsPerPage)

		return (
			<ReactPaginate
				previousLabel={''}
				nextLabel={''}
				pageCount={count || 1}
				activeClassName='active'
				forcePage={currentPage - 1}
				onPageChange={handlePagination}
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

	// ** Table columns
	const columns = [
		{
			name: 'Count Number',
			sortable: true,
			minWidth: '150px',
			selector: row => row.countNumber,
			cell: row => (
				<div 
					className='d-flex align-items-center cursor-pointer'
					onClick={() => history.push(`/inventory/counts/${row.id}`)}
				>
					<div className='d-flex flex-column'>
						<span className='font-weight-bold'>{row.countNumber}</span>
						<small className='text-muted'>{moment(row.countDate).format('DD MMM YYYY')}</small>
					</div>
				</div>
			)
		},
		{
			name: 'Type',
			sortable: true,
			minWidth: '100px',
			selector: row => row.countType,
			cell: row => (
				<Badge color='light-primary' pill>
					{row.countType}
				</Badge>
			)
		},
		{
			name: 'Status',
			sortable: true,
			minWidth: '120px',
			selector: row => row.status,
			cell: row => {
				const statusColors = {
					draft: 'light-secondary',
					in_progress: 'light-warning',
					review: 'light-info',
					approved: 'light-primary',
					completed: 'light-success',
					cancelled: 'light-danger'
				}
				return (
					<Badge color={statusColors[row.status]} pill>
						{row.status.replace('_', ' ')}
					</Badge>
				)
			}
		},
		{
			name: 'Progress',
			sortable: true,
			minWidth: '150px',
			selector: row => row.countedItems,
			cell: row => {
				const progress = row.totalItems > 0 
					? Math.round((row.countedItems / row.totalItems) * 100) 
					: 0
				return (
					<div className='w-100'>
						<div className='d-flex justify-content-between mb-1'>
							<small>{row.countedItems}/{row.totalItems}</small>
							<small>{progress}%</small>
						</div>
						<Progress 
							value={progress} 
							color={progress === 100 ? 'success' : progress > 50 ? 'primary' : 'warning'}
							style={{ height: '6px' }}
						/>
					</div>
				)
			}
		},
		{
			name: 'Assigned To',
			sortable: true,
			minWidth: '150px',
			selector: row => row.assignee,
			cell: row => (
				<div>
					{row.assignee ? (
						<span>{row.assignee.firstName} {row.assignee.lastName}</span>
					) : (
						<span className='text-muted'>Unassigned</span>
					)}
				</div>
			)
		},
		{
			name: 'Variance',
			sortable: true,
			minWidth: '120px',
			selector: row => row.totalVariance,
			cell: row => (
				<span className={row.totalVariance > 0 ? 'text-danger' : 'text-success'}>
					R {Math.abs(row.totalVariance || 0).toFixed(2)}
				</span>
			)
		},
		{
			name: 'Actions',
			minWidth: '100px',
			cell: row => (
				<Button
					color='primary'
					size='sm'
					onClick={() => history.push(`/inventory/counts/${row.id}`)}
				>
					View
				</Button>
			)
		}
	]

	// ** Analytics Cards
	const renderAnalytics = () => {
		if (!store.analytics) return null

		const { summary } = store.analytics

		return (
			<Row className='mb-2'>
				<Col lg='3' md='6' className='mb-1'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-primary mr-2'>
									<Package size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Counts</h6>
									<h4 className='mb-0'>{summary.totalCounts}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6' className='mb-1'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-warning mr-2'>
									<Clock size={20} />
								</div>
								<div>
									<h6 className='mb-0'>In Progress</h6>
									<h4 className='mb-0'>{summary.inProgressCounts}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6' className='mb-1'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-success mr-2'>
									<CheckCircle size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Completed</h6>
									<h4 className='mb-0'>{summary.completedCounts}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col lg='3' md='6' className='mb-1'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-info mr-2'>
									<TrendingUp size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Accuracy</h6>
									<h4 className='mb-0'>{summary.averageAccuracy}%</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>
		)
	}

	return (
		<Fragment>
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>Inventory Counts</CardTitle>
							<div className='d-flex'>
								<Button
									color='primary'
									onClick={() => setCreateModalOpen(true)}
									className='mr-1'
								>
									<Plus size={14} className='mr-50' />
									New Count
								</Button>
								<Button
									color='secondary'
									outline
									onClick={() => handleFilter()}
								>
									<RefreshCw size={14} />
								</Button>
							</div>
						</CardHeader>
					</Card>
				</Col>
			</Row>

			{renderAnalytics()}

			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<CountFilters 
								filters={filters}
								setFilters={setFilters}
								onFilter={handleFilter}
							/>
							
							{store.error && (
								<Alert color='danger' className='mb-2'>
									<AlertCircle size={14} className='mr-1' />
									{store.error}
								</Alert>
							)}

							<DataTable
								noHeader
								pagination
								responsive
								paginationServer
								columns={columns}
								sortIcon={<ChevronDown />}
								className='react-dataTable'
								progressPending={store.loading}
								paginationComponent={CustomPagination}
								data={store.counts}
								noDataComponent={
									<div className='p-2'>
										No inventory counts found. Create your first count to get started.
									</div>
								}
							/>
						</CardBody>
					</Card>
				</Col>
			</Row>

			<CreateCountModal
				open={createModalOpen}
				toggle={() => setCreateModalOpen(!createModalOpen)}
				onSuccess={() => {
					setCreateModalOpen(false)
					handleFilter()
				}}
			/>
		</Fragment>
	)
}

export default InventoryCountList