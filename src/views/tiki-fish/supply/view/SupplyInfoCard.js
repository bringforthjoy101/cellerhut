// ** React Imports
import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Row, Col, Card, CardBody, Button, Badge, Modal, Input, Label, ModalBody, ModalHeader } from 'reactstrap'

// ** Third Party Components
import Swal from 'sweetalert2'
import { Check, Briefcase, X, User, Calendar, DollarSign } from 'react-feather'
import withReactContent from 'sweetalert2-react-content'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { approveSupply, rejectSupply } from '../store/action'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'

const MySwal = withReactContent(Swal)

const SupplyInfoCard = ({ selectedSupply }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [show, setShow] = useState(false)

	// ** render supplier avatar
	const renderSupplierAvatar = () => {
		const stateNum = Math.floor(Math.random() * 6),
			states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
			color = states[stateNum]
		return (
			<Avatar
				initials
				color={color || 'light-primary'}
				className="rounded mt-3 mb-2"
				content={selectedSupply.supplier?.name || 'Unknown'}
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

	// ** Handle Approve Supply
	const handleApproveClick = () => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "This will approve the supply and update product quantities!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, Approve supply!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ml-1'
			},
			buttonsStyling: false
		}).then(function (result) {
			if (result.value) {
				dispatch(approveSupply(selectedSupply.id))
			}
		})
	}

	// ** Handle Reject Supply
	const handleRejectClick = () => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this action!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, Reject supply!',
			customClass: {
				confirmButton: 'btn btn-danger',
				cancelButton: 'btn btn-outline-secondary ml-1'
			},
			buttonsStyling: false
		}).then(function (result) {
			if (result.value) {
				dispatch(rejectSupply(selectedSupply.id))
			}
		})
	}

	return (
		<Fragment>
			<Card>
				<CardBody>
					<div className="user-avatar-section">
						<div className="d-flex align-items-center flex-column">
							{renderSupplierAvatar()}
							<div className="d-flex flex-column align-items-center text-center">
								<div className="user-info">
									<h4>{selectedSupply?.supplier?.name || 'Unknown Supplier'}</h4>
									{selectedSupply !== null ? (
										<Badge color={selectedSupply.status === 'approved' ? 'light-success' : selectedSupply.status === 'rejected' ? 'light-danger' : 'light-warning'} className="text-capitalize">
											{selectedSupply.status}
										</Badge>
									) : null}
								</div>
							</div>
						</div>
					</div>
					<div className="d-flex justify-content-around my-2 pt-75">
						<div className="d-flex align-items-start me-2">
							<Badge color="light-primary" className="rounded p-75">
								<Briefcase className="font-medium-2" />
							</Badge>
							<div className="ms-75">
								<h4 className="mb-0">{selectedSupply.supply_items?.length || 0}</h4>
								<small>Items</small>
							</div>
						</div>
						<div className="d-flex align-items-start">
							<Badge color="light-primary" className="rounded p-75">
								<DollarSign className="font-medium-2" />
							</Badge>
							<div className="ms-75">
								<h4 className="mb-0">R{parseFloat(selectedSupply.totalAmount || 0).toFixed(2)}</h4>
								<small>Total Amount</small>
							</div>
						</div>
					</div>
					<h4 className="fw-bolder border-bottom pb-50 mb-1">Details</h4>
					<div className="info-container">
						{selectedSupply !== null ? (
							<ul className="list-unstyled">
								<li className="mb-75">
									<span className="fw-bolder me-25">Supply Number:</span>
									<span className="text-capitalize">{selectedSupply.supplyNumber}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Supply Date:</span>
									<span>{new Date(selectedSupply.supplyDate).toLocaleDateString('en-ZA')}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Status:</span>
									<Badge className="text-capitalize" color={selectedSupply.status === 'approved' ? 'light-success' : selectedSupply.status === 'rejected' ? 'light-danger' : 'light-warning'}>
										{selectedSupply.status}
									</Badge>
								</li>
								<hr className="my-1" />
								<li className="mb-75">
									<span className="fw-bolder me-25">Supplier:</span>
									<Link to={`/supplier/view/${selectedSupply.supplier?.id}`} className="text-primary">
										{selectedSupply.supplier?.name || 'Unknown'}
									</Link>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Email:</span>
									<span>{selectedSupply.supplier?.email || '-'}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Phone:</span>
									<span>{selectedSupply.supplier?.phone || '-'}</span>
								</li>
								<li className="mb-75">
									<span className="fw-bolder me-25">Address:</span>
									<span className="text-wrap">{selectedSupply.supplier?.address || '-'}</span>
								</li>
								{selectedSupply.supplier?.bankName && (
									<>
										<hr className="my-1" />
										<li className="mb-75">
											<span className="fw-bolder me-25">Bank:</span>
											<span>{selectedSupply.supplier.bankName}</span>
										</li>
										<li className="mb-75">
											<span className="fw-bolder me-25">Account Name:</span>
											<span>{selectedSupply.supplier.accountName || '-'}</span>
										</li>
										<li className="mb-75">
											<span className="fw-bolder me-25">Account Number:</span>
											<span>{selectedSupply.supplier.accountNumber || '-'}</span>
										</li>
									</>
								)}
								<hr className="my-1" />
								<li className="mb-75">
									<span className="fw-bolder me-25">Created By:</span>
									<span>
										{selectedSupply.CreatedBy 
											? `${selectedSupply.CreatedBy.firstName} ${selectedSupply.CreatedBy.lastName}`
											: 'Unknown'}
									</span>
								</li>
								{selectedSupply.approvedAt && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Approved At:</span>
										<span>{new Date(selectedSupply.approvedAt).toLocaleString()}</span>
									</li>
								)}
								{selectedSupply.ApprovedBy && (
									<li className="mb-75">
										<span className="fw-bolder me-25">Approved By:</span>
										<span>
											{`${selectedSupply.ApprovedBy.firstName} ${selectedSupply.ApprovedBy.lastName}`}
										</span>
									</li>
								)}
							</ul>
						) : null}
					</div>
					{selectedSupply?.status === 'pending' && (
						<div className="d-flex justify-content-center pt-2">
							<Button color="success" onClick={handleApproveClick}>
								<Check size={14} className="me-50" />
								Approve
							</Button>
							<Button className="ms-1" color="danger" onClick={handleRejectClick}>
								<X size={14} className="me-50" />
								Reject
							</Button>
						</div>
					)}
					{selectedSupply?.status !== 'pending' && (
						<div className="d-flex justify-content-center pt-2">
							<Button color="primary" tag={Link} to={`/supply/edit/${selectedSupply.id}`}>
								Edit
							</Button>
						</div>
					)}
				</CardBody>
			</Card>
		</Fragment>
	)
}

export default SupplyInfoCard