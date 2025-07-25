// ** React Imports
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** User Edit Components
import SocialTab from './Social'
import AccountTab from './Account'
import InfoTab from './Information'

// ** Store & Actions
import { getProduct } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'

// ** Third Party Components
import { User, Info, Share2 } from 'react-feather'
import { Card, CardBody, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Alert, Spinner } from 'reactstrap'

// ** Styles
import '@styles/react/apps/app-users.scss'

const UserEdit = () => {
	// ** States & Vars
	const [activeTab, setActiveTab] = useState('1'),
		[isLoading, setIsLoading] = useState(true),
		store = useSelector((state) => state.products),
		dispatch = useDispatch(),
		{ id } = useParams()

	// ** Function to toggle tabs
	const toggle = (tab) => setActiveTab(tab)

	// ** Function to get user on mount
	useEffect(() => {
		setIsLoading(true)
		dispatch(getProduct(parseInt(id)))
	}, [dispatch, id])

	// ** Set loading to false when product is loaded
	useEffect(() => {
		if (store.selectedProduct !== null && store.selectedProduct !== undefined) {
			setIsLoading(false)
		}
	}, [store.selectedProduct])

	// Show loading spinner while data is being fetched
	if (isLoading) {
		return (
			<Row className="app-user-edit">
				<Col sm="12">
					<Card>
						<CardBody className="text-center py-5">
							<Spinner color="primary" />
							<div className="mt-2">Loading product details...</div>
						</CardBody>
					</Card>
				</Col>
			</Row>
		)
	}

	// Show product edit form when data is loaded
	return store.selectedProduct !== null && store.selectedProduct !== undefined ? (
		<Row className="app-user-edit">
			<Col sm="12">
				<Card>
					<CardBody className="pt-2">
						<Nav pills>
							<NavItem>
								<NavLink active={activeTab === '1'} onClick={() => toggle('1')}>
									<User size={14} />
									<span className="align-middle d-none d-sm-block">Product</span>
								</NavLink>
							</NavItem>
							{/* <NavItem>
                <NavLink active={activeTab === '2'} onClick={() => toggle('2')}>
                  <Info size={14} />
                  <span className='align-middle d-none d-sm-block'>Information</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink active={activeTab === '3'} onClick={() => toggle('3')}>
                  <Share2 size={14} />
                  <span className='align-middle d-none d-sm-block'>Social</span>
                </NavLink>
              </NavItem> */}
						</Nav>
						<TabContent activeTab={activeTab}>
							<TabPane tabId="1">
								<AccountTab selectedProduct={store.selectedProduct} />
							</TabPane>
							{/* <TabPane tabId='2'>
                <InfoTab />
              </TabPane>
              <TabPane tabId='3'>
                <SocialTab />
              </TabPane> */}
						</TabContent>
					</CardBody>
				</Card>
			</Col>
		</Row>
	) : (
		<Alert color="danger">
			<h4 className="alert-heading">Product not found</h4>
			<div className="alert-body">
				Product with id: {id} doesn't exist. Check list of all Products: <Link to="/app/product/list">Products List</Link>
			</div>
		</Alert>
	)
}
export default UserEdit
