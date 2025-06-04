// ** React Imports
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import {
  Send,
  CheckCircle,
  Save,
  ArrowDownCircle,
  Info,
  PieChart
} from 'react-feather'

// ** Table columns
export const columns = [
  {
    name: 'Transaction Id',
    minWidth: '180px',
    selector: 'escrow_id',
    cell: row => <span>{ `#${row.escrow_id}` }</span>
  },
  {
    name: 'Transaction Type',
    minWidth: '300px',
    selector: 'type',
    sortable: true,
    cell: row => row.type
  },
  {
    name: 'Description',
    minWidth: '300px',
    selector: 'description',
    sortable: true,
    cell: row => <span>{row.description === "" ? "No Narration" : row.description}</span>
  },
  {
    name: 'Amount',
    selector: 'amount',
    sortable: true,
    minWidth: '150px',
    cell: row => <span>{(row.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>
  },
  {
    name: 'Date',
    selector: 'updated_at',
    sortable: true,
    minWidth: '200px',
    cell: row => moment(row.updated_at).format('lll')
  }
]
