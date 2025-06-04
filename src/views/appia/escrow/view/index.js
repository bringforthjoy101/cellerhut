// ** React Imports
import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getEscrow } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import EscrowInfoCard from './EscrowInfoCard'
import TransactionList from './Transactions'
import PlanCard from './PlanCard'

// ** Styles
import '@styles/react/apps/app-users.scss'

const EscrowView = props => {
  // ** Vars
  const store = useSelector(state => state.appiaEscrow),
    dispatch = useDispatch(),
    { id } = useParams()

  // ** Get Escrow on mount
  useEffect(() => {
    dispatch(getEscrow(store.allData, id))
  }, [dispatch])


  return store.selectedEscrow !== null && store.selectedEscrow !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='8' md='7'>
          <EscrowInfoCard selectedEscrow={store.selectedEscrow} />
        </Col>
        {store.selectedEscrow.status === "contested" ? <Col xl='3' le='4' md='7'>
          <PlanCard selectedEscrow={store.selectedEscrow} />
        </Col> : "" }
      </Row>
      <Row>
        <Col sm='12'>
          <TransactionList selectedEscrow={store.selectedEscrow} />
        </Col>
      </Row>
    </div>
  ) : (
    <Alert color='danger'>
      <h4 className='alert-heading'>Users not found</h4>
      <div className='alert-body'>
        Users with id: {id} doesn't exist. Check list of all Users: <Link to='/appia/user/list'>Users List</Link>
      </div>
    </Alert>
  )
}
export default EscrowView
