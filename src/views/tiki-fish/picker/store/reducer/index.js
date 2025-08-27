import { 
	loadHeldOrdersFromStorage, 
	loadActiveOrderId,
	saveHeldOrdersToStorage,
	saveActiveOrderId 
} from '../../utils/orderStorage'

// Helper function to get category ID from category data
const getCategoryId = (category) => {
	if (!category) return null
	if (typeof category === 'string') return category
	if (typeof category === 'object' && category.id) return category.id
	if (typeof category === 'object' && category.name) return category.name
	return null
}

// Helper function to get category name from category data
const getCategoryName = (category) => {
	if (!category) return 'Uncategorized'
	if (typeof category === 'string') return category
	if (typeof category === 'object' && category.name) return category.name
	return 'Uncategorized'
}

// Helper function to sort products
const sortProducts = (products, sortBy, sortOrder) => {
	return [...products].sort((a, b) => {
		let aValue, bValue
		
		switch (sortBy) {
			case 'price':
				aValue = parseFloat(a.price || 0)
				bValue = parseFloat(b.price || 0)
				break
			case 'category':
				aValue = getCategoryName(a.category).toLowerCase()
				bValue = getCategoryName(b.category).toLowerCase()
				break
			case 'name':
			default:
				aValue = (a.name || '').toLowerCase()
				bValue = (b.name || '').toLowerCase()
				break
		}
		
		if (sortOrder === 'desc') {
			return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
		}
		return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
	})
}

