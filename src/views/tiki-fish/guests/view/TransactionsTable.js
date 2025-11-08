// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import { Table, Badge, Row, Col, Label, CustomInput } from 'reactstrap'
import { ChevronDown } from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import moment from 'moment'

const statusColors = {
	credit: 'light-success',
	debit: 'light-danger',
}

const TransactionsTable = ({ guestData }) => {
	// ** States
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)

	// ** Get total pages count
	const count = Number((guestData.investmentTransactions?.length / rowsPerPage).toFixed(0))

	// ** Function to handle Pagination
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1)
	}

	// ** Function to handle per page
	const handlePerPage = (e) => {
		setRowsPerPage(parseInt(e.target.value))
		setCurrentPage(1)
	}

	// ** Custom Pagination
	const CustomPagination = () => (
		<Row>
			<Col sm="6">
				<Label for="sort-select">Show</Label>
				<CustomInput className="form-control mx-50 w-50" type="select" id="rows-per-page" value={rowsPerPage} onChange={handlePerPage}>
					<option value="10">10</option>
					<option value="25">25</option>
					<option value="50">50</option>
				</CustomInput>
			</Col>
			<Col sm="6">
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
			</Col>
		</Row>
	)

	// ** Table Columns
	const columns = [
		{
			name: 'ID',
			selector: 'reference',
			sortable: true,
			cell: (row) => <span className="font-weight-bold">#{row.reference}</span>,
		},
		{
			name: 'Amount',
			selector: 'amount',
			sortable: true,
			cell: (row) => <span className="font-weight-bold">{row.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>,
		},
		{
			name: 'Type',
			selector: 'type',
			sortable: true,
			cell: (row) => (
				<Badge className="text-capitalize" color={statusColors[row.type]} pill>
					{row.type}
				</Badge>
			),
		},
		{
			name: 'Description',
			selector: 'description',
			sortable: true,
		},
		{
			name: 'Pre Balance',
			selector: 'preBalance',
			sortable: true,
			cell: (row) => row.balanceBefore?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
		},
		{
			name: 'Post Balance',
			selector: 'postBalance',
			sortable: true,
			cell: (row) => row.balanceAfter?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
		},
		{
			name: 'Date',
			selector: 'createdAt',
			sortable: true,
			cell: (row) => moment(row.createdAt).format('DD/MM/YYYY HH:mm'),
		},
	]

	// ** Get current items based on pagination
	const getCurrentItems = () => {
		const start = (currentPage - 1) * rowsPerPage
		const end = start + rowsPerPage
		return guestData.investmentTransactions?.slice(start, end) || []
	}

	return (
		<div className="react-dataTable">
			<DataTable
				noHeader
				pagination
				columns={columns}
				paginationPerPage={rowsPerPage}
				className="react-dataTable"
				sortIcon={<ChevronDown size={10} />}
				paginationDefaultPage={currentPage}
				paginationComponent={CustomPagination}
				data={getCurrentItems()}
			/>
		</div>
	)
}

export default TransactionsTable
