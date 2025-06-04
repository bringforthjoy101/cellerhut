// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { useSelector, useDispatch } from 'react-redux'
import { isUserLoggedIn } from '@utils'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import AllRewardInfo from './AllRewardInfo'
import HistoryList from './HistoryList'

// ** Styles
import '@styles/react/apps/app-users.scss'

const RewardView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaAllRewards),
    dispatch = useDispatch(),
    { id } = useParams()

  const [userData, setUserData] = useState(null)
  const [plan, setPlan] = useState(null)

  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])

  return store.selectedReward !== null && store.selectedReward !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='9' md='10'>
          <AllRewardInfo selectedReward={store.selectedReward} />
        </Col>
        <Col xl='3' lg='3' md='2'>
          <PlanCard selectedReward={store.selectedReward} />
        </Col> 
      </Row>
        <HistoryList selectedReward={store.selectedReward} />
    </div>
  ) : (
    <Alert color='danger'>
      <h4 className='alert-heading'>Users not found</h4>
      <div className='alert-body'>
        Users with id: {id} doesn't exist. Check list of all Users: <Link to='/app/user/list'>Users List</Link>
      </div>
    </Alert>
  )
}
export default RewardView
