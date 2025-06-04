// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getUser, getUserAllTransactions, getWalletDetails, trackUser } from '../store/action'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap
import { Row, Col, Alert, Card, Nav, NavItem, NavLink, Spinner } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import UserInfoCard from './UserInfoCard'
import AllOrders from './AllOrders'
import { isUserLoggedIn } from '@utils'

// ** Styles
import '@styles/react/apps/app-users.scss'

const WalletView = (props) => {
	// ** Vars
	const store = useSelector((state) => state.wallets),
		dispatch = useDispatch(),
		{ id } = useParams()

	const [userData, setUserData] = useState(null)

	const [activeTransaction, setActiveTransaction] = useState('orders')

	// ** Get user on mount
	useEffect(() => {
		dispatch({
			type: 'GET_WALLET_DETAILS',
			walletDetails: null,
		})
		dispatch(getWalletDetails(id))
		// dispatch(getUserAllTransactions(id))
	}, [dispatch, id])

	useEffect(() => {
		if (isUserLoggedIn() !== null) {
			setUserData(JSON.parse(localStorage.getItem('userData')))
		}
	}, [])

	return store.walletDetails !== null && store.walletDetails !== undefined ? (
		<div className="app-user-view">
			<Row>
				<Col xl="9" lg="8" md="7">
					<UserInfoCard walletDetails={store.walletDetails} userRole={userData?.role} />
				</Col>
					<Col xl="3" lg="4" md="5">
						<PlanCard walletDetails={store.walletDetails} />
					</Col>
			</Row>
				<div>
					{/* <Card className="mb-3 d-flex justify-content-around">
						<Row className="d-sm-block d-lg-flex justify-content-center">
							<Nav pills className="nav-pill-primary my-2">
								<NavItem>
									<NavLink active="orders">
										Orders
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink onClick={() => setActiveTransaction('books')} active={activeTransaction === 'books'}>
										Books
									</NavLink>
								</NavItem>
							</Nav>
						</Row>
					</Card> */}
					{/* <Row>
						<Col sm="12">
							<AllOrders />
						</Col>
					</Row> */}
				</div>
		</div>
	) : (
		<SpinnerComponent />
	)
}
export default WalletView
