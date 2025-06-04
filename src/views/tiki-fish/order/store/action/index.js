import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data
export const getAllData = () => {
	return async (dispatch) => {
		const response = await apiRequest({ url: '/orders', method: 'GET' }, dispatch)
		console.log(response)
		if (response && response.data.data && response.data.status) {
			await dispatch({
				type: 'GET_ALL_ORDERS_DATA',
				data: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
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

// All Users Filtered Data
export const getFilteredData = (orders, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 100, page = 1 } = params

		/* eslint-disable  */
		const queryLowered = q?.toLowerCase()
		let filteredData = orders?.filter(
			(order) =>
				order?.orderNumber?.toLowerCase()?.includes(queryLowered) ||
				order?.student.firstName?.toLowerCase()?.includes(queryLowered) ||
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

export const getFilteredRageData = (orders, range, params) => {
	// const or = [
	// 	{ id: 683, orderNumber: '164ca075', amount: 240, createdAt: '2022-03-13T10:28:20.000Z' },
	// 	{ id: 682, orderNumber: '3526fdb4', amount: 350, createdAt: '2022-03-13T10:28:20.000Z' },
	// 	{ id: 681, orderNumber: '1c4a7825', amount: 270, createdAt: '2022-03-14T10:28:20.000Z' },
	// 	{ id: 680, orderNumber: '3801d8ad', amount: 440, createdAt: '2022-03-14T10:28:20.000Z' },
	// 	{ id: 679, orderNumber: '4357861', amount: 50, createdAt: '2022-03-01T10:28:20.000Z' },
	// 	{ id: 678, orderNumber: '1f316cac', amount: 310, createdAt: '2022-03-02T10:28:20.000Z' },
	// 	{ id: 677, orderNumber: '496e23f', amount: 310, createdAt: '2022-03-03T10:28:20.000Z' },
	// 	{ id: 676, orderNumber: '76a2661', amount: 150, createdAt: '2022-03-04T10:28:20.000Z' },
	// 	{ id: 675, orderNumber: '7f89629', amount: 500, createdAt: '2022-03-05T10:28:20.000Z' },
	// 	{ id: 674, orderNumber: '2fff0305', amount: 390, createdAt: '2022-03-06T10:28:20.000Z' },
	// ]
	// const ra = [1647126000000, 1647212400000]
	// console.log(or.filter(({ createdAt }) => new Date(createdAt).getTime() >= ra[0] && new Date(createdAt).getTime() <= ra[1]))
	// console.log(or.filter((d) => {
	//   const time = new Date(d.createdAt).getTime()
	//   return ra[0] < time && time < ra[1]
	// }))
	return async (dispatch) => {
		const { q = '', perPage = 100, page = 1 } = params
		// console.log(range)
		// orders.filter((d) => {
		// 	const time = new Date(d.createdAt).getTime()
		// 	return range[0] < time && time < range[1]
		// })
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
	// return orders.filter((d) => {
	// 	const time = new Date(d.createdAt).getTime()
	// 	return range[0] < time && time < range[1]
	// })
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
