// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { getAdmin, getAdminActivity } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'
import { isUserLoggedIn } from '@utils'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import PlanCard from './PlanCard'
import AdminInfoCard from './AdminInfoCard'
import AdminTimeline from './AdminTimeline'

// ** Styles
import '@styles/react/apps/app-users.scss'

const AdminView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaAdmins),
    dispatch = useDispatch(),
    { id } = useParams()

  const [userData, setUserData] = useState(null)

  useEffect(() => {
     if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])
 
  // ** Get Admin on mount
  useEffect(() => {
    dispatch(getAdmin(id))
    dispatch(getAdminActivity(id))
  }, [dispatch])

  return store.selectedAdmin !== null && store.selectedAdmin !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='8' md='7'>
          <AdminInfoCard selectedAdmin={store.selectedAdmin} />
        </Col>
        {userData?.role_name === "Super Admin" ? <Col xl='3' lg='4' md='5'>
          <PlanCard selectedAdmin={store.selectedAdmin} />
        </Col> : ""}
      </Row>
      {userData?.role_name === "Super Admin" ? <Row>
        <Col md='12'>
          <AdminTimeline selectedAdmin={store.selectedAdmin} data={store.adminActivities.sort((a, b) => moment(b.date).format('YYYYMMDD') - moment(a.date).format('YYYYMMDD'))} />
        </Col>
      </Row> : ""}
    </div>
  ) : ""
}
export default AdminView
