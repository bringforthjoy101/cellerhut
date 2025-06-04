// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getSetting } from '../store/action'
import { store } from '@store/storeConfig/store'
import moment from 'moment'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Slack, User, Settings, Database, Edit, MoreVertical, FileText, Trash2, Archive } from 'react-feather'
import { Button } from 'bootstrap'

import { UpdateSettings } from './UpdateSetting'

// ** Renders Client Columns
const renderClient = row => {
  const stateNum = Math.floor(Math.random() * 6),
    states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
    color = states[stateNum]

  if (row.avatar) {
    return <Avatar className='mr-1' img={row.avatar} width='32' height='32' />
  } else {
    return <Avatar color={color || 'primary'} className='mr-1' content={`${row.name}` || 'John Doe'} initials />
  }
}

export const columns = [
  {
    name: 'Setting Name',
    minWidth: '297px',
    selector: 'name',
    sortable: true,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <span className='font-weight-bold'>{row.name}</span>
          <small className='text-truncate text-muted mb-0'>{row.id}</small>
        </div>
      </div>
    )
  },
  {
    name: 'Value',
    minWidth: '200px',
    selector: 'value',
    sortable: true,
    cell: row => row.value
  },
  {
    name: 'Description',
    minWidth: '300px',
    selector: 'description',
    sortable: true,
    cell: row => <span>{row.description !== null ? row.description : 'No Description'}</span>
  },
  {
    name: 'Date',
    minWidth: '200px',
    selector: 'created_at',
    sortable: true,
    cell: row => moment(row.created_at).format('lll')
  },
  {
    name: 'Update',
    minWidth: '200px',
    selector: 'update',
    sortable: true,
    cell: row => <span className="mt-1">
      <UpdateSettings id={row.id} name={row.name}  />
    </span>
  }
]
