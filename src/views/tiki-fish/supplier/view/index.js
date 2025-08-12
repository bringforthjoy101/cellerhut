// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getSupplier } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap Imports
import { Row, Col, Alert } from 'reactstrap'

// ** User View Components
import SupplierInfoCard from './SupplierInfoCard'
import SupplierSupplies from './SupplierSupplies'

// ** Styles
import '@styles/react/apps/app-users.scss'

const SupplierView = () => {
	// ** Store Vars
	const store = useSelector((state) => state.suppliers)
	const dispatch = useDispatch()

	// ** Hooks
	const { id } = useParams()

	// ** Get supplier on mount
	useEffect(() => {
		dispatch(getSupplier(parseInt(id)))
	}, [dispatch, id])

	const [active, setActive] = useState('1')

	const toggleTab = (tab) => {
		if (active !== tab) {
			setActive(tab)
		}
	}

	return store.selectedSupplier !== null && store.selectedSupplier !== undefined ? (
		<div className="app-user-view">
			<Row>
				<Col xl="4" lg="5" xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
					<SupplierInfoCard selectedSupplier={store.selectedSupplier} />
				</Col>
				<Col xl="8" lg="7" xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
					<SupplierSupplies active={active} toggleTab={toggleTab} />
				</Col>
			</Row>
		</div>
	) : (
		<Alert color="danger">
			<h4 className="alert-heading">Supplier not found</h4>
			<div className="alert-body">
				Supplier with id: {id} doesn't exist. Check list of all Suppliers:{' '}
				<Link to="/suppliers/list">Suppliers List</Link>
			</div>
		</Alert>
	)
}
export default SupplierView