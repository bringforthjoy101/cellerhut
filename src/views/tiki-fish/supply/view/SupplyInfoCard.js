// ** React Imports
import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'

// ** Reactstrap Imports
import { Row, Col, Card, CardBody, Button, Badge, Modal, Input, Label, ModalBody, ModalHeader, Form, FormGroup } from 'reactstrap'

// ** Third Party Components
import Swal from 'sweetalert2'
import { Check, Briefcase, X, User, Calendar, DollarSign, Edit, Trash2, Printer, FileText } from 'react-feather'
import withReactContent from 'sweetalert2-react-content'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { useDispatch } from 'react-redux'
import { approveSupply, rejectSupply, deleteSupply, paySupply, getAllData } from '../store/action'

// ** Supply Modal
import SupplyModal from '../list/SupplyModal'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'

const MySwal = withReactContent(Swal)

const SupplyInfoCard = ({ selectedSupply }) => {
	// ** Store Vars
	const dispatch = useDispatch()

	// ** State
	const [show, setShow] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [paymentModalOpen, setPaymentModalOpen] = useState(false)
	const [paymentData, setPaymentData] = useState({
		amount: '',
		paymentMethod: 'cash',
	})

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
					height: '100%',
				}}
				style={{
					height: '110px',
					width: '110px',
				}}
			/>
		)
	}

	// ** Handle Approve Supply
	const handleApproveClick = () => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: 'This will approve the supply and update product quantities!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, Approve supply!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ml-1',
			},
			buttonsStyling: false,
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
				cancelButton: 'btn btn-outline-secondary ml-1',
			},
			buttonsStyling: false,
		}).then(function (result) {
			if (result.value) {
				dispatch(rejectSupply(selectedSupply.id))
			}
		})
	}

	// ** Handle Edit Click
	const handleEditClick = () => {
		setSidebarOpen(true)
	}

	// ** Toggle sidebar
	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen)
		dispatch(getAllData())
	}

	// ** Handle Delete Supply
	const handleDeleteClick = () => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ms-1',
			},
			buttonsStyling: false,
		}).then(async (result) => {
			if (result.value) {
				await dispatch(deleteSupply(selectedSupply.id))
				window.location.href = '/supplies/list'
			}
		})
	}

	// ** Handle Payment Submit
	const handlePaymentSubmit = async (e) => {
		e.preventDefault()
		if (paymentData.amount && paymentData.amount > 0) {
			await dispatch(paySupply(selectedSupply.id, paymentData))
			setPaymentModalOpen(false)
			setPaymentData({ amount: '', paymentMethod: 'cash' })
			dispatch(getAllData())
		}
	}

	// ** Handle Print
	const handlePrint = () => {
		window.print()
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
										<Badge
											color={
												selectedSupply.status === 'approved'
													? 'light-success'
													: selectedSupply.status === 'rejected'
													? 'light-danger'
													: 'light-warning'
											}
											className="text-capitalize"
										>
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
									<Badge
										className="text-capitalize"
										color={
											selectedSupply.status === 'approved' ? 'light-success' : selectedSupply.status === 'rejected' ? 'light-danger' : 'light-warning'
										}
									>
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
									<span>{selectedSupply.CreatedBy ? `${selectedSupply.CreatedBy.firstName} ${selectedSupply.CreatedBy.lastName}` : 'Unknown'}</span>
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
										<span>{`${selectedSupply.ApprovedBy.firstName} ${selectedSupply.ApprovedBy.lastName}`}</span>
									</li>
								)}
							</ul>
						) : null}
					</div>
					<h4 className="fw-bolder border-bottom pb-50 mb-1">Actions</h4>
					<div className="d-flex flex-wrap justify-content-center pt-2">
						{selectedSupply?.status === 'pending' && (
							<>
								<Button color="primary" className="me-1 mb-1" onClick={handleEditClick}>
									<Edit size={14} className="me-50" />
									Edit
								</Button>
								<Button color="success" className="me-1 mb-1" onClick={handleApproveClick}>
									<Check size={14} className="me-50" />
									Approve
								</Button>
								<Button color="danger" className="me-1 mb-1" onClick={handleRejectClick}>
									<X size={14} className="me-50" />
									Reject
								</Button>
							</>
						)}
						{selectedSupply?.status === 'approved' && selectedSupply?.paymentStatus !== 'paid' && (
							<Button color="warning" className="me-1 mb-1" onClick={() => setPaymentModalOpen(true)}>
								<DollarSign size={14} className="me-50" />
								Record Payment
							</Button>
						)}
						{selectedSupply?.status !== 'approved' && (
							<Button color="danger" className="me-1 mb-1" outline onClick={handleDeleteClick}>
								<Trash2 size={14} className="me-50" />
								Delete
							</Button>
						)}
						<Button color="secondary" className="mb-1" outline onClick={handlePrint}>
							<Printer size={14} className="me-50" />
							Print
						</Button>
					</div>
				</CardBody>
			</Card>

			{/* Supply Modal */}
			<SupplyModal open={sidebarOpen} toggleSidebar={toggleSidebar} selectedSupply={selectedSupply} />

			{/* Payment Modal */}
			<Modal isOpen={paymentModalOpen} toggle={() => setPaymentModalOpen(false)}>
				<ModalHeader toggle={() => setPaymentModalOpen(false)}>Record Payment for {selectedSupply?.supplyNumber}</ModalHeader>
				<Form onSubmit={handlePaymentSubmit}>
					<ModalBody>
						<FormGroup>
							<Label for="amount">Amount</Label>
							<Input
								type="number"
								id="amount"
								value={paymentData.amount}
								onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
								placeholder="Enter payment amount"
								step="0.01"
								min="0"
								max={(selectedSupply?.totalAmount || 0) - (selectedSupply?.amountPaid || 0)}
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label for="paymentMethod">Payment Method</Label>
							<Input
								type="select"
								id="paymentMethod"
								value={paymentData.paymentMethod}
								onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
							>
								<option value="cash">Cash</option>
								<option value="bank-transfer">Bank Transfer</option>
							</Input>
						</FormGroup>
						<div className="text-muted">
							<small>Total Amount: R{selectedSupply?.totalAmount || 0}</small>
							<br />
							<small>Amount Paid: R{selectedSupply?.amountPaid || 0}</small>
							<br />
							<small>Amount Due: R{(selectedSupply?.totalAmount || 0) - (selectedSupply?.amountPaid || 0)}</small>
						</div>
					</ModalBody>
					<div className="modal-footer">
						<Button color="secondary" onClick={() => setPaymentModalOpen(false)}>
							Cancel
						</Button>
						<Button color="primary" type="submit">
							Record Payment
						</Button>
					</div>
				</Form>
			</Modal>
		</Fragment>
	)
}

export default SupplyInfoCard
