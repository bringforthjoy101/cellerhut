// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getProduct } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap
import { Row, Col, Alert, Button } from 'reactstrap'

// ** User View Components
import UserInfoCard from './UserInfoCard'
import PlanCard from './PlanCard'
import { isUserLoggedIn, apiRequest, swal } from '@utils'
import InventoryHistories from './InventoryHistories'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'

// ** Styles
import '@styles/react/apps/app-users.scss'

const ProductView = props => {
  // ** Vars
  const store = useSelector(state => state.products),
    dispatch = useDispatch(),
    { id } = useParams()

  const [userData, setUserData] = useState(null)
  const [detail, setDetail] = useState(null)

  // ** Get user on mount
  useEffect(() => {
    dispatch(getProduct(id))
  }, [dispatch])


  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])


  return store.selectedProduct !== null && store.selectedProduct !== undefined ? (
    <div className='app-user-view'>
      <Row>
        <Col xl='9' lg='9' md='12'>
          <UserInfoCard selectedProduct={store.selectedProduct} detail={detail} />
        </Col>
        <Col xl="3" lg="3" md="12">
					<PlanCard selectedInventory={store.selectedProduct} detail={detail} />
				</Col>
      </Row>
      <Row>
				<Col sm="12">
					<InventoryHistories inventoryHistories={store.selectedProduct.productStockHistories.sort((a, b) => b.id - a.id)} product={store.selectedProduct} />
				</Col>
			</Row>
    </div>
  ) : <SpinnerComponent />
}
export default ProductView
