// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge } from 'reactstrap'
import { Slack, User, Settings, Database, Edit } from 'react-feather'

// ** Renders Client Columns
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

// ** Renders Role Columns
const renderRole = row => {
  
  const roleObj = {
    subscriber: {
      class: 'text-primary',
      icon: User
    },
    maintainer: {
      class: 'text-success',
      icon: Database
    },
    editor: {
      class: 'text-info',
      icon: Edit
    },
    author: {
      class: 'text-warning',
      icon: Settings
    },
    admin: {
      class: 'text-danger',
      icon: Slack
    }
  }

  const Icon = roleObj[row.role] ? roleObj[row.role].icon : User

  return (
    <span className='text-truncate text-capitalize align-middle'>
      <Icon size={18} className={`${roleObj[row.role] ? roleObj[row.role].class : 'text-primary'} mr-50`} />
      {row.role_name || 'User'}
    </span>
  )
}

const statusObj = {
  blacklisted: 'light-danger',
  active: 'light-success',
  inactive: 'light-warning'
}
export const columns = [
  {
    name: 'User',
    minWidth: '297px',
    selector: 'names',
    sortable: true,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/appia/funds/view/${row.user_id}`}
            className='user-name text-truncate mb-0'
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
    minWidth: '300px',
    selector: 'email',
    sortable: true,
    cell: row => row.email
  },
  {
    name: 'Phone',
    minWidth: '300px',
    selector: 'phone',
    sortable: true,
    cell: row => <span>{row.phone === null ? "No Number" : row.phone}</span>
  },
  {
    name: 'Balance',
    minWidth: '150px',
    selector: 'balance',
    sortable: true,
    cell: row => <span className="text-capitalize">{row?.balance?.toLocaleString('en-US', {style: 'currency', currency: 'ZAR'})}</span>
  },
  {
    name: 'Refferal Code',
    minWidth: '80px',
    selector: 'referral_code',
    sortable: true,
    cell: row => row.referral_code
  },
  {
    name: 'Status',
    minWidth: '138px',
    selector: 'status',
    sortable: true,
    cell: row => (
      <Badge className='text-capitalize' color={statusObj[row.status]} pill>
        {row.status}
      </Badge>
    )
  }
]
