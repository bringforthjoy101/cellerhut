import { apiRequest, swal } from '@utils'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all payment transactions with filters
export const getAllTransactions = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const {
			page = 1,
			limit = 20,
			status,
			gateway,
			orderId,
			customerId,
			startDate,
			endDate,
			search,
			sortBy = 'createdAt',
			sortOrder = 'DESC',
		} = params

		// Build query string
		let url = `/payments/transactions?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
		if (status) url += `&status=${status}`
		if (gateway) url += `&gateway=${gateway}`
		if (orderId) url += `&orderId=${orderId}`
		if (customerId) url += `&customerId=${customerId}`
		if (startDate) url += `&startDate=${startDate}`
		if (endDate) url += `&endDate=${endDate}`
		if (search) url += `&search=${encodeURIComponent(search)}`

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_ALL_TRANSACTIONS',
				data: response.data.data.data,
				pagination: response.data.data.pagination,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load payment transactions.', 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: 'Failed to load transactions' })
		}

		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
	}
}

// ** Get transaction detail with logs and webhooks
export const getTransactionDetail = (id) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const response = await apiRequest({ url: `/payments/transactions/${id}`, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_TRANSACTION_DETAIL',
				transaction: response.data.data.transaction,
				webhooks: response.data.data.webhooks,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load transaction details.', 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: 'Failed to load transaction details' })
		}

		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
	}
}

// ** Get payment logs
export const getPaymentLogs = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const {
			page = 1,
			limit = 50,
			transactionId,
			status,
			action,
			event,
			startDate,
			endDate,
		} = params

		let url = `/payments/logs?page=${page}&limit=${limit}`
		if (transactionId) url += `&transactionId=${transactionId}`
		if (status) url += `&status=${status}`
		if (action) url += `&action=${action}`
		if (event) url += `&event=${event}`
		if (startDate) url += `&startDate=${startDate}`
		if (endDate) url += `&endDate=${endDate}`

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_PAYMENT_LOGS',
				data: response.data.data.data,
				pagination: response.data.data.pagination,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load payment logs.', 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: 'Failed to load logs' })
		}

		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
	}
}

// ** Get payment webhooks
export const getPaymentWebhooks = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const {
			page = 1,
			limit = 50,
			gateway,
			verified,
			event,
			transactionId,
			startDate,
			endDate,
		} = params

		let url = `/payments/webhooks?page=${page}&limit=${limit}`
		if (gateway) url += `&gateway=${gateway}`
		if (verified !== undefined) url += `&verified=${verified}`
		if (event) url += `&event=${event}`
		if (transactionId) url += `&transactionId=${transactionId}`
		if (startDate) url += `&startDate=${startDate}`
		if (endDate) url += `&endDate=${endDate}`

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_WEBHOOKS',
				data: response.data.data.data,
				pagination: response.data.data.pagination,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load webhooks.', 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: 'Failed to load webhooks' })
		}

		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
	}
}

// ** Assign payment to order
export const assignPaymentToOrder = (transactionId, orderId) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const body = JSON.stringify({ orderId })
		const response = await apiRequest(
			{ url: `/payments/transactions/${transactionId}/assign-order`, method: 'POST', body },
			dispatch
		)

		if (response && response.data && response.data.status) {
			swal('Success!', response.data.message || 'Payment assigned to order successfully.', 'success')
			// Refresh transaction details
			await dispatch(getTransactionDetail(transactionId))
			dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
			return { success: true, data: response.data.data }
		} else {
			const errorMsg = response?.data?.message || 'Failed to assign payment to order.'
			swal('Oops!', errorMsg, 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: errorMsg })
			dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
			return { success: false, error: errorMsg }
		}
	}
}

// ** Get payment statistics
export const getPaymentStats = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: true })

		const { startDate, endDate } = params

		let url = '/payments/stats'
		if (startDate || endDate) {
			const queryParams = []
			if (startDate) queryParams.push(`startDate=${startDate}`)
			if (endDate) queryParams.push(`endDate=${endDate}`)
			url += `?${queryParams.join('&')}`
		}

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_PAYMENT_STATS',
				stats: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load payment statistics.', 'error')
			dispatch({ type: 'SET_PAYMENTS_ERROR', error: 'Failed to load stats' })
		}

		dispatch({ type: 'SET_PAYMENTS_LOADING', loading: false })
	}
}

// ** Clear transaction detail
export const clearTransactionDetail = () => {
	return (dispatch) => {
		dispatch({ type: 'CLEAR_TRANSACTION_DETAIL' })
	}
}

// ** Clear error
export const clearPaymentError = () => {
	return (dispatch) => {
		dispatch({ type: 'CLEAR_PAYMENT_ERROR' })
	}
}

// ** Reset payment state
export const resetPaymentState = () => {
	return (dispatch) => {
		dispatch({ type: 'RESET_PAYMENT_STATE' })
	}
}
