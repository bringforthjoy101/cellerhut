import { Fragment } from 'react'
import { Calendar, Filter } from 'react-feather'
import { Row, Col, FormGroup, Label, Input, Button, ButtonGroup, Card, CardBody } from 'reactstrap'

const ReportFilters = ({ filters, setFilters, quickDateRange, onQuickDateRange }) => {
	const handleFilterChange = (field, value) => {
		setFilters({ ...filters, [field]: value })
	}

	const quickRangeOptions = [
		{ value: 'today', label: 'Today' },
		{ value: 'yesterday', label: 'Yesterday' },
		{ value: 'thisWeek', label: 'This Week' },
		{ value: 'lastWeek', label: 'Last Week' },
		{ value: 'thisMonth', label: 'This Month' },
		{ value: 'lastMonth', label: 'Last Month' },
		{ value: 'thisQuarter', label: 'This Quarter' },
		{ value: 'lastQuarter', label: 'Last Quarter' },
		{ value: 'thisYear', label: 'This Year' },
		{ value: 'lastYear', label: 'Last Year' },
	]

	const reportTypeOptions = [
		{ value: 'comprehensive', label: 'Comprehensive Audit Report' },
		{ value: 'revenue', label: 'Revenue Analysis Only' },
		{ value: 'tax', label: 'Tax Compliance Report' },
		{ value: 'products', label: 'Product Performance Report' },
		{ value: 'customers', label: 'Customer Analytics Report' },
	]

	return (
		<Card className="border-0 shadow-sm">
			<CardBody>
				<Row>
					<Col lg="12" className="mb-3">
						<h6 className="d-flex align-items-center mb-2">
							<Filter size={16} className="mr-1" />
							Report Filters
						</h6>
					</Col>
				</Row>

				{/* Quick Date Range Selection */}
				<Row className="mb-3">
					<Col lg="12">
						<Label className="form-label">Quick Date Range</Label>
						<div className="d-flex flex-wrap gap-1">
							{quickRangeOptions.map((option) => (
								<Button
									key={option.value}
									size="sm"
									color={quickDateRange === option.value ? 'primary' : 'outline-secondary'}
									onClick={() => onQuickDateRange(option.value)}
									className="mb-1"
								>
									{option.label}
								</Button>
							))}
						</div>
					</Col>
				</Row>

				{/* Custom Date Range */}
				<Row>
					<Col md="4">
						<FormGroup>
							<Label for="startDate" className="d-flex align-items-center">
								<Calendar size={14} className="mr-1" />
								Start Date
							</Label>
							<Input
								type="date"
								id="startDate"
								value={filters.startDate}
								onChange={(e) => handleFilterChange('startDate', e.target.value)}
								max={filters.endDate}
							/>
						</FormGroup>
					</Col>

					<Col md="4">
						<FormGroup>
							<Label for="endDate" className="d-flex align-items-center">
								<Calendar size={14} className="mr-1" />
								End Date
							</Label>
							<Input
								type="date"
								id="endDate"
								value={filters.endDate}
								onChange={(e) => handleFilterChange('endDate', e.target.value)}
								min={filters.startDate}
								max={new Date().toISOString().split('T')[0]}
							/>
						</FormGroup>
					</Col>

					<Col md="4">
						<FormGroup>
							<Label for="reportType">Report Type</Label>
							<Input type="select" id="reportType" value={filters.reportType} onChange={(e) => handleFilterChange('reportType', e.target.value)}>
								{reportTypeOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Input>
						</FormGroup>
					</Col>
				</Row>

				{/* Date Range Info */}
				<Row>
					<Col lg="12">
						<div className="d-flex align-items-center justify-content-between">
							<small className="text-muted">
								Selected Range: {filters.startDate} to {filters.endDate}
								{(() => {
									const start = new Date(filters.startDate)
									const end = new Date(filters.endDate)
									const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
									return ` (${days} day${days !== 1 ? 's' : ''})`
								})()}
							</small>
							<small className="text-info">📍 Timezone: South Africa (SAST)</small>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default ReportFilters
