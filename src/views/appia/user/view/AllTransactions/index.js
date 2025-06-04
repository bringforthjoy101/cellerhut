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
import { getUserAllTransactions, getFilteredUserTransactions } from '../../store/action'
import { useDispatch, useSelector } from 'react-redux'

// ** Styles
import '@styles/react/apps/app-invoice.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// custom Header
const CustomHeader = ({ handleFilter, searchTerm, handlePerPage, rowsPerPage, downloadCSV, storeData, downloadPDF }) => {
  return (
    <div className='invoice-list-table-header w-100 py-2'>
      <Row>
        <Col lg='6'sm="12" className='d-flex align-items-center px-0 px-lg-1 mb-2'>
          <div className='d-flex align-items-center mr-2'>
            <Label for='rows-per-page'>Show</Label>
            <CustomInput
              className='form-control ml-50 pr-3'
              type='select'
              id='rows-per-page'
              value={rowsPerPage}
              onChange={handlePerPage}
            >
              <option value='10'>10</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
            </CustomInput>
          </div>
          <h3 className="d-none d-lg-block">User's Transactions</h3>
        </Col>
        <Col
          lg='3' sm="6"
          className='actions-right d-flex align-items-center justify-content-lg-end flex-lg-nowrap flex-wrap mt-lg-0 mt-1 pr-lg-1 p-0 mb-2'
        >
          <div className='d-flex align-items-center'>
            <Label for='search-invoice'>Search</Label>
            <Input
              id='search-invoice'
              className='ml-50 mr-2 w-100'
              type='text'
              value={searchTerm}
              onChange={e => handleFilter(e.target.value)}
              placeholder='Search'
            />
          </div>
          
        </Col>
        <Col lg="3" sm="12">
        <UncontrolledButtonDropdown>
            <DropdownToggle color='secondary' caret outline>
              <Share size={15} />
              <span className='align-middle ml-50'>Download Table</span>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem className='w-100' onClick={() => downloadCSV(storeData)}>
                <FileText size={15} />
                <span className='align-middle ml-50'>CSV</span>
              </DropdownItem>
              <DropdownItem className='w-100' onClick={() => downloadPDF()}>
                <FileText size={15} />
                <span className='align-middle ml-50'>PDF</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </Col>
      </Row>
    </div>
  )
}

const TransactionList = () => {
  const dispatch = useDispatch()
  const store = useSelector(state => state.appiaUsers)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    dispatch(getUserAllTransactions(store.userDetails.user_details.user_id))
    dispatch(
      getFilteredUserTransactions(store.selectedUserAllTransactions, {
        page: currentPage,
        perPage: rowsPerPage,
        q: searchTerm
      })
    )
  }, [dispatch])


  const handleFilter = val => {
    setSearchTerm(val)
    dispatch(
      getFilteredUserTransactions(store.selectedUserAllTransactions, {
        page: currentPage,
        perPage: rowsPerPage,
        q: val
      })
    )
  }

  const handlePerPage = e => {
    const value = parseInt(e.currentTarget.value)
    dispatch(
      getFilteredUserTransactions(store.selectedUserAllTransactions, {
        page: currentPage,
        perPage: value,
        q: searchTerm
      })
    )
    setRowsPerPage(value)
  }

  const handlePagination = page => {
    dispatch(
      getFilteredUserTransactions(store.selectedUserAllTransactions, {
        page: page.selected + 1,
        perPage: rowsPerPage,
        q: searchTerm
      })
    )
    setCurrentPage(page.selected + 1)
  }

  const filteredData = store?.selectedUserAllTransactions.filter(
    item => (item?.trans_id?.toLowerCase() || item?.trans_type?.toLowerCase())
  )

  const CustomPagination = () => {
    const count = Math.ceil(filteredData.length / rowsPerPage)

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
      containerClassName={'pagination react-paginate justify-content-end my-2 pr-1'}
    />
    )
  }

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result

    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(store.selectedUserAllTransactions[0])
    console.log("keyss", keys)

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
      orientation: "landscape"
    })

    doc.autoTable({
        styles: { halign: 'center'},
        columnStyles: {
          0: {cellWidth: 30},
          1: {cellWidth: 70},
          2: {cellWidth: 30},
          3: {cellWidth: 30},
          4: {cellWidth: 60}
        },
        head: [['Id', 'Type', 'Amount', 'Balance', 'Date']]
    })
    store.selectedUserAllTransactions.map(arr => {
      doc.autoTable({
        styles: { halign: 'left' },
        columnStyles: {
          0: {cellWidth: 40},
          1: {cellWidth: 70},
          2: {cellWidth: 70},
          3: {cellWidth: 30},
          4: {cellWidth: 100}
        },
        body: [[(arr.trans_id), (arr.trans_type), (arr.trans_amount), (arr.balance), (arr.trans_date)]]
      })
    })
    doc.save("export.pdf")
  }


  // Data to Render
  const dataToRender = () => {
    const filters = {
      q: searchTerm
    }

    const isFiltered = Object.keys(filters).some(function (k) {
      return filters[k].length > 0
    })
    if (store.selectedUserTransactions.length > 0) {
      return store.selectedUserTransactions
    } else if (store.selectedUserTransactions.length === 0 && isFiltered) {
      return []
    } else {
      return store.selectedUserAllTransactions.slice(0, rowsPerPage)
    }
  }

  return (
    <div className='invoice-list-wrapper'>
      <Card>
        <div className='invoice-list-dataTable'>
          <DataTable
            noHeader
            pagination
            paginationServer
            subHeader={true}
            columns={columns}
            responsive={true}
            sortIcon={<ChevronDown />}
            className='react-dataTable'
            defaultSortField='invoiceId'
            paginationDefaultPage={currentPage}
            paginationComponent={CustomPagination}
            data={dataToRender()}
            subHeaderComponent={
              <CustomHeader
                rowsPerPage={rowsPerPage}
                handleFilter={handleFilter}
                handlePerPage={handlePerPage}
                downloadCSV={downloadCSV}
                storeData={store.selectedUserAllTransactions}
                downloadPDF={downloadPDF}
                searchTerm={searchTerm}
              />
            }
          />
        </div>
      </Card>
    </div>
  )
}

export default TransactionList
