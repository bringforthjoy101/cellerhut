import { apiRequest } from '@utils'

export const setLoading = (loading) => ({
	type: 'PICKER_SET_LOADING',
	loading,
})

export const setError = (error) => ({
	type: 'PICKER_SET_ERROR',
	error,
})

export const getCategories = () => async (dispatch) => {
	try {
		dispatch(setLoading(true))

		const response = await apiRequest({ url: '/categories', method: 'GET' }, dispatch)

		dispatch({
			type: 'PICKER_GET_CATEGORIES',
			categories: response.data.data || [],
		})

		dispatch(setLoading(false))
	} catch (error) {
		console.error('Error fetching categories:', error)
		dispatch(setError('Failed to fetch categories'))
	}
}

export const getProducts = () => async (dispatch) => {
	try {
		dispatch(setLoading(true))

		const response = await apiRequest({ url: '/products', method: 'GET' }, dispatch)

		dispatch({
			type: 'PICKER_GET_PRODUCTS',
			products: response.data.data || [],
		})

		dispatch(setLoading(false))
	} catch (error) {
		console.error('Error fetching products:', error)
		dispatch(setError('Failed to fetch products'))
	}
}

export const filterProducts = (category) => ({
	type: 'PICKER_FILTER_PRODUCTS',
	category,
})

export const addToOrder = (product) => ({
	type: 'PICKER_ADD_TO_ORDER',
	product,
})

export const removeFromOrder = (productId) => ({
	type: 'PICKER_REMOVE_FROM_ORDER',
	productId,
})

export const updateQuantity = (productId, quantity) => ({
	type: 'PICKER_UPDATE_QUANTITY',
	productId,
	quantity,
})

export const setPaymentMethod = (method) => ({
	type: 'PICKER_SET_PAYMENT_METHOD',
	method,
})

export const setCashCollected = (amount) => ({
	type: 'PICKER_SET_CASH_COLLECTED',
	amount,
})

export const showConfirmationModal = () => ({
	type: 'PICKER_SHOW_CONFIRMATION_MODAL',
})

export const hideConfirmationModal = () => ({
	type: 'PICKER_HIDE_CONFIRMATION_MODAL',
})

export const setPlacingOrder = (isPlacing) => ({
	type: 'PICKER_SET_PLACING_ORDER',
	isPlacing,
})

// Tab Management Actions
export const switchToOrder = (orderId) => ({
	type: 'PICKER_SWITCH_TO_ORDER',
	orderId,
})

export const createNewOrder = () => ({
	type: 'PICKER_CREATE_NEW_ORDER',
})

export const closeOrderTab = (tabId) => ({
	type: 'PICKER_CLOSE_ORDER_TAB',
	tabId,
})

export const duplicateOrder = (orderId) => ({
	type: 'PICKER_DUPLICATE_ORDER',
	orderId,
})

export const renameOrder = (orderId, newName) => ({
	type: 'PICKER_RENAME_ORDER',
	orderId,
	newName,
})

export const deleteHeldOrder = (orderId) => ({
	type: 'PICKER_DELETE_HELD_ORDER',
	orderId,
})

export const mergeOrders = (orderIds) => ({
	type: 'PICKER_MERGE_ORDERS',
	orderIds,
})

export const exportHeldOrders = (orders, format) => {
	// Handle export logic here - CSV or PDF
	const exportData = orders.map(order => ({
		id: order.id,
		name: order.customName || `Order ${order.id.slice(-4)}`,
		items: order.items?.length || 0,
		total: order.total,
		created: order.createdAt || order.heldAt,
		customer: order.customerName || 'N/A'
	}))
	
	if (format === 'csv') {
		// Convert to CSV
		const csv = [
			['Order ID', 'Name', 'Items', 'Total', 'Created', 'Customer'],
			...exportData.map(row => [
				row.id,
				row.name,
				row.items,
				row.total,
				row.created,
				row.customer
			])
		].map(row => row.join(',')).join('\n')
		
		// Download CSV
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `held_orders_${Date.now()}.csv`
		a.click()
		URL.revokeObjectURL(url)
	} else if (format === 'pdf') {
		// For PDF, we would use a library like jsPDF
		console.log('PDF export not yet implemented')
	}
	
	return { type: 'EXPORT_HELD_ORDERS_SUCCESS' }
}

export const markOrderChanged = () => ({
	type: 'PICKER_MARK_ORDER_CHANGED',
})

export const holdOrder = () => ({
	type: 'PICKER_HOLD_ORDER',
})

export const resumeOrder = (orderId) => ({
	type: 'PICKER_RESUME_ORDER',
	orderId,
})

export const clearOrder = () => ({
	type: 'PICKER_CLEAR_ORDER',
})

export const placeOrder = (orderData) => async (dispatch) => {
	try {
		dispatch(setPlacingOrder(true))

		// Map payment method values for backend
		const getBackendPaymentMode = (paymentMethod) => {
			switch (paymentMethod) {
				case 'card':
					return 'pos'
				case 'mobile':
					return 'transfer'
				case 'cash':
					return 'cash'
				default:
					return paymentMethod
			}
		}

		// Format order data to match checkout format
		const body = JSON.stringify({
			subTotal: orderData.subtotal,
			discount: orderData.discount || 0,
			amount: orderData.total,
			location: 'Shop',
			logistics: 0,
			paymentMode: getBackendPaymentMode(orderData.paymentMethod),
			products: orderData.items.map((item) => ({
				id: item.id,
				name: item.name,
				price: item.price,
				qty: item.quantity,
				amount: item.price * item.quantity,
			})),
			// Add fields for held orders
			heldOrderId: orderData.heldOrderId || null,
			isHeldOrder: Boolean(orderData.heldOrderId),
			salesTax: orderData.tax || 0,
			// Add cash handling fields
			cashCollected: orderData.cashCollected || null,
			changeAmount: orderData.changeAmount || null,
		})

		const response = await apiRequest({ url: '/orders/create?completeOrder=true', method: 'POST', body }, dispatch)

		if (response.data.status) {
			dispatch({
				type: 'PICKER_PLACE_ORDER',
			})

			dispatch(hideConfirmationModal())
			dispatch(setPlacingOrder(false))

			return {
				success: true,
				orderId: response.data.data,
				message: response.data.message,
			}
		} else {
			throw new Error(response.data.message || 'Failed to place order')
		}
	} catch (error) {
		console.error('Error placing order:', error)
		dispatch(setError('Failed to place order'))
		dispatch(setPlacingOrder(false))
		return { success: false, error: error.response?.data?.message || error.message }
	}
}
