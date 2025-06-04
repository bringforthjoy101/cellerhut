// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { getUser, getUserActivity } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'
import { isUserLoggedIn } from '@utils'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import UserInfoCard from './UserInfoCard'
import UserTimeline from './UserTimeline'

// ** Styles
import '@styles/react/apps/app-users.scss'

const UserView = (props) => {
	// ** Vars
	const store = useSelector((state) => state.users),
		dispatch = useDispatch(),
		{ id } = useParams()

	const [userData, setUserData] = useState(null)

	useEffect(() => {
		if (isUserLoggedIn() !== null) {
			setUserData(JSON.parse(localStorage.getItem('userData')))
		}
	}, [])

	// ** Get User on mount
	useEffect(() => {
		dispatch(getUser(id))
		dispatch(getUserActivity(id))
	}, [dispatch])

	return store.selectedUser !== null && store.selectedUser !== undefined ? (
		<div className="app-user-view">
			<Row>
				<Col xl="9" lg="8" md="7">
					<UserInfoCard selectedUser={store.selectedUser} />
				</Col>
				{userData?.role === 'ADMIN' ? (
					<Col xl="3" lg="4" md="5">
						<PlanCard selectedUser={store.selectedUser} />
					</Col>
				) : (
					''
				)}
			</Row>
			{userData?.role === 'ADMIN' ? (
				<Row>
					<Col md="12">
						<UserTimeline
							selectedUser={store.selectedUser}
							data={store.userActivities.sort((a, b) => moment(b.date).format('YYYYMMDD') - moment(a.date).format('YYYYMMDD'))}
						/>
					</Col>
				</Row>
			) : (
				''
			)}
		</div>
	) : (
		''
	)
}
export default UserView
