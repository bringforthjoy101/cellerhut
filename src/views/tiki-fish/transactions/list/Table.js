// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import moment from 'moment'

// ** Invoice List Sidebar
import Sidebar from './Sidebar'

// ** Columns
import { columns } from './columns'

// ** Store & Actions
import { getAccountTransactions, getFilteredData, getFilteredRageData } from '../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Third Party Components
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import { ChevronDown, Share, FileText } from 'react-feather'
import DataTable from 'react-data-table-component'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { selectThemeColors, isUserLoggedIn } from '@utils'
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
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Table,
	Badge,
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import FormGroup from 'reactstrap/lib/FormGroup'

// ** Table Header
const CustomHeader = ({ toggleSidebar, handlePerPage, rowsPerPage, userData }) => {
	return (
		<div className="invoice-list-table-header w-100 mr-1 ml-50 mt-2 mb-75">
			<Row>
				<Col xl="6" className="d-flex align-items-center p-0">
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
						</CustomInput>
						<Label for="rows-per-page">Entries</Label>
					</div>
				</Col>
				<Col
					xl="6"
					className="d-flex align-items-sm-center justify-content-lg-end justify-content-start flex-lg-nowrap flex-wrap flex-sm-row flex-column pr-lg-1 p-0 mt-lg-0 mt-1"
				>
					{userData?.role === 'ADMIN' ? (
						<Button.Ripple color="primary" onClick={toggleSidebar}>
							{' '}
							Add New User{' '}
						</Button.Ripple>
					) : (
						''
					)}
				</Col>
			</Row>
		</div>
	)
}

