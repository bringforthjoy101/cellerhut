// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Supply List Modal
import SupplyModal from './SupplyModal'

// ** Columns
import { columns } from './columns'

// ** Store & Actions
import { getAllData, getFilteredData } from '../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Components
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import { ChevronDown, Share, Printer, FileText, File, Grid, Copy, Plus } from 'react-feather'
import DataTable from 'react-data-table-component'
import { selectThemeColors } from '@utils'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
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
	UncontrolledDropdown
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'

// ** Table Header
const CustomHeader = ({ store, searchTerm, handlePerPage, rowsPerPage, handleFilter, toggleSidebar }) => {
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
	const [currentStatus, setCurrentStatus] = useState({ value: '', label: 'Select Status', number: 0 })

	// ** Function to toggle sidebar
	const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

	// ** Get data on mount
	useEffect(() => {
		dispatch(getAllData())
		dispatch(
			getFilteredData({
				sort,
				sortColumn,
				q: searchTerm,
				page: currentPage,
				perPage: rowsPerPage,
				status: currentStatus.value
			})
		)
	}, [dispatch, store.data.length, sort, sortColumn, currentPage])

	// ** User filter options
	const statusOptions = [
		{ value: '', label: 'Select Status', number: 0 },
		{ value: 'pending', label: 'Pending', number: 1 },
		{ value: 'approved', label: 'Approved', number: 2 },
		{ value: 'rejected', label: 'Rejected', number: 3 }
	]

	// ** Function in get data on page change
	const handlePagination = page => {
		dispatch(
			getFilteredData({
				sort,
				sortColumn,
				q: searchTerm,
				perPage: rowsPerPage,
				page: page.selected + 1,
				status: currentStatus.value
			})
		)
		setCurrentPage(page.selected + 1)
	}

	// ** Function in get data on rows per page
	const handlePerPage = e => {
		const value = parseInt(e.currentTarget.value)
		dispatch(
			getFilteredData({
				sort,
				sortColumn,
				q: searchTerm,
				perPage: value,
				page: currentPage,
				status: currentStatus.value
			})
		)
		setRowsPerPage(value)
	}

	// ** Function in get data on search query change
	const handleFilter = val => {
		setSearchTerm(val)
		dispatch(
			getFilteredData({
				sort,
				sortColumn,
				q: val,
				page: currentPage,
				perPage: rowsPerPage,
				status: currentStatus.value
			})
		)
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
			status: currentStatus.value,
			q: searchTerm
		}

		const isFiltered = Object.keys(filters).some(function (k) {
			return filters[k] && filters[k].length > 0
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
		dispatch(
			getFilteredData({
				sort,
				sortColumn,
				q: searchTerm,
				page: currentPage,
				perPage: rowsPerPage,
				status: currentStatus.value
			})
		)
	}

	return (
		<Fragment>
			<Card className='overflow-hidden'>
				<div className='react-dataTable'>
					<DataTable
						noHeader
						subHeader
						sortServer
						pagination
						responsive
						paginationServer
						columns={columns}
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
							/>
						}
					/>
				</div>
			</Card>
			<SupplyModal open={sidebarOpen} toggleSidebar={toggleSidebar} />
		</Fragment>
	)
}

export default SuppliesList