// ** React Imports
import { useState, useEffect, Fragment } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// ** Store & Actions
import { sendBroadcast, clearNotificationError } from './store/action'

// ** Third Party Components
import {
	Card,
	CardHeader,
	CardTitle,
	CardBody,
	Row,
	Col,
	Button,
	FormGroup,
	Label,
	FormText,
	Alert,
	Spinner,
} from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { Bell, Send, AlertCircle } from 'react-feather'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

const BroadcastMessage = () => {
	const dispatch = useDispatch()
	const history = useHistory()

	// ** Store state
	const { loading, error } = useSelector((state) => state.notifications)

	// ** Component state
	const [formData, setFormData] = useState({
		title: '',
		message: '',
		target_audience: 'all',
	})

	const [showSuccess, setShowSuccess] = useState(false)

	// ** Character limits
	const TITLE_MAX = 100
	const MESSAGE_MAX = 500

	// ** Clear error on mount
	useEffect(() => {
		dispatch(clearNotificationError())
	}, [dispatch])

	// ** Handle form submission
	const onSubmit = async (event, errors) => {
		event?.preventDefault()

		if (errors && errors.length) {
			return
		}

		// Validate character limits
		if (formData.title.length > TITLE_MAX) {
			return
		}
		if (formData.message.length > MESSAGE_MAX) {
			return
		}

		// Send broadcast
		const result = await dispatch(sendBroadcast(formData))

		if (result && result.success) {
			setShowSuccess(true)
			// Reset form
			setFormData({
				title: '',
				message: '',
				target_audience: 'all',
			})
			// Redirect to history after 2 seconds
			setTimeout(() => {
				history.push('/notifications/history')
			}, 2000)
		}
	}

	// ** Handle input changes
	const handleChange = (field, value) => {
		setFormData({ ...formData, [field]: value })
	}

	return (
		<Fragment>
			<Row>
				<Col sm='12'>
					<Card>
						<CardHeader className='border-bottom'>
							<CardTitle tag='h4'>
								<Bell size={20} className='mr-50' />
								Send Broadcast Message
							</CardTitle>
						</CardHeader>
						<CardBody className='pt-2'>
							{/* Success Alert */}
							{showSuccess && (
								<Alert color='success'>
									<div className='alert-body'>
										<Send size={15} className='mr-50' />
										<span className='font-weight-bold'>
											Broadcast message is being sent! Redirecting to history...
										</span>
									</div>
								</Alert>
							)}

							{/* Error Alert */}
							{error && (
								<Alert color='danger'>
									<div className='alert-body'>
										<AlertCircle size={15} className='mr-50' />
										<span>{error}</span>
									</div>
								</Alert>
							)}

							<AvForm onSubmit={onSubmit}>
								<Row>
									{/* Form Section */}
									<Col md='6' sm='12'>
										<h5 className='mb-1'>Message Details</h5>

										<FormGroup>
											<Label for='title'>
												Title <span className='text-danger'>*</span>
											</Label>
											<AvInput
												name='title'
												id='title'
												placeholder='Enter notification title...'
												value={formData.title}
												onChange={(e) => handleChange('title', e.target.value)}
												maxLength={TITLE_MAX}
												required
											/>
											<FormText color='muted'>
												{formData.title.length}/{TITLE_MAX} characters
											</FormText>
										</FormGroup>

										<FormGroup>
											<Label for='message'>
												Message <span className='text-danger'>*</span>
											</Label>
											<AvInput
												type='textarea'
												name='message'
												id='message'
												rows='6'
												placeholder='Enter notification message...'
												value={formData.message}
												onChange={(e) => handleChange('message', e.target.value)}
												maxLength={MESSAGE_MAX}
												required
											/>
											<FormText color='muted'>
												{formData.message.length}/{MESSAGE_MAX} characters
											</FormText>
										</FormGroup>

										<FormGroup>
											<Label for='target_audience'>
												Target Audience <span className='text-danger'>*</span>
											</Label>
											<AvInput
												type='select'
												id='target_audience'
												name='target_audience'
												value={formData.target_audience}
												onChange={(e) => handleChange('target_audience', e.target.value)}
												required
											>
												<option value='all'>All Customers</option>
												<option value='active'>Active Customers Only</option>
											</AvInput>
											<FormText color='muted'>
												{formData.target_audience === 'all'
													? 'Will be sent to all registered customers with active devices'
													: 'Will be sent to customers with active push tokens'}
											</FormText>
										</FormGroup>

										<div className='d-flex mt-2'>
											<Button
												type='submit'
												className='mr-1'
												color='primary'
												disabled={loading || !formData.title || !formData.message}
											>
												{loading ? (
													<Fragment>
														<Spinner size='sm' className='mr-50' />
														Sending...
													</Fragment>
												) : (
													<Fragment>
														<Send size={15} className='mr-50' />
														Send Broadcast
													</Fragment>
												)}
											</Button>
											<Button
												type='button'
												color='secondary'
												outline
												onClick={() => history.push('/notifications/history')}
												disabled={loading}
											>
												Cancel
											</Button>
										</div>
									</Col>

									{/* Preview Section */}
									<Col md='6' sm='12'>
										<h5 className='mb-1'>Live Preview</h5>
										<Card className='bg-light-secondary'>
											<CardBody>
												<div className='border rounded p-2 bg-white'>
													<div className='d-flex align-items-start mb-1'>
														<div className='avatar bg-light-primary rounded mr-1'>
															<Bell size={20} className='text-primary' />
														</div>
														<div className='flex-grow-1'>
															<h6 className='mb-25'>
																{formData.title || 'Notification Title'}
															</h6>
															<p className='mb-0' style={{ fontSize: '0.9rem' }}>
																{formData.message || 'Your notification message will appear here...'}
															</p>
														</div>
													</div>
													<small className='text-muted'>Just now</small>
												</div>

												<div className='mt-2'>
													<h6 className='font-weight-bold'>Delivery Info:</h6>
													<ul className='list-unstyled'>
														<li>
															<strong>Target:</strong>{' '}
															{formData.target_audience === 'all'
																? 'All Customers'
																: 'Active Customers'}
														</li>
														<li>
															<strong>Platform:</strong> iOS & Android
														</li>
														<li>
															<strong>Delivery:</strong> Immediate (async)
														</li>
													</ul>
												</div>
											</CardBody>
										</Card>
									</Col>
								</Row>
							</AvForm>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Fragment>
	)
}

export default BroadcastMessage
