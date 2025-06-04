// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'


// ** Third Party Components

// ** Renders Client Columns
const renderClient = row => {
  const stateNum = Math.floor(Math.random() * 6),
    states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
    color = states[stateNum]

  if (row.avatar) {
    return <Avatar className='mr-1' img={row.avatar} width='32' height='32' />
  } else {
    return <Avatar color={color || 'primary'} className='mr-1' content={`${row.trans_id}` || 'John Doe'} initials />
  }
}

export const columns = [
  {
    name: 'Transaction Id',
    minWidth: '297px',
    selector: 'names',
    sortable: true,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        {renderClient(row)}
        <div className='d-flex flex-column'>
          <Link
            to={`/appia/transaction/view/${row.trans_id}`}
            className='user-name text-truncate mb-0'
          >
            <span className='font-weight-bold'>{row.trans_id}</span>
          </Link>
        </div>
      </div>
    )
  },
  {
    name: 'Transaction Type',
    minWidth: '200px',
    selector: 'trans_type',
    sortable: true,
    cell: row => row.trans_type
  },
  {
    name: 'Transaction Amount',
    minWidth: '250px',
    selector: 'trans_amount',
    sortable: true,
    cell: row => <span>{(row.trans_amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>
  },
  {
    name: 'Balance',
    minWidth: '150px',
    selector: 'balance',
    sortable: true,
    cell: row => <span className="text-capitalize">{row?.balance?.toLocaleString('en-US', {style: 'currency', currency: 'ZAR'})}</span>
  },
  {
    name: 'Transaction Date',
    minWidth: '250px',
    selector: 'trans_date',
    sortable: true,
    cell: row => moment(row.trans_date).format('lll')
  }
]
