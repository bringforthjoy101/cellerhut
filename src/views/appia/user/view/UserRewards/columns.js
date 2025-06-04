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
    selector: 'transaction_id',
    cell: row => <span>{ `#${row.transaction_id}` }</span>
  },
  {
    name: 'User Id',
    minWidth: '180px',
    selector: 'user_id',
    cell: row => <span>{ `#${row.user_id}` }</span>
  },
  {
    name: 'reward_id',
    minWidth: '300px',
    selector: 'reward_id',
    sortable: true,
    cell: row => row.reward_id
  },
  {
    name: 'Date',
    minWidth: '200px',
    selector: 'created_at',
    sortable: true,
    cell: row => moment(row.created_at).format('lll')
  }
]
