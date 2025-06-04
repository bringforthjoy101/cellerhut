// ** React Imports
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import FeedbackInfoCard from './FeedbackInfoCard'
// import InvoiceList from '../../invoice/list'

// ** Styles
import '@styles/react/apps/app-users.scss'

const FeedbackView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaFeedbacks),
    { id } = useParams()

  return store.selectedFeedback !== null && store.selectedFeedback !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='8' md='7'>
          <FeedbackInfoCard selectedFeedback={store.selectedFeedback} />
        </Col>
        <Col xl='3' lg='4' md='5'>
          <PlanCard selectedFeedback={store.selectedFeedback} />
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
export default FeedbackView
