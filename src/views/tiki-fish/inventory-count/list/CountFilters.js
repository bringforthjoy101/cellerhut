import { Fragment } from 'react'
import { 
	Row, 
	Col, 
	FormGroup, 
	Label, 
	Input, 
	Button 
} from 'reactstrap'
import Flatpickr from 'react-flatpickr'
import { Search, X } from 'react-feather'

// ** Styles
import 'flatpickr/dist/themes/material_blue.css'

const CountFilters = ({ filters, setFilters, onFilter }) => {
	
	// ** Handle filter change
	const handleFilterChange = (field, value) => {
		setFilters({ ...filters, [field]: value })
	}

	// ** Reset filters
	const handleReset = () => {
		setFilters({
			status: '',
			countType: '',
			startDate: '',
			endDate: ''
		})
		setTimeout(() => onFilter(), 100)
	}

	return (
		<Fragment>
			<Row className='mb-2'>
				<Col md={3}>
					<FormGroup>
						<Label for='status'>Status</Label>
						<Input
							type='select'
							id='status'
							value={filters.status}
							onChange={(e) => handleFilterChange('status', e.target.value)}
						>
							<option value=''>All Status</option>
							<option value='draft'>Draft</option>
							<option value='in_progress'>In Progress</option>
							<option value='review'>Review</option>
							<option value='approved'>Approved</option>
							<option value='completed'>Completed</option>
							<option value='cancelled'>Cancelled</option>
						</Input>
					</FormGroup>
				</Col>
				<Col md={3}>
					<FormGroup>
						<Label for='countType'>Count Type</Label>
						<Input
							type='select'
							id='countType'
							value={filters.countType}
							onChange={(e) => handleFilterChange('countType', e.target.value)}
						>
							<option value=''>All Types</option>
							<option value='full'>Full Count</option>
							<option value='cycle'>Cycle Count</option>
							<option value='spot'>Spot Check</option>
							<option value='category'>Category Count</option>
						</Input>
					</FormGroup>
				</Col>
				<Col md={2}>
					<FormGroup>
						<Label for='startDate'>Start Date</Label>
						<Flatpickr
							id='startDate'
							className='form-control'
							value={filters.startDate}
							onChange={(date) => handleFilterChange('startDate', date[0] ? date[0] : '')}
							options={{
								dateFormat: 'Y-m-d'
							}}
							placeholder='Select date'
						/>
					</FormGroup>
				</Col>
				<Col md={2}>
					<FormGroup>
						<Label for='endDate'>End Date</Label>
						<Flatpickr
							id='endDate'
							className='form-control'
							value={filters.endDate}
							onChange={(date) => handleFilterChange('endDate', date[0] ? date[0] : '')}
							options={{
								dateFormat: 'Y-m-d',
								minDate: filters.startDate || undefined
							}}
							placeholder='Select date'
						/>
					</FormGroup>
				</Col>
				<Col md={2} className='d-flex align-items-end'>
					<FormGroup className='mb-0 w-100'>
						<Button 
							color='primary' 
							onClick={onFilter}
							className='mr-1'
							block
						>
							<Search size={14} className='mr-50' />
							Filter
						</Button>
					</FormGroup>
				</Col>
			</Row>
			<Row>
				<Col md={12} className='text-right'>
					<Button 
						color='link' 
						size='sm'
						onClick={handleReset}
						className='p-0'
					>
						<X size={14} className='mr-50' />
						Clear Filters
					</Button>
				</Col>
			</Row>
		</Fragment>
	)
}

export default CountFilters