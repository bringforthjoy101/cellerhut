// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getInvestmentPackageDetails } from '../store/action'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap
import { Row, Col, Alert, Card, Nav, NavItem, NavLink, Spinner } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import UserInfoCard from './UserInfoCard'
import AllSubscriptions from './AllSubscriptions'
import { isUserLoggedIn } from '@utils'

// ** Styles
import '@styles/react/apps/app-users.scss'

const UserView = (props) => {
	// ** Vars
	const store = useSelector((state) => state.investments),
		dispatch = useDispatch(),
		{ id } = useParams()

	const [userData, setUserData] = useState(null)

	const [activeTransaction, setActiveTransaction] = useState('subscriptions')

	// ** Get user on mount
	useEffect(() => {
		dispatch({
			type: 'GET_INVESTMENT_PACKAGE_DETAILS',
			investmentPackageDetails: null,
		})
		dispatch(getInvestmentPackageDetails(id))
		// dispatch(getUserAllTransactions(id))
	}, [dispatch, id])

	useEffect(() => {
		if (isUserLoggedIn() !== null) {
			setUserData(JSON.parse(localStorage.getItem('userData')))
		}
	}, [])

	return store.investmentPackageDetails !== null && store.investmentPackageDetails !== undefined ? (
		<div className="app-user-view">
			<Row>
				<Col xl="9" lg="8" md="7">
					<UserInfoCard investmentPackageDetails={store.investmentPackageDetails} userRole={userData?.role} />
				</Col>
					<Col xl="3" lg="4" md="5">
						<PlanCard investmentPackageDetails={store.investmentPackageDetails} />
					</Col>
			</Row>
				<div>
					<Card className="mb-3 d-flex justify-content-around">
						<Row className="d-sm-block d-lg-flex justify-content-center">
							<Nav pills className="nav-pill-primary my-2">
								<NavItem>
									<NavLink active="subscriptions">
										Subscriptions
									</NavLink>
								</NavItem>
								{/* <NavItem>
									<NavLink onClick={() => setActiveTransaction('books')} active={activeTransaction === 'books'}>
										Books
									</NavLink>
								</NavItem> */}
							</Nav>
						</Row>
					</Card>
					<Row>
						<Col sm="12">
							<AllSubscriptions />
						</Col>
					</Row>
				</div>
		</div>
	) : (
		<SpinnerComponent />
	)
}
export default UserView
