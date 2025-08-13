// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'

// ** Icons Imports
import { Package, DollarSign } from 'react-feather'

// ** Custom Components
import SupplierSuppliesTable from './SupplierSuppliesTable'
import SupplierPaymentHistoryTable from './SupplierPaymentHistoryTable'

// ** Store
import { useSelector } from 'react-redux'

const SupplierSupplies = ({ active, toggleTab }) => {
	// ** Store
	const store = useSelector((state) => state.suppliers)
	const supplierId = store.selectedSupplier?.id

	return (
		<Fragment>
			<Nav pills className="mb-2">
				<NavItem>
					<NavLink active={active === '1'} onClick={() => toggleTab('1')}>
						<Package className="font-medium-3 me-50" />
						<span className="fw-bold">Supplies</span>
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink active={active === '2'} onClick={() => toggleTab('2')}>
						<DollarSign className="font-medium-3 me-50" />
						<span className="fw-bold">Payment History</span>
					</NavLink>
				</NavItem>
			</Nav>
			<TabContent activeTab={active}>
				<TabPane tabId="1">
					{supplierId && <SupplierSuppliesTable supplierId={supplierId} />}
				</TabPane>
				<TabPane tabId="2">
					{supplierId && <SupplierPaymentHistoryTable supplierId={supplierId} />}
				</TabPane>
			</TabContent>
		</Fragment>
	)
}
export default SupplierSupplies