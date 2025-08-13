// ** React Imports
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
import { Eye, Download, FileText, Search, Calendar, Package } from 'react-feather'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { getSupplierSupplies } from '../store/action'

// ** Utils
import { formatRandWithSeparator } from '../../shared/currencyUtils'
import moment from 'moment'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

const SupplierSuppliesTable = ({ supplierId }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [supplies, setSupplies] = useState([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsPerPage, setRowsPerPage] = useState(10)
	const [statusFilter, setStatusFilter] = useState('')
	const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
	const [summary, setSummary] = useState({
		totalSupplies: 0,
		totalAmount: 0,
		totalPaid: 0,
		totalOutstanding: 0
	})

	// ** Fetch supplies
	const fetchSupplies = async () => {
		setLoading(true)
		try {
			const params = {}
			if (statusFilter) params.status = statusFilter
			if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
			
			const result = await dispatch(getSupplierSupplies(supplierId, params))
			if (result) {
				setSupplies(result.supplies || [])
				setSummary({
					totalSupplies: result.totalSupplies || 0,
					totalAmount: result.totalAmount || 0,
					totalPaid: result.totalPaid || 0,
					totalOutstanding: result.totalOutstanding || 0
				})
			}
		} catch (error) {
			console.error('Error fetching supplies:', error)
		} finally {
			setLoading(false)
		}
	}

	// ** Get supplies on mount and when filters change
	useEffect(() => {
		if (supplierId) {
			fetchSupplies()
		}
	}, [supplierId, statusFilter, paymentStatusFilter])

	// ** Renders Status
	const renderStatus = (status) => {
		const color = 
			status === 'approved' ? 'light-success' :
			status === 'rejected' ? 'light-danger' : 
			'light-warning'

		return (
			<Badge className='text-capitalize' color={color} pill>
				{status}
			</Badge>
		)
	}

	// ** Renders Payment Status
	const renderPaymentStatus = (status) => {
		const color = 
			status === 'paid' ? 'light-success' :
			status === 'partial' ? 'light-warning' : 
			'light-danger'

		return (
			<Badge className='text-capitalize' color={color} pill>
				{status}
			</Badge>
		)
	}

	// ** Column definitions
	const columns = [
		{
			name: 'Supply Number',
			sortable: true,
			minWidth: '150px',
			selector: row => row.supplyNumber,
			cell: row => (
				<Link
					to={`/supply/view/${row.id}`}
					className='text-truncate text-body fw-bolder'
				>
					{row.supplyNumber}
				</Link>
			)
		},
		{
			name: 'Date',
			sortable: true,
			minWidth: '120px',
			selector: row => row.supplyDate,
			cell: row => moment(row.supplyDate).format('DD MMM YYYY')
		},
		{
			name: 'Items',
			sortable: true,
			minWidth: '80px',
			selector: row => row.supply_items?.length || 0,
			cell: row => (
				<div className='d-flex align-items-center'>
					<Package size={14} className='me-50' />
					<span>{row.supply_items?.length || 0}</span>
				</div>
			)
		},
		{
			name: 'Total Amount',
			sortable: true,
			minWidth: '130px',
			selector: row => row.totalAmount,
			cell: row => (
				<span className='fw-bolder'>
					{formatRandWithSeparator(row.totalAmount || 0)}
				</span>
			)
		},
		{
			name: 'Amount Paid',
			sortable: true,
			minWidth: '130px',
			selector: row => row.amountPaid,
			cell: row => (
				<div>
					<span>{formatRandWithSeparator(row.amountPaid || 0)}</span>
					{row.totalAmount - row.amountPaid > 0 && (
						<small className='text-danger d-block'>
							Due: {formatRandWithSeparator(row.totalAmount - row.amountPaid)}
						</small>
					)}
				</div>
			)
		},
		{
			name: 'Status',
			sortable: true,
			minWidth: '100px',
			selector: row => row.status,
			cell: row => renderStatus(row.status)
		},
		{
			name: 'Payment',
			sortable: true,
			minWidth: '100px',
			selector: row => row.paymentStatus,
			cell: row => renderPaymentStatus(row.paymentStatus)
		},
		{
			name: 'Actions',
			minWidth: '100px',
			cell: row => (
				<Button
					size='sm'
					color='primary'
					tag={Link}
					to={`/supply/view/${row.id}`}
					className='btn-icon'
				>
					<Eye size={14} />
				</Button>
			)
		}
	]

	// ** Filter data
	const filteredData = supplies.filter(supply => {
		const matchesSearch = !searchTerm || 
			supply.supplyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			moment(supply.supplyDate).format('DD MMM YYYY').toLowerCase().includes(searchTerm.toLowerCase())
		
		return matchesSearch
	})

	// ** Export to Excel
	const exportToExcel = () => {
		const exportData = supplies.map(supply => ({
			SupplyNumber: supply.supplyNumber,
			Date: moment(supply.supplyDate).format('DD MMM YYYY'),
			Items: supply.supply_items?.length || 0,
			TotalAmount: supply.totalAmount || 0,
			AmountPaid: supply.amountPaid || 0,
			AmountDue: (supply.totalAmount || 0) - (supply.amountPaid || 0),
			Status: supply.status,
			PaymentStatus: supply.paymentStatus
		}))

		const ws = XLSX.utils.json_to_sheet(exportData)
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
		const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'})
		FileSaver.saveAs(data, `supplier-supplies-${moment().format('YYYY-MM-DD')}.xlsx`)
	}

	// ** Export to CSV
	const exportToCSV = () => {
		const exportData = supplies.map(supply => ({
			SupplyNumber: supply.supplyNumber,
			Date: moment(supply.supplyDate).format('DD MMM YYYY'),
			Items: supply.supply_items?.length || 0,
			TotalAmount: supply.totalAmount || 0,
			AmountPaid: supply.amountPaid || 0,
			AmountDue: (supply.totalAmount || 0) - (supply.amountPaid || 0),
			Status: supply.status,
			PaymentStatus: supply.paymentStatus
		}))

		const headers = ['Supply Number', 'Date', 'Items', 'Total Amount', 'Amount Paid', 'Amount Due', 'Status', 'Payment Status']
		const csvContent = [
			headers.join(','),
			...exportData.map(row => Object.values(row).join(','))
		].join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `supplier-supplies-${moment().format('YYYY-MM-DD')}.csv`
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

	if (loading) {
		return (
			<Card>
				<CardBody className='text-center py-5'>
					<Spinner color='primary' />
					<p className='mt-2'>Loading supplies...</p>
				</CardBody>
			</Card>
		)
	}

	return (
		<>
			{/* Summary Cards */}
			<Row className='mb-2'>
				<Col xl='3' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Total Supplies</h6>
								<h3 className='fw-bolder mb-0'>{summary.totalSupplies}</h3>
							</div>
							<Package size={30} className='text-primary' />
						</CardBody>
					</Card>
				</Col>
				<Col xl='3' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Total Amount</h6>
								<h3 className='fw-bolder mb-0'>{formatRandWithSeparator(summary.totalAmount)}</h3>
							</div>
							<FileText size={30} className='text-info' />
						</CardBody>
					</Card>
				</Col>
				<Col xl='3' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Total Paid</h6>
								<h3 className='fw-bolder mb-0 text-success'>{formatRandWithSeparator(summary.totalPaid)}</h3>
							</div>
							<FileText size={30} className='text-success' />
						</CardBody>
					</Card>
				</Col>
				<Col xl='3' sm='6'>
					<Card>
						<CardBody className='d-flex justify-content-between align-items-center'>
							<div>
								<h6 className='mb-0'>Outstanding</h6>
								<h3 className='fw-bolder mb-0 text-danger'>{formatRandWithSeparator(summary.totalOutstanding)}</h3>
							</div>
							<FileText size={30} className='text-danger' />
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Supplies Table */}
			<Card>
				<CardHeader>
					<CardTitle tag='h4'>Supplies History</CardTitle>
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
						<Col md='3'>
							<Label for='status-filter'>Status</Label>
							<Input
								type='select'
								id='status-filter'
								value={statusFilter}
								onChange={e => setStatusFilter(e.target.value)}
							>
								<option value=''>All</option>
								<option value='pending'>Pending</option>
								<option value='approved'>Approved</option>
								<option value='rejected'>Rejected</option>
							</Input>
						</Col>
						<Col md='3'>
							<Label for='payment-filter'>Payment Status</Label>
							<Input
								type='select'
								id='payment-filter'
								value={paymentStatusFilter}
								onChange={e => setPaymentStatusFilter(e.target.value)}
							>
								<option value=''>All</option>
								<option value='unpaid'>Unpaid</option>
								<option value='partial'>Partial</option>
								<option value='paid'>Paid</option>
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
									<Package size={50} className='text-muted mb-2' />
									<h4>No supplies found</h4>
									<p className='text-muted'>This supplier has no supplies yet.</p>
								</div>
							}
						/>
					</div>
				</CardBody>
			</Card>
		</>
	)
}

export default SupplierSuppliesTable