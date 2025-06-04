import { useContext, useState, useEffect } from 'react'
import { apiRequest, swal, kFormatter, isUserLoggedIn } from '@utils'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { Row, Col, Spinner } from 'reactstrap'
import ContactsCount from '@src/views/ui-elements/cards/statistics/ContactsCountInfo'
import CardCongratulations from '@src/views/ui-elements/cards/advance/CardCongratulations'
import StatsCard from '@src/views/ui-elements/cards/statistics/StatsCard'
import StatsVertical from '@components/widgets/stats/StatsVertical'
import { DollarSign, Eye, TrendingUp } from 'react-feather'

import '@styles/react/libs/charts/apex-charts.scss'

const AnalyticsDashboard = () => {
	const { colors } = useContext(ThemeColors)

	const [userData, setUserData] = useState(null)
	const [dashData, setDashData] = useState({})

	useEffect(() => {
		if (isUserLoggedIn) {
			setUserData(JSON.parse(localStorage.getItem('userData')))
		}
	}, [])

	// ** Get all Dashboard Data
	const dashboardData = async () => {
		const response = await apiRequest({ url: '/dashboard', method: 'GET' })
		if (response) {
			if (response?.data?.data && response?.data?.status) {
				await setDashData(response.data.data)
			} else {
				console.log(response.error)
			}
		} else {
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}

	// ** Get admin activities
	useEffect(() => {
		dashboardData()
	}, [])

	const numFormatter = (num) => {
		if (num > 999 && num < 1000000) {
			return `${(num / 1000).toFixed(2)}K`
		} else if (num > 1000000) {
			return `${(num / 1000000).toFixed(2)}M`
		} else if (num < 900) {
			return num
		}
	}

	console.log({ dashData })
	return (
		<div id="dashboard-analytics">
			<Row className="match-height">
				<Col lg="5" md="6" sm="12">
					<CardCongratulations userData={userData} />
				</Col>
				<Col lg="7" md="6" sm="12">
					{dashData.sales ? <StatsCard cols={{ xl: '4', sm: '6' }} statsData={dashData?.sales.topSelling} /> : <Spinner className="mr-25" size="l" />}
				</Col>
			</Row>
			{userData?.role === 'admin' && (
				<>
					{/* <Row className="match-height">
						<Col xl="4" md="6" sm="12">
							<StatsVertical icon={<DollarSign size={21} />} color="success" stats={dashData.businessBalance ? Number(dashData?.businessBalance).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <Spinner className="mr-25" size="s" />} statTitle="Total Account Balance" />
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical icon={<DollarSign size={21} />} color="success" stats={dashData.logisticsBalance ? Number(dashData?.logisticsBalance).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <Spinner className="mr-25" size="s" />} statTitle="Logistics Balance" />
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<DollarSign size={21} />}
								color="success"
								stats={dashData.packagingBalance ? Number(dashData?.packagingBalance).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <Spinner className="mr-25" size="sm" />}
								statTitle="Packaging Balance"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<DollarSign size={21} />}
								color="success"
								stats={dashData.profitBalance ? Number(dashData?.profitBalance).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <Spinner className="mr-25" size="sm" />}
								statTitle="Profit Balance"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<DollarSign size={21} />}
								color="success"
								stats={dashData.salesBalance ? Number(dashData?.salesBalance).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) : <Spinner className="mr-25" size="sm" />}
								statTitle="Sales Balance"
							/>
						</Col>
					</Row> */}
					{/* <Row className="match-height">
						<Col xl="4" md="6" sm="12">
							<StatsVertical icon={<TrendingUp size={21} />} color="primary" stats={dashData.stock ? Number(dashData?.stock.stockVolume).toLocaleString() : <Spinner className="mr-25" size="s" />} statTitle="Total Stocks Available" />
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.stock.stockValue)}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Available Stocks"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.stock.stockProfit)}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Available Stocks Profits"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.profitToday)}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Profit Today"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.totalProfit.toFixed(0))}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Profit So Far"
							/>
						</Col>
					</Row> */}
					<Row className="match-height">
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesToday) || 0}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Today"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesYesterday) || 0}` : <Spinner className="mr-25" size="sm" />}
								statTitle="Yesterday"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesThisWeek) || 0}` : <Spinner className="mr-25" size="sm" />}
								statTitle="This Week"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesThisMonth) || 0}` : <Spinner className="mr-25" size="sm" />}
								statTitle="This Month"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesThisYear) || 0}` : <Spinner className="mr-25" size="sm" />}
								statTitle="This Year"
							/>
						</Col>
						<Col xl="4" md="6" sm="12">
							<StatsVertical
								icon={<TrendingUp size={21} />}
								color="primary"
								stats={dashData.sales ? `R${numFormatter(dashData.sales?.salesSoFar.toFixed(0))}` : <Spinner className="mr-25" size="sm" />}
								statTitle="So Far"
							/>
						</Col>
					</Row>
				</>
			)}
		</div>
	)
}

export default AnalyticsDashboard