// Helper function to create empty order
const createEmptyOrder = (id = null) => ({
	id: id || `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
	items: [],
	customer: null,
	subtotal: 0,
	tax: 0,
	total: 0,
	orderDiscount: {
		type: 'fixed',
		value: 0,
		amount: 0,
	},
	totalItemDiscount: 0,
	totalDiscount: 0,
	discountPercentage: 0,
	paymentMethod: 'cash',
	cashCollected: 0,
	changeAmount: 0,
	customName: null,
	hasUnsavedChanges: false,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString()
})

const initialState = {
	currentOrder: createEmptyOrder('current'),
	heldOrders: loadHeldOrdersFromStorage(),
	orderTabs: [], // Array of held orders that are open as tabs
	activeOrderId: loadActiveOrderId() || 'current',
	categories: [],
	products: [],
	filteredProducts: [],
	selectedCategory: 'all',
	searchTerm: '',
	sortBy: 'name',
	sortOrder: 'asc',
	loading: false,
	error: null,
	showConfirmationModal: false,
	isPlacingOrder: false,
}

const pickerReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'PICKER_SET_LOADING':
			return { ...state, loading: action.loading }

		case 'PICKER_SET_ERROR':
			return { ...state, error: action.error, loading: false }

		case 'PICKER_GET_CATEGORIES':
			return { ...state, categories: action.categories }

		case 'PICKER_GET_PRODUCTS':
			return {
				...state,
				products: action.products,
				filteredProducts: action.products,
			}

		case 'PICKER_FILTER_PRODUCTS':
			let filtered = action.category === 'all' ? state.products : state.products.filter((product) => getCategoryId(product.category) === action.category)
			
			// Apply search filter if there's a search term
			if (state.searchTerm) {
				filtered = filtered.filter(product =>
					product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
					product.barcode?.includes(state.searchTerm) ||
					getCategoryName(product.category).toLowerCase().includes(state.searchTerm.toLowerCase())
				)
			}
			
			// Apply sorting
			filtered = sortProducts(filtered, state.sortBy, state.sortOrder)
			
			return {
				...state,
				filteredProducts: filtered,
				selectedCategory: action.category,
			}

		case 'PICKER_SEARCH_PRODUCTS':
			let searchFiltered = state.products
			
			// Apply category filter
			if (state.selectedCategory !== 'all') {
				searchFiltered = searchFiltered.filter(product => getCategoryId(product.category) === state.selectedCategory)
			}
			
			// Apply search filter
			if (action.searchTerm) {
				searchFiltered = searchFiltered.filter(product =>
					product.name.toLowerCase().includes(action.searchTerm.toLowerCase()) ||
					product.barcode?.includes(action.searchTerm) ||
					getCategoryName(product.category).toLowerCase().includes(action.searchTerm.toLowerCase())
				)
			}
			
			// Apply sorting
			const sortBy = action.sortBy || state.sortBy
			const sortOrder = action.sortOrder || state.sortOrder
			searchFiltered = sortProducts(searchFiltered, sortBy, sortOrder)
			
			return {
				...state,
				filteredProducts: searchFiltered,
				searchTerm: action.searchTerm || '',
				sortBy,
				sortOrder,
			}

		case 'PICKER_CLEAR_SEARCH':
			let clearedFiltered = state.selectedCategory === 'all' ? state.products : state.products.filter(product => getCategoryId(product.category) === state.selectedCategory)
			clearedFiltered = sortProducts(clearedFiltered, state.sortBy, state.sortOrder)
			
			return {
				...state,
				filteredProducts: clearedFiltered,
				searchTerm: '',
			}

		case 'PICKER_ADD_TO_ORDER':
			const existingItemIndex = state.currentOrder.items.findIndex((item) => item.id === action.product.id)

			let updatedItems
			if (existingItemIndex >= 0) {
				updatedItems = state.currentOrder.items.map((item, index) => (index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item))
			} else {
				updatedItems = [...state.currentOrder.items, { 
					...action.product, 
					quantity: 1,
					discountType: 'percentage',
					discountValue: 0,
					discountAmount: 0
				}]
			}

			// Calculate totals with discounts
			const itemTotals = updatedItems.reduce((acc, item) => {
				const itemSubtotal = item.price * item.quantity
				const itemDiscountAmount = item.discountAmount || 0
				const itemTotal = itemSubtotal - itemDiscountAmount
				return {
					subtotal: acc.subtotal + itemTotal,
					totalItemDiscount: acc.totalItemDiscount + itemDiscountAmount
				}
			}, { subtotal: 0, totalItemDiscount: 0 })

			// Apply order-level discount
			const currentOrderDiscount = state.currentOrder.orderDiscount || { type: 'fixed', value: 0, amount: 0 }
			const orderDiscountAmount = currentOrderDiscount.type === 'percentage'
				? itemTotals.subtotal * (currentOrderDiscount.value / 100)
				: currentOrderDiscount.amount

			const finalSubtotal = itemTotals.subtotal - orderDiscountAmount
			const tax = (finalSubtotal * 0.15) / (1 + 0.15)
			const total = finalSubtotal + tax
			const totalDiscount = itemTotals.totalItemDiscount + orderDiscountAmount
			const discountPercentage = total > 0 ? (totalDiscount / (total + totalDiscount)) * 100 : 0

			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					items: updatedItems,
					subtotal: finalSubtotal,
					tax,
					total,
					totalItemDiscount: itemTotals.totalItemDiscount,
					totalDiscount,
					discountPercentage,
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				},
			}

		case 'PICKER_REMOVE_FROM_ORDER':
			const filteredItems = state.currentOrder.items.filter((item) => item.id !== action.productId)
			const newTotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			const newTax = (newTotal * 0.15) / (1 + 0.15)
			const newSubtotal = newTotal - newTax

			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					items: filteredItems,
					subtotal: newSubtotal,
					tax: newTax,
					total: newTotal,
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				},
			}

		case 'PICKER_UPDATE_QUANTITY':
			const itemsWithUpdatedQty = state.currentOrder.items
				.map((item) => (item.id === action.productId ? { ...item, quantity: Math.max(0, action.quantity) } : item))
				.filter((item) => item.quantity > 0)

			const qtyTotal = itemsWithUpdatedQty.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			const qtyTax = (qtyTotal * 0.15) / (1 + 0.15)
			const qtySubtotal = qtyTotal - qtyTax

			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					items: itemsWithUpdatedQty,
					subtotal: qtySubtotal,
					tax: qtyTax,
					total: qtyTotal,
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				},
			}

		case 'PICKER_SET_PAYMENT_METHOD':
			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					paymentMethod: action.method,
					cashCollected: action.method === 'cash' ? state.currentOrder.cashCollected : 0,
					changeAmount: action.method === 'cash' ? state.currentOrder.changeAmount : 0,
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				},
			}

		case 'PICKER_SET_CASH_COLLECTED':
			const changeAmount = action.amount ? parseFloat(action.amount) - state.currentOrder.total : 0
			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					cashCollected: parseFloat(action.amount) || 0,
					changeAmount: changeAmount >= 0 ? changeAmount : 0,
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				},
			}

		case 'PICKER_SHOW_CONFIRMATION_MODAL':
			return {
				...state,
				showConfirmationModal: true,
			}

		case 'PICKER_HIDE_CONFIRMATION_MODAL':
			return {
				...state,
				showConfirmationModal: false,
			}

		case 'PICKER_SET_PLACING_ORDER':
			return {
				...state,
				isPlacingOrder: action.isPlacing,
			}

		case 'PICKER_HOLD_ORDER':
			// Only hold if current order has items
			if (state.currentOrder.items.length === 0) {
				return state
			}

			const orderToHold = {
				...state.currentOrder,
				id: state.currentOrder.id === 'current' ? createEmptyOrder().id : state.currentOrder.id,
				heldAt: new Date().toLocaleTimeString(),
				hasUnsavedChanges: false // Holding saves the order
			}

			const updatedHeldOrdersForHold = [...state.heldOrders, orderToHold]
			saveHeldOrdersToStorage(updatedHeldOrdersForHold)
			saveActiveOrderId('current')

			return {
				...state,
				heldOrders: updatedHeldOrdersForHold,
				currentOrder: createEmptyOrder('current'),
				activeOrderId: 'current'
			}

		case 'PICKER_RESUME_ORDER':
			const orderToResume = state.heldOrders.find((order) => order.id === action.orderId)
			const remainingHeldOrders = state.heldOrders.filter((order) => order.id !== action.orderId)

			if (!orderToResume) return state

			// Save current order to held orders if it has items
			let finalHeldOrders = remainingHeldOrders
			if (state.currentOrder.items.length > 0) {
				const currentOrderToHold = {
					...state.currentOrder,
					id: state.currentOrder.id === 'current' ? createEmptyOrder().id : state.currentOrder.id,
					hasUnsavedChanges: true
				}
				finalHeldOrders = [...finalHeldOrders, currentOrderToHold]
			}

			saveHeldOrdersToStorage(finalHeldOrders)
			saveActiveOrderId(orderToResume.id)

			return {
				...state,
				currentOrder: orderToResume,
				heldOrders: finalHeldOrders,
				activeOrderId: orderToResume.id
			}

		case 'PICKER_CLEAR_ORDER':
			return {
				...state,
				currentOrder: createEmptyOrder(state.activeOrderId === 'current' ? 'current' : state.activeOrderId),
			}

		case 'PICKER_PLACE_ORDER':
			return {
				...state,
				currentOrder: createEmptyOrder('current'),
			}

		// Tab Management Actions
		case 'PICKER_SWITCH_TO_ORDER':
			const orderToSwitchTo = action.orderId === 'current' 
				? state.currentOrder 
				: state.heldOrders.find(order => order.id === action.orderId)

			if (!orderToSwitchTo) return state

			// Save current active order state before switching
			let updatedHeldOrders = [...state.heldOrders]
			let updatedCurrentOrder = state.currentOrder

			if (state.activeOrderId === 'current') {
				// Current order becomes a held order if it has items
				if (state.currentOrder.items.length > 0) {
					const currentAsHeld = {
						...state.currentOrder,
						id: state.currentOrder.id === 'current' ? createEmptyOrder().id : state.currentOrder.id,
						hasUnsavedChanges: true
					}
					updatedHeldOrders = [...updatedHeldOrders, currentAsHeld]
				}
			} else {
				// Update the previously active held order
				updatedHeldOrders = updatedHeldOrders.map(order => (
					order.id === state.activeOrderId 
						? { ...state.currentOrder, hasUnsavedChanges: true }
						: order
				))
			}

			// Set the new active order
			if (action.orderId === 'current') {
				updatedCurrentOrder = createEmptyOrder('current')
			} else {
				updatedCurrentOrder = { ...orderToSwitchTo }
				updatedHeldOrders = updatedHeldOrders.filter(order => order.id !== action.orderId)
			}

			// Save to localStorage
			saveHeldOrdersToStorage(updatedHeldOrders)
			saveActiveOrderId(action.orderId)

			return {
				...state,
				currentOrder: updatedCurrentOrder,
				heldOrders: updatedHeldOrders,
				activeOrderId: action.orderId
			}

		case 'PICKER_CREATE_NEW_ORDER':
			const newOrderId = createEmptyOrder().id
			const newOrder = createEmptyOrder(newOrderId)
			
			// Save current order to held orders if it has items
			let newHeldOrders = [...state.heldOrders]
			if (state.currentOrder.items.length > 0) {
				const currentOrderToHold = {
					...state.currentOrder,
					id: state.currentOrder.id === 'current' ? createEmptyOrder().id : state.currentOrder.id,
					hasUnsavedChanges: true
				}
				newHeldOrders = [...newHeldOrders, currentOrderToHold]
			}

			saveHeldOrdersToStorage(newHeldOrders)
			saveActiveOrderId(newOrderId)

			return {
				...state,
				currentOrder: newOrder,
				heldOrders: newHeldOrders,
				activeOrderId: newOrderId
			}

		case 'PICKER_CLOSE_ORDER_TAB':
			if (action.tabId === 'current') {
				// Closing current order - switch to first held order or create new
				const firstHeldOrder = state.heldOrders[0]
				
				if (firstHeldOrder) {
					const remainingHeldOrders = state.heldOrders.slice(1)
					saveHeldOrdersToStorage(remainingHeldOrders)
					saveActiveOrderId(firstHeldOrder.id)
					
					return {
						...state,
						currentOrder: firstHeldOrder,
						heldOrders: remainingHeldOrders,
						activeOrderId: firstHeldOrder.id
					}
				} else {
					// No held orders, create new current order
					const freshOrder = createEmptyOrder('current')
					saveActiveOrderId('current')
					
					return {
						...state,
						currentOrder: freshOrder,
						activeOrderId: 'current'
					}
				}
			} else {
				// Closing a held order
				const filteredHeldOrders = state.heldOrders.filter(order => order.id !== action.tabId)
				saveHeldOrdersToStorage(filteredHeldOrders)
				
				return {
					...state,
					heldOrders: filteredHeldOrders
				}
			}

		case 'PICKER_DUPLICATE_ORDER':
			const orderToDuplicate = action.orderId === 'current' 
				? state.currentOrder 
				: state.heldOrders.find(order => order.id === action.orderId)

			if (!orderToDuplicate) return state

			const duplicatedOrder = {
				...orderToDuplicate,
				id: createEmptyOrder().id,
				customName: `${orderToDuplicate.customName || 'Order'} (Copy)`,
				hasUnsavedChanges: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}

			const updatedHeldOrdersForDupe = [...state.heldOrders, duplicatedOrder]
			saveHeldOrdersToStorage(updatedHeldOrdersForDupe)

			return {
				...state,
				heldOrders: updatedHeldOrdersForDupe
			}

		case 'PICKER_RENAME_ORDER':
			if (action.orderId === 'current') {
				return {
					...state,
					currentOrder: {
						...state.currentOrder,
						customName: action.newName,
						hasUnsavedChanges: true,
						updatedAt: new Date().toISOString()
					}
				}
			} else {
				const renamedHeldOrders = state.heldOrders.map(order => (
					order.id === action.orderId 
						? { 
							...order, 
							customName: action.newName,
							hasUnsavedChanges: true,
							updatedAt: new Date().toISOString()
						}
						: order
				))
				saveHeldOrdersToStorage(renamedHeldOrders)
				
				return {
					...state,
					heldOrders: renamedHeldOrders
				}
			}

		case 'PICKER_MARK_ORDER_CHANGED':
			if (state.activeOrderId === 'current') {
				return {
					...state,
					currentOrder: {
						...state.currentOrder,
						hasUnsavedChanges: true,
						updatedAt: new Date().toISOString()
					}
				}
			}
			return state

		case 'PICKER_DELETE_HELD_ORDER':
			const filteredHeldOrders = state.heldOrders.filter(order => order.id !== action.orderId)
			saveHeldOrdersToStorage(filteredHeldOrders)
			
			return {
				...state,
				heldOrders: filteredHeldOrders
			}

		case 'PICKER_MERGE_ORDERS':
			if (!action.orderIds || action.orderIds.length < 2) return state
			
			// Find all orders to merge
			const ordersToMerge = state.heldOrders.filter(order => action.orderIds.includes(order.id))
			if (ordersToMerge.length < 2) return state
			
			// Create merged order
			const mergedOrder = {
				...createEmptyOrder(),
				items: [],
				subtotal: 0,
				tax: 0,
				total: 0,
				customName: 'Merged Order',
				createdAt: new Date().toISOString(),
				heldAt: new Date().toLocaleTimeString()
			}
			
			// Merge all items
			const itemMap = new Map()
			ordersToMerge.forEach(order => {
				order.items?.forEach(item => {
					const key = item.id
					if (itemMap.has(key)) {
						const existing = itemMap.get(key)
						itemMap.set(key, {
							...existing,
							quantity: existing.quantity + item.quantity
						})
					} else {
						itemMap.set(key, { ...item })
					}
				})
			})
			
			mergedOrder.items = Array.from(itemMap.values())
			
			// Recalculate totals
			mergedOrder.subtotal = mergedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			mergedOrder.tax = mergedOrder.subtotal * 0.15 // Assuming 15% tax
			mergedOrder.total = mergedOrder.subtotal + mergedOrder.tax
			
			// Remove merged orders and add new merged order
			const remainingOrders = state.heldOrders.filter(order => !action.orderIds.includes(order.id))
			const updatedHeldOrdersAfterMerge = [...remainingOrders, mergedOrder]
			saveHeldOrdersToStorage(updatedHeldOrdersAfterMerge)
			
			return {
				...state,
				heldOrders: updatedHeldOrdersAfterMerge
			}

		case 'PICKER_SET_ITEM_DISCOUNT':
			const itemsWithDiscount = state.currentOrder.items.map((item) => {
				if (item.id === action.productId) {
					const itemSubtotal = item.price * item.quantity
					const discountAmount = action.discountType === 'percentage'
						? itemSubtotal * (action.discountValue / 100)
						: Math.min(action.discountValue, itemSubtotal) // Don't allow discount greater than subtotal
					
					return {
						...item,
						discountType: action.discountType,
						discountValue: action.discountValue,
						discountAmount
					}
				}
				return item
			})

			// Recalculate totals
			const discountItemTotals = itemsWithDiscount.reduce((acc, item) => {
				const itemSubtotal = item.price * item.quantity
				const itemDiscountAmount = item.discountAmount || 0
				const itemTotal = itemSubtotal - itemDiscountAmount
				return {
					subtotal: acc.subtotal + itemTotal,
					totalItemDiscount: acc.totalItemDiscount + itemDiscountAmount
				}
			}, { subtotal: 0, totalItemDiscount: 0 })

			const orderDiscount = state.currentOrder.orderDiscount || { type: 'fixed', value: 0, amount: 0 }
			const discountOrderAmount = orderDiscount.type === 'percentage'
				? discountItemTotals.subtotal * (orderDiscount.value / 100)
				: orderDiscount.value

			const discountFinalSubtotal = discountItemTotals.subtotal - discountOrderAmount
			const discountTax = (discountFinalSubtotal * 0.15) / (1 + 0.15)
			const discountTotal = discountFinalSubtotal + discountTax
			const discountTotalDiscount = discountItemTotals.totalItemDiscount + discountOrderAmount
			const itemDiscountPercentage = discountTotal > 0 ? (discountTotalDiscount / (discountTotal + discountTotalDiscount)) * 100 : 0

			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					items: itemsWithDiscount,
					subtotal: discountFinalSubtotal,
					tax: discountTax,
					total: discountTotal,
					totalItemDiscount: discountItemTotals.totalItemDiscount,
					totalDiscount: discountTotalDiscount,
					discountPercentage: itemDiscountPercentage,
					orderDiscount: {
						...state.currentOrder.orderDiscount,
						amount: discountOrderAmount
					},
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				}
			}

		case 'PICKER_SET_ORDER_DISCOUNT':
			// Recalculate item totals first
			const orderDiscItemTotals = state.currentOrder.items.reduce((acc, item) => {
				const itemSubtotal = item.price * item.quantity
				const itemDiscountAmount = item.discountAmount || 0
				const itemTotal = itemSubtotal - itemDiscountAmount
				return {
					subtotal: acc.subtotal + itemTotal,
					totalItemDiscount: acc.totalItemDiscount + itemDiscountAmount
				}
			}, { subtotal: 0, totalItemDiscount: 0 })

			const newOrderDiscountAmount = action.discountType === 'percentage'
				? orderDiscItemTotals.subtotal * (action.discountValue / 100)
				: Math.min(action.discountValue, orderDiscItemTotals.subtotal)

			const newFinalSubtotal = orderDiscItemTotals.subtotal - newOrderDiscountAmount
			const orderDiscountTax = (newFinalSubtotal * 0.15) / (1 + 0.15)
			const newOrderTotal = newFinalSubtotal + orderDiscountTax
			const newTotalDiscount = orderDiscItemTotals.totalItemDiscount + newOrderDiscountAmount
			const newDiscountPercentage = newOrderTotal > 0 ? (newTotalDiscount / (newOrderTotal + newTotalDiscount)) * 100 : 0

			return {
				...state,
				currentOrder: {
					...state.currentOrder,
					subtotal: newFinalSubtotal,
					tax: orderDiscountTax,
					total: newOrderTotal,
					totalDiscount: newTotalDiscount,
					discountPercentage: newDiscountPercentage,
					orderDiscount: {
						type: action.discountType,
						value: action.discountValue,
						amount: newOrderDiscountAmount
					},
					hasUnsavedChanges: true,
					updatedAt: new Date().toISOString()
				}
			}

		default:
			return state
	}
}

export default pickerReducer
