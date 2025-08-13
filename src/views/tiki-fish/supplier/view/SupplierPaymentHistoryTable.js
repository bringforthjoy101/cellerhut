// ** React Imports
import { useEffect, useState } from 'react'

// ** Reactstrap Imports
import { 
	Card, 
	CardBody, 
	CardHeader, 
	CardTitle,
	Table,
	Badge,
	Button,
	Input,
	Label,
	Row,
	Col,
	Spinner,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
} from 'reactstrap'

// ** Icons
import { DollarSign, Download, FileText, CreditCard, Calendar, TrendingUp } from 'react-feather'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { getSupplierPaymentHistory } from '../store/action'

// ** Utils
import { formatRandWithSeparator } from '../../shared/currencyUtils'
import moment from 'moment'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import Flatpickr from 'react-flatpickr'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

const SupplierPaymentHistoryTable = ({ supplierId }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [payments, setPayments] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [dateRange, setDateRange] = useState([])
	const [summary, setSummary] = useState({
		totalPayments: 0,
		totalAmountPaid: 0
	})

	// ** Fetch payment history
	const fetchPaymentHistory = async () => {
		setLoading(true)
		try {
			const params = {}
			if (dateRange.length === 2) {
				params.startDate = moment(dateRange[0]).format('YYYY-MM-DD')
				params.endDate = moment(dateRange[1]).format('YYYY-MM-DD')
			}
			
			const result = await dispatch(getSupplierPaymentHistory(supplierId, params))
			if (result) {
				setPayments(result.payments || [])
				setSummary({
					totalPayments: result.totalPayments || 0,
					totalAmountPaid: result.totalAmountPaid || 0
				})
			}
		} catch (error) {
			console.error('Error fetching payment history:', error)
		} finally {
			setLoading(false)
		}
	}

	// ** Get payment history on mount and when filters change
	useEffect(() => {
		if (supplierId) {
			fetchPaymentHistory()
		}
	}, [supplierId, dateRange])

	// ** Renders Payment Method
	const renderPaymentMethod = (method) => {
		const icon = method === 'cash' ? '💵' : '🏦'
		const color = method === 'cash' ? 'light-success' : 'light-info'
		
		return (
			<Badge color={color} pill>
				{icon} {method === 'bank-transfer' ? 'Bank Transfer' : 'Cash'}
			</Badge>
		)
	}

	// ** Column definitions
	const columns = [
		{
			name: 'Payment Date',
			sortable: true,
			minWidth: '150px',
			selector: row => row.paymentDate,
			cell: row => (
				<div>
					<span className='fw-bolder'>
						{moment(row.paymentDate).format('DD MMM YYYY')}
					</span>
					<small className='text-muted d-block'>
						{moment(row.paymentDate).format('h:mm A')}
					</small>
				</div>
			)
		},
		{
			name: 'Supply Reference',
			sortable: true,
			minWidth: '150px',
			selector: row => row.supply?.supplyNumber,
			cell: row => (
				<span className='text-truncate fw-bolder'>
					{row.supply?.supplyNumber || 'N/A'}
				</span>
			)
		},
		{
			name: 'Amount',
			sortable: true,
			minWidth: '130px',
			selector: row => row.amount,
			cell: row => (
				<span className='fw-bolder text-success'>
					{formatRandWithSeparator(row.amount || 0)}
				</span>
			)
		},
		{
			name: 'Payment Method',
			sortable: true,
			minWidth: '150px',
			selector: row => row.paymentMethod,
			cell: row => renderPaymentMethod(row.paymentMethod)
		},
		{
			name: 'Reference',
			sortable: false,
			minWidth: '150px',
			selector: row => row.reference,
			cell: row => (
				<span className='text-truncate'>
					{row.reference || '-'}
				</span>
			)
		},
		{
			name: 'Recorded By',
			sortable: true,
			minWidth: '150px',
			selector: row => row.admin,
			cell: row => (
				<div>
					<span className='d-block'>
						{row.admin ? `${row.admin.firstName} ${row.admin.lastName}` : 'Unknown'}
					</span>
					<small className='text-muted'>
						{moment(row.createdAt).fromNow()}
					</small>
				</div>
			)
		}
	]

	// ** Filter data
	const filteredData = payments.filter(payment => {
		const matchesSearch = !searchTerm || 
			payment.supply?.supplyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			moment(payment.paymentDate).format('DD MMM YYYY').toLowerCase().includes(searchTerm.toLowerCase())
		
		return matchesSearch
	})

	// ** Export to Excel
	const exportToExcel = () => {
		const exportData = payments.map(payment => ({
			PaymentDate: moment(payment.paymentDate).format('DD MMM YYYY HH:mm'),
			SupplyReference: payment.supply?.supplyNumber || 'N/A',
			Amount: payment.amount || 0,
			PaymentMethod: payment.paymentMethod,
			Reference: payment.reference || '-',
			RecordedBy: payment.admin ? `${payment.admin.firstName} ${payment.admin.lastName}` : 'Unknown',
			CreatedAt: moment(payment.createdAt).format('DD MMM YYYY HH:mm')
		}))

		const ws = XLSX.utils.json_to_sheet(exportData)
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
		const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'})
		FileSaver.saveAs(data, `payment-history-${moment().format('YYYY-MM-DD')}.xlsx`)
	}

	// ** Export to CSV
	const exportToCSV = () => {
		const exportData = payments.map(payment => ({
			PaymentDate: moment(payment.paymentDate).format('DD MMM YYYY HH:mm'),
			SupplyReference: payment.supply?.supplyNumber || 'N/A',
			Amount: payment.amount || 0,
			PaymentMethod: payment.paymentMethod,
			Reference: payment.reference || '-',
			RecordedBy: payment.admin ? `${payment.admin.firstName} ${payment.admin.lastName}` : 'Unknown',
			CreatedAt: moment(payment.createdAt).format('DD MMM YYYY HH:mm')
		}))

		const headers = ['Payment Date', 'Supply Reference', 'Amount', 'Payment Method', 'Reference', 'Recorded By', 'Created At']
		const csvContent = [
			headers.join(','),
			...exportData.map(row => Object.values(row).join(','))
		].join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `payment-history-${moment().format('YYYY-MM-DD')}.csv`
		link.click()
	}

	// ** Custom Pagination
	const CustomPagination = () => {
		const count = Math.ceil(filteredData.length / rowsPerPage)

		return (
			<ReactPaginate
				previousLabel={''}
				nextLabel={''}
				pageCount={count || 1}
				activeClassName='active'
				forcePage={currentPage !== 0 ? currentPage - 1 : 0}
				onPageChange={page => setCurrentPage(page.selected + 1)}
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

	// ** Clear date filter
	const clearDateFilter = () => {
		setDateRange([])
	}

	if (loading) {
		return (
			<Card>
				<CardBody className='text-center py-5'>
					<Spinner color='primary' />
					<p className='mt-2'>Loading payment history...</p>
				</CardBody>
			</Card>
		)
	}

	return (
		<>
			{/* Summary Cards */}
			<Row className='mb-2'>
				<Col xl='6' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Total Payments</h6>
								<h3 className='fw-bolder mb-0'>{summary.totalPayments}</h3>
							</div>
							<CreditCard size={30} className='text-primary' />
						</CardBody>
					</Card>
				</Col>
				<Col xl='6' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Total Amount Paid</h6>
								<h3 className='fw-bolder mb-0 text-success'>
									{formatRandWithSeparator(summary.totalAmountPaid)}
								</h3>
							</div>
							<TrendingUp size={30} className='text-success' />
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Payment History Table */}
			<Card>
				<CardHeader>
					<CardTitle tag='h4'>Payment History</CardTitle>
					<div className='d-flex align-items-center'>
						<Label className='me-1' for='search-input'>
							Search
						</Label>
						<Input
							className='dataTable-filter mb-50'
							type='text'
							bsSize='sm'
							id='search-input'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							style={{ width: '200px' }}
						/>
						<UncontrolledDropdown className='ms-1'>
							<DropdownToggle color='secondary' caret outline>
								<Download size={15} />
								<span className='align-middle ms-50'>Export</span>
							</DropdownToggle>
							<DropdownMenu>
								<DropdownItem className='w-100' onClick={exportToCSV}>
									<FileText size={15} />
									<span className='align-middle ms-50'>CSV</span>
								</DropdownItem>
								<DropdownItem className='w-100' onClick={exportToExcel}>
									<FileText size={15} />
									<span className='align-middle ms-50'>Excel</span>
								</DropdownItem>
							</DropdownMenu>
						</UncontrolledDropdown>
					</div>
				</CardHeader>
				<CardBody>
					<Row className='mb-2'>
						<Col md='4'>
							<Label for='date-range'>Date Range</Label>
							<div className='d-flex align-items-center'>
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
								{dateRange.length > 0 && (
									<Button
										color='secondary'
										outline
										size='sm'
										className='ms-1'
										onClick={clearDateFilter}
									>
										Clear
									</Button>
								)}
							</div>
						</Col>
						<Col md='3'>
							<Label for='rows-per-page'>Show</Label>
							<Input
								type='select'
								id='rows-per-page'
								value={rowsPerPage}
								onChange={e => setRowsPerPage(parseInt(e.target.value))}
							>
								<option value='10'>10</option>
								<option value='25'>25</option>
								<option value='50'>50</option>
								<option value='100'>100</option>
							</Input>
						</Col>
					</Row>
					
					<div className='react-dataTable'>
						<DataTable
							noHeader
							pagination
							paginationServer
							columns={columns}
							className='react-dataTable'
							sortIcon={<Calendar size={10} />}
							paginationComponent={CustomPagination}
							data={filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
							responsive
							noDataComponent={
								<div className='text-center py-5'>
									<DollarSign size={50} className='text-muted mb-2' />
									<h4>No payments found</h4>
									<p className='text-muted'>
										{dateRange.length > 0 
											? 'No payments found for the selected date range.'
											: 'No payments have been recorded for this supplier yet.'}
									</p>
								</div>
							}
						/>
					</div>
				</CardBody>
			</Card>
		</>
	)
}

export default SupplierPaymentHistoryTable