import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Button,
	FormGroup,
	Label,
	Input,
	Table,
	Badge,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane
} from 'reactstrap'
import {
	Download,
	FileText,
	TrendingUp,
	TrendingDown,
	Calendar,
	Filter,
	BarChart2,
	PieChart,
	Activity
} from 'react-feather'
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import { selectThemeColors, apiRequest } from '@utils'
import { Bar, Line, Pie } from 'react-chartjs-2'
import moment from 'moment'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// ** Styles
import 'flatpickr/dist/themes/material_blue.css'
import '@styles/react/libs/charts/recharts.scss'

const MySwal = withReactContent(Swal)

const CountReports = () => {
	const dispatch = useDispatch()
	
	// ** States
	const [activeTab, setActiveTab] = useState('summary')
	const [dateRange, setDateRange] = useState([
		moment().subtract(30, 'days').toDate(),
		moment().toDate()
	])
	const [selectedCounts, setSelectedCounts] = useState([])
	const [reportData, setReportData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [reportType, setReportType] = useState('summary')
	const [counts, setCounts] = useState([])

	// ** Load available counts
	const loadCounts = async () => {
		try {
			const response = await apiRequest({ 
				url: '/inventory/counts', 
				method: 'GET',
				params: { status: 'completed,approved', limit: 100 }
			})
			if (response?.data?.data?.counts) {
				const countOptions = response.data.data.counts.map(count => ({
					value: count.id,
					label: `${count.countNumber} - ${moment(count.countDate).format('DD MMM YYYY')}`
				}))
				setCounts(countOptions)
			}
		} catch (error) {
			console.error('Error loading counts:', error)
		}
	}

	// ** Load counts for selection
	useEffect(() => {
		loadCounts()
	}, [])

	// ** Generate report
	const generateReport = async () => {
		if (selectedCounts.length === 0 && reportType !== 'trend') {
			MySwal.fire({
				icon: 'warning',
				title: 'Select Counts',
				text: 'Please select at least one count to generate report'
			})
			return
		}

		setLoading(true)
		try {
			const params = {
				reportType,
				countIds: selectedCounts.map(c => c.value),
				startDate: dateRange[0] ? moment(dateRange[0]).format('YYYY-MM-DD') : null,
				endDate: dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : null
			}

			const response = await apiRequest({
				url: '/inventory/counts/reports/generate',
				method: 'POST',
				body: JSON.stringify(params) // Changed from 'data' to 'body' with JSON.stringify
			})

			console.log('Report response:', response?.data) // Debug log

			if (response?.data?.data) {
				setReportData(response.data.data)
				MySwal.fire({
					icon: 'success',
					title: 'Report Generated',
					text: 'Your report has been generated successfully',
					showConfirmButton: false,
					timer: 1500
				})
			} else {
				console.error('Unexpected response structure:', response)
				throw new Error('Invalid response structure')
			}
		} catch (error) {
			MySwal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Failed to generate report'
			})
		} finally {
			setLoading(false)
		}
	}

	// ** Export report
	const exportReport = (format) => {
		if (!reportData) {
			MySwal.fire({
				icon: 'warning',
				title: 'No Data',
				text: 'Please generate a report first'
			})
			return
		}

		// In production, implement actual export functionality
		MySwal.fire({
			icon: 'info',
			title: `Export as ${format.toUpperCase()}`,
			text: 'Export functionality will be implemented with backend integration'
		})
	}

	// ** Chart options (Chart.js v2 format)
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: true,
			position: 'top'
		},
		tooltips: {
			mode: 'index',
			intersect: false
		},
		scales: {
			xAxes: [{
				display: true,
				gridLines: {
					display: true
				}
			}],
			yAxes: [
				{
					id: 'y-axis-1',
					type: 'linear',
					display: true,
					position: 'left',
					ticks: {
						beginAtZero: true
					},
					scaleLabel: {
						display: true,
						labelString: 'Variance Value (R)'
					}
				},
				{
					id: 'y-axis-2',
					type: 'linear',
					display: true,
					position: 'right',
					ticks: {
						beginAtZero: true,
						max: 100
					},
					scaleLabel: {
						display: true,
						labelString: 'Accuracy %'
					},
					gridLines: {
						drawOnChartArea: false
					}
				}
			]
		}
	}

	// ** Variance trend chart data
	const getVarianceTrendData = () => {
		if (!reportData?.trendData || !Array.isArray(reportData.trendData) || reportData.trendData.length === 0) {
			return null
		}

		try {
			return {
				labels: reportData.trendData.map(d => moment(d.date).format('MMM DD')),
				datasets: [
					{
						label: 'Variance Value (R)',
						data: reportData.trendData.map(d => d.varianceValue || 0),
						borderColor: 'rgb(255, 99, 132)',
						backgroundColor: 'rgba(255, 99, 132, 0.5)',
						tension: 0.4
					},
					{
						label: 'Accuracy %',
						data: reportData.trendData.map(d => d.accuracy || 0),
						borderColor: 'rgb(53, 162, 235)',
						backgroundColor: 'rgba(53, 162, 235, 0.5)',
						tension: 0.4,
						yAxisID: 'y-axis-2'
					}
				]
			}
		} catch (error) {
			console.error('Error generating trend data:', error)
			return null
		}
	}

	// ** Category variance chart data
	const getCategoryVarianceData = () => {
		if (!reportData?.categoryData || !Array.isArray(reportData.categoryData) || reportData.categoryData.length === 0) {
			return null
		}

		try {
			return {
				labels: reportData.categoryData.map(d => d.category || 'Unknown'),
				datasets: [
					{
						label: 'Variance Count',
						data: reportData.categoryData.map(d => d.count || 0),
						backgroundColor: [
							'rgba(255, 99, 132, 0.5)',
							'rgba(54, 162, 235, 0.5)',
							'rgba(255, 206, 86, 0.5)',
							'rgba(75, 192, 192, 0.5)',
							'rgba(153, 102, 255, 0.5)'
						],
						borderWidth: 1
					}
				]
			}
		} catch (error) {
			console.error('Error generating category data:', error)
			return null
		}
	}

	// ** Top variance products table
	const renderTopVarianceProducts = () => {
		if (!reportData?.topVariances || !Array.isArray(reportData.topVariances) || reportData.topVariances.length === 0) {
			return <p>No variance data available</p>
		}

		return (
			<Table responsive hover>
				<thead>
					<tr>
						<th>Product</th>
						<th>SKU</th>
						<th>Avg System Qty</th>
						<th>Avg Counted Qty</th>
						<th>Avg Variance</th>
						<th>Variance %</th>
						<th>Total Value</th>
					</tr>
				</thead>
				<tbody>
					{reportData.topVariances.map((item, index) => (
						<tr key={index}>
							<td>{item.productName}</td>
							<td>{item.sku}</td>
							<td>{item.avgSystemQty}</td>
							<td>{item.avgCountedQty}</td>
							<td>
								<span className={item.avgVariance > 0 ? 'text-success' : 'text-danger'}>
									{item.avgVariance > 0 ? '+' : ''}{item.avgVariance}
								</span>
							</td>
							<td>
								<Badge color={Math.abs(item.variancePercent) > 10 ? 'danger' : 'warning'}>
									{typeof item.variancePercent === 'number' ? item.variancePercent.toFixed(1) : item.variancePercent}%
								</Badge>
							</td>
							<td className={item.totalValue >= 0 ? 'text-success' : 'text-danger'}>
								R {Math.abs(item.totalValue).toFixed(2)}
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		)
	}

	// ** Summary statistics
	const renderSummaryStats = () => {
		if (!reportData?.summary) return null

		const { summary } = reportData

		return (
			<Row>
				<Col md='3'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-primary mr-2'>
									<BarChart2 size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Counts</h6>
									<h4 className='mb-0'>{summary.totalCounts}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col md='3'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-success mr-2'>
									<TrendingUp size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Avg Accuracy</h6>
									<h4 className='mb-0'>{summary.avgAccuracy}%</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col md='3'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-warning mr-2'>
									<Activity size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Variances</h6>
									<h4 className='mb-0'>{summary.totalVariances}</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col md='3'>
					<Card>
						<CardBody>
							<div className='d-flex align-items-center'>
								<div className='avatar bg-light-danger mr-2'>
									<TrendingDown size={20} />
								</div>
								<div>
									<h6 className='mb-0'>Total Impact</h6>
									<h4 className='mb-0 text-danger'>
										R {Math.abs(summary.totalImpact).toFixed(2)}
									</h4>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>
		)
	}

	return (
		<Fragment>
			{/* Header */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader>
							<CardTitle tag='h4'>Inventory Count Reports</CardTitle>
							<div className='d-flex'>
								<Button
									color='success'
									className='mr-1'
									onClick={() => exportReport('excel')}
									disabled={!reportData}
								>
									<Download size={14} className='mr-50' />
									Export Excel
								</Button>
								<Button
									color='danger'
									outline
									onClick={() => exportReport('pdf')}
									disabled={!reportData}
								>
									<FileText size={14} className='mr-50' />
									Export PDF
								</Button>
							</div>
						</CardHeader>
					</Card>
				</Col>
			</Row>

			{/* Filters */}
			<Row>
				<Col sm='12'>
					<Card>
						<CardBody>
							<h5 className='mb-2'>
								<Filter size={18} className='mr-1' />
								Report Filters
							</h5>
							<Row>
								<Col md='3'>
									<FormGroup>
										<Label for='reportType'>Report Type</Label>
										<Input
											type='select'
											id='reportType'
											value={reportType}
											onChange={(e) => setReportType(e.target.value)}
										>
											<option value='summary'>Summary Report</option>
											<option value='detailed'>Detailed Variance Report</option>
											<option value='trend'>Trend Analysis</option>
											<option value='category'>Category Analysis</option>
											<option value='product'>Product Performance</option>
										</Input>
									</FormGroup>
								</Col>
								<Col md='3'>
									<FormGroup>
										<Label for='dateRange'>Date Range</Label>
										<Flatpickr
											id='dateRange'
											className='form-control'
											value={dateRange}
											onChange={(dates) => setDateRange(dates)}
											options={{
												mode: 'range',
												dateFormat: 'Y-m-d'
											}}
										/>
									</FormGroup>
								</Col>
								<Col md='4'>
									<FormGroup>
										<Label for='counts'>Select Counts</Label>
										<Select
											id='counts'
											theme={selectThemeColors}
											className='react-select'
											classNamePrefix='select'
											options={counts}
											isMulti
											placeholder='Select counts...'
											value={selectedCounts}
											onChange={setSelectedCounts}
										/>
									</FormGroup>
								</Col>
								<Col md='2' className='d-flex align-items-end'>
									<Button
										color='primary'
										block
										onClick={generateReport}
										disabled={loading}
									>
										{loading ? 'Generating...' : 'Generate Report'}
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Report Content */}
			{reportData && (
				<Row>
					<Col sm='12'>
						<Card>
							<CardBody>
								<Nav tabs>
									<NavItem>
										<NavLink
											active={activeTab === 'summary'}
											onClick={() => setActiveTab('summary')}
										>
											Summary
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											active={activeTab === 'charts'}
											onClick={() => setActiveTab('charts')}
										>
											Charts
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink
											active={activeTab === 'details'}
											onClick={() => setActiveTab('details')}
										>
											Detailed Data
										</NavLink>
									</NavItem>
								</Nav>

								<TabContent activeTab={activeTab}>
									{/* Summary Tab */}
									<TabPane tabId='summary'>
										<div className='mt-2'>
											{renderSummaryStats()}
											
											<Row className='mt-2'>
												<Col sm='12'>
													<h5>Key Insights</h5>
													<ul>
														{reportData.insights?.map((insight, index) => (
															<li key={index}>{insight}</li>
														))}
													</ul>
												</Col>
											</Row>

											<Row className='mt-2'>
												<Col sm='12'>
													<h5>Top Variance Products</h5>
													{renderTopVarianceProducts()}
												</Col>
											</Row>
										</div>
									</TabPane>

									{/* Charts Tab */}
									<TabPane tabId='charts'>
										{activeTab === 'charts' && reportData && (
											<Row className='mt-2'>
												<Col md='6'>
													<Card>
														<CardHeader>
															<CardTitle>Variance Trend</CardTitle>
														</CardHeader>
														<CardBody>
															<div style={{ height: '300px' }}>
																{(() => {
																	const trendData = getVarianceTrendData()
																	return trendData ? (
																		<Line 
																			data={trendData} 
																			options={chartOptions}
																		/>
																	) : (
																		<p className='text-center mt-5'>No trend data available</p>
																	)
																})()}
															</div>
														</CardBody>
													</Card>
												</Col>
												<Col md='6'>
													<Card>
														<CardHeader>
															<CardTitle>Category Distribution</CardTitle>
														</CardHeader>
														<CardBody>
															<div style={{ height: '300px' }}>
																{(() => {
																	const categoryData = getCategoryVarianceData()
																	return categoryData ? (
																		<Pie 
																			data={categoryData}
																			options={{ 
																				responsive: true,
																				maintainAspectRatio: false,
																				legend: {
																					display: true,
																					position: 'bottom'
																				}
																			}}
																		/>
																	) : (
																		<p className='text-center mt-5'>No category data available</p>
																	)
																})()}
															</div>
														</CardBody>
													</Card>
												</Col>
											</Row>
										)}

										<Row>
											<Col sm='12'>
												<Card>
													<CardHeader>
														<CardTitle>Count Performance Comparison</CardTitle>
													</CardHeader>
													<CardBody>
														<div style={{ height: '400px' }}>
															{reportData.performanceData && (
																<Bar
																	data={{
																		labels: reportData.performanceData.map(d => d.countNumber),
																		datasets: [
																			{
																				label: 'Accuracy %',
																				data: reportData.performanceData.map(d => d.accuracy),
																				backgroundColor: 'rgba(75, 192, 192, 0.5)'
																			},
																			{
																				label: 'Variance Count',
																				data: reportData.performanceData.map(d => d.varianceCount),
																				backgroundColor: 'rgba(255, 99, 132, 0.5)'
																			}
																		]
																	}}
																	options={chartOptions}
																/>
															)}
														</div>
													</CardBody>
												</Card>
											</Col>
										</Row>
									</TabPane>

									{/* Details Tab */}
									<TabPane tabId='details'>
										<div className='mt-2'>
											<h5>Detailed Variance Data</h5>
											<Table responsive hover size='sm'>
												<thead>
													<tr>
														<th>Count #</th>
														<th>Date</th>
														<th>Product</th>
														<th>Category</th>
														<th>System Qty</th>
														<th>Counted Qty</th>
														<th>Variance</th>
														<th>Value</th>
														<th>Status</th>
													</tr>
												</thead>
												<tbody>
													{reportData.detailedData?.map((item, index) => (
														<tr key={index}>
															<td>{item.countNumber}</td>
															<td>{moment(item.countDate).format('DD/MM/YY')}</td>
															<td>{item.productName}</td>
															<td>
																<Badge color='light-primary' pill>
																	{item.categoryName}
																</Badge>
															</td>
															<td>{item.systemQty}</td>
															<td>{item.countedQty}</td>
															<td className={item.variance > 0 ? 'text-success' : item.variance < 0 ? 'text-danger' : ''}>
																{item.variance > 0 ? '+' : ''}{item.variance}
															</td>
															<td className={item.varianceValue >= 0 ? 'text-success' : 'text-danger'}>
																R {Math.abs(item.varianceValue).toFixed(2)}
															</td>
															<td>
																<Badge color={item.approved ? 'success' : 'warning'} pill>
																	{item.approved ? 'Approved' : 'Pending'}
																</Badge>
															</td>
														</tr>
													))}
												</tbody>
											</Table>
										</div>
									</TabPane>
								</TabContent>
							</CardBody>
						</Card>
					</Col>
				</Row>
			)}
		</Fragment>
	)
}

export default CountReports