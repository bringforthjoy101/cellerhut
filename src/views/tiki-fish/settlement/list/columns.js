// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'

import { Badge } from 'reactstrap'

// ** Third Party Components

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.avatar) {
		return <Avatar className="mr-1" img={row.avatar} width="32" height="32" />
	} else {
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.firstName} ${row.lastName}` || 'John Doe'} initials />
	}
}

const statusObj = {
	UNPAID: 'light-warning',
	PAID: 'light-success',
}

const transactionTypeObj = {
	debit: 'light-danger',
	credit: 'light-success',
}

export const columns = [
	{
		name: 'Settlement Id',
		minWidth: '150px',
		selector: 'tagNumber',
		sortable: true,
		cell: (row) => row.tagNumber,
	},
	{
		name: 'Transctions',
		minWidth: '200px',
		selector: 'transactions',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{/* {renderClient(row.student)} */}
				<div className='d-flex flex-column'>
					<span className='font-weight-bold'>{row?.transactionsValue?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					<small className='text-truncate text-muted text-capitalize mb-0'>{row.transactionsVolume.toLocaleString()} Transactions</small>
				</div>
			</div>
		),
	},
	{
		name: 'Credits',
		minWidth: '200px',
		selector: 'credits',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{/* {renderClient(row.student)} */}
				<div className='d-flex flex-column'>
				<span className='font-weight-bold'>{row?.totalCreditsValue?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					<small className='text-truncate text-muted text-capitalize mb-0'>{row.totalCreditsVolume.toLocaleString()} Transactions</small>
				</div>
			</div>
		),
	},
	{
		name: 'Debits',
		minWidth: '200px',
		selector: 'debits',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{/* {renderClient(row.student)} */}
				<div className='d-flex flex-column'>
				<span className='font-weight-bold'>{row?.totalDebitsValue?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					<small className='text-truncate text-muted text-capitalize mb-0'>{row.totalDebitsVolume.toLocaleString()} Transactions</small>
				</div>
			</div>
		),
	},
	{
		name: 'Service Fee',
		minWidth: '200px',
		selector: 'service-fee',
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{/* {renderClient(row.student)} */}
				<div className='d-flex flex-column'>
				<span className='font-weight-bold'>{row?.amount?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					<small className='text-truncate text-muted text-capitalize mb-0'>{row.serviceChargeCount.toLocaleString()} Transactions</small>
				</div>
			</div>
		),
	},
	// {
	// 	name: 'Type',
	// 	minWidth: '150px',
	// 	selector: 'type',
	// 	sortable: true,
	// 	cell: (row) => (
	// 		<Badge className="text-capitalize" color={transactionTypeObj[row.type]} pill>
	// 			{row.type}
	// 		</Badge>
	// 	),
	// },
	// {
	// 	name: 'Amount',
	// 	minWidth: '150px',
	// 	selector: 'amount',
	// 	sortable: true,
	// 	cell: (row) => <span>{(row.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>,
	// },
	// {
	// 	name: 'Balance',
	// 	minWidth: '150px',
	// 	selector: 'balance',
	// 	sortable: true,
	// 	cell: (row) => <span className="text-capitalize">{row?.balance?.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}</span>,
	// },
	{
	  name: 'Status',
	  minWidth: '100px',
	  selector: 'status',
	  sortable: true,
	  cell: row => (
	    <Badge className='text-capitalize' color={statusObj[row.status]} pill>
	      {row.status}
	    </Badge>
	  )
	},
	{
		name: 'Date',
		minWidth: '150px',
		selector: 'createdAt',
		sortable: true,
		cell: (row) => moment(row.createdAt).format('lll'),
	},
	// {
	// 	name: 'Initiated By',
	// 	minWidth: '200px',
	// 	selector: 'admin',
	// 	sortable: true,
	// 	cell: (row) => (
	// 		<span className="font-weight-bold">
	// 			{row.admin.firstName} {row.admin.lastName}
	// 		</span>
	// 	),
	// },
]
