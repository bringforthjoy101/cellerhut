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
import DataPlanInfo from './DataPlanInfo'

// ** Styles
import '@styles/react/apps/app-users.scss'

const DataPlanView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaDataPlans),
    dispatch = useDispatch(),
    { id } = useParams()

  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])
  // ** Get suer on mount
  useEffect(() => {
    // dispatch(getPlan(store.allData, id))
  }, [dispatch])


  return store.selectedPlan !== null && store.selectedPlan !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='8' md='7'>
          <DataPlanInfo selectedPlan={store.selectedPlan} />
        </Col>
        {/* {userData?.role_name === "Super Admin" ?  */}
        <Col xl='3' lg='4' md='5'>
          <PlanCard selectedPlan={store.selectedPlan} />
        </Col> 
        {/* // : ""} */}
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
export default DataPlanView