const ReportsTable = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const store = useSelector((state) => state.transactions)

	// ** States
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [picker, setPicker] = useState([new Date(), new Date()])
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [currentRole, setCurrentRole] = useState({ value: '', label: 'Select Role', number: 0 })
	const [currentCategory, setCurrentCategory] = useState({ value: '', label: 'Select Category', number: 0 })
	const [userData, setUserData] = useState(null)
	const [modal, setModal] = useState(false)

	const toggleModal = () => {
		setModal(!modal)
	}

	// ** Function to toggle sidebar
	const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

	// ** Get data on mount
	useEffect(() => {
		console.log('store', store.loading)
		dispatch(getAccountTransactions({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-') }))
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: searchTerm,
			})
		)
	}, [dispatch])

	useEffect(() => {
		if (isUserLoggedIn() !== null) {
			setUserData(JSON.parse(localStorage.getItem('userData')))
		}
	}, [])

	const categoryOptions = [
		{ value: '', label: 'Select Category', number: 0 },
		{ value: 'BAR', label: 'BAR', number: 1 },
		{ value: 'RESTAURANT', label: 'RESTAUTANT', number: 2 },
	]

	// ** Function in get data on page change
	const handlePagination = (page) => {
		dispatch(
			getFilteredData(store.allData, {
				page: page.selected + 1,
				perPage: rowsPerPage,
				q: searchTerm,
			})
		)
		setCurrentPage(page.selected + 1)
	}

	// ** Function in get data on rows per page
	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: value,
				q: searchTerm,
			})
		)
		setRowsPerPage(value)
	}

	// ** Function in get data on search query change
	const handleFilter = (val) => {
		setSearchTerm(val)
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: val,
			})
		)
	}

	const handleRangeSearch = (date) => {
		const range = date.map((d) => new Date(d).getTime())
		setPicker(range)
		dispatch(
			getAccountTransactions({
				startDate: moment(date[0]).format('L').split('/').join('-'),
				endDate: moment(date[1]).format('L').split('/').join('-'),
				category: currentCategory.value,
			})
		)
		dispatch(
			getFilteredData(store.allData, {
				page: currentPage,
				perPage: rowsPerPage,
				q: searchTerm,
			})
		)
	}

	// const filteredData = store.allData.filter((item) => item.phone.toLowerCase() || item.fullName.toLowerCase() || item.role.toLowerCase())

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = Math.ceil(store.allData.length / rowsPerPage)

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
		let keys = Object.keys(array[0])
		const keysToRemove = ['_id', 'adminId', 'customerId', 'updatedAt', 'settlementId']
		keys = keys.filter((key) => !keysToRemove.includes(key))

		console.log('keyss', keys)

		result = ''
		result += keys.join(columnDelimiter)
		result += lineDelimiter

		array.forEach((item) => {
			let ctr = 0
			keys.forEach((key) => {
				if (ctr > 0) result += columnDelimiter
				if (key === 'products') {
					result += item[key].map((product) => `${product.name} X ${product.qty}`).join(' | ')
				} else if (key === 'admin') {
					result += `${item[key].firstName} ${item[key].lastName}`
				} else {
					result += item[key]
					ctr++
				}
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
			`jums_kitchen_orders_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.pdf`
		)
	}

	// ** Table data to render
	const dataToRender = () => {
		const filters = {
			q: searchTerm,
		}

		const isFiltered = Object.keys(filters).some(function (k) {
			return filters[k].length > 0
		})

		if (store.data.length > 0) {
			return store.data
		} else if (store.data.length === 0 && isFiltered) {
			return []
		} else {
			return store.allData?.slice(0, rowsPerPage)
		}
	}

	const renderTable = () => {
		return store?.allData?.summary?.map((product) => {
			return (
				<tr key={product.product}>
					<td>
						<span className="align-middle fw-bold">{product.product}</span>
					</td>
					<td>
						<span className="align-middle fw-bold">{product.qty}</span>
					</td>
					<td>{`R${product.orders.toLocaleString()}`}</td>
				</tr>
			)
		})
	}

	return (
		<Fragment>
			<Card>
				<CardHeader>
					<CardTitle tag="h4">Search Filter</CardTitle>
				</CardHeader>
				<CardBody>
					<Row form className="mt-1 mb-50">
						<Col lg="4" md="6">
							<FormGroup>
								<Label for="search-invoice"> Search:</Label>
								<Input
									id="search-invoice"
									type="text"
									value={searchTerm}
									placeholder="Sale ID Search"
									onChange={(e) => handleFilter(e.target.value)}
								/>
							</FormGroup>
						</Col>
						{/* <Col lg="4" md="6">
							<FormGroup>
								<Label for="select">Select Category:</Label>
								<Select
									theme={selectThemeColors}
									isClearable={false}
									className="react-select"
									classNamePrefix="select"
									id="select"
									options={categoryOptions}
									value={currentCategory}
									onChange={(data) => {
										setCurrentCategory(data)
										dispatch(
											getFilteredData(store.allData, {
												page: currentPage,
												perPage: rowsPerPage,
												status: data.value,
												q: searchTerm,
											})
										)
									}}
								/>
							</FormGroup>
						</Col> */}
						<Col lg="4" md="6">
							<Label for="range-picker">Select Range</Label>
							<Flatpickr
								value={picker}
								id="range-picker"
								className="form-control"
								onChange={(date) => handleRangeSearch(date)}
								options={{
									mode: 'range',
									defaultDate: ['2020-02-01', '2020-02-15'],
								}}
							/>
						</Col>
					</Row>
				</CardBody>
			</Card>

			<Card>
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
								<DropdownItem className="w-100" onClick={() => downloadCSV(store.allData.orders)}>
									<FileText size={15} />
									<span className="align-middle ml-50">CSV</span>
								</DropdownItem>
								{/* <DropdownItem className="w-100" onClick={() => downloadPDF()}>
									<FileText size={15} />
									<span className="align-middle ml-50">PDF</span>
								</DropdownItem> */}
								{/* <DropdownItem className="w-100" onClick={() => printOrder(filteredData)}>
									<Printer size={15} />
									<span className="align-middle ml-50">Print</span>
								</DropdownItem> */}
							</DropdownMenu>
						</UncontrolledButtonDropdown>
					</Col>
				</Row>
				<DataTable
					noHeader
					pagination
					subHeader
					responsive
					paginationServer
					columns={columns}
					sortIcon={<ChevronDown />}
					className="react-dataTable"
					paginationComponent={CustomPagination}
					data={dataToRender()}
					progressPending={store.loading}
					// subHeaderComponent={
					// 	<CustomHeader
					// 		toggleSidebar={toggleSidebar}
					// 		handlePerPage={handlePerPage}
					// 		rowsPerPage={rowsPerPage}
					// 		searchTerm={searchTerm}
					// 		handleFilter={handleFilter}
					// 		userData={userData}
					// 	/>
					// }
				/>
			</Card>

			{/* <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} /> */}
		</Fragment>
	)
}

export default ReportsTable
