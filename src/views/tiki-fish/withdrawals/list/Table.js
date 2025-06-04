// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import moment from 'moment'

// ** Invoice List Sidebar
import Sidebar from './Sidebar'

// ** Columns
import { columns } from './columns'

// ** Store & Actions
import { getAllData, getFilteredData, getFilteredRageData } from '../store/action'
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
						<Button.Ripple color="primary" onClick={toggleSidebar}>
							Make New Withdrawal
						</Button.Ripple>
				</Col>
			</Row>
		</div>
	)
}

const ReportsTable = () => {
	// ** Store Vars
	const dispatch = useDispatch()
	const store = useSelector((state) => state.withdrawals)

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
		dispatch(getAllData({ startDate: moment().format('L').split('/').join('-'), endDate: moment().format('L').split('/').join('-')}))
		dispatch(
			getFilteredData(store?.allData.withdrawals, {
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
			getFilteredData(store?.allData.withdrawals, {
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
			getFilteredData(store?.allData.withdrawals, {
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
			getFilteredData(store?.allData.withdrawals, {
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
			getAllData({ startDate: moment(date[0]).format('L').split('/').join('-'), endDate: moment(date[1]).format('L').split('/').join('-') })
		)
		dispatch(
			getFilteredData(store?.allData.withdrawals, {
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

		if (store?.data?.length > 0) {
			return store.data
		} else if (store?.data?.length === 0 && isFiltered) {
			return []
		} else {
			return store?.allData?.withdrawals?.slice(0, rowsPerPage)
		}
	}

	const renderTable = () => {
		return store?.allData?.walletSummary?.map((wallet, key) => {
			return (
				<Fragment key={key}>
					{Object.keys(wallet.categories).map((categoryKey, index) => {
						const category = wallet.categories[categoryKey]
						return (
							<tr key={index}>
								{index === 0 && (
									<td rowSpan={Object.keys(wallet.categories).length + 1}>
										<h4 className="align-middle fw-bold">{wallet.wallet}</h4>
									</td>
								)}
								<td>
									<span className="align-middle fw-bold">{categoryKey}</span>
								</td>
								<td>
									<span className="align-middle fw-bold">{category.count}</span>
								</td>
								<td>{`${category.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}`}</td>
							</tr>
						)
					})}
					<tr>
						<td>
							<h5 className="align-middle">Total</h5>
						</td>
						<td>
							<h5 className="align-middle">{wallet.count}</h5>
						</td>
						<td> <h5 className="align-middle">{`${wallet.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}`} </h5></td>
					</tr>
				</Fragment>
			)
		})
	}

	const exportToPDF = () => {
		const doc = new jsPDF()
		doc.setFontSize(24);
		doc.setTextColor("blue");
		doc.text("Celler Hut Sales Platform.", 20, 20);
		doc.setFontSize(12);
		doc.text(`Withdrawal Summary from ${moment(picker[0]).format('LL')} to ${moment(picker[1]).format('LL')}`, 20, 30);
		doc.autoTable({ html: '#withdrawal-table', startY: 40, startX: 80 })
		doc.save(`withdrawal-summary-${moment(picker[0]).format('LL')}-to-${moment(picker[1]).format('LL')}-${new Date().getTime()}.pdf`)
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
									placeholder="Withdrawal Search"
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
						<Col
							lg="4"
							md="6"
							className="d-flex align-items-sm-center justify-content-lg-end justify-content-start flex-lg-nowrap flex-wrap flex-sm-row flex-column pr-lg-1 p-0 mt-lg-0 mt-1"
						>
							<>
								<Button.Ripple color="primary" onClick={() => toggleModal()}>
									Show Summary
								</Button.Ripple>
							</>
							<Modal isOpen={modal} toggle={() => toggleModal()} className={'modal-dialog-centered modal-lg'} key={1}>
								<ModalHeader toggle={() => toggleModal()}>Withdrawal Report Summary</ModalHeader>
								<ModalBody>
									<Fragment>
										<Table bordered responsive id="withdrawal-table">
											<thead>
											<tr>
												<th>Wallet</th>
												<th>Category</th>
												<th>Count</th>
												<th>Total</th>
											</tr>
											</thead>
											<tbody>
											{renderTable()}
											<tr key={'total'}>
												<td></td>
												<td></td>
												<td>
													<span className="align-middle fw-bold"> GRAND TOTAL </span>
												</td>
												<td>
													<h3 className="align-middle fw-bold"> {`${store?.allData?.withdrawals?.filter(withdrawal => withdrawal.status === 'SUCCESS').reduce((total, withdrawal) => total + withdrawal.amount, 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}`} </h3>
												</td>
											</tr>
											
											</tbody>
										</Table>
									</Fragment>
								</ModalBody>
								<ModalFooter>
									<Button color="success" onClick={exportToPDF} className="">
										Export to PDF
									</Button>
									<Button color="primary" onClick={() => toggleModal()} outline>
										Close
									</Button>
								</ModalFooter>
							</Modal>
						</Col>
					</Row>
				</CardBody>
			</Card>

			<Card>
				<Row className="d-flex flex-row justify-content-between mx-0 mt-3">
					<Col xl="4" md="12" className="d-flex align-items-center pl-3">
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
								<option value="100">100</option>
								<option value="250">250</option>
								<option value="500">500</option>
							</CustomInput>
							<Label for="rows-per-page">Entries</Label>
						</div>
					</Col>
					<Col xl="4" md="12" className="d-flex align-items-sm-center justify-content-center pr-lg-3 p-0 mt-lg-0 mt-1">
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
					<Col
						xl='4' md='12'
						className='d-flex align-items-sm-cente justify-content-end flex-lg-nowrap flex-wrap flex-sm-row flex-column pr-lg-1 p-0 mt-lg-0 mt-1'
					>
						
							<Button.Ripple color='primary' onClick={toggleSidebar}> Make New Withdrawal </Button.Ripple>
						
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

			<Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
		</Fragment>
	)
}

export default ReportsTable
