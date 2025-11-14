// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// ** Store & Actions
import { getAllBroadcasts } from './store/action'

// ** Third Party Components
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import { ChevronDown, Send, MessageSquare, Users, CheckCircle, XCircle, Clock } from 'react-feather'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Button,
	Badge,
	Spinner,
	Row,
	Col,
	Label,
	CustomInput,
} from 'reactstrap'
import moment from 'moment'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

const BroadcastHistory = () => {
	const dispatch = useDispatch()
	const history = useHistory()

	// ** Store state
	const { broadcasts, broadcastPagination, loading } = useSelector((state) => state.notifications)

	// ** Local state
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(20)

	// ** Get data on mount
	useEffect(() => {
		dispatch(getAllBroadcasts({ page: currentPage, limit: rowsPerPage }))
	}, [dispatch])

	// ** Handle pagination
	const handlePagination = (page) => {
		const nextPage = page.selected + 1
		setCurrentPage(nextPage)
		dispatch(getAllBroadcasts({ page: nextPage, limit: rowsPerPage }))
	}

	// ** Handle rows per page
	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		setRowsPerPage(value)
		setCurrentPage(1)
		dispatch(getAllBroadcasts({ page: 1, limit: value }))
	}

	// ** Status badge renderer
	const renderStatus = (status) => {
		const statusConfig = {
			sent: { color: 'success', icon: CheckCircle, text: 'Sent' },
			failed: { color: 'danger', icon: XCircle, text: 'Failed' },
			sending: { color: 'warning', icon: Clock, text: 'Sending' },
			draft: { color: 'secondary', icon: MessageSquare, text: 'Draft' },
		}

		const config = statusConfig[status] || statusConfig.draft
		const Icon = config.icon

		return (
			<Badge color={config.color} className='text-capitalize' pill>
				<Icon size={12} className='mr-25' />
				{config.text}
			</Badge>
		)
	}

	// ** Table columns
	const columns = [
		{
			name: 'Title',
			minWidth: '200px',
			selector: 'title',
			sortable: true,
			cell: (row) => (
				<div className='d-flex align-items-center'>
					<MessageSquare size={16} className='text-primary mr-50' />
					<span className='font-weight-bold'>{row.title}</span>
				</div>
			),
		},
		{
			name: 'Message',
			minWidth: '250px',
			selector: 'message',
			cell: (row) => (
				<span className='text-truncate' style={{ maxWidth: '250px' }}>
					{row.message}
				</span>
			),
		},
		{
			name: 'Target',
			minWidth: '130px',
			selector: 'target_audience',
			sortable: true,
			cell: (row) => (
				<div className='d-flex align-items-center'>
					<Users size={14} className='mr-50' />
					<span className='text-capitalize'>{row.target_audience}</span>
				</div>
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
			name: 'Recipients',
			minWidth: '110px',
			selector: 'recipients_count',
			sortable: true,
			center: true,
			cell: (row) => (
				<span className='font-weight-bold text-primary'>{row.recipients_count || 0}</span>
			),
		},
		{
			name: 'Sent',
			minWidth: '100px',
			selector: 'success_count',
			sortable: true,
			center: true,
			cell: (row) => (
				<Badge color='light-success' pill>
					{row.success_count || 0}
				</Badge>
			),
		},
		{
			name: 'Failed',
			minWidth: '100px',
			selector: 'failure_count',
			sortable: true,
			center: true,
			cell: (row) => (
				row.failure_count > 0 ? (
					<Badge color='light-danger' pill>
						{row.failure_count}
					</Badge>
				) : (
					<Badge color='light-secondary' pill>
						0
					</Badge>
				)
			),
		},
		{
			name: 'Created',
			minWidth: '180px',
			selector: 'created_at',
			sortable: true,
			cell: (row) => (
				<span className='text-muted'>{moment(row.created_at).format('MMM DD, YYYY HH:mm')}</span>
			),
		},
	]

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = broadcastPagination.totalPages || 1

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

	return (
		<Fragment>
			<Card>
				<CardHeader className='border-bottom'>
					<CardTitle tag='h4'>
						<MessageSquare size={20} className='mr-50' />
						Broadcast History
					</CardTitle>
					<Button color='primary' onClick={() => history.push('/notifications/broadcast')}>
						<Send size={15} className='mr-50' />
						New Broadcast
					</Button>
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
								<option value='10'>10</option>
								<option value='20'>20</option>
								<option value='50'>50</option>
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
							<span className='text-muted'>
								Total: {broadcastPagination.total || 0} broadcasts
							</span>
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
					data={broadcasts}
					noDataComponent={
						<div className='p-2 text-center'>
							<MessageSquare size={40} className='text-muted mb-1' />
							<h5>No broadcasts yet</h5>
							<p className='text-muted'>
								Start by creating your first broadcast message to notify customers.
							</p>
							<Button
								color='primary'
								outline
								onClick={() => history.push('/notifications/broadcast')}
							>
								<Send size={15} className='mr-50' />
								Create Broadcast
							</Button>
						</div>
					}
				/>
			</Card>
		</Fragment>
	)
}

export default BroadcastHistory
