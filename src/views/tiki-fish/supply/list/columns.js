// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { store } from '@store/storeConfig/store'
import { approveSupply, rejectSupply } from '../store/action'

// ** Icons Imports
import { Settings, Database, Edit, Eye, Check, X } from 'react-feather'

// ** Reactstrap Imports
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap'

// ** Renders Client Columns
const renderClient = row => {
  const stateNum = Math.floor(Math.random() * 6),
    states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
    color = states[stateNum]

  if (row.supplier?.name) {
    return (
      <div className='d-flex justify-content-left align-items-center'>
        <Avatar
          initials
          color={color || 'light-primary'}
          className='me-1'
          content={row.supplier.name}
        />
        <div className='d-flex flex-column'>
          <Link
            to={`/supplier/view/${row.supplier.id}`}
            className='user_name text-truncate text-body'
          >
            <span className='fw-bolder'>{row.supplier.name}</span>
          </Link>
          <small className='text-truncate text-muted mb-0'>{row.supplier.email}</small>
        </div>
      </div>
    )
  } else {
    return (
      <div className='d-flex justify-content-left align-items-center'>
        <Avatar
          initials
          color={color || 'light-primary'}
          className='me-1'
          content='Unknown'
        />
        <div className='d-flex flex-column'>
          <span className='fw-bolder'>Unknown Supplier</span>
          <small className='text-truncate text-muted mb-0'>-</small>
        </div>
      </div>
    )
  }
}

// ** Renders Status
const renderStatus = row => {
  const status = row.status
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

// ** Renders Items Count
const renderItemsCount = row => {
  const itemsCount = row.supply_items ? row.supply_items.length : 0
  return (
    <div className='d-flex align-items-center'>
      <Database size={14} className='me-50' />
      <span>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
    </div>
  )
}

// ** Renders Total Amount
const renderTotalAmount = row => {
  const total = row.totalAmount || 0
  return (
    <div className='d-flex flex-column'>
      <span className='fw-bolder'>${parseFloat(total).toFixed(2)}</span>
      <small className='text-muted'>Total</small>
    </div>
  )
}

// ** Renders Action Buttons
const renderActions = row => {
  const handleApprove = () => {
    store.dispatch(approveSupply(row.id))
  }

  const handleReject = () => {
    store.dispatch(rejectSupply(row.id))
  }

  return (
    <div className='column-action d-flex align-items-center'>
      {row.status === 'pending' && (
        <>
          <Button
            size='sm'
            color='success'
            className='me-50'
            onClick={handleApprove}
          >
            <Check size={14} />
          </Button>
          <Button
            size='sm'
            color='danger'
            className='me-50'
            onClick={handleReject}
          >
            <X size={14} />
          </Button>
        </>
      )}
      <UncontrolledDropdown>
        <DropdownToggle tag='div' className='btn btn-sm'>
          <Settings size={14} className='cursor-pointer' />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem
            tag={Link}
            to={`/supply/view/${row.id}`}
            className='w-100'
          >
            <Eye size={14} className='me-50' />
            <span className='align-middle'>Details</span>
          </DropdownItem>
          <DropdownItem
            tag={Link}
            to={`/supply/edit/${row.id}`}
            className='w-100'
          >
            <Edit size={14} className='me-50' />
            <span className='align-middle'>Edit</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  )
}

export const columns = [
  {
    name: 'Supply Number',
    sortable: true,
    minWidth: '150px',
    selector: row => row.supplyNumber,
    cell: row => (
      <div className='d-flex flex-column'>
        <Link
          to={`/supply/view/${row.id}`}
          className='user_name text-truncate text-body fw-bolder'
        >
          {row.supplyNumber}
        </Link>
        <small className='text-truncate text-muted mb-0'>
          {new Date(row.supplyDate).toLocaleDateString()}
        </small>
      </div>
    )
  },
  {
    name: 'Supplier',
    sortable: true,
    minWidth: '230px',
    selector: row => row.supplier?.name,
    cell: row => renderClient(row)
  },
  {
    name: 'Items',
    sortable: true,
    minWidth: '120px',
    selector: row => row.supply_items?.length || 0,
    cell: row => renderItemsCount(row)
  },
  {
    name: 'Total Amount',
    sortable: true,
    minWidth: '150px',
    selector: row => row.totalAmount,
    cell: row => renderTotalAmount(row)
  },
  {
    name: 'Status',
    sortable: true,
    minWidth: '120px',
    selector: row => row.status,
    cell: row => renderStatus(row)
  },
  {
    name: 'Created By',
    sortable: true,
    minWidth: '150px',
    selector: row => row.admin?.name || 'Unknown',
    cell: row => (
      <div className='d-flex flex-column'>
        <span className='fw-bolder'>{row.admin?.name || 'Unknown'}</span>
        <small className='text-muted'>{row.admin?.email || '-'}</small>
      </div>
    )
  },
  {
    name: 'Actions',
    minWidth: '150px',
    cell: row => renderActions(row)
  }
]