import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data with server-side pagination and filtering
export const getAllData = (params = {}) => {
	return async (dispatch) => {
		const {
			page = 1,
			limit = 25,
			status = '',
			paymentMethod = '',
			search = '',
			startDate = '',
			endDate = '',
			sortBy = 'id',
			sortOrder = 'DESC'
		} = params

		// Build query string
		const queryParams = new URLSearchParams()
		if (page) queryParams.append('page', page)
		if (limit) queryParams.append('limit', limit)
		if (status) queryParams.append('status', status)
		if (paymentMethod) queryParams.append('paymentMethod', paymentMethod)
		if (search) queryParams.append('search', search)
		if (startDate) queryParams.append('startDate', startDate)
		if (endDate) queryParams.append('endDate', endDate)
		if (sortBy) queryParams.append('sortBy', sortBy)
		if (sortOrder) queryParams.append('sortOrder', sortOrder)

		const url = `/orders?${queryParams.toString()}`
		const response = await apiRequest({ url, method: 'GET' }, dispatch)

		console.log('Orders API Response:', response)

		if (response && response.data.data && response.data.status) {
			const { data, pagination } = response.data.data

			await dispatch({
				type: 'GET_ALL_ORDERS_DATA',
				data,
				pagination,
				params
			})
		} else {
			console.log('Error fetching orders:', response)
			swal('Oops!', 'Failed to fetch orders.', 'error')
		}
	}
}

export const completeOrder = (orderId) => {
	return async dispatch => {
	  const response = await apiRequest({url:`/orders/complete/${orderId}`, method:'GET'}, dispatch)
	  if (response && response.data.status) {
		  return response.data
	  } else {
		console.log(response)
		swal('Oops!', 'Something went wrong.', 'error')
	  }
	}
}

export const nullifyOrder = (orderId) => {
	return async dispatch => {
	  const response = await apiRequest({url:`/orders/nullify/${orderId}`, method:'GET'}, dispatch)
	  if (response && response.data.status) {
		  return response.data
	  } else {
		console.log(response)
		swal('Oops!', 'Something went wrong.', 'error')
	  }
	}
}

// ** DEPRECATED: Client-side filtering - Use getAllData() with params instead
// Kept for backward compatibility but should migrate to server-side filtering
export const getFilteredData = (orders, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 25, page = 1 } = params

		/* eslint-disable  */
		const queryLowered = q?.toLowerCase()
		let filteredData = orders?.filter(
			(order) =>
				order?.orderNumber?.toLowerCase()?.includes(queryLowered) ||
				order?.customer?.firstName?.toLowerCase()?.includes(queryLowered) ||
				order?.customer?.lastName?.toLowerCase()?.includes(queryLowered) ||
				order?.customer?.name?.toLowerCase()?.includes(queryLowered) ||
				moment(order.createdAt).format('lll').includes(q)
		)

		/* eslint-enable  */
		dispatch({
			type: 'GET_FILTERED_ORDER_DATA',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// ** DEPRECATED: Client-side date filtering - Use getAllData() with startDate/endDate params instead
// Kept for backward compatibility but should migrate to server-side filtering
export const getFilteredRageData = (orders, range, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 25, page = 1 } = params

		console.log('incoming length', orders.length)
		const newOrders = orders.filter(({ createdAt }) => new Date(createdAt).getTime() >= range[0] && new Date(createdAt).getTime() <= range[1])
		console.log('outgoing length', newOrders.length)

		/* eslint-enable  */
		dispatch({
			type: 'GET_FILTERED_ORDER_DATA',
			data: paginateArray(newOrders, perPage, page),
			totalPages: newOrders.length,
			params,
		})
	}
}

//  Get User
export const getOrder = (id) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/orders/get-detail/${id}`, method: 'GET' }, dispatch)
		if (response && response.data.data && response.data.status) {
			await dispatch({
				type: 'GET_ORDER',
				selectedOrder: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
		}
	}
}

// Get Order Tracking
export const getOrderTracking = (orderId) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/orders/${orderId}/tracking`, method: 'GET' }, dispatch)
		if (response && response.data.data && response.data.status) {
			// Transform coordinates from Cellerhut format (latitude/longitude) to frontend format (lat/lng)
			const trackingData = response.data.data

			// Transform driver location
			if (trackingData.driver?.currentLocation) {
				trackingData.driver.location = [
					trackingData.driver.currentLocation.latitude,
					trackingData.driver.currentLocation.longitude
				]
			}

			// Transform delivery location
			if (trackingData.delivery?.location) {
				trackingData.delivery.location = [
					trackingData.delivery.location.latitude,
					trackingData.delivery.location.longitude
				]
			}

			// Transform timeline locations
			if (trackingData.timeline && Array.isArray(trackingData.timeline)) {
				trackingData.timeline = trackingData.timeline.map(event => {
					if (event.location) {
						return {
							...event,
							location: [event.location.latitude, event.location.longitude]
						}
					}
					return event
				})
			}

			return trackingData
		} else {
			console.log(response)
			return null
		}
	}
}
