// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import moment from 'moment'

// ** Store & Actions
import { useSelector, useDispatch } from 'react-redux'
import { isUserLoggedIn } from '@utils'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

import PlanCard from './PlanCard'
import TransferInfo from './TransferInfoCard'

// ** Styles
import '@styles/react/apps/app-users.scss'

const TransferView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaTransfers),
    { id } = useParams()


  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])


  return store.selectedTransfer !== null && store.selectedTransfer !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='12' lg='12' md='12'>
          <TransferInfo selectedTransfer={store.selectedTransfer} />
        </Col>
      </Row>
      {userData?.role_name === 'Financial Admin' || userData?.role_name === 'Super Admin' ? <Row>
         <Col xl='3' lg='4' md='5'> 
        {store.selectedTransfer.status === 'pending' ? <PlanCard selectedTransfer={store.selectedTransfer} /> : ""}
          </Col> 
        </Row>  : ""}
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
export default TransferView
