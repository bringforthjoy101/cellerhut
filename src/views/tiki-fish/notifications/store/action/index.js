import { apiRequest, swal } from '@utils'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all broadcast messages
export const getAllBroadcasts = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: true })

		const { page = 1, limit = 20 } = params
		const url = `/notifications/broadcasts?page=${page}&limit=${limit}`

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_ALL_BROADCASTS',
				data: response.data.data.broadcasts,
				pagination: response.data.data.pagination,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load broadcast messages.', 'error')
			dispatch({ type: 'SET_NOTIFICATIONS_ERROR', error: 'Failed to load broadcasts' })
		}

		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
	}
}

// ** Get single broadcast by ID
export const getBroadcastById = (id) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: true })

		const response = await apiRequest({ url: `/notifications/broadcasts/${id}`, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_BROADCAST_DETAILS',
				broadcast: response.data.data.broadcast,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load broadcast details.', 'error')
			dispatch({ type: 'SET_NOTIFICATIONS_ERROR', error: 'Failed to load broadcast' })
		}

		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
	}
}

// ** Send broadcast message
export const sendBroadcast = (broadcastData) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: true })

		const body = JSON.stringify(broadcastData)
		const response = await apiRequest({ url: '/notifications/broadcast', method: 'POST', body }, dispatch)

		if (response && response.data && response.data.status) {
			swal('Success!', response.data.message || 'Broadcast message is being sent.', 'success')
			await dispatch({
				type: 'SEND_BROADCAST_SUCCESS',
				broadcast: response.data.data,
			})
			// Refresh broadcast list
			await dispatch(getAllBroadcasts())
			dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
			return { success: true, data: response.data.data }
		} else {
			const errorMsg = response?.data?.message || 'Failed to send broadcast message.'
			swal('Oops!', errorMsg, 'error')
			dispatch({ type: 'SET_NOTIFICATIONS_ERROR', error: errorMsg })
			dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
			return { success: false, error: errorMsg }
		}
	}
}

// ** Get notification logs with filters
export const getNotificationLogs = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: true })

		const { page = 1, limit = 50, customer_id = '', type = '', status = '' } = params

		// Build query string
		let url = `/notifications/logs?page=${page}&limit=${limit}`
		if (customer_id) url += `&customer_id=${customer_id}`
		if (type) url += `&type=${type}`
		if (status) url += `&status=${status}`

		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_NOTIFICATION_LOGS',
				data: response.data.data.logs,
				pagination: response.data.data.pagination,
				params,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load notification logs.', 'error')
			dispatch({ type: 'SET_NOTIFICATIONS_ERROR', error: 'Failed to load logs' })
		}

		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
	}
}

// ** Get notification statistics
export const getNotificationStats = () => {
	return async (dispatch) => {
		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: true })

		const response = await apiRequest({ url: '/notifications/stats', method: 'GET' }, dispatch)

		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_NOTIFICATION_STATS',
				stats: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Failed to load notification statistics.', 'error')
			dispatch({ type: 'SET_NOTIFICATIONS_ERROR', error: 'Failed to load stats' })
		}

		dispatch({ type: 'SET_NOTIFICATIONS_LOADING', loading: false })
	}
}

// ** Clear notification error
export const clearNotificationError = () => {
	return async (dispatch) => {
		dispatch({ type: 'CLEAR_NOTIFICATION_ERROR' })
	}
}

// ** Reset notification state
export const resetNotificationState = () => {
	return async (dispatch) => {
		dispatch({ type: 'RESET_NOTIFICATION_STATE' })
	}
}
