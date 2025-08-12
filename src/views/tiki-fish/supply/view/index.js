// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ** Store & Actions
import { getSupply } from '../store/action'
import { useSelector, useDispatch } from 'react-redux'

// ** Reactstrap Imports
import { Row, Col, Alert } from 'reactstrap'

// ** Supply View Components
import SupplyInfoCard from './SupplyInfoCard'
import SupplyItems from './SupplyItems'

// ** Styles
import '@styles/react/apps/app-users.scss'

const SupplyView = () => {
	// ** Store Vars
	const store = useSelector((state) => state.supplies)
	const dispatch = useDispatch()

	// ** Hooks
	const { id } = useParams()

	// ** Get supply on mount
	useEffect(() => {
		dispatch(getSupply(parseInt(id)))
	}, [dispatch, id])

	return store.selectedSupply !== null && store.selectedSupply !== undefined ? (
		<div className="app-user-view">
			<Row>
				<Col xl="4" lg="5" xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
					<SupplyInfoCard selectedSupply={store.selectedSupply} />
				</Col>
				<Col xl="8" lg="7" xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
					<SupplyItems selectedSupply={store.selectedSupply} />
				</Col>
			</Row>
		</div>
	) : (
		<Alert color="danger">
			<h4 className="alert-heading">Supply not found</h4>
			<div className="alert-body">
				Supply with id: {id} doesn't exist. Check list of all Supplies:{' '}
				<Link to="/supplies/list">Supplies List</Link>
			</div>
		</Alert>
	)
}

export default SupplyView