// ** React Imports
import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Row, Col, Card, Form, CardBody, Button, Badge, Modal, Input, Label, ModalBody, ModalHeader } from 'reactstrap'

// ** Third Party Components
import Swal from 'sweetalert2'
import { Check, Briefcase, X } from 'react-feather'
import withReactContent from 'sweetalert2-react-content'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { deleteSupplier } from '../store/action'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'

const MySwal = withReactContent(Swal)

const SupplierInfoCard = ({ selectedSupplier }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [show, setShow] = useState(false)

	// ** render supplier img
	const renderSupplierImg = () => {
		const stateNum = Math.floor(Math.random() * 6),
			states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
			color = states[stateNum]
		return (
			<Avatar
				initials
				color={color || 'light-primary'}
				className="rounded mt-3 mb-2"
				content={selectedSupplier.name}
				contentStyles={{
					borderRadius: 0,
					fontSize: 'calc(48px)',
					width: '100%',
					height: '100%'
				}}
				style={{
					height: '110px',
					width: '110px'
				}}
			/>
		)
	}

	// ** Handle Delete supplier
	const handleSuspendedClick = () => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert supplier!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, Delete supplier!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ml-1'
			},
			buttonsStyling: false
		}).then(function (result) {
			if (result.value) {
				dispatch(deleteSupplier(selectedSupplier.id))
			}
		})
	}

	return (
		<Fragment>
			<Card>
				<CardBody>
					<div className="user-avatar-section">
						<div className="d-flex align-items-center flex-column">
							{renderSupplierImg()}
							<div className="d-flex flex-column align-items-center text-center">
								<div className="user-info">
									<h4>{selectedSupplier !== null ? selectedSupplier.name : 'Unknown Supplier'}</h4>
									{selectedSupplier !== null ? (
										<Badge color={selectedSupplier.status === 'active' ? 'light-success' : 'light-secondary'} className="text-capitalize">
											{selectedSupplier.status}
										</Badge>
									) : null}
								</div>
							</div>
						</div>
					</div>
					<div className="d-flex justify-content-around my-2 pt-75">
						<div className="d-flex align-items-start me-2">
							<Badge color="light-primary" className="rounded p-75">
								<Check className="font-medium-2" />
							</Badge>
							<div className="ms-75">
								<h4 className="mb-0">{selectedSupplier.statistics?.approvedSupplies || 0}</h4>
								<small>Approved Supplies</small>
							</div>
						</div>
						<div className="d-flex align-items-start">
							<Badge color="light-primary" className="rounded p-75">
								<Briefcase className="font-medium-2" />
							</Badge>
							<div className="ms-75">
								<h4 className="mb-0">{selectedSupplier.statistics?.totalSupplies || 0}</h4>
								<small>Total Supplies</small>
							</div>
						</div>
					</div>
					<h4 className="fw-bolder border-bottom pb-50 mb-1">Details</h4>
					<div className="info-container">
						{selectedSupplier !== null ? (
							<ul className="list-unstyled">
								<li className="mb-75">
									<span className="fw-bolder me-25">Email:</span>
									<span>{selectedSupplier.email}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Phone:</span>
									<span className="text-capitalize">{selectedSupplier.phone}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Status:</span>
									<Badge className="text-capitalize" color={selectedSupplier.status === 'active' ? 'light-success' : 'light-secondary'}>
										{selectedSupplier.status}
									</Badge>
								</li>
								{selectedSupplier.address && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Address:</span>
										<span>{selectedSupplier.address}</span>
									</li>
								)}
								{selectedSupplier.bankName && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Bank:</span>
										<span>{selectedSupplier.bankName}</span>
									</li>
								)}
								{selectedSupplier.accountNumber && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Account:</span>
										<span>{selectedSupplier.accountNumber}</span>
									</li>
								)}
								{selectedSupplier.accountName && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Account Name:</span>
										<span>{selectedSupplier.accountName}</span>
									</li>
								)}
							</ul>
						) : null}
					</div>
					<div className="d-flex justify-content-center pt-2">
						<Button color="primary" tag={Link} to={`/supplier/edit/${selectedSupplier.id}`}>
							Edit
						</Button>
						<Button className="ms-1" color="danger" outline onClick={handleSuspendedClick}>
							Delete
						</Button>
					</div>
				</CardBody>
			</Card>
		</Fragment>
	)
}

export default SupplierInfoCard