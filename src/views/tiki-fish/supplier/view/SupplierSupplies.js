// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Nav, NavItem, NavLink, TabContent, TabPane, Card, CardBody } from 'reactstrap'

// ** Icons Imports
import { User, Lock, Bookmark, Bell, Link } from 'react-feather'

const SupplierSupplies = ({ active, toggleTab }) => {
	return (
		<Fragment>
			<Nav pills className="mb-2">
				<NavItem>
					<NavLink active={active === '1'} onClick={() => toggleTab('1')}>
						<User className="font-medium-3 me-50" />
						<span className="fw-bold">Supplies</span>
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink active={active === '2'} onClick={() => toggleTab('2')}>
						<Lock className="font-medium-3 me-50" />
						<span className="fw-bold">Payments</span>
					</NavLink>
				</NavItem>
			</Nav>
			<TabContent activeTab={active}>
				<TabPane tabId="1">
					<Card>
						<CardBody>
							<h5>Supplier Supplies</h5>
							<p>List of all supplies from this supplier will be displayed here.</p>
							<p className="text-muted">This feature will be implemented in the supplies module.</p>
						</CardBody>
					</Card>
				</TabPane>
				<TabPane tabId="2">
					<Card>
						<CardBody>
							<h5>Payment History</h5>
							<p>Payment history for this supplier will be displayed here.</p>
							<p className="text-muted">This feature will be implemented in the supplies module.</p>
						</CardBody>
					</Card>
				</TabPane>
			</TabContent>
		</Fragment>
	)
}
export default SupplierSupplies