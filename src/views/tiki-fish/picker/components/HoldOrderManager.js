import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Card,
	CardBody,
	Badge,
	Button,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
	Col,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Alert,
	CustomInput,
	UncontrolledTooltip,
} from 'reactstrap'
import {
	Search,
	Filter,
	Clock,
	DollarSign,
	Package,
	User,
	MoreVertical,
	Eye,
	Play,
	Copy,
	Trash2,
	Edit3,
	Download,
	GitMerge,
	Archive,
	AlertCircle,
	CheckCircle,
	XCircle,
} from 'react-feather'
import moment from 'moment'
import { toast } from 'react-toastify'
import { resumeOrder, deleteHeldOrder, duplicateOrder, renameOrder, mergeOrders, exportHeldOrders } from '../store/actions'

const HoldOrderManager = ({ isOpen, toggle }) => {
	const dispatch = useDispatch()
	const { heldOrders } = useSelector((state) => state.picker)

	// Local state
	const [searchTerm, setSearchTerm] = useState('')
	const [filterStatus, setFilterStatus] = useState('all')
	const [sortBy, setSortBy] = useState('date-desc')
	const [selectedOrders, setSelectedOrders] = useState([])
	const [previewOrder, setPreviewOrder] = useState(null)
	const [showPreviewModal, setShowPreviewModal] = useState(false)
	const [showMergeModal, setShowMergeModal] = useState(false)
	const [editingOrder, setEditingOrder] = useState(null)
	const [orderNotes, setOrderNotes] = useState({})

	// Calculate order age
	const getOrderAge = (order) => {
		const created = moment(order.createdAt || order.heldAt)
		return created.fromNow()
	}

	// Get order priority color based on age
	const getOrderPriorityColor = (order) => {
		const hours = moment().diff(moment(order.createdAt || order.heldAt), 'hours')
		if (hours < 2) return 'success'
		if (hours < 6) return 'info'
		if (hours < 24) return 'warning'
		return 'danger'
	}

	// Filter and sort orders
	const filteredOrders = useMemo(() => {
		let filtered = [...heldOrders]

		// Search filter
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			filtered = filtered.filter((order) => {
				const customerName = order.customerName?.toLowerCase() || ''
				const orderId = order.id?.toLowerCase() || ''
				const notes = orderNotes[order.id]?.toLowerCase() || ''
				return customerName.includes(search) || orderId.includes(search) || notes.includes(search)
			})
		}

		// Status filter
		if (filterStatus !== 'all') {
			const hours = moment().diff(moment(order.createdAt || order.heldAt), 'hours')
			switch (filterStatus) {
				case 'recent':
					filtered = filtered.filter((order) => {
						const hours = moment().diff(moment(order.createdAt || order.heldAt), 'hours')
						return hours < 6
					})
					break
				case 'old':
					filtered = filtered.filter((order) => {
						const hours = moment().diff(moment(order.createdAt || order.heldAt), 'hours')
						return hours > 24
					})
					break
				case 'large':
					filtered = filtered.filter((order) => (order.items?.length || 0) > 5)
					break
				default:
					break
			}
		}

		// Sort
		switch (sortBy) {
			case 'date-asc':
				filtered.sort((a, b) => moment(a.createdAt || a.heldAt).valueOf() - moment(b.createdAt || b.heldAt).valueOf())
				break
			case 'date-desc':
				filtered.sort((a, b) => moment(b.createdAt || b.heldAt).valueOf() - moment(a.createdAt || a.heldAt).valueOf())
				break
			case 'total-asc':
				filtered.sort((a, b) => (a.total || 0) - (b.total || 0))
				break
			case 'total-desc':
				filtered.sort((a, b) => (b.total || 0) - (a.total || 0))
				break
			case 'items-asc':
				filtered.sort((a, b) => (a.items?.length || 0) - (b.items?.length || 0))
				break
			case 'items-desc':
				filtered.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0))
				break
			default:
				break
		}

		return filtered
	}, [heldOrders, searchTerm, filterStatus, sortBy, orderNotes])

	// Format currency
	const formatPrice = (price) => {
		return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
	}

	// Handle order selection
	const toggleOrderSelection = (orderId) => {
		setSelectedOrders((prev) => {
			if (prev.includes(orderId)) {
				return prev.filter((id) => id !== orderId)
			}
			return [...prev, orderId]
		})
	}

	// Handle select all
	const handleSelectAll = () => {
		if (selectedOrders.length === filteredOrders.length) {
			setSelectedOrders([])
		} else {
			setSelectedOrders(filteredOrders.map((order) => order.id))
		}
	}

	// Handle resume order
	const handleResumeOrder = (orderId) => {
		dispatch(resumeOrder(orderId))
		toast.success('Order resumed successfully')
		if (selectedOrders.includes(orderId)) {
			setSelectedOrders((prev) => prev.filter((id) => id !== orderId))
		}
	}

	// Handle delete orders
	const handleDeleteOrders = () => {
		if (selectedOrders.length === 0) return

		if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
			selectedOrders.forEach((orderId) => {
				dispatch(deleteHeldOrder(orderId))
			})
			toast.success(`${selectedOrders.length} order(s) deleted`)
			setSelectedOrders([])
		}
	}

	// Handle merge orders
	const handleMergeOrders = () => {
		if (selectedOrders.length < 2) {
			toast.warning('Please select at least 2 orders to merge')
			return
		}
		setShowMergeModal(true)
	}

	// Confirm merge
	const confirmMerge = () => {
		dispatch(mergeOrders(selectedOrders))
		toast.success(`${selectedOrders.length} orders merged successfully`)
		setSelectedOrders([])
		setShowMergeModal(false)
	}

	// Handle export
	const handleExport = (format) => {
		const dataToExport = selectedOrders.length > 0 ? heldOrders.filter((order) => selectedOrders.includes(order.id)) : filteredOrders

		dispatch(exportHeldOrders(dataToExport, format))
		toast.success(`Exported ${dataToExport.length} orders as ${format.toUpperCase()}`)
	}

	// Handle preview
	const handlePreview = (order) => {
		setPreviewOrder(order)
		setShowPreviewModal(true)
	}

	// Handle edit order name
	const handleEditOrderName = (orderId, newName) => {
		dispatch(renameOrder(orderId, newName))
		setEditingOrder(null)
		toast.success('Order renamed successfully')
	}

	// Handle add note
	const handleAddNote = (orderId, note) => {
		setOrderNotes((prev) => ({ ...prev, [orderId]: note }))
		// Save to localStorage
		localStorage.setItem('cellerhut_order_notes', JSON.stringify({ ...orderNotes, [orderId]: note }))
	}

	// Load notes from localStorage on mount
	useEffect(() => {
		const savedNotes = localStorage.getItem('cellerhut_order_notes')
		if (savedNotes) {
			try {
				setOrderNotes(JSON.parse(savedNotes))
			} catch (error) {
				console.error('Failed to load order notes:', error)
			}
		}
	}, [])

	// Auto-cleanup old orders notification
	useEffect(() => {
		const oldOrders = heldOrders.filter((order) => {
			const hours = moment().diff(moment(order.createdAt || order.heldAt), 'hours')
			return hours > 48
		})

		if (oldOrders.length > 0) {
			toast.warning(`You have ${oldOrders.length} order(s) older than 48 hours`, {
				autoClose: 10000,
				onClick: () => setFilterStatus('old'),
			})
		}
	}, [heldOrders])

	return (
		<>
			<Modal isOpen={isOpen} toggle={toggle} size="xl" className="hold-order-manager">
				<ModalHeader toggle={toggle}>
					<div className="d-flex align-items-center justify-content-between w-100">
						<span>Held Orders Manager</span>
						<div className="d-flex align-items-center gap-2">
							<Badge color="primary" pill>
								{heldOrders.length} Total
							</Badge>
							{selectedOrders.length > 0 && (
								<Badge color="success" pill>
									{selectedOrders.length} Selected
								</Badge>
							)}
						</div>
					</div>
				</ModalHeader>

				<ModalBody>
					{/* Filters and Search */}
					<Row className="mb-3">
						<Col md={4}>
							<InputGroup>
								<InputGroupAddon addonType="prepend">
									<InputGroupText>
										<Search size={16} />
									</InputGroupText>
								</InputGroupAddon>
								<Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
							</InputGroup>
						</Col>

						<Col md={3}>
							<Input type="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
								<option value="all">All Orders</option>
								<option value="recent">Recent (&lt; 6 hours)</option>
								<option value="old">Old (&gt; 24 hours)</option>
								<option value="large">Large (&gt; 5 items)</option>
							</Input>
						</Col>

						<Col md={3}>
							<Input type="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
								<option value="date-desc">Newest First</option>
								<option value="date-asc">Oldest First</option>
								<option value="total-desc">Highest Total</option>
								<option value="total-asc">Lowest Total</option>
								<option value="items-desc">Most Items</option>
								<option value="items-asc">Least Items</option>
							</Input>
						</Col>

						<Col md={2}>
							<UncontrolledDropdown>
								<DropdownToggle color="primary" caret>
									Actions
								</DropdownToggle>
								<DropdownMenu right>
									<DropdownItem onClick={handleSelectAll}>
										{selectedOrders.length === filteredOrders.length ? 'Deselect All' : 'Select All'}
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem onClick={handleMergeOrders} disabled={selectedOrders.length < 2}>
										<GitMerge size={14} className="mr-1" /> Merge Selected
									</DropdownItem>
									<DropdownItem onClick={handleDeleteOrders} disabled={selectedOrders.length === 0}>
										<Trash2 size={14} className="mr-1" /> Delete Selected
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem onClick={() => handleExport('csv')}>
										<Download size={14} className="mr-1" /> Export as CSV
									</DropdownItem>
									<DropdownItem onClick={() => handleExport('pdf')}>
										<Download size={14} className="mr-1" /> Export as PDF
									</DropdownItem>
								</DropdownMenu>
							</UncontrolledDropdown>
						</Col>
					</Row>

					{/* Orders Grid */}
					{filteredOrders.length === 0 ? (
						<Alert color="info">
							<AlertCircle size={16} className="mr-2" />
							No held orders found. Orders will appear here when you hold them.
						</Alert>
					) : (
						<Row>
							{filteredOrders.map((order) => (
								<Col lg={4} md={6} key={order.id} className="mb-3">
									<Card className={`held-order-card ${selectedOrders.includes(order.id) ? 'selected' : ''}`}>
										<CardBody>
											{/* Order Header */}
											<div className="d-flex justify-content-between align-items-start mb-2">
												<div className="d-flex align-items-center">
													<CustomInput
														type="checkbox"
														id={`order-${order.id}`}
														checked={selectedOrders.includes(order.id)}
														onChange={() => toggleOrderSelection(order.id)}
													/>
													<div className="ml-2">
														{editingOrder === order.id ? (
															<Input
																type="text"
																defaultValue={order.customName || `Order ${order.id.slice(-4)}`}
																onBlur={(e) => handleEditOrderName(order.id, e.target.value)}
																onKeyPress={(e) => {
																	if (e.key === 'Enter') {
																		handleEditOrderName(order.id, e.target.value)
																	}
																}}
																autoFocus
																size="sm"
															/>
														) : (
															<h6 className="mb-0">
																{order.customName || `Order ${order.id.slice(-4)}`}
																<Edit3 size={12} className="ml-1 cursor-pointer" onClick={() => setEditingOrder(order.id)} />
															</h6>
														)}
														<small className="text-muted">
															<Clock size={12} /> {getOrderAge(order)}
														</small>
													</div>
												</div>

												<Badge color={getOrderPriorityColor(order)} pill>
													{order.items?.length || 0} items
												</Badge>
											</div>

											{/* Order Details */}
											<div className="order-details mb-2">
												<div className="d-flex justify-content-between mb-1">
													<span className="text-muted">Total:</span>
													<strong>{formatPrice(order.total)}</strong>
												</div>

												{order.customerName && (
													<div className="d-flex justify-content-between mb-1">
														<span className="text-muted">Customer:</span>
														<span>{order.customerName}</span>
													</div>
												)}

												{orderNotes[order.id] && (
													<div className="order-note mt-2">
														<small className="text-info">
															<AlertCircle size={12} /> {orderNotes[order.id]}
														</small>
													</div>
												)}
											</div>

											{/* Order Items Preview */}
											<div className="order-items-preview mb-2">
												{order.items?.slice(0, 3).map((item, index) => (
													<div key={index} className="item-preview">
														<small>
															{item.quantity}x {item.name}
														</small>
													</div>
												))}
												{order.items?.length > 3 && <small className="text-muted">+{order.items.length - 3} more items</small>}
											</div>

											{/* Action Buttons */}
											<div className="d-flex justify-content-between">
												<Button color="primary" size="sm" onClick={() => handleResumeOrder(order.id)}>
													<Play size={14} /> Resume
												</Button>

												<div className="d-flex gap-1">
													<Button color="info" size="sm" outline onClick={() => handlePreview(order)} id={`preview-${order.id}`}>
														<Eye size={14} />
													</Button>
													<UncontrolledTooltip target={`preview-${order.id}`}>Preview Order</UncontrolledTooltip>

													<Button color="secondary" size="sm" outline onClick={() => dispatch(duplicateOrder(order.id))} id={`duplicate-${order.id}`}>
														<Copy size={14} />
													</Button>
													<UncontrolledTooltip target={`duplicate-${order.id}`}>Duplicate Order</UncontrolledTooltip>
												</div>
											</div>
										</CardBody>
									</Card>
								</Col>
							))}
						</Row>
					)}
				</ModalBody>

				<ModalFooter>
					<Button color="secondary" onClick={toggle}>
						Close
					</Button>
				</ModalFooter>
			</Modal>

			{/* Preview Modal */}
			{previewOrder && (
				<Modal isOpen={showPreviewModal} toggle={() => setShowPreviewModal(false)} size="lg">
					<ModalHeader toggle={() => setShowPreviewModal(false)}>
						Order Preview: {previewOrder.customName || `Order ${previewOrder.id.slice(-4)}`}
					</ModalHeader>
					<ModalBody>
						<h6>Order Details</h6>
						<div className="mb-3">
							<p>
								<strong>Created:</strong> {moment(previewOrder.createdAt || previewOrder.heldAt).format('LLLL')}
							</p>
							<p>
								<strong>Total:</strong> {formatPrice(previewOrder.total)}
							</p>
							<p>
								<strong>Items:</strong> {previewOrder.items?.length || 0}
							</p>
						</div>

						<h6>Items</h6>
						<table className="table table-sm">
							<thead>
								<tr>
									<th>Product</th>
									<th>Quantity</th>
									<th>Price</th>
									<th>Total</th>
								</tr>
							</thead>
							<tbody>
								{previewOrder.items?.map((item, index) => (
									<tr key={index}>
										<td>{item.name}</td>
										<td>{item.quantity}</td>
										<td>{formatPrice(item.price)}</td>
										<td>{formatPrice(item.quantity * item.price)}</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr>
									<th colSpan="3">Total</th>
									<th>{formatPrice(previewOrder.total)}</th>
								</tr>
							</tfoot>
						</table>

						{/* Add Note */}
						<div className="mt-3">
							<label>Add Note:</label>
							<Input
								type="textarea"
								rows={2}
								value={orderNotes[previewOrder.id] || ''}
								onChange={(e) => handleAddNote(previewOrder.id, e.target.value)}
								placeholder="Add a note for this order..."
							/>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={() => handleResumeOrder(previewOrder.id)}>
							Resume Order
						</Button>
						<Button color="secondary" onClick={() => setShowPreviewModal(false)}>
							Close
						</Button>
					</ModalFooter>
				</Modal>
			)}

			{/* Merge Confirmation Modal */}
			<Modal isOpen={showMergeModal} toggle={() => setShowMergeModal(false)}>
				<ModalHeader toggle={() => setShowMergeModal(false)}>Confirm Merge</ModalHeader>
				<ModalBody>
					<Alert color="warning">
						<AlertCircle size={16} className="mr-2" />
						You are about to merge {selectedOrders.length} orders into one. This action cannot be undone.
					</Alert>
					<p>The merged order will contain all items from the selected orders.</p>
				</ModalBody>
				<ModalFooter>
					<Button color="danger" onClick={confirmMerge}>
						Merge Orders
					</Button>
					<Button color="secondary" onClick={() => setShowMergeModal(false)}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}

export default HoldOrderManager
