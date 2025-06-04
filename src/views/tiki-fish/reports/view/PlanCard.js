import { useState } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { activateUser, deactivateUser } from '../store/action'
import { store } from '@store/storeConfig/store'
import { EditRole } from './EditRole'

const PlanCard = ({ selectedUser }) => {
	// state
	const [toggleButton, setToggleButton] = useState(false)

	// ** Function to toggle sidebar
	const openButton = () => setToggleButton(!toggleButton)

	return (
		<Card className="plan-card border-primary">
			<CardHeader className="d-flex justify-content-between align-items-center pt-75 pb-1">
				<h5 className="mb-0">Actions</h5>
			</CardHeader>
			<CardBody>
				{selectedUser.status === 'ACTIVE' ? (
					<Button.Ripple
						className="text-center mb-1"
						color="danger"
						block
						onClick={() => {
							store.dispatch(deactivateUser(selectedUser.id))
						}}
					>
						{' '}
						Deactivate User
					</Button.Ripple>
				) : (
					<Button.Ripple
						className="text-center mb-1"
						color="success"
						block
						onClick={() => {
							store.dispatch(activateUser(selectedUser.id))
						}}
					>
						Activate User
					</Button.Ripple>
				)}
				<EditRole selectedUser={selectedUser} />
			</CardBody>
		</Card>
	)
}

export default PlanCard
