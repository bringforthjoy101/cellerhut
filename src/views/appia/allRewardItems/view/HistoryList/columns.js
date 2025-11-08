// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { getReward } from '../../store/action'
import moment from 'moment'
import { store } from '@store/storeConfig/store'
import RestoreReward from './RestoreReward'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { Slack, User, Settings, Database, Edit, MoreVertical, FileText, Trash2, Archive } from 'react-feather'

const statusObj = {
	pending: 'light-warning',
	active: 'light-success',
	inactive: 'light-danger',
}

export const columns = [
	{
		name: 'Image',
		minWidth: '40px',
		selector: 'image',
		sortable: true,
		cell: (row) => (
			<Badge>
				<img src={row.image} width="30px" alt="" />
			</Badge>
		),
	},
	{
		name: 'Reward Id',
		minWidth: '140px',
		selector: 'id',
		sortable: true,
		cell: (row) => row.id,
	},
	{
		name: 'Name',
		minWidth: '200px',
		selector: 'name',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				<div className="d-flex flex-column">
					<span className="font-weight-bold">{row.name}</span>
				</div>
			</div>
		),
	},
	{
		name: 'Quantity',
		minWidth: '100px',
		selector: 'qty',
		sortable: true,
		cell: (row) => row.qty,
	},
	{
		name: 'Value',
		minWidth: '172px',
		selector: 'value',
		sortable: true,
		cell: (row) => row?.value?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }),
	},
	{
		name: 'Type',
		minWidth: '138px',
		selector: 'price',
		sortable: true,
		cell: (row) => row.type,
	},
	{
		name: 'Status',
		minWidth: '100px',
		selector: 'status',
		sortable: true,
		cell: (row) => (
			<Badge className="text-capitalize" color={statusObj[row.status]} pill>
				{row.status}
			</Badge>
		),
	},
	{
		name: 'Date',
		minWidth: '200px',
		selector: 'created_at',
		sortable: true,
		cell: (row) => moment(row.created_at).format('lll'),
	},
	{
		name: 'Actions',
		minWidth: '200px',
		selector: 'fullName',
		sortable: true,
		cell: (row) => <RestoreReward />,
	},
]
