// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Supply List Modal
import SupplyModal from './SupplyModal'

// ** Columns
import { getColumns } from './columns'

// ** Store & Actions
import { getAllData, getFilteredData, getAllSuppliers } from '../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Components
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import { ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus, X, Filter } from 'react-feather'
import DataTable from 'react-data-table-component'
import { selectThemeColors } from '@utils'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
import Flatpickr from 'react-flatpickr'
import moment from 'moment'
import {
	Row,
	Col,
	Card,
	Input,
	Label,
	Button,
	CardBody,
	CardTitle,
	CardHeader,
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	UncontrolledDropdown,
	Badge
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Table Header
const CustomHeader = ({ store, searchTerm, handlePerPage, rowsPerPage, handleFilter, toggleSidebar, activeFiltersCount }) => {
	// ** Converts table to CSV
	function convertArrayOfObjectsToCSV(array) {
		let result

		const columnDelimiter = ','
		const lineDelimiter = '\n'
		const keys = Object.keys(store.data[0])

		result = ''
		result += keys.join(columnDelimiter)
		result += lineDelimiter

		array.forEach(item => {
			let ctr = 0
			keys.forEach(key => {
				if (ctr > 0) result += columnDelimiter

				result += item[key]

				ctr++
			})
			result += lineDelimiter
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

	// ** Export XL file
	const exportToXL = (arr) => {
		const ws = XLSX.utils.json_to_sheet(arr)
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
		const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'})
		FileSaver.saveAs(data, 'supplies.xlsx')
	}

	const exportPDF = () => {
		import('jspdf').then(jsPDF => {
			import('jspdf-autotable').then(() => {
				const doc = new jsPDF.default()
				
				const tableData = store.data.map(supply => [
					supply.supplyNumber,
					supply.supplier?.name || 'Unknown',
					supply.supply_items?.length || 0,
					`R${parseFloat(supply.totalAmount || 0).toFixed(2)}`,
					supply.status,
					supply.admin?.name || 'Unknown'
				])

				doc.autoTable({
					head: [['Supply Number', 'Supplier', 'Items', 'Total Amount', 'Status', 'Created By']],
					body: tableData
				})
				doc.save('supplies.pdf')
			})
		})
	}

	return (
		<div className='invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75'>
			<Row>
				<Col xl='6' className='d-flex align-items-center p-0'>
					<div className='d-flex align-items-center w-100'>
						<label htmlFor='rows-per-page'>Show</label>
						<Input
							className='mx-50'
							type='select'
							id='rows-per-page'
							value={rowsPerPage}
							onChange={handlePerPage}
							style={{
								width: '5rem',
								padding: '0 0.8rem',
								backgroundPosition: 'calc(100% - 3px) 11px, calc(100% - 20px) 13px, 100% 0'
							}}
						>
							<option value='10'>10</option>
							<option value='25'>25</option>
							<option value='50'>50</option>
						</Input>
						<label htmlFor='rows-per-page'>Entries</label>
						{activeFiltersCount > 0 && (
							<Badge color='primary' className='ms-2'>
								<Filter size={12} className='me-25' />
								{activeFiltersCount} Filter{activeFiltersCount > 1 ? 's' : ''} Active
							</Badge>
						)}
					</div>
				</Col>
				<Col
					xl='6'
					className='d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column pe-xl-1 p-0 mt-xl-0 mt-1'
				>
					<div className='d-flex align-items-center mb-sm-0 mb-1 me-1'>
						<label className='mb-0' htmlFor='search-supply'>
							Search:
						</label>
						<Input
							id='search-supply'
							className='ms-50 w-100'
							type='text'
							value={searchTerm}
							onChange={e => handleFilter(e.target.value)}
						/>
					</div>

					<div className='d-flex align-items-center table-header-actions'>
						<UncontrolledDropdown className='me-1'>
							<DropdownToggle color='secondary' caret outline>
								<Share className='font-small-4 me-50' />
								<span className='align-middle'>Export</span>
							</DropdownToggle>
							<DropdownMenu>
								<DropdownItem className='w-100' onClick={() => exportPDF()}>
									<FileText className='font-small-4 me-50' />
									<span className='align-middle'>PDF</span>
								</DropdownItem>
								<DropdownItem className='w-100' onClick={() => exportToXL(store.data)}>
									<Grid className='font-small-4 me-50' />
									<span className='align-middle'>Excel</span>
								</DropdownItem>
								<DropdownItem className='w-100' onClick={() => downloadCSV(store.data)}>
									<File className='font-small-4 me-50' />
									<span className='align-middle'>CSV</span>
								</DropdownItem>
								<DropdownItem className='w-100' onClick={() => window.print()}>
									<Printer className='font-small-4 me-50' />
									<span className='align-middle'>Print</span>
								</DropdownItem>
							</DropdownMenu>
						</UncontrolledDropdown>

						<Button className='add-new-supply' color='primary' onClick={toggleSidebar}>
							Add New Supply
						</Button>
					</div>
				</Col>
			</Row>
		</div>
	)
}

const SuppliesList = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const store = useSelector(state => state.supplies)

	// ** States
	const [sort, setSort] = useState('desc')
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortColumn, setSortColumn] = useState('id')
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [selectedSupply, setSelectedSupply] = useState(null)
	
	// ** Filter States
	const [statusFilter, setStatusFilter] = useState('')
	const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
	const [supplierFilter, setSupplierFilter] = useState(null)
	const [dateRange, setDateRange] = useState([])
	const [suppliers, setSuppliers] = useState([])

	// ** Function to toggle sidebar
	const toggleSidebar = () => {
		if (!sidebarOpen && selectedSupply) {
			setSelectedSupply(null)
		}
		setSidebarOpen(!sidebarOpen)
	}
	
	// ** Function to handle edit
	const handleEdit = (supply) => {
		setSelectedSupply(supply)
		setSidebarOpen(true)
	}

	// ** Get suppliers for filter dropdown on mount
	useEffect(() => {
		const fetchSuppliers = async () => {
			const suppliersList = await dispatch(getAllSuppliers())
			if (suppliersList) {
				setSuppliers(suppliersList.map(supplier => ({
					value: supplier.id,
					label: supplier.name
				})))
			}
		}
		fetchSuppliers()
	}, [])

	// ** Get data on mount and when filters change
	useEffect(() => {
		dispatch(getAllData())
		
		// Build params object
		const params = {
			sort,
			sortColumn,
			q: searchTerm,
			page: currentPage,
			perPage: rowsPerPage
		}

		// Add filters to params if they have values
		if (statusFilter) params.status = statusFilter
		if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
		if (supplierFilter) params.supplierId = supplierFilter.value
		if (dateRange.length === 2) {
			params.startDate = moment(dateRange[0]).format('YYYY-MM-DD')
			params.endDate = moment(dateRange[1]).format('YYYY-MM-DD')
		}

		dispatch(getFilteredData(params))
	}, [dispatch, sort, sortColumn, currentPage, rowsPerPage, statusFilter, paymentStatusFilter, supplierFilter, dateRange])

	// ** Status filter options
	const statusOptions = [
		{ value: '', label: 'All Status' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' }
	]

	// ** Payment Status filter options
	const paymentStatusOptions = [
		{ value: '', label: 'All Payment Status' },
		{ value: 'unpaid', label: 'Unpaid' },
		{ value: 'partial', label: 'Partial' },
		{ value: 'paid', label: 'Paid' }
	]

	// ** Function in get data on page change
	const handlePagination = page => {
		setCurrentPage(page.selected + 1)
	}

	// ** Function in get data on rows per page
	const handlePerPage = e => {
		const value = parseInt(e.currentTarget.value)
		setRowsPerPage(value)
	}

	// ** Function in get data on search query change
	const handleFilter = val => {
		setSearchTerm(val)
		// Build params object
		const params = {
			sort,
			sortColumn,
			q: val,
			page: currentPage,
			perPage: rowsPerPage
		}

		// Add filters to params if they have values
		if (statusFilter) params.status = statusFilter
		if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
		if (supplierFilter) params.supplierId = supplierFilter.value
		if (dateRange.length === 2) {
			params.startDate = moment(dateRange[0]).format('YYYY-MM-DD')
			params.endDate = moment(dateRange[1]).format('YYYY-MM-DD')
		}

		dispatch(getFilteredData(params))
	}

	// ** Clear all filters
	const clearFilters = () => {
		setStatusFilter('')
		setPaymentStatusFilter('')
		setSupplierFilter(null)
		setDateRange([])
		setSearchTerm('')
		
		// Reset data with no filters
		dispatch(getFilteredData({
			sort,
			sortColumn,
			q: '',
			page: 1,
			perPage: rowsPerPage
		}))
		setCurrentPage(1)
	}

	// ** Count active filters
	const getActiveFiltersCount = () => {
		let count = 0
		if (statusFilter) count++
		if (paymentStatusFilter) count++
		if (supplierFilter) count++
		if (dateRange.length === 2) count++
		return count
	}

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = Number(Math.ceil(store.total / rowsPerPage))

		return (
			<ReactPaginate
				previousLabel={''}
				nextLabel={''}
				pageCount={count || 1}
				activeClassName='active'
				forcePage={currentPage !== 0 ? currentPage - 1 : 0}
				onPageChange={page => handlePagination(page)}
				pageClassName={'page-item'}
				nextLinkClassName={'page-link'}
				nextClassName={'page-item next'}
				previousClassName={'page-item prev'}
				previousLinkClassName={'page-link'}
				pageLinkClassName={'page-link'}
				containerClassName={'pagination react-paginate justify-content-end my-2 pe-1'}
			/>
		)
	}

	// ** Table data to render
	const dataToRender = () => {
		const filters = {
			status: statusFilter,
			paymentStatus: paymentStatusFilter,
			supplierId: supplierFilter?.value,
			q: searchTerm,
			dateRange: dateRange.length === 2 ? dateRange : null
		}

		const isFiltered = Object.keys(filters).some(function (k) {
			return filters[k] && (Array.isArray(filters[k]) ? filters[k].length > 0 : filters[k].length > 0)
		})

		if (store.data.length > 0) {
			return store.data
		} else if (store.data.length === 0 && isFiltered) {
			return []
		} else {
			return store.allData.slice(0, rowsPerPage)
		}
	}

	const handleSort = (column, sortDirection) => {
		setSort(sortDirection)
		setSortColumn(column.sortField)
		
		// Build params object
		const params = {
			sort: sortDirection,
			sortColumn: column.sortField,
			q: searchTerm,
			page: currentPage,
			perPage: rowsPerPage
		}

		// Add filters to params if they have values
		if (statusFilter) params.status = statusFilter
		if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
		if (supplierFilter) params.supplierId = supplierFilter.value
		if (dateRange.length === 2) {
			params.startDate = moment(dateRange[0]).format('YYYY-MM-DD')
			params.endDate = moment(dateRange[1]).format('YYYY-MM-DD')
		}

		dispatch(getFilteredData(params))
	}

	return (
		<Fragment>
			{/* Filter Section */}
			<Card className='mb-1'>
				<CardBody>
					<Row className='align-items-end'>
						<Col md='2' className='mb-1'>
							<Label for='status-filter'>Status</Label>
							<Input
								type='select'
								id='status-filter'
								value={statusFilter}
								onChange={e => setStatusFilter(e.target.value)}
							>
								{statusOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Input>
						</Col>
						<Col md='2' className='mb-1'>
							<Label for='payment-status-filter'>Payment Status</Label>
							<Input
								type='select'
								id='payment-status-filter'
								value={paymentStatusFilter}
								onChange={e => setPaymentStatusFilter(e.target.value)}
							>
								{paymentStatusOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Input>
						</Col>
						<Col md='3' className='mb-1'>
							<Label for='supplier-filter'>Supplier</Label>
							<Select
								isClearable
								theme={selectThemeColors}
								className='react-select'
								classNamePrefix='select'
								id='supplier-filter'
								options={suppliers}
								value={supplierFilter}
								onChange={setSupplierFilter}
								placeholder='Select Supplier...'
							/>
						</Col>
						<Col md='3' className='mb-1'>
							<Label for='date-range'>Date Range</Label>
							<Flatpickr
								className='form-control'
								value={dateRange}
								onChange={date => setDateRange(date)}
								options={{
									mode: 'range',
									dateFormat: 'd M Y',
									maxDate: new Date(),
									static: true,
									position: 'auto center'
								}}
								placeholder='Select date range'
							/>
						</Col>
						<Col md='2' className='mb-1'>
							<Button
								color='secondary'
								outline
								block
								onClick={clearFilters}
								disabled={getActiveFiltersCount() === 0}
							>
								<X size={14} className='me-50' />
								Clear Filters
							</Button>
						</Col>
					</Row>
				</CardBody>
			</Card>

			{/* Data Table */}
			<Card className='overflow-hidden'>
				<div className='react-dataTable'>
					<DataTable
						noHeader
						subHeader
						sortServer
						pagination
						responsive
						paginationServer
						columns={getColumns(handleEdit)}
						onSort={handleSort}
						sortIcon={<ChevronDown />}
						className='react-dataTable'
						paginationComponent={CustomPagination}
						data={dataToRender()}
						subHeaderComponent={
							<CustomHeader
								store={store}
								searchTerm={searchTerm}
								rowsPerPage={rowsPerPage}
								handleFilter={handleFilter}
								handlePerPage={handlePerPage}
								toggleSidebar={toggleSidebar}
								activeFiltersCount={getActiveFiltersCount()}
							/>
						}
					/>
				</div>
			</Card>
			<SupplyModal open={sidebarOpen} toggleSidebar={toggleSidebar} selectedSupply={selectedSupply} />
		</Fragment>
	)
}

export default SuppliesList