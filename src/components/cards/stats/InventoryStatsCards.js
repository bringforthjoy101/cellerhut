import { Fragment } from 'react'
import { Card, CardBody, Row, Col, Media, Progress } from 'reactstrap'
import Avatar from '@components/avatar'
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart, AlertCircle, CheckCircle, Activity } from 'react-feather'

const InventoryStatsCards = ({ stats, cols = { xl: '3', sm: '6' } }) => {
	if (!stats) {
		return null
	}

	const formatCurrency = (value) => {
		return `R ${parseFloat(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
	}

	const formatNumber = (value) => {
		return value.toLocaleString('en-ZA')
	}

	const statsData = [
		{
			title: formatNumber(stats.totalProducts || 0),
			subtitle: 'Total Products',
			color: 'light-primary',
			icon: <Package size={24} />,
			trend: null,
		},
		{
			title: formatNumber(stats.totalStock || 0),
			subtitle: 'Total Stock Units',
			color: 'light-info',
			icon: <ShoppingCart size={24} />,
			trend: null,
		},
		{
			title: formatCurrency(stats.totalValue || 0),
			subtitle: 'Inventory Value',
			color: 'light-success',
			icon: <DollarSign size={24} />,
			trend: 'up',
		},
		{
			title: formatNumber(stats.lowStockCount || 0),
			subtitle: 'Low Stock Items',
			color: 'light-warning',
			icon: <AlertTriangle size={24} />,
			trend: stats.lowStockCount > 0 ? 'warning' : null,
		},
		{
			title: formatNumber(stats.outOfStockCount || 0),
			subtitle: 'Out of Stock',
			color: 'light-danger',
			icon: <AlertCircle size={24} />,
			trend: stats.outOfStockCount > 0 ? 'down' : null,
		},
		{
			title: `${stats.healthScore || 0}%`,
			subtitle: 'Health Score',
			color: stats.healthScore >= 80 ? 'light-success' : stats.healthScore >= 60 ? 'light-warning' : 'light-danger',
			icon: <Activity size={24} />,
			showProgress: true,
			progressValue: stats.healthScore || 0,
		},
	]

	const renderCards = () => {
		return statsData.map((item, index) => {
			const colSizes = typeof cols === 'object' ? cols : { xl: cols, sm: '6' }

			return (
				<Col key={index} {...colSizes}>
					<Card className="mb-2">
						<CardBody>
							<Media>
								<Avatar color={item.color} icon={item.icon} className="mr-2" />
								<Media className="my-auto" body>
									<div className="d-flex align-items-center justify-content-between">
										<div>
											<h4 className="font-weight-bolder mb-0">
												{item.title}
												{item.trend && (
													<small className={`ml-1 ${item.trend === 'up' ? 'text-success' : item.trend === 'down' ? 'text-danger' : 'text-warning'}`}>
														{item.trend === 'up' && <TrendingUp size={14} />}
														{item.trend === 'down' && <TrendingUp size={14} className="rotate-180" />}
														{item.trend === 'warning' && <AlertCircle size={14} />}
													</small>
												)}
											</h4>
											<small className="text-muted">{item.subtitle}</small>
											{item.showProgress && (
												<Progress
													value={item.progressValue}
													color={item.progressValue >= 80 ? 'success' : item.progressValue >= 60 ? 'warning' : 'danger'}
													className="mt-1"
													style={{ height: '6px' }}
												/>
											)}
										</div>
									</div>
								</Media>
							</Media>
						</CardBody>
					</Card>
				</Col>
			)
		})
	}

	return <Row>{renderCards()}</Row>
}

export default InventoryStatsCards
