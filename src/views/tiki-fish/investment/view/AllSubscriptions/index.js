// ** React Imports
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ** Table Columns
import { columns } from './columns'

// ** Third Party Components
import ReactPaginate from 'react-paginate'
import { ChevronDown, Share, Printer, FileText } from 'react-feather'
import DataTable from 'react-data-table-component'
import { Button, Label, Input, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, CustomInput, Row, Col, Card } from 'reactstrap'

// ** Store & Actions
import { getUserAllUtilitiesTransactions, getFilteredInvestmentPackageSubscription } from '../../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Styles
import '@styles/react/apps/app-invoice.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import moment from 'moment'

// custom Header
const CustomHeader = ({ handleFilter, searchTerm, handlePerPage, rowsPerPage, downloadCSV, storeData, downloadPDF, investmentPackageDetails }) => {
	return (
		<div className="invoice-list-table-header w-100 py-2">
			<Row>
				<Col lg="6" sm="12" className="d-flex align-items-center px-0 px-lg-1 mb-2">
					<div className="d-flex align-items-center mr-2">
						<Label for="rows-per-page">Show</Label>
						<CustomInput className="form-control ml-50 pr-3" type="select" id="rows-per-page" value={rowsPerPage} onChange={handlePerPage}>
							<option value="10">10</option>
							<option value="25">25</option>
							<option value="50">50</option>
						</CustomInput>
					</div>
					<h3 className="d-none d-lg-block">{investmentPackageDetails.name}'s Subscriptions</h3>
				</Col>
				<Col
					lg="3"
					sm="6"
					className="actions-right d-flex align-items-center justify-content-lg-end flex-lg-nowrap flex-wrap mt-lg-0 mt-1 pr-lg-1 p-0 mb-2"
				>
					<div className="d-flex align-items-center">
						<Label for="search-invoice">Search</Label>
						<Input
							id="search-invoice"
							className="ml-50 mr-2 w-100"
							type="text"
							value={searchTerm}
							onChange={(e) => handleFilter(e.target.value)}
							placeholder="Search"
						/>
					</div>
				</Col>
				<Col lg="3" sm="12">
					<UncontrolledButtonDropdown>
						<DropdownToggle color="secondary" caret outline>
							<Share size={15} />
							<span className="align-middle ml-50">Download Table</span>
						</DropdownToggle>
						<DropdownMenu right>
							{/* <DropdownItem className="w-100" onClick={() => downloadCSV(storeData)}>
								<FileText size={15} />
								<span className="align-middle ml-50">CSV</span>
							</DropdownItem> */}
							<DropdownItem className="w-100" onClick={() => downloadPDF()}>
								<FileText size={15} />
								<span className="align-middle ml-50">PDF</span>
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledButtonDropdown>
				</Col>
			</Row>
		</div>
	)
}

const AllSubscriptions = () => {
	const dispatch = useDispatch()
	const store = useSelector((state) => state.investments)

	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)

	useEffect(() => {
		// dispatch(getUserAllUtilitiesTransactions(store.userDetails.user_details.user_id))
		dispatch(
			getFilteredInvestmentPackageSubscription(store.investmentPackageDetails.investmentSubscriptions, {
				page: currentPage,
				perPage: rowsPerPage,
				q: searchTerm,
			})
		)
	}, [dispatch])

	const handleFilter = (val) => {
		setSearchTerm(val)
		dispatch(
			getFilteredInvestmentPackageSubscription(store.investmentPackageDetails.investmentSubscriptions, {
				page: currentPage,
				perPage: rowsPerPage,
				q: val,
			})
		)
	}

	const handlePerPage = (e) => {
		const value = parseInt(e.currentTarget.value)
		dispatch(
			getFilteredInvestmentPackageSubscription(store.investmentPackageDetails.investmentSubscriptions, {
				page: currentPage,
				perPage: value,
				q: searchTerm,
			})
		)
		setRowsPerPage(value)
	}

	const handlePagination = (page) => {
		dispatch(
			getFilteredInvestmentPackageSubscription(store.investmentPackageDetails.investmentSubscriptions, {
				page: page.selected + 1,
				perPage: rowsPerPage,
				q: searchTerm,
			})
		)
		setCurrentPage(page.selected + 1)
	}

	const filteredData = store?.investmentPackageDetails.investmentSubscriptions?.filter(
		(item) => item?.orderNumber?.toLowerCase() || item?.status?.toLowerCase()
	)

	const CustomPagination = () => {
		const count = Math.ceil(store?.investmentPackageDetails.investmentSubscriptions.length / rowsPerPage)

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
		const keys = Object.keys(store.investmentPackageDetails.investmentSubscriptions[0])
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
			},
			head: [['Id', 'Amount', 'Products', 'Date', 'Initiated By']],
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
		store.customerDetails.orders.map((arr) => {
			doc.autoTable({
				styles: { halign: 'left' },
				theme: 'grid',
				columnStyles: {
					0: { cellWidth: 'auto' },
					1: { cellWidth: 'auto' },
					2: { cellWidth: 'auto' },
					3: { cellWidth: 'auto' },
					4: { cellWidth: 'auto' },
				},
				body: [
					[
						arr.orderNumber,
						arr.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
						getProducts(arr.products),
						moment(arr.createdAt).format('lll'),
						`${arr.admin.firstName} ${arr.admin.lastName}`,
					],
				],
			})
		})
		doc.save(`${store.investmentPackageDetails.name}_subscriptions.pdf`)
	}

	// Data to Render
	const dataToRender = () => {
		const filters = {
			q: searchTerm,
		}

		const isFiltered = Object.keys(filters).some(function (k) {
			return filters[k].length > 0
		})
		if (store.investmentPackageDetails.investmentSubscriptions.length > 0) {
			return store.investmentPackageDetails.investmentSubscriptions
		} else if (store.investmentPackageDetails.investmentSubscriptions.length === 0 && isFiltered) {
			return []
		} else {
			return store.investmentPackageDetails.investmentSubscriptions.slice(0, rowsPerPage)
		}
	}

	return (
		<div className="invoice-list-wrapper">
			<Card>
				<div className="invoice-list-dataTable">
					<DataTable
						noHeader
						pagination
						paginationServer
						subHeader={true}
						columns={columns}
						responsive={true}
						sortIcon={<ChevronDown />}
						className="react-dataTable"
						defaultSortField="invoiceId"
						paginationDefaultPage={currentPage}
						paginationComponent={CustomPagination}
						data={dataToRender()}
						subHeaderComponent={
							<CustomHeader
								rowsPerPage={rowsPerPage}
								handleFilter={handleFilter}
								handlePerPage={handlePerPage}
								downloadCSV={downloadCSV}
								storeData={store.investmentPackageDetails.investmentSubscriptions}
								downloadPDF={downloadPDF}
								searchTerm={searchTerm}
								investmentPackageDetails={store.investmentPackageDetails}
							/>
						}
					/>
				</div>
			</Card>
		</div>
	)
}

export default AllSubscriptions
