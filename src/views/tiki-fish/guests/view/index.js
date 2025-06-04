import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { getGuestDetails } from '../store/action'
import GuestInfoCard from './GuestInfoCard'
import SubscriptionsTable from './SubscriptionsTable'
import TransactionsTable from './TransactionsTable'
import classnames from 'classnames'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'

const GuestView = () => {
  const dispatch = useDispatch()
  const store = useSelector(state => state.guests)
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  useEffect(() => {
    const fetchGuestDetails = async () => {
      setLoading(true)
      await dispatch(getGuestDetails(id))
      setLoading(false)
    }
    fetchGuestDetails()
  }, [dispatch, id])

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '70vh' }}>
        <SpinnerComponent />
      </div>
    )
  }

  return store.selectedGuest !== null ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='12' lg='12' md='12'>
          <GuestInfoCard selectedGuest={store.selectedGuest} />
        </Col>
      </Row>
      <Row>
        <Col sm='12'>
          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: active === '1' })}
                    onClick={() => toggle('1')}
                  >
                    <span className='align-middle'>Transactions</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: active === '2' })}
                    onClick={() => toggle('2')}
                  >
                    <span className='align-middle'>Subscriptions</span>
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent className='py-50' activeTab={active}>
                <TabPane tabId='1'>
                  <TransactionsTable guestData={store.selectedGuest} />
                </TabPane>
                <TabPane tabId='2'>
                  <SubscriptionsTable guestData={store.selectedGuest} />
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  ) : null
}

export default GuestView 