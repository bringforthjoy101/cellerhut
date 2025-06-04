import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data
export const getAllData = (role) => {
	return async (dispatch) => {
		const url = '/wallets'
		const response = await apiRequest({ url, method: 'GET' }, dispatch)
		if (response && response.data.data && response.data.status) {
			await dispatch({
				type: 'GET_ALL_DATA',
				data: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
		}
	}
}

// All Users Filtered Data
export const getFilteredData = (wallets, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, number = '', page = 1, status = null } = params

		/* eslint-disable  */
		const queryLowered = q.toLowerCase()
		const filteredData = wallets.filter(wallet => wallet.name.toLowerCase().includes(queryLowered))

		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_WALLET_DATA',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// get user details
export const getWalletDetails = (id) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/wallets/get-detail/${id}`, method: 'GET' }, dispatch)
		// console.log(response)
		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_WALLET_DETAILS',
				walletDetails: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
		}
	}
}

export const editWallet = (walletId, walletData) => {
	return async (dispatch) => {
		const body = JSON.stringify(walletData)
		const response = await apiRequest({ url: `/wallets/update/${customerId}`, method: 'POST', body }, dispatch)
		if (response) {
			if (response.data.status) {
				swal('Good!', `${response.data.message}.`, 'success')
				dispatch(getAllData())
			} else {
				swal('Oops!', `${response.data.message}.`, 'error')
			}
		} else {
			console.log(response)
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}

// Delete Customer
export const deleteWallet = (walletId) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/wallets/delete/${walletId}`, method: 'GET' }, dispatch)
		if (response && response.data.status) {
			return response.data
		} else {
			console.log(response)
			swal('Oops!', response.data.message, 'error')
		}
	}
}


// Filtered Utility Transactions
export const getFilteredCustomerOrders = (orders, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1 } = params
		/* eslint-enable */

		const queryLowered = q.toLowerCase()
		const filteredData = orders.filter(
			(order) => order.orderNumber.toLowerCase().includes(queryLowered) || moment(order.createdAt).format('lll').toLowerCase().includes(queryLowered)
		)
		/* eslint-enable  */
		await dispatch({
			type: 'GET_CUSTOMER_ORDERS',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// Filtered Books
export const getFilteredCustomerBooks = (books, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1 } = params
		/* eslint-enable */

		const queryLowered = q.toLowerCase()
		const filteredData = books.filter((book) => book.name.toLowerCase().includes(queryLowered))
		/* eslint-enable  */
		await dispatch({
			type: 'GET_CUSTOMER_ORDERS',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// update customer status
export const updateCustomerStatus = (customerId, status) => {
	return async (dispatch) => {
		const body = JSON.stringify({ status })
		const response = await apiRequest({ url: `/customers/update/${customerId}`, method: 'POST', body }, dispatch)
		if (response) {
			console.log(response)
			if (response.data.status) {
				await dispatch(getAllData())
				await dispatch(getCustomerDetails(customerId))
				swal('Good!', `${response.data.message}.`, 'success')
			} else {
				swal('Oops!', `${response.data.message}.`, 'error')
			}
		} else {
			swal('Oops!', 'Something went wrong with your network.', 'error')
		}
	}
}

// deactivate User account
export const deactivateUser = (users, id) => {
	const user = users.find((i) => i.user_id === id)
	return async (dispatch) => {
		const response = await apiRequest({ url: `/admin/users/deactivate/${user.user_id}`, method: 'GET' }, dispatch)
		if (response) {
			if (response.data.success) {
				dispatch({
					type: 'GET_USER',
					selectedUser: { ...user, status: 'Inactive' },
				})
				swal('Good!', `${response.data.message}.`, 'success')
				dispatch(getAllData())
			} else {
				swal('Oops!', `${response.data.message}.`, 'error')
			}
		} else {
			swal('Oops!', 'Something went wrong with your network.', 'error')
		}
	}
}

//  Fund Wallet
export const fundWallet = (walletId, amount, narration) => {
	return async (dispatch) => {
		const body = JSON.stringify({ amount, narration })
		const response = await apiRequest({ url: `/wallets/fund/${walletId}`, method: 'POST', body }, dispatch)
		if (response && response.data.success) {
			swal('Good!', `Wallet Sucessfully.`, 'success')
		} else {
			console.log(response)
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}
