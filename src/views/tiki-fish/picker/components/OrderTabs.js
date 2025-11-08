import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Plus, MoreHorizontal, Copy, Edit3 } from 'react-feather'
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, Badge } from 'reactstrap'
import { switchToOrder, createNewOrder, closeOrderTab, holdOrder, duplicateOrder, renameOrder } from '../store/actions'

const OrderTabs = () => {
	const dispatch = useDispatch()
	const { heldOrders, activeOrderId, currentOrder } = useSelector((state) => state.picker)
	const [editingTabId, setEditingTabId] = useState(null)
	const [tabName, setTabName] = useState('')

	const formatPrice = (price) => {
		return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
	}

	const handleTabClick = (tabId) => {
		if (tabId !== activeOrderId) {
			dispatch(switchToOrder(tabId))
		}
	}

	const handleCloseTab = (e, tabId) => {
		e.stopPropagation()

		// Find the order to check if it has items
		const orderToClose = heldOrders.find((order) => order.id === tabId) || (tabId === 'current' ? currentOrder : null)

		// If order has items, confirm before closing
		if (orderToClose && orderToClose.items && orderToClose.items.length > 0) {
			if (window.confirm('This order has items. Are you sure you want to close it? The order will be automatically held.')) {
				// Auto-hold the order before closing
				if (tabId === activeOrderId) {
					dispatch(holdOrder())
				}
				dispatch(closeOrderTab(tabId))
			}
		} else {
			dispatch(closeOrderTab(tabId))
		}
	}

	const handleNewOrder = () => {
		dispatch(createNewOrder())
	}

	const handleDuplicateOrder = (tabId) => {
		dispatch(duplicateOrder(tabId))
	}

	const startRenaming = (tabId, currentName) => {
		setEditingTabId(tabId)
		setTabName(currentName)
	}

	const handleRename = (tabId) => {
		if (tabName.trim()) {
			dispatch(renameOrder(tabId, tabName.trim()))
		}
		setEditingTabId(null)
		setTabName('')
	}

	const handleKeyPress = (e, tabId) => {
		if (e.key === 'Enter') {
			handleRename(tabId)
		} else if (e.key === 'Escape') {
			setEditingTabId(null)
			setTabName('')
		}
	}

	const getTabTitle = (tab) => {
		if (tab.id === 'current') {
			return tab.customName || 'New Order'
		}
		// For held orders, use custom name or fallback to a shorter ID
		return tab.customName || `Order ${tab.id.toString().slice(-4)}`
	}

	const getTabInfo = (tab) => {
		const itemCount = tab.items ? tab.items.length : 0
		const total = tab.total || 0

		return {
			itemCount,
			total,
			isEmpty: itemCount === 0,
		}
	}

	// Include current order as first tab, then held orders as additional tabs
	const allTabs = [
		{
			id: 'current',
			...currentOrder,
			isActive: activeOrderId === 'current' || !activeOrderId,
			customName: currentOrder.customName || null,
		},
		...(heldOrders || []).map((order) => ({
			...order,
			isActive: activeOrderId === order.id,
		})),
	]

	return (
		<div className="order-tabs">
			<div className="tabs-container">
				<div className="tabs-scroll">
					{allTabs.map((tab) => {
						const tabInfo = getTabInfo(tab)
						const isEditing = editingTabId === tab.id

						return (
							<div
								key={tab.id}
								className={`order-tab ${tab.isActive ? 'active' : ''} ${tabInfo.isEmpty ? 'empty' : ''}`}
								onClick={() => handleTabClick(tab.id)}
							>
								<div className="tab-content">
									<div className="tab-header">
										{isEditing ? (
											<Input
												type="text"
												value={tabName}
												onChange={(e) => setTabName(e.target.value)}
												onBlur={() => handleRename(tab.id)}
												onKeyDown={(e) => handleKeyPress(e, tab.id)}
												className="tab-name-input"
												autoFocus
											/>
										) : (
											<span className="tab-title">{getTabTitle(tab)}</span>
										)}

										{tab.hasUnsavedChanges && (
											<span className="unsaved-indicator" title="Unsaved changes">
												•
											</span>
										)}
									</div>

									<div className="tab-info">
										<span className="item-count">
											{tabInfo.itemCount} item{tabInfo.itemCount !== 1 ? 's' : ''}
										</span>
										{!tabInfo.isEmpty && (
											<Badge color="light" className="total-badge">
												{formatPrice(tabInfo.total)}
											</Badge>
										)}
									</div>
								</div>

								<div className="tab-actions">
									{/* Context menu */}
									<UncontrolledDropdown>
										<DropdownToggle tag="button" className="tab-menu-btn">
											<MoreHorizontal size={14} />
										</DropdownToggle>
										<DropdownMenu right>
											<DropdownItem onClick={() => startRenaming(tab.id, getTabTitle(tab))}>
												<Edit3 size={14} className="me-1" />
												Rename
											</DropdownItem>
											<DropdownItem onClick={() => handleDuplicateOrder(tab.id)}>
												<Copy size={14} className="me-1" />
												Duplicate
											</DropdownItem>
											<DropdownItem divider />
											<DropdownItem onClick={(e) => handleCloseTab(e, tab.id)} className="text-danger">
												<X size={14} className="me-1" />
												Close Tab
											</DropdownItem>
										</DropdownMenu>
									</UncontrolledDropdown>

									{/* Close button */}
									<button className="tab-close-btn" onClick={(e) => handleCloseTab(e, tab.id)} title="Close tab">
										<X size={12} />
									</button>
								</div>
							</div>
						)
					})}
				</div>

				{/* New tab button */}
				<button className="new-tab-btn" onClick={handleNewOrder} title="New order">
					<Plus size={16} />
				</button>
			</div>

			{/* Tab count indicator */}
			{allTabs.length > 1 && (
				<div className="tabs-info">
					<small className="text-muted">
						{allTabs.length} order{allTabs.length !== 1 ? 's' : ''} open
					</small>
				</div>
			)}
		</div>
	)
}

export default OrderTabs
