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
import ContactInfoCard from './ContactInfoCard'
// import InvoiceList from '../../invoice/list'

// ** Styles
import '@styles/react/apps/app-users.scss'

const ContactsView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaContacts),
    { id } = useParams()

  return store.selectedContact !== null && store.selectedContact !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='8' md='7'>
          <ContactInfoCard selectedContact={store.selectedContact} />
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
export default ContactsView
