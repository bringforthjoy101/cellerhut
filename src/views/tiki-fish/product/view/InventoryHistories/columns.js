// ** React Imports
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Badge, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import { Send, CheckCircle, Save, ArrowDownCircle, Info, PieChart } from 'react-feather'

const getItemNames = (items) => {
	const arr = []
	items.forEach((item) => {
		arr.push(item.name)
	})
	const string = arr.join(', ')
	if (string.length < 35) return string
	return `${string.substring(0, 35)}...`
}

// ** Table columns
export const columns = [
	{
		name: 'ID',
		minWidth: '100px',
		selector: 'id',
		cell: (row) => <span>{`#${row.id}`}</span>,
	},
	{
		name: 'Qty',
		selector: 'qty',
		sortable: true,
		minWidth: '100px',
		cell: (row) => <span>{(row.qty || 0).toLocaleString()}</span>,
	},
	{
		name: 'Type ',
		minWidth: '100px',
		selector: 'type',
		sortable: true,
		cell: (row) => <span>{row.type}</span>,
	},
	{
		name: 'Department ',
		minWidth: '100px',
		selector: 'department',
		sortable: true,
		cell: (row) => <span>{row.department || '--'}</span>,
	},
	{
		name: 'New Qty',
		selector: 'newQty',
		sortable: true,
		minWidth: '100px',
		cell: (row) => <span>{(row.newQty || 0).toLocaleString()}</span>,
	},
	{
		name: 'Description',
		selector: 'description',
		sortable: true,
		minWidth: '200px',
		cell: (row) => <span>{row.description || '--'}</span>,
	},
	{
		name: 'Date',
		selector: 'createdAt',
		sortable: true,
		minWidth: '100px',
		cell: (row) => moment(row.createdAt).format('lll'),
	},
	{
		name: 'Initiated By',
		minWidth: '200px',
		selector: 'admin',
		sortable: true,
		cell: (row) => <span className="font-weight-bold">{row.admin.firstName} {row.admin.lastName}</span>,
	},
]
