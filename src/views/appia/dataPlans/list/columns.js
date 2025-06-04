// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getPlan } from '../store/action'
import moment from 'moment'
import { store } from '@store/storeConfig/store'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Slack, User, Settings, Database, Edit, MoreVertical, FileText, Trash2, Archive } from 'react-feather'

export const columns = [
  {
    name: 'Product Id',
    minWidth: '160px',
    selector: 'product_id',
    sortable: true,
    cell: row => (
      <div className='d-flex justify-content-left align-items-center'>
        <div className='d-flex flex-column'>
          <Link
            to={`/appia/dataPlans/view/${row.id}`}
            className='user-name text-truncate mb-0'
            onClick={() => store.dispatch(getPlan(store.getState().appiaDataPlans.allData, row.id))}
          >
            <span className='font-weight-bold'>{row.product_id}</span>
          </Link>
        </div>
      </div>
    )
  },
  {
    name: 'Price',
    minWidth: '138px',
    selector: 'price',
    sortable: true,
    cell: row => row.price
  },
  {
    name: 'Network',
    minWidth: '172px',
    selector: 'network',
    sortable: true,
    cell: row => row.network
  },
  {
    name: 'Category',
    minWidth: '172px',
    selector: 'category',
    sortable: true,
    cell: row => row.category
  },
  {
    name: 'Date',
    minWidth: '200px',
    selector: 'created_at',
    sortable: true,
    cell: row => moment(row.created_at).format('lll')
  }
]
