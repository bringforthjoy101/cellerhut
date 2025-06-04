import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// ** Get all Report
export const getAccountTransactions = ({ startDate, endDate }) => {
	return async (dispatch) => {
		const body = JSON.stringify({ startDate, endDate })
		const response = await apiRequest({ url: '/get-transactions', method: 'POST', body }, dispatch)
		if (response) {
			if (response.data.data && response.data.status) {

				await dispatch({
					type: 'GET_ALL_TRANSACTION_DATA',
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
export const getFilteredData = (transactions, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1, transactionType = null, status = null } = params

		/* eslint-disable  */
		const queryLowered = q.toLowerCase()
		const filteredData = transactions?.filter(
			(transaction) =>
				(transaction.reference.toLowerCase().includes(queryLowered) || transaction.narration.toLowerCase().includes(queryLowered) || transaction.transactionType.toLowerCase().includes(queryLowered)) && transaction.transactionType === (transactionType || transaction.transactionType)
		)
		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_TRANSACTION_DATA',
			data: transactions ? paginateArray(filteredData, perPage, page) : [],
			totalPages: filteredData?.length,
			params,
		})
	}
}

export const getFilteredRageData = (transactions, range, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1 } = params
		console.log('incoming length', transactions.length)
		const newTransactions = transactions.filter(({ createdAt }) => new Date(createdAt).getTime() >= range[0] && new Date(createdAt).getTime() <= range[1])
		console.log('outgoing length', newTransactions.length)

		/* eslint-enable  */
		dispatch({
			type: 'GET_FILTERED_TRANSACTION_DATA',
			data: paginateArray(newTransactions, perPage, page),
			totalPages: newTransactions.length,
			params,
		})
	}
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
