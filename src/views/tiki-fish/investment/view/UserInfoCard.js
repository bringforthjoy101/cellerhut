// ** Custom Components
import { useState, useEffect } from 'react'
import Avatar from '@components/avatar'
import moment from 'moment'

import { useHistory, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { deleteInvestmentPackage, getAllData, editInvestmentPackage, getInvestmentPackageDetails } from '../store/action'

const MySwal = withReactContent(Swal)

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, CustomInput } from 'reactstrap'
import { Pocket, Award, Hexagon, UserPlus, Check, Star, Flag, Phone } from 'react-feather'
import CardTitle from 'reactstrap/lib/CardTitle'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const UserInfoCard = ({ investmentPackageDetails, userRole }) => {
	const renderCustomerImg = () => {
		if (investmentPackageDetails !== null && investmentPackageDetails.avatar) {
			return <img src={investmentPackageDetails.avatar} alt="user-avatar" className="img-fluid rounded" height="104" width="104" />
		} else {
			const stateNum = Math.floor(Math.random() * 6),
				states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
				color = states[stateNum]
			return (
				<Avatar
					initials
					color={color}
					className="rounded"
					content={`${investmentPackageDetails.name}`}
					contentStyles={{
						borderRadius: 0,
						fontSize: 'calc(36px)',
						width: '100%',
						height: '100%',
					}}
					style={{
						height: '90px',
						width: '90px',
					}}
				/>
			)
		}
	}

	const history = useHistory()
	const dispatch = useDispatch()

	// ** Handle Delete
	const handleDelete = async (id) => {
		return MySwal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			customClass: {
				confirmButton: 'btn btn-primary',
				cancelButton: 'btn btn-outline-danger ml-1',
			},
			buttonsStyling: false,
		}).then(async function (result) {
			if (result.value) {
				const deleted = await dispatch(deleteInvestmentPackage(id))
				if (deleted) {
					await dispatch(getAllData())
					MySwal.fire({
						icon: 'success',
						title: 'Deleted!',
						text: 'Customer has been deleted.',
						customClass: {
							confirmButton: 'btn btn-primary',
						},
					})
					history.push(`/customers/list`)
				}
			}
		})
	}

	const getTotalInvestedAmount = (investmentSubscriptions) => {
		const totalInvestedAmount = investmentSubscriptions.reduce(function (accumulator, item) {
			return accumulator + item.amount
		}, 0)
		return totalInvestedAmount
	}

	const [packageData, setPackageData] = useState({
		name: investmentPackageDetails.name,
		description: investmentPackageDetails.description,
		minimumAmount: investmentPackageDetails.minimumAmount,
		durationType: investmentPackageDetails.durationType,
		durationValue: investmentPackageDetails.durationValue,
		roi: investmentPackageDetails.roi,
	})
	const [formModal, setFormModal] = useState(false)

	const onSubmit = async (event, errors) => {
		event?.preventDefault()
		if (errors && !errors.length) {
			await dispatch(editInvestmentPackage(investmentPackageDetails.id, packageData))
			dispatch(getInvestmentPackageDetails(investmentPackageDetails.id))
			setFormModal(!formModal)
		}
	}

	return (
		<Card>
			<CardBody>
				<Row>
					<Col xl="6" lg="12" className="d-flex flex-column justify-content-between border-container-lg">
						<div className="user-avatar-section">
							<div className="d-flex justify-content-start">
								{/* {renderCustomerImg()} */}
								<div className="d-flex flex-column ml-1">
									<div className="user-info mb-1">
										<h4 className="mb-0">{investmentPackageDetails !== null ? `${investmentPackageDetails.name}` : 'Package Name'}</h4>
										<CardText tag="span" className="text-captalize">
											{investmentPackageDetails?.description}
										</CardText>
									</div>
									<div className="d-flex flex-wrap align-items-center">
										{/* <Button.Ripple tag={Link} to={`/customer/edit/${customerDetails.id}`} disabled color='primary'>
                      Edit
                    </Button.Ripple> */}
										{userRole === 'admin' || userRole === 'store' ? (
											<Button.Ripple className="text-center" color="primary" onClick={() => setFormModal(!formModal)}>
												Edit Package
											</Button.Ripple>
										) : (
											''
										)}
										<Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className="modal-dialog-centered modal-lg">
											<ModalHeader toggle={() => setFormModal(!formModal)}>Edit Package</ModalHeader>
											<AvForm onSubmit={onSubmit}>
												<ModalBody>
													<Row>
														<Col xl="6" lg="12">
															<FormGroup>
																<Label for="name">Package Name</Label>
																<AvInput
																	type="text"
																	name="name"
																	id="name"
																	placeholder="Package Name"
																	value={investmentPackageDetails.name}
																	onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
																	required
																/>
															</FormGroup>
														</Col>
														<Col xl="6" lg="12">
															<FormGroup>
																<Label for="minimumAmount">Minimum Amount</Label>
																<AvInput
																	type="text"
																	name="minimumAmount"
																	id="minimumAmount"
																	placeholder="Minimum Amount"
																	value={investmentPackageDetails.minimumAmount}
																	onChange={(e) => setPackageData({ ...packageData, minimumAmount: e.target.value })}
																	required
																/>
															</FormGroup>
														</Col>
														<Col xl="6" lg="12">
															<FormGroup>
																<Label for="durationType">Duration Type</Label>
																<AvInput
																	type="select"
																	name="durationType"
																	id="durationType"
																	placeholder="Duration Type"
																	value={investmentPackageDetails.durationType}
																	onChange={(e) => setPackageData({ ...packageData, durationType: e.target.value })}
																	required
																>
																	<option value={investmentPackageDetails.durationType}>{investmentPackageDetails.durationType}</option>
																	<option value="days">Days</option>
																	<option value="weeks">Weeks</option>
																	<option value="months">Months</option>
																	<option value="years">Years</option>
																</AvInput>
															</FormGroup>
														</Col>
														<Col xl="6" lg="12">
															<FormGroup>
																<Label for="durationValue">Duration Value</Label>
																<AvInput
																	type="text"
																	name="durationValue"
																	id="durationValue"
																	placeholder="Duration Value"
																	value={investmentPackageDetails.durationValue}
																	onChange={(e) => setPackageData({ ...packageData, durationValue: e.target.value })}
																	required
																/>
															</FormGroup>
														</Col>
														<Col xl="6" lg="12">
															<FormGroup>
																<Label for="status">Package Status</Label>
																<AvInput
																	type="select"
																	id="status"
																	name="status"
																	value={investmentPackageDetails.status}
																	onChange={(e) => setPackageData({ ...packageData, status: e.target.value })}
																	required
																>
																	<option value={investmentPackageDetails.status}>{investmentPackageDetails.status}</option>
																	<option value="active">Active</option>
																	<option value="inactive">Inactive</option>
																</AvInput>
															</FormGroup>
														</Col>
													</Row>
												</ModalBody>
												<ModalFooter>
													<Button.Ripple color="primary" type="submit">
														<span className="ml-50">Save Changes</span>
													</Button.Ripple>
												</ModalFooter>
											</AvForm>
										</Modal>
										{userRole === 'admin' || userRole === 'store' ? (
											<Button.Ripple className="ml-1" color="danger" outline onClick={() => handleDelete(customerDetails.id)}>
												Delete
											</Button.Ripple>
										) : (
											''
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="d-flex align-items-center user-total-numbers">
							<div className="d-flex align-items-center mr-2">
								<div className="color-box bg-light-primary">
									<Pocket className="text-primary" />
								</div>
								<div className="ml-1">
									<h5 className="mb-0">{investmentPackageDetails.investmentSubscriptions.length.toLocaleString()}</h5>
									<small>Subscriptions</small>
								</div>
							</div>
							<div className="d-flex align-items-center">
								<div className="color-box bg-light-success">
									<Pocket className="text-success" />
								</div>
								<div className="ml-1">
									<h5 className="mb-0">
										{getTotalInvestedAmount(investmentPackageDetails.investmentSubscriptions).toLocaleString('en-ZA', {
											style: 'currency',
											currency: 'ZAR',
										})}
									</h5>
									<small>Invested Amount</small>
								</div>
							</div>
						</div>
					</Col>
					<Col xl="6" lg="12" className="mt-2 mt-xl-0">
						<div className="user-info-wrapper">
							<div className="d-flex flex-wrap align-items-center mt-0">
								<div className="user-info-title">
									<Award className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Min. Amount
									</CardText>
								</div>
								<CardText className="mb-0 text-capitalize">
									{investmentPackageDetails?.minimumAmount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
								</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mt-1">
								<div className="user-info-title">
									<Hexagon className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Duration
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">
									{investmentPackageDetails?.durationValue} {investmentPackageDetails?.durationType}
								</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mt-1">
								<div className="user-info-title">
									<Star className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Status
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{investmentPackageDetails?.packageStatus}</CardText>
							</div>
							<div className="d-flex flex-wrap align-items-center mt-1">
								<div className="user-info-title">
									<UserPlus className="mr-1" size={14} />
									<CardText tag="span" className="user-info-title font-weight-bold mb-0">
										Created Since
									</CardText>
								</div>
								<CardText className="text-capitalize mb-0">{moment(investmentPackageDetails?.createdAt).format('LL')}</CardText>
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
		</Card>
	)
}

export default UserInfoCard
