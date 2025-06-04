// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserClaimHistory} from '../store/action'
import moment from 'moment'

// ** Store & Actions
import { useSelector, useDispatch } from 'react-redux'
import { isUserLoggedIn } from '@utils'


// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import ClaimedHistory from './Claimed'
import UserClaimedHistory from './UserClaimHistory/index'

// ** Styles
import '@styles/react/apps/app-users.scss'

const ClaimedView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaClaimedRewards),
    dispatch = useDispatch(),
    { id } = useParams()

  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])

  const reward_id = store.selectedClaim.reward_id


  useEffect(() => {
    dispatch(getUserClaimHistory(reward_id))
  }, [dispatch])


  return store.selectedClaim !== null && store.selectedClaim !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='12' lg='12' md='12'>
          <ClaimedHistory selectedClaim={store.selectedClaim} />
        </Col>
      </Row>
      <Row>
        <Col sm='12'>
        <UserClaimedHistory reward_id={reward_id} />
        </Col>
      </Row>
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
export default ClaimedView
