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
    name: '#',
    minWidth: '180px',
    selector: 'trans_id',
    cell: row => <span>{ `#${row.trans_id}` }</span>
  },
  {
    name: 'Type',
    minWidth: '300px',
    selector: 'trans_type',
    sortable: true,
    cell: row => row.trans_type
  },
  {
    name: 'Description',
    minWidth: '300px',
    selector: 'narration',
    sortable: true,
    cell: row => <span>{row.narration === "" ? "No Narration" : row.narration}</span>
  },
  {
    name: 'Amount',
    selector: 'trans_amount',
    sortable: true,
    minWidth: '150px',
    cell: row => <span>{(row.trans_amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>
  },
  {
    name: 'Balance',
    selector: 'balance',
    sortable: true,
    minWidth: '164px',
    cell: row => {
      return row.balance !== 0 ? (
        <span>{(row.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>
      ) : (
        <Badge color='light-success' pill>
          Paid
        </Badge>
      )
    }
  },
  {
    name: 'Date',
    selector: 'trans_date',
    sortable: true,
    minWidth: '200px',
    cell: row => moment(row.trans_date).format('lll')
  }
]
