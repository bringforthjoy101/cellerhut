// ** React Imports
import React, { Fragment, useState, useEffect, forwardRef, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Table Data & Columns
// import { data, columns } from '../data'
import { getAllFundsData, reviewFunds } from '../store/action'
import { store } from '@store/storeConfig/store'

// ** Add New Modal Component
// import AddNewModal from './AddNewModal'

// ** Third Party Components
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import {
  ChevronDown,
  Share,
  Printer,
  File,
  Grid,
  Copy,
  Plus,
  MoreVertical,
  Edit,
  FileText,
  Archive,
  Trash, X, Check, Bookmark, Trash2
} from 'react-feather'

import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  UncontrolledButtonDropdown,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Label,
  Row,
  Col,
  Badge
} from 'reactstrap'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary']

const status = {
  Approved: { title: 'Approved', color: 'light-success' },
  Pending: { title: 'Pending', color: 'light-warning' },
  Disapproved: { title: 'Disapproved', color: 'light-danger' },
  Rejected: { title: 'Rejected', color: 'light-danger' },
  5: { title: 'Applied', color: 'light-info' }
}

// ** Table Common Column
const columns = [
  {
    name: 'User',
    selector: 'user_details',
    sortable: true,
    minWidth: '280px',
    cell: row => (
      <div className='d-flex align-items-center'>
        {!row.avatar ? (
          <Avatar color={`light-${states[3]}`} content={row?.user_details?.user_name} initials />
        ) : (
          <Avatar img={require(`@src/assets/images/portrait/small/avatar-s-${row.avatar}`).default} />
        )}
        <div className='user-info text-truncate ml-1'>
          <span className='d-block font-weight-bold text-truncate'>{row?.user_details?.user_name}</span>
          <small>{row?.user_details?.email}</small>
        </div>
      </div>
    )
  },
  {
    name: 'Email',
    selector: 'user_details',
    sortable: true,
    minWidth: '240px',
    cell: row => row?.user_details?.email
  },
  {
    name: 'Purpose',
    selector: 'purpose',
    sortable: true,
    minWidth: '150px'
  },
  {
    name: 'Description',
    selector: 'description',
    sortable: true,
    minWidth: '100px'
  },
  {
    name: 'Status',
    selector: 'status',
    sortable: true,
    minWidth: '100px',
    cell: row => {
      return (
        <Badge color={status[row.status].color} pill>
          {status[row.status].title}
        </Badge>
      )
    }
  },
  {
    name: 'Date',
    selector: 'posted_date',
    sortable: true,
    minWidth: '200px',
    cell: row => moment(row.posted_date).format('lll')
  },
  {
    name: 'Posted By',
    selector: 'posted_by',
    sortable: true,
    minWidth: '170px',
    cell: row => (
      <div className='d-flex align-items-center'>
        <Avatar color={`light-${states[3]}`} content={row.posted_by} initials />
        <div className='user-info text-truncate ml-1'>
          <span className='d-block font-weight-bold text-truncate'>{row.posted_by}</span>
          <small>{'Admin'}</small>
        </div>
      </div>
    )
  },
  {
    name: 'Actions',
    minWidth: '100px',
    selector: 'fullName',
    sortable: true,
    cell: row => (
      <UncontrolledDropdown>
        <DropdownToggle tag='div' className='btn btn-sm'>
          <MoreVertical size={14} className='cursor-pointer' />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>
            <FileText size={14} className='mr-50' />
            <span className='align-middle'>Details</span>
          </DropdownItem>
          <DropdownItem>
            <Archive size={14} className='mr-50' />
            <span className='align-middle'>Edit</span>
          </DropdownItem>
          <DropdownItem className='w-100'>
            <Trash2 size={14} className='mr-50' />
            <span className='align-middle'>Delete</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
]

// ** Bootstrap Checkbox Component
const BootstrapCheckbox = forwardRef(({ onClick, ...rest }, ref) => (
  <div className='custom-control custom-checkbox'>
    <input type='checkbox' className='custom-control-input' ref={ref} {...rest} />
    <label className='custom-control-label' onClick={onClick} />
  </div>
))

const DataTableWithButtons = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const store = useSelector(state => state.appiaWithdrawals)

  // ** States
  const [modal, setModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // ** Get data on mount
  useEffect(() => {
    dispatch(getAllFundsData())
  }, [dispatch])

  // ** Function to handle filter
  const handleFilter = e => {
    const value = e.target.value
    let updatedData = []
    setSearchValue(value)

    const status = {
      1: { title: 'Current', color: 'light-primary' },
      2: { title: 'Professional', color: 'light-success' },
      3: { title: 'Rejected', color: 'light-danger' },
      4: { title: 'Resigned', color: 'light-warning' },
      5: { title: 'Applied', color: 'light-info' }
    }

    if (value.length) {
      updatedData = store.allData.filter(item => {
        const startsWith =
          item.user_details.user_name.toLowerCase().startsWith(value.toLowerCase()) ||
          item.user_details.email.toLowerCase().startsWith(value.toLowerCase()) ||
          item.purpose.toLowerCase().startsWith(value.toLowerCase()) ||
          item.description.toLowerCase().startsWith(value.toLowerCase()) ||
          item.status.toLowerCase().startsWith(value.toLowerCase()) ||
          item.posted_date.toLowerCase().startsWith(value.toLowerCase())
        // status[item.status].title.toLowerCase().startsWith(value.toLowerCase())

        const includes =
          item.user_details.user_name.toLowerCase().startsWith(value.toLowerCase()) ||
          item.user_details.email.toLowerCase().startsWith(value.toLowerCase()) ||
          item.purpose.toLowerCase().startsWith(value.toLowerCase()) ||
          item.description.toLowerCase().startsWith(value.toLowerCase()) ||
          item.status.toLowerCase().startsWith(value.toLowerCase()) ||
          item.posted_date.toLowerCase().startsWith(value.toLowerCase())
        // status[item.status].title.toLowerCase().includes(value.toLowerCase())

        if (startsWith) {
          return startsWith
        } else if (!startsWith && includes) {
          return includes
        } else return null
      })
      setFilteredData(updatedData)
      setSearchValue(value)
    }
  }

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={searchValue.length ? filteredData.length / 10 : store.allData.length / 10 || 1}
      breakLabel='...'
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName='active'
      pageClassName='page-item'
      breakClassName='page-item'
      breakLinkClassName='page-link'
      nextLinkClassName='page-link'
      nextClassName='page-item next'
      previousClassName='page-item prev'
      previousLinkClassName='page-link'
      pageLinkClassName='page-link'
      breakClassName='page-item'
      breakLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  const printOrder = () => {
    const orderHtml = document.getElementById('printme')
    const oldPage = document.body.innerHTML
    document.body.innerHTML = oldPage
    window.print()
    document.body.innerHTML = oldPage
  }

  // ** Converts table to CSV
  function convertArrayOfObjectsToCSV(array) {
    let result

    const columnDelimiter = ','
    const lineDelimiter = '\n'
    const keys = Object.keys(store.allData[0])
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
      styles: { halign: 'center' },
      head: [['User', 'Purpose', 'Description', 'Status', 'Date', 'Posted by']]
    })
    store.allData.map(arr => {
      doc.autoTable({
        styles: { halign: 'left' },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 55 },
          2: { cellWidth: 50 },
          3: { cellWidth: 40 },
          4: { cellWidth: 70 },
          5: { cellWidth: 40 }
        },
        body: [[(arr.user_details.user_name), (arr.purpose), (arr.description), (arr.status), (arr.posted_date), (arr.posted_by)]]
      })
    })
    doc.save("export.pdf")
  }


  return (
    <Fragment>
      <Card>
        <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
          <CardTitle tag='h4'>All Funds</CardTitle>
          <div className='d-flex mt-md-0 mt-1'>
            <UncontrolledButtonDropdown>
              <DropdownToggle color='secondary' caret outline>
                <Share size={15} />
                <span className='align-middle ml-50'>Export</span>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem className='w-100' onClick={() => downloadCSV(store.allData)}>
                  <FileText size={15} />
                  <span className='align-middle ml-50'>CSV</span>
                </DropdownItem>
                <DropdownItem className='w-100' onClick={() => downloadPDF()}>
                  <FileText size={15} />
                  <span className='align-middle ml-50'>PDF</span>
                </DropdownItem>
                <DropdownItem className='w-100' onClick={() => printOrder(filteredData)}>
                  <Printer size={15} />
                  <span className='align-middle ml-50'>Print</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </div>
        </CardHeader>
        <Row className='justify-content-end mx-0'>
          <Col className='d-flex align-items-center justify-content-end mt-1' md='3' sm='12'>
            <Label className='mr-1' for='search-input'>
              Search
            </Label>
            <Input
              className='dataTable-filter mb-50'
              type='text'
              bsSize='sm'
              id='search-input'
              value={searchValue}
              onChange={handleFilter}
            />
          </Col>
        </Row>
        <DataTable
          printableId="printme"
          noHeader
          pagination
          selectableRows
          columns={columns}
          paginationPerPage={10}
          className='react-dataTable'
          sortIcon={<ChevronDown size={10} />}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={searchValue.length ? filteredData : store.allData}
          selectableRowsComponent={BootstrapCheckbox}
        />
      </Card>
    </Fragment>
  )
}

export default DataTableWithButtons
