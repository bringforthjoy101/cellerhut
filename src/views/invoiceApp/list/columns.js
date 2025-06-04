// ** React Imports
import { Link } from 'react-router-dom'
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import {
  Eye,
  TrendingUp,
  Send,
  MoreVertical,
  Download,
  Edit,
  Trash,
  Copy,
  CheckCircle,
  Save,
  ArrowDownCircle,
  Info,
  PieChart
} from 'react-feather'

// ** Vars
const invoiceStatusObj = {
  Sent: { color: 'light-secondary', icon: Send },
  Paid: { color: 'light-success', icon: CheckCircle },
  draft: { color: 'light-primary', icon: Edit },
  Downloaded: { color: 'light-info', icon: ArrowDownCircle },
  published: { color: 'light-success', icon: Send },
  'Partial Payment': { color: 'light-warning', icon: PieChart }
}

// ** renders client column
const renderClient = row => {
  const stateNum = Math.floor(Math.random() * 6),
    states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
    color = states[stateNum]

  if (row.avatar?.length) {
    return <Avatar className='mr-50' img={row.avatar} width='32' height='32' />
  } else {
    return <Avatar color={color} className='mr-50' content={row.RecipientCompanyName.toUpperCase() || 'John Doe'} initials />
  }
}

// ** Table columns
export const columns = [
  {
    name: '#',
    minWidth: '20px',
    selector: 'id',
    cell: row => <Link to={`/apps/invoice/preview/${row.id}`}>{`#${row.id}`}</Link>
  },
  {
    name: <TrendingUp size={14} />,
    minWidth: '20px',
    selector: 'Status',
    sortable: true,
    cell: row => {
      const color = invoiceStatusObj[row.Status] ? invoiceStatusObj[row.Status].color : 'primary',
        Icon = invoiceStatusObj[row.Status] ? invoiceStatusObj[row.Status].icon : Edit
      return <Avatar color={color} icon={<Icon size={14} />} />
    }
  },
  {
    name: 'Client',
    width: '250px',
    selector: 'RecipientCompanyName',
    sortable: true,
    cell: row => {
      const name = row.RecipientCompanyName || 'Fountain Pay',
        email = row.RecipientCompanyEmail || 'support@fountainpay.ng'
      return (
        <div className='d-flex justify-content-left align-items-center'>
          {renderClient(row)}
          <div className='d-flex flex-column'>
            <h6 className='user-name text-truncate mb-0'>{name}</h6>
            <small className='text-truncate text-muted mb-0'>{email}</small>
          </div>
        </div>
      )
    }
  },
  {
    name: 'Total',
    selector: 'total',
    sortable: true,
    minWidth: '150px',
    width: '150px',
    cell: row => <span>{row.Currency} {row.Amount.toLocaleString() || 0}</span>
  },
  {
    name: 'Issued Date',
    selector: 'createdAt',
    sortable: true,
    minWidth: '100px',
    width: '150px',
    cell: row => moment(row.createdAt).format('ll')
  },
  {
    name: 'Due Date',
    selector: 'DueAt',
    sortable: true,
    minWidth: '100px',
    width: '150px',
    cell: row => moment(row.DueAt).format('ll')
  },
  {
    name: 'Balance',
    selector: 'balance',
    sortable: true,
    minWidth: '164px',
    cell: row => {
      return row.balance !== 0 ? (
        <span>{row.Currency} {row.Balance.toLocaleString() || 0}</span>
      ) : (
        <Badge color='light-success' pill>
          Paid
        </Badge>
      )
    }
  },
  {
    name: 'Action',
    minWidth: '70px',
    width: '150px',
    selector: '',
    sortable: true,
    cell: row => (
      <div className='column-action d-flex align-items-center'>
        <Send size={17} />
        <Link to={`/invoice/preview/${row.id}`}>
          <Eye size={17} className='mx-1' />
        </Link>
        <UncontrolledDropdown>
          <DropdownToggle tag='span'>
            <MoreVertical size={17} className='cursor-pointer' />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
              <Download size={14} className='mr-50' />
              <span className='align-middle'>Download</span>
            </DropdownItem>
            <DropdownItem tag={Link} to={`/invoice/edit/${row.id}`} className='w-100'>
              <Edit size={14} className='mr-50' />
              <span className='align-middle'>Edit</span>
            </DropdownItem>
            <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
              <Trash size={14} className='mr-50' />
              <span className='align-middle'>Delete</span>
            </DropdownItem>
            <DropdownItem tag='a' href='/' className='w-100' onClick={e => e.preventDefault()}>
              <Copy size={14} className='mr-50' />
              <span className='align-middle'>Duplicate</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
]
