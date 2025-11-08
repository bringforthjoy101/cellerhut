// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Columns
import { columns } from './columns'
import moment from 'moment'

// ** Store & Actions
import { getAllData, getFilteredData, getFilteredRageData, getOrder } from '../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Components
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import { ChevronDown, Share, Printer, FileText, RefreshCw } from 'react-feather'
import Flatpickr from 'react-flatpickr'
import DataTable from 'react-data-table-component'
import { selectThemeColors } from '@utils'
import PickerRange from '../../../forms/form-elements/datepicker/PickerRange'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	UncontrolledButtonDropdown,
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	Input,
	Row,
	Col,
	Label,
	CustomInput,
	Button,
	Spinner,
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/apps/app-orders.scss'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import FormGroup from 'reactstrap/lib/FormGroup'

// ** Custom Components
import OrderCard from './OrderCard'
import { OrderSkeleton, OrderTableSkeleton } from './OrderSkeleton'
import EmptyState from './EmptyState'

// ** Tracking Modals
import DispatchModal from './DispatchModal'
import TrackingModal from './TrackingModal'

const TransactionTable = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const store = useSelector((state) => state.orders)

	// ** States
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(25)
	const [picker, setPicker] = useState([])
	const [statusFilter, setStatusFilter] = useState('')
	const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
	const [loading, setLoading] = useState(false)

	// ** Tracking Modal States
	const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
	const [trackingModalOpen, setTrackingModalOpen] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState(null)

	// ** Fetch orders with server-side filtering and pagination
	const fetchOrders = async (params = {}) => {
		setLoading(true)
		const filterParams = {
			page: currentPage,
			limit: rowsPerPage,
			search: searchTerm,
			status: statusFilter,
			paymentMethod: paymentMethodFilter,
			...(picker.length === 2 && {
				startDate: moment(picker[0]).format('YYYY-MM-DD'),
				endDate: moment(picker[1]).format('YYYY-MM-DD'),
			}),
			...params,
		}
		await dispatch(getAllData(filterParams))
		setLoading(false)
	}

	// ** Refresh handler
	const handleRefresh = () => {
		fetchOrders()
	}

	useEffect(() => {
		fetchOrders()
	}, [])

	// ** Function in get data on page change
	const handlePagination = (page) => {
		const newPage = page.selected + 1
		setCurrentPage(newPage)
		fetchOrders({ page: newPage })
	}

	// ** Function in get data on rows per page
	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		setRowsPerPage(value)
		setCurrentPage(1)
		fetchOrders({ limit: value, page: 1 })
	}

	// ** Function in get data on search query change
	const handleFilter = (val) => {
		setSearchTerm(val)
		setCurrentPage(1)
		fetchOrders({ search: val, page: 1 })
	}

	// ** Function for date range filtering
	const handleRangeSearch = (date) => {
		setPicker(date)
		setCurrentPage(1)
		if (date.length === 2) {
			fetchOrders({
				startDate: moment(date[0]).format('YYYY-MM-DD'),
				endDate: moment(date[1]).format('YYYY-MM-DD'),
				page: 1
			})
		}
	}

	// ** Function for status filtering
	const handleStatusFilter = (selectedOption) => {
		const value = selectedOption ? selectedOption.value : ''
		setStatusFilter(value)
		setCurrentPage(1)
		fetchOrders({ status: value, page: 1 })
	}

	// ** Function for payment method filtering
	const handlePaymentMethodFilter = (selectedOption) => {
		const value = selectedOption ? selectedOption.value : ''
		setPaymentMethodFilter(value)
		setCurrentPage(1)
		fetchOrders({ paymentMethod: value, page: 1 })
	}

	// ** Clear all filters
	const handleClearFilters = () => {
		setSearchTerm('')
		setPicker([])
		setStatusFilter('')
		setPaymentMethodFilter('')
		setCurrentPage(1)
		fetchOrders({ search: '', status: '', paymentMethod: '', startDate: '', endDate: '', page: 1 })
	}

	// ** Tracking Handlers
	const handleDispatch = async (order) => {
		// Fetch full order details including address before opening modal
		await dispatch(getOrder(order.id))
		// The selectedOrder will be updated in the store by getOrder action
		setDispatchModalOpen(true)
	}

	const handleTrack = (order) => {
		setSelectedOrder(order)
		setTrackingModalOpen(true)
	}

	const handleDispatchSuccess = () => {
		// Refresh order data after successful dispatch
		fetchOrders()
	}

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = store.pagination?.totalPages || Math.ceil(store.total / rowsPerPage)

		return (
			<ReactPaginate
				previousLabel={''}
				nextLabel={''}
				pageCount={count || 1}
				activeClassName="active"
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

	// ** Converts table to CSV
	function convertArrayOfObjectsToCSV(array) {
		let result

		const columnDelimiter = ','
		const lineDelimiter = '\n'
		const keys = Object.keys(store.allData[0])
		console.log('keyss', keys)

		result = ''
		result += keys.join(columnDelimiter)
		result += lineDelimiter

		array.forEach((item) => {
			let ctr = 0
			keys.forEach((key) => {
				if (ctr > 0) result += columnDelimiter

				result += item[key]

				ctr++
			})
			result += lineDelimiter
			console.log('esults', result)
		})

		return result
	}

	// ** Downloads CSV
	function downloadCSV(array) {
		const link = document.createElement('a')
		let csv = convertArrayOfObjectsToCSV(array)
		if (csv === null) return

		const filename = 'export.csv'

		if (!csv.match(/^data:text\/csv/i)) {
			csv = `data:text/csv;charset=utf-8,${csv}`
		}

		link.setAttribute('href', encodeURI(csv))
		link.setAttribute('download', filename)
		link.click()
	}

	// download PDF
	const downloadPDF = () => {
		const doc = new jsPDF({
			orientation: 'landscape',
		})

		doc.autoTable({
			styles: { halign: 'left' },
			columnStyles: {
				0: { cellWidth: 'auto' },
				1: { cellWidth: 'auto' },
				2: { cellWidth: 'auto' },
				3: { cellWidth: 'auto' },
				4: { cellWidth: 'auto' },
				5: { cellWidth: 'auto' },
			},
			head: [['OrderId', 'Amount', 'Products', 'Student', 'Date', 'Initiated By']],
		})
		const getProducts = (items) => {
			const arr = []
			const _items = process.env.NODE_ENV === 'production' ? JSON.parse(items) : items
			_items.forEach((item) => {
				arr.push(`${item.name} X ${item.qty}`)
			})
			const string = arr.join(', ')
			return string
		}
		store.data.map((arr) => {
			doc.autoTable({
				styles: { halign: 'left' },
				theme: 'grid',
				columnStyles: {
					0: { cellWidth: 'auto' },
					1: { cellWidth: 'auto' },
					2: { cellWidth: 'auto' },
					3: { cellWidth: 'auto' },
					4: { cellWidth: 'auto' },
					5: { cellWidth: 'auto' },
				},
				body: [
					[
						`#${arr.orderNumber}`,
						arr.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
						getProducts(arr.products),
						`${arr.student.firstName} ${arr.student.lastName}`,
						moment(arr.createdAt).format('lll'),
						`${arr.admin.firstName} ${arr.admin.lastName}`,
					],
				],
			})
		})
		const date = new Date()
		doc.save(
			`tuckshop_orders_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.pdf`
		)
	}

	// ** Table data to render (server-side pagination)
	const dataToRender = () => {
		return store.data || []
	}

	// ** Status options for filter
	const statusOptions = [
		{ value: '', label: 'All Statuses' },
		{ value: 'order-pending', label: 'Pending' },
		{ value: 'order-processing,processing', label: 'Processing' },
		{ value: 'order-at-local-facility', label: 'At Local Facility' },
		{ value: 'order-out-for-delivery', label: 'Out for Delivery' },
		{ value: 'order-completed', label: 'Completed' },
		{ value: 'order-cancelled', label: 'Cancelled' },
		{ value: 'order-refunded', label: 'Refunded' },
		{ value: 'held', label: 'Held' }
	]

	// ** Payment method options for filter
	const paymentMethodOptions = [
		{ value: '', label: 'All Payment Methods' },
		{ value: 'cash', label: 'Cash' },
		{ value: 'mpesa', label: 'M-Pesa' },
		{ value: 'card', label: 'Card' },
		{ value: 'bank-transfer', label: 'Bank Transfer' },
		{ value: 'pos', label: 'POS' },
		{ value: 'dynamic', label: 'Dynamic' },
		{ value: 'cod', label: 'Cash on Delivery' }
	]

	return (
		<Fragment>
			<Card>
				<CardHeader className="border-bottom">
					<CardTitle tag="h4">Search & Filters</CardTitle>
					<div className="d-flex">
						<Button
							color="primary"
							outline
							size="sm"
							className="mr-50"
							onClick={handleRefresh}
							disabled={loading}
						>
							<RefreshCw size={14} className={loading ? 'rotate-animation' : ''} />
							<span className="ml-50 d-none d-sm-inline">Refresh</span>
						</Button>
						<Button color="secondary" outline size="sm" onClick={handleClearFilters}>
							Clear Filters
						</Button>
					</div>
				</CardHeader>
				<CardBody>
					<Row form className="mt-1 mb-50">
						<Col lg="3" md="6" className="mb-1">
							<FormGroup>
								<Label for="search-input">Search:</Label>
								<Input
									id="search-input"
									type="text"
									value={searchTerm}
									placeholder="Order number, customer..."
									onChange={(e) => handleFilter(e.target.value)}
								/>
							</FormGroup>
						</Col>
						<Col lg="3" md="6" className="mb-1">
							<FormGroup>
								<Label for="status-filter">Status:</Label>
								<Select
									id="status-filter"
									className="react-select"
									classNamePrefix="select"
									isClearable={true}
									options={statusOptions}
									value={statusOptions.find(opt => opt.value === statusFilter)}
									onChange={handleStatusFilter}
									theme={selectThemeColors}
								/>
							</FormGroup>
						</Col>
						<Col lg="3" md="6" className="mb-1">
							<FormGroup>
								<Label for="payment-filter">Payment Method:</Label>
								<Select
									id="payment-filter"
									className="react-select"
									classNamePrefix="select"
									isClearable={true}
									options={paymentMethodOptions}
									value={paymentMethodOptions.find(opt => opt.value === paymentMethodFilter)}
									onChange={handlePaymentMethodFilter}
									theme={selectThemeColors}
								/>
							</FormGroup>
						</Col>
						<Col lg="3" md="6" className="mb-1">
							<FormGroup>
								<Label for="range-picker">Date Range:</Label>
								<Flatpickr
									value={picker}
									id="range-picker"
									className="form-control"
									onChange={(date) => handleRangeSearch(date)}
									options={{
										mode: 'range',
										dateFormat: 'Y-m-d'
									}}
									placeholder="Select date range"
								/>
							</FormGroup>
						</Col>
					</Row>
					{(searchTerm || statusFilter || paymentMethodFilter || picker.length === 2) && (
						<Row>
							<Col xs="12">
								<div className="text-muted">
									<small>
										Showing {store.pagination?.total || 0} result{(store.pagination?.total !== 1) ? 's' : ''}
										{searchTerm && ` for "${searchTerm}"`}
									</small>
								</div>
							</Col>
						</Row>
					)}
				</CardBody>
			</Card>

			{/* Mobile View - Order Cards */}
			<div className="mobile-orders">
				{loading ? (
					// Loading skeleton for mobile
					Array.from({ length: rowsPerPage }).map((_, index) => (
						<OrderSkeleton key={`skeleton-${index}`} />
					))
				) : dataToRender().length > 0 ? (
					// Render order cards
					<>
						{dataToRender().map((order) => (
							<OrderCard
								key={order.id}
								order={order}
								onDispatch={handleDispatch}
								onTrack={handleTrack}
							/>
						))}
						{/* Pagination for mobile */}
						<Card>
							<CardBody className="p-1">
								<CustomPagination />
							</CardBody>
						</Card>
					</>
				) : (
					// Empty state for mobile
					<EmptyState
						type={searchTerm || statusFilter || paymentMethodFilter || picker.length === 2 ? 'no-results' : 'no-data'}
						onClearFilters={handleClearFilters}
					/>
				)}
			</div>

			{/* Desktop View - Data Table */}
			<Card className="desktop-table">
				<Row className="mx-0 mt-3">
					<Col xl="6" sm="12" className="d-flex align-items-center pl-3">
						<div className="d-flex align-items-center w-100">
							<Label for="rows-per-page">Show</Label>
							<CustomInput
								className="form-control mx-50"
								type="select"
								id="rows-per-page"
								value={rowsPerPage}
								onChange={handlePerPage}
								style={{
									width: '10rem',
									padding: '0 0.8rem',
									backgroundPosition: 'calc(100% - 3px) 11px, calc(100% - 20px) 13px, 100% 0',
								}}
							>
								<option value="10">10</option>
								<option value="25">25</option>
								<option value="50">50</option>
								<option value="100">100</option>
							</CustomInput>
							<Label for="rows-per-page">Entries</Label>
						</div>
					</Col>
					<Col xl="6" sm="12" className="d-flex align-items-sm-center justify-content-lg-end justify-content-center pr-lg-3 p-0 mt-lg-0 mt-1">
						<UncontrolledButtonDropdown>
							<DropdownToggle className="mr-lg-0 mr-5" color="secondary" caret outline>
								<Share size={15} />
								<span className="align-middle ml-lg-50">Download Table</span>
							</DropdownToggle>
							<DropdownMenu right>
								<DropdownItem className="w-100" onClick={() => downloadPDF()}>
									<FileText size={15} />
									<span className="align-middle ml-50">PDF</span>
								</DropdownItem>
							</DropdownMenu>
						</UncontrolledButtonDropdown>
					</Col>
				</Row>
				{loading ? (
					// Loading skeleton for desktop
					<div className="p-2">
						<OrderTableSkeleton rows={rowsPerPage} />
					</div>
				) : dataToRender().length > 0 ? (
					// Render data table
					<DataTable
						noHeader
						pagination
						subHeader
						responsive
						paginationServer
						columns={columns.map((col) => (
							col.name === 'Actions'
								? {
										...col,
										onDispatch: handleDispatch,
										onTrack: handleTrack,
								  }
								: col
						))}
						sortIcon={<ChevronDown />}
						className="react-dataTable"
						paginationComponent={CustomPagination}
						data={dataToRender()}
					/>
				) : (
					// Empty state for desktop
					<EmptyState
						type={searchTerm || statusFilter || paymentMethodFilter || picker.length === 2 ? 'no-results' : 'no-data'}
						onClearFilters={handleClearFilters}
					/>
				)}
			</Card>

			{/* Tracking Modals */}
			<DispatchModal
				isOpen={dispatchModalOpen}
				toggle={() => setDispatchModalOpen(!dispatchModalOpen)}
				order={store.selectedOrder}
				onDispatchSuccess={handleDispatchSuccess}
			/>

			<TrackingModal
				isOpen={trackingModalOpen}
				toggle={() => setTrackingModalOpen(!trackingModalOpen)}
				order={selectedOrder}
			/>
		</Fragment>
	)
}

export default TransactionTable
