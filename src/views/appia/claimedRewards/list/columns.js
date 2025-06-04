// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getClaim } from '../store/action'
import moment from 'moment'
import { store } from '@store/storeConfig/store'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Slack, User, Settings, Database, Edit, MoreVertical, FileText, Trash2, Archive } from 'react-feather'

const renderClient = row => {
  const stateNum = Math.floor(Math.random() * 6),
    states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
    color = states[stateNum]

  if (row.avatar) {
    return <Avatar className='mr-1' img={row.avatar} width='32' height='32' />
  } else {
    return <Avatar color={color || 'primary'} className='mr-1' content={`${row.names}` || 'John Doe'} initials />
  }
}

export const columns = [
  {
    name: 'User',
    minWidth: '230px',
    selector: 'names',
    sortable: true,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/appia/claimedRewards/view/${row.id}`}
            className='user-name text-truncate mb-0'
            onClick={() => store.dispatch(getClaim(store.getState().appiaClaimedRewards.allData, row.id))}
          >
            <span className='font-weight-bold'>{row.names}</span>
          </Link>
            <small className='text-truncate text-muted mb-0'>{row.user_id}</small>
        </div>
      </div>
    )
  },
  {
    name: 'Email',
    minWidth: '200px',
    selector: 'email',
    sortable: true,
    cell: row => row.email
  },
  {
    name: 'User Name',
    minWidth: '140px',
    selector: 'username',
    sortable: true,
    cell: row => row.username
  },
  {
    name: 'Phone',
    minWidth: '140px',
    selector: 'phone',
    sortable: true,
    cell: row => row.phone
  },
  {
    name: 'Date',
    minWidth: '200px',
    selector: 'created_at',
    sortable: true,
    cell: row => moment(row.created_at).format('lll')
  }
]
