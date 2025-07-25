import { Fragment } from 'react'
import { TrendingUp, DollarSign, Package, Users, CreditCard, PieChart, BarChart, AlertTriangle, CheckCircle, Info } from 'react-feather'
import { Card, CardHeader, CardTitle, CardBody, Row, Col, Table, Badge, Progress, Alert } from 'reactstrap'

const ReportPreview = ({ reportData }) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-ZA', {
			style: 'currency',
			currency: 'ZAR',
			minimumFractionDigits: 2,
		}).format(amount)
	}

	const formatPercentage = (value) => {
		return `${Number(value).toFixed(2)}%`
	}

	if (!reportData) {
		return null
	}

	const { reportInfo, revenue, taxation, products, payments, customers, profitability, settlements, compliance } = reportData

	return (
		<Fragment>
			{/* Report Header */}
			<Row>
				<Col lg="12">
					<Card className="border-primary">
						<CardHeader className="bg-primary text-white">
							<CardTitle tag="h4" className="mb-0 text-white">
								📊 Comprehensive Audit Report - South African Liquor Business
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Row>
								<Col md="6">
									<div className="d-flex flex-column">
										<strong>Report Period:</strong>
										<span>
											{reportInfo.period.start} to {reportInfo.period.end}
										</span>
										<small className="text-muted">Duration: {reportInfo.period.duration} days</small>
									</div>
								</Col>
								<Col md="6">
									<div className="d-flex flex-column">
										<strong>Generated:</strong>
										<span>{reportInfo.generatedAt}</span>
										<small className="text-muted">Total Orders: {reportInfo.totalOrders}</small>
									</div>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Key Metrics Overview */}
			<Row>
				<Col lg="3" md="6">
					<Card className="border-left-success">
						<CardBody>
							<div className="d-flex align-items-center">
								<div className="avatar bg-light-success mr-2">
									<DollarSign size={24} className="text-success" />
								</div>
								<div>
									<h4 className="mb-0">{formatCurrency(revenue.totalRevenue)}</h4>
									<small className="text-muted">Total Revenue</small>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<Col lg="3" md="6">
					<Card className="border-left-primary">
						<CardBody>
							<div className="d-flex align-items-center">
								<div className="avatar bg-light-primary mr-2">
									<TrendingUp size={24} className="text-primary" />
								</div>
								<div>
									<h4 className="mb-0">{formatCurrency(profitability.totalProfit)}</h4>
									<small className="text-muted">Gross Profit</small>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<Col lg="3" md="6">
					<Card className="border-left-warning">
						<CardBody>
							<div className="d-flex align-items-center">
								<div className="avatar bg-light-warning mr-2">
									<AlertTriangle size={24} className="text-warning" />
								</div>
								<div>
									<h4 className="mb-0">{formatCurrency(taxation.totalVATCollected)}</h4>
									<small className="text-muted">VAT Collected (15%)</small>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<Col lg="3" md="6">
					<Card className="border-left-info">
						<CardBody>
							<div className="d-flex align-items-center">
								<div className="avatar bg-light-info mr-2">
									<Users size={24} className="text-info" />
								</div>
								<div>
									<h4 className="mb-0">{customers.totalCustomers}</h4>
									<small className="text-muted">Active Customers</small>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Revenue Analysis */}
			<Row>
				<Col lg="6">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<DollarSign className="mr-1" size={18} />
								Revenue Breakdown
							</CardTitle>
						</CardHeader>
						<CardBody>
							<div className="mb-2">
								<div className="d-flex justify-content-between">
									<span>Subtotal:</span>
									<strong>{formatCurrency(revenue.totalSubTotal)}</strong>
								</div>
								<div className="d-flex justify-content-between">
									<span>Discounts:</span>
									<span className="text-danger">-{formatCurrency(revenue.totalDiscount)}</span>
								</div>
								<div className="d-flex justify-content-between">
									<span>Logistics:</span>
									<span>{formatCurrency(revenue.totalLogistics)}</span>
								</div>
								<div className="d-flex justify-content-between">
									<span>Sales Tax:</span>
									<span>{formatCurrency(revenue.totalSalesTax)}</span>
								</div>
								<hr />
								<div className="d-flex justify-content-between">
									<strong>Total Revenue:</strong>
									<strong className="text-success">{formatCurrency(revenue.totalRevenue)}</strong>
								</div>
								<div className="d-flex justify-content-between mt-1">
									<span>Average Order Value:</span>
									<span>{formatCurrency(revenue.averageOrderValue)}</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>

				<Col lg="6">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<BarChart className="mr-1" size={18} />
								Profitability Analysis
							</CardTitle>
						</CardHeader>
						<CardBody>
							<div className="mb-3">
								<div className="d-flex justify-content-between mb-1">
									<span>Profit Margin</span>
									<span className="text-success font-weight-bold">{formatPercentage(profitability.profitMargin)}</span>
								</div>
								<Progress
									value={profitability.profitMargin}
									color={profitability.profitMargin > 20 ? 'success' : profitability.profitMargin > 10 ? 'warning' : 'danger'}
								/>
							</div>

							<div className="mb-3">
								<div className="d-flex justify-content-between mb-1">
									<span>Cost Ratio</span>
									<span>{formatPercentage(profitability.costRatio)}</span>
								</div>
								<Progress
									value={profitability.costRatio}
									color={profitability.costRatio < 60 ? 'success' : profitability.costRatio < 80 ? 'warning' : 'danger'}
								/>
							</div>

							<div className="mt-3">
								<div className="d-flex justify-content-between">
									<span>Total Cost:</span>
									<span>{formatCurrency(profitability.totalCost)}</span>
								</div>
								<div className="d-flex justify-content-between">
									<strong>Net Profit:</strong>
									<strong className={profitability.totalProfit > 0 ? 'text-success' : 'text-danger'}>
										{formatCurrency(profitability.totalProfit)}
									</strong>
								</div>
							</div>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Tax Compliance */}
			<Row>
				<Col lg="12">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<CheckCircle className="mr-1" size={18} />
								VAT Compliance Report (South Africa - 15% Standard Rate)
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Row>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-primary">{formatCurrency(taxation.taxInclusiveRevenue)}</h4>
										<small>Tax-Inclusive Sales</small>
									</div>
								</Col>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-info">{formatCurrency(taxation.taxExclusiveRevenue)}</h4>
										<small>Tax-Exclusive Sales</small>
									</div>
								</Col>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-warning">{formatCurrency(taxation.totalVATCollected)}</h4>
										<small>Total VAT Collected</small>
									</div>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Top Products */}
			<Row>
				<Col lg="12">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<Package className="mr-1" size={18} />
								Top Performing Products
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Table responsive>
								<thead>
									<tr>
										<th>Product</th>
										<th>Category</th>
										<th className="text-center">Qty Sold</th>
										<th className="text-right">Revenue</th>
										<th className="text-right">Profit</th>
										<th className="text-center">Margin</th>
									</tr>
								</thead>
								<tbody>
									{products.topPerformers.slice(0, 10).map((product, index) => (
										<tr key={product.productId}>
											<td>
												<div>
													<strong>{product.name}</strong>
													<Badge color="secondary" className="ml-1">
														#{index + 1}
													</Badge>
												</div>
											</td>
											<td>{product.category}</td>
											<td className="text-center">{product.quantitySold}</td>
											<td className="text-right">{formatCurrency(product.revenue)}</td>
											<td className="text-right">
												<span className={product.profit > 0 ? 'text-success' : 'text-danger'}>{formatCurrency(product.profit)}</span>
											</td>
											<td className="text-center">
												<Badge color={product.profitMargin > 20 ? 'success' : product.profitMargin > 10 ? 'warning' : 'danger'}>
													{formatPercentage(product.profitMargin)}
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Payment Methods */}
			<Row>
				<Col lg="6">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<CreditCard className="mr-1" size={18} />
								Payment Method Analysis
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Table responsive>
								<thead>
									<tr>
										<th>Method</th>
										<th className="text-center">Orders</th>
										<th className="text-right">Revenue</th>
										<th className="text-center">%</th>
									</tr>
								</thead>
								<tbody>
									{payments.map((payment) => (
										<tr key={payment.method}>
											<td>
												<Badge color="outline-primary" className="text-capitalize">
													{payment.method.replace('-', ' ')}
												</Badge>
											</td>
											<td className="text-center">{payment.count}</td>
											<td className="text-right">{formatCurrency(payment.revenue)}</td>
											<td className="text-center">{formatPercentage(payment.percentage)}</td>
										</tr>
									))}
								</tbody>
							</Table>
						</CardBody>
					</Card>
				</Col>

				<Col lg="6">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<Users className="mr-1" size={18} />
								Top Customers
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Table responsive>
								<thead>
									<tr>
										<th>Customer</th>
										<th className="text-center">Orders</th>
										<th className="text-right">Revenue</th>
									</tr>
								</thead>
								<tbody>
									{customers.topCustomers.slice(0, 5).map((customer) => (
										<tr key={customer.customerId}>
											<td>
												<div>
													<div>{customer.name}</div>
													<small className="text-muted">{customer.email}</small>
												</div>
											</td>
											<td className="text-center">{customer.orders}</td>
											<td className="text-right">{formatCurrency(customer.revenue)}</td>
										</tr>
									))}
								</tbody>
							</Table>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Compliance Section */}
			<Row>
				<Col lg="12">
					<Card>
						<CardHeader>
							<CardTitle tag="h5" className="d-flex align-items-center">
								<Info className="mr-1" size={18} />
								South African Liquor Business Compliance
							</CardTitle>
						</CardHeader>
						<CardBody>
							<Row>
								<Col md="4">
									<Alert color="info">
										<h6>Alcohol Sales</h6>
										<div>Revenue: {formatCurrency(compliance.alcoholRevenue)}</div>
										<div>Percentage: {formatPercentage(compliance.alcoholRevenuePercentage)}</div>
										<Badge color={compliance.requiresLiquorLicense ? 'warning' : 'success'}>
											{compliance.requiresLiquorLicense ? 'Liquor License Required' : 'No License Needed'}
										</Badge>
									</Alert>
								</Col>
								<Col md="8">
									<h6>Compliance Notes:</h6>
									<ul className="list-unstyled">
										{compliance.complianceNotes.map((note, index) => (
											<li key={index} className="mb-1">
												<CheckCircle size={14} className="text-success mr-1" />
												{note}
											</li>
										))}
									</ul>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>

			{/* Settlement Status */}
			<Row>
				<Col lg="12">
					<Card>
						<CardHeader>
							<CardTitle tag="h5">Settlement & Payment Status</CardTitle>
						</CardHeader>
						<CardBody>
							<Row>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-success">{formatCurrency(settlements.completedRevenue)}</h4>
										<small>Completed Payments</small>
									</div>
								</Col>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-warning">{formatCurrency(settlements.pendingRevenue)}</h4>
										<small>Pending Payments</small>
									</div>
								</Col>
								<Col md="4">
									<div className="text-center p-3 border rounded">
										<h4 className="text-info">{formatPercentage(settlements.settlementRate)}</h4>
										<small>Settlement Rate</small>
									</div>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Fragment>
	)
}

export default ReportPreview
