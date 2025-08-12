// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Supplier List Modal
import SupplierModal from './SupplierModal'

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
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'

// ** Table Header
const CustomHeader = ({ store, toggleSidebar, handlePerPage, rowsPerPage, handleFilter, searchTerm, handleStatusFilter }) => {
	return (
		<div className="invoice-list-table-header w-100 mr-1 ml-50 d-flex justify-content-between flex-wrap px-0">
			<div className="d-flex align-items-center flex-wrap">
				<div className="d-flex align-items-center mr-2">
					<Label for="rows-per-page">Show</Label>
					<Input
						className="mx-50"
						type="select"
						id="rows-per-page"
						value={rowsPerPage}
						onChange={handlePerPage}
						style={{ width: '5rem' }}
					>
						<option value="10">10</option>
						<option value="25">25</option>
						<option value="50">50</option>
					</Input>
					<Label for="rows-per-page">Entries</Label>
				</div>
				<div className="d-flex align-items-center mr-2">
					<Label className="mr-1" for="search-invoice">
						Search:
					</Label>
					<Input
						id="search-invoice"
						className="ml-50 w-100"
						type="text"
						value={searchTerm}
						onChange={(e) => handleFilter(e.target.value)}
						placeholder="Search Name, Email, Phone..."
					/>
				</div>
				<div className="d-flex align-items-center">
					<Label className="mr-1" for="status-select">
						Status:
					</Label>
					<Select
						theme={selectThemeColors}
						isClearable={false}
						className="react-select"
						classNamePrefix="select"
						options={[
							{ value: '', label: 'All' },
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' }
						]}
						value={[
							{ value: '', label: 'All' },
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' }
						].find(option => option.value === store.params?.status) || { value: '', label: 'All' }}
						onChange={(data) => handleStatusFilter(data ? data.value : '')}
					/>
				</div>
			</div>

			<div className="d-flex align-items-center flex-wrap">
				<UncontrolledDropdown className="mr-1">
					<DropdownToggle color="secondary" caret outline>
						<Share className="font-small-4 mr-50" />
						<span className="align-middle">Export</span>
					</DropdownToggle>
					<DropdownMenu>
						<DropdownItem className="w-100">
							<FileText className="font-small-4 mr-50" />
							<span className="align-middle">CSV</span>
						</DropdownItem>
						<DropdownItem className="w-100">
							<Grid className="font-small-4 mr-50" />
							<span className="align-middle">Excel</span>
						</DropdownItem>
						<DropdownItem className="w-100">
							<File className="font-small-4 mr-50" />
							<span className="align-middle">PDF</span>
						</DropdownItem>
						<DropdownItem className="w-100">
							<Copy className="font-small-4 mr-50" />
							<span className="align-middle">Copy</span>
						</DropdownItem>
					</DropdownMenu>
				</UncontrolledDropdown>

				<Button className="add-new-user" color="primary" onClick={toggleSidebar}>
					<Plus size={15} />
					<span className="align-middle">Add Supplier</span>
				</Button>
			</div>
		</div>
	)
}

const SuppliersList = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const store = useSelector((state) => state.suppliers)

	// ** States
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	// ** Function to toggle sidebar
	const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

	// ** Get data on mount
	useEffect(() => {
		dispatch(getAllData())
	}, [dispatch])

	// ** Function in get data on page change
	useEffect(() => {
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: searchTerm,
				status: store.params?.status
			})
		)
	}, [dispatch, store.allData, currentPage, rowsPerPage, searchTerm, store.params?.status])

	// ** Function in get data on search query change
	const handleFilter = (val) => {
		setSearchTerm(val)
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: val,
				status: store.params?.status
			})
		)
	}

	// ** Function to handle status filter
	const handleStatusFilter = (status) => {
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: searchTerm,
				status
			})
		)
	}

	// ** Function to handle per page
	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		setCurrentPage(1)
		setRowsPerPage(value)
	}

	// ** Function to handle pagination
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1)
	}

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = Number(Math.ceil(store.total / rowsPerPage))

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

	// ** Table data to render
	const dataToRender = () => {
		const filters = {
			q: searchTerm,
			status: store.params?.status
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

	return (
		<Fragment>
			<Card>
				<CardHeader>
					<CardTitle tag="h4">Suppliers</CardTitle>
				</CardHeader>
				<CardBody>
					<div className="invoice-list-wrapper">
						<div className="invoice-list-dataTable">
							<DataTable
								noHeader
								subHeader
								sortServer
								pagination
								responsive
								paginationServer
								columns={columns}
								onSort={() => {}}
								sortIcon={<ChevronDown />}
								className="react-dataTable"
								paginationComponent={CustomPagination}
								data={dataToRender()}
								subHeaderComponent={
									<CustomHeader
										store={store}
										searchTerm={searchTerm}
										rowsPerPage={rowsPerPage}
										handleFilter={handleFilter}
										handlePerPage={handlePerPage}
										handleStatusFilter={handleStatusFilter}
										toggleSidebar={toggleSidebar}
									/>
								}
							/>
						</div>
					</div>
				</CardBody>
			</Card>

			<SupplierModal open={sidebarOpen} toggleSidebar={toggleSidebar} />
		</Fragment>
	)
}

export default SuppliersList