import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// ** Get all Report
export const getSalesReport = ({ startDate, endDate }) => {
	return async (dispatch) => {
		const body = JSON.stringify({ startDate, endDate })
		const response = await apiRequest({ url: '/report', method: 'POST', body }, dispatch)
		if (response) {
			if (response.data.data && response.data.status) {

				await dispatch({
					type: 'GET_ALL_REPORT_DATA',
					data: response.data.data
				})
			} else {
				console.log(response.error)
			}
		} else {
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}

// ** Get filtered reports on page or row change
export const getFilteredData = (reports, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1, mode = null, status = null } = params

		/* eslint-disable  */
		const queryLowered = q.toLowerCase()
		const filteredData = reports?.filter(
			(report) =>
				report.orderNumber.toLowerCase().includes(queryLowered) && report.paymentMode === (mode || report.paymentMode) && report.status === (status || report.status)
		)
		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_REPORT_DATA',
			data: reports ? paginateArray(filteredData, perPage, page) : [],
			totalPages: filteredData?.length,
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
		const { q = '', perPage = 10, page = 1 } = params
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
			type: 'GET_FILTERED_REPORT_DATA',
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

// get Report Details
export const getReport = (id) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/reports/get-detail/${id}`, method: 'GET' }, dispatch)
		if (response) {
			if (response?.data?.data && response?.data?.status) {
				await dispatch({
					type: 'GET_REPORT',
					selectedReport: response.data.data,
				})
			} else {
				console.log(response.error)
			}
		} else {
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}
