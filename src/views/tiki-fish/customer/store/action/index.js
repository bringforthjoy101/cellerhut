import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data
export const getAllData = (role) => {
	return async (dispatch) => {
		const url = role === 'store' ? '/customers/kitchen' : '/customers'
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
export const getFilteredData = (customers, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, number = '', page = 1, status = null } = params

		/* eslint-disable  */
		const queryLowered = q.toLowerCase()
		const filteredData = customers.filter(
			(customer) =>
				(customer.fullName.toLowerCase().includes(queryLowered) ||
					customer.phone?.toString().toLowerCase().includes(queryLowered) ||
					customer.location.toLowerCase().includes(queryLowered)) &&
				customer.status === (status || customer.status)
		)

		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_CUSTOMER_DATA',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// get user details
export const getCustomerDetails = (id) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/customers/get-detail/${id}`, method: 'GET' }, dispatch)
		// console.log(response)
		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_CUSTOMER_DETAILS',
				customerDetails: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
		}
	}
}

export const editCustomer = (customerId, customerData) => {
	return async (dispatch) => {
		const body = JSON.stringify(customerData)
		const response = await apiRequest({ url: `/customers/update/${customerId}`, method: 'POST', body }, dispatch)
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
export const deleteCustomer = (customerId) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/customers/delete/${customerId}`, method: 'GET' }, dispatch)
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

//  Reset User Password
export const passwordReset = ({ user_id }) => {
	return async (dispatch) => {
		const body = JSON.stringify({ user_id })
		const response = await apiRequest({ url: `/admin/users/reset/`, method: 'POST', body }, dispatch)
		if (response && response.data.success) {
			swal('Good!', `User password reset Sucessfully.`, 'success')
		} else {
			console.log(response)
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}
