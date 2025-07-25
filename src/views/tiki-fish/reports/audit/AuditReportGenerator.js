import { Fragment, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'
import { Calendar, Download, FileText, TrendingUp, DollarSign, Users, Package, AlertCircle } from 'react-feather'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	Alert,
	Badge,
	Table,
	Progress,
	Spinner,
} from 'reactstrap'
import { toast } from 'react-toastify'
import { apiRequest } from '@utils'
import ReportPreview from './ReportPreview'
import ReportFilters from './ReportFilters'

const AuditReportGenerator = () => {
	const dispatch = useDispatch()

	// State management
	const [reportData, setReportData] = useState(null)
	const [isGenerating, setIsGenerating] = useState(false)
	const [isExporting, setIsExporting] = useState(false)
	const [filters, setFilters] = useState({
		startDate: moment().subtract(1, 'month').format('YYYY-MM-DD'),
		endDate: moment().format('YYYY-MM-DD'),
		reportType: 'comprehensive',
	})
	const [quickDateRange, setQuickDateRange] = useState('')

	// Generate report
	const generateReport = async () => {
		setIsGenerating(true)

		try {
			const response = await apiRequest(
				{
					url: '/reports/audit/generate',
					method: 'POST',
					body: JSON.stringify(filters),
				},
				dispatch
			)

			if (response.data.status) {
				setReportData(response.data.data)
				toast.success('Audit report generated successfully!')
			} else {
				toast.error(response.data.message || 'Failed to generate report')
			}
		} catch (error) {
			console.error('Report generation error:', error)
			toast.error('Failed to generate report. Please try again.')
		} finally {
			setIsGenerating(false)
		}
	}

	// Handle quick date range selection
	const handleQuickDateRange = (range) => {
		setQuickDateRange(range)
		let startDate, endDate

		switch (range) {
			case 'today':
				startDate = moment().format('YYYY-MM-DD')
				endDate = moment().format('YYYY-MM-DD')
				break
			case 'yesterday':
				startDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
				endDate = moment().subtract(1, 'day').format('YYYY-MM-DD')
				break
			case 'thisWeek':
				startDate = moment().startOf('week').format('YYYY-MM-DD')
				endDate = moment().endOf('week').format('YYYY-MM-DD')
				break
			case 'lastWeek':
				startDate = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
				endDate = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
				break
			case 'thisMonth':
				startDate = moment().startOf('month').format('YYYY-MM-DD')
				endDate = moment().endOf('month').format('YYYY-MM-DD')
				break
			case 'lastMonth':
				startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
				endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
				break
			case 'thisQuarter':
				startDate = moment().startOf('quarter').format('YYYY-MM-DD')
				endDate = moment().endOf('quarter').format('YYYY-MM-DD')
				break
			case 'lastQuarter':
				startDate = moment().subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD')
				endDate = moment().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD')
				break
			case 'thisYear':
				startDate = moment().startOf('year').format('YYYY-MM-DD')
				endDate = moment().endOf('year').format('YYYY-MM-DD')
				break
			case 'lastYear':
				startDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD')
				endDate = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD')
				break
			default:
				return
		}

		setFilters({ ...filters, startDate, endDate })
	}

	// Export report
	const exportReport = async (format) => {
		if (!reportData) {
			toast.error('Please generate a report first')
			return
		}

		setIsExporting(true)

		try {
			const endpoint = format === 'pdf' ? '/reports/audit/export/pdf' : '/reports/audit/export/csv'

			const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${JSON.parse(localStorage.getItem('userData')).accessToken}`,
				},
				body: JSON.stringify({ reportData, format }),
			})

			if (response.ok) {
				const blob = await response.blob()
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `Audit_Report_${filters.startDate}_to_${filters.endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)

				toast.success(`Report exported successfully as ${format.toUpperCase()}`)
			} else {
				toast.error('Export failed. Please try again.')
			}
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Export failed. Please try again.')
		} finally {
			setIsExporting(false)
		}
	}

	// Auto-generate report on component mount
	useEffect(() => {
		generateReport()
	}, [])

	return (
		<Fragment>
			<Row>
				<Col lg="12">
					<Card>
						<CardHeader>
							<CardTitle tag="h4" className="d-flex align-items-center">
								<FileText className="mr-1" size={20} />
								Audit Report Generator
								<Badge color="info" className="ml-2">
									South Africa
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Alert color="info">
								<AlertCircle size={16} className="mr-1" />
								<strong>For Auditor Review:</strong> This comprehensive report includes all revenue, tax compliance (15% VAT), product performance,
								and regulatory information required for South African liquor business auditing.
							</Alert>

							{/* Filters Section */}
							<ReportFilters filters={filters} setFilters={setFilters} quickDateRange={quickDateRange} onQuickDateRange={handleQuickDateRange} />

							{/* Action Buttons */}
							<Row className="mt-3">
								<Col md="6">
									<Button color="primary" onClick={generateReport} disabled={isGenerating} className="mr-1">
										{isGenerating ? <Spinner size="sm" className="mr-1" /> : <TrendingUp size={16} className="mr-1" />}
										{isGenerating ? 'Generating...' : 'Generate Report'}
									</Button>
								</Col>
								<Col md="6" className="text-right">
									{reportData && (
										<Fragment>
											<Button color="success" outline onClick={() => exportReport('pdf')} disabled={isExporting} className="mr-1">
												{isExporting ? <Spinner size="sm" className="mr-1" /> : <Download size={16} className="mr-1" />}
												Export PDF
											</Button>
											<Button color="info" outline onClick={() => exportReport('csv')} disabled={isExporting}>
												{isExporting ? <Spinner size="sm" className="mr-1" /> : <Download size={16} className="mr-1" />}
												Export Excel
											</Button>
										</Fragment>
									)}
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Report Preview */}
			{reportData && <ReportPreview reportData={reportData} />}

			{/* Loading State */}
			{isGenerating && !reportData && (
				<Row>
					<Col lg="12">
						<Card>
							<CardBody className="text-center">
								<Spinner color="primary" />
								<div className="mt-2">Generating comprehensive audit report...</div>
								<small className="text-muted">This may take a few moments for large date ranges</small>
							</CardBody>
						</Card>
					</Col>
				</Row>
			)}
		</Fragment>
	)
}

export default AuditReportGenerator
