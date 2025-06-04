import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data
export const getAllData = (role) => {
	return async (dispatch) => {
		const url = '/investments/packages'
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
export const getFilteredData = (packages, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1, status = '' } = params

		/* eslint-disable  */
		const queryLowered = q?.toLowerCase() || ''
		const filteredData = packages.filter(
			(investmentPackage) =>
				(investmentPackage?.name || '').toLowerCase().includes(queryLowered) &&
				(status ? investmentPackage?.status === status : true)
		)
		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_DATA',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// get user details
export const getInvestmentPackageDetails = (id) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/investments/packages/get-detail/${id}`, method: 'GET' }, dispatch)
		// console.log(response)
		if (response && response.data && response.data.status) {
			await dispatch({
				type: 'GET_INVESTMENT_PACKAGE_DETAILS',
				investmentPackageDetails: response.data.data,
			})
		} else {
			console.log(response)
			swal('Oops!', 'Something went wrong.', 'error')
		}
	}
}

export const editInvestmentPackage = (investmentPackageId, investmentPackageData) => {
	return async (dispatch) => {
		const body = JSON.stringify(investmentPackageData)
		const response = await apiRequest({ url: `/investments/packages/update/${investmentPackageId}`, method: 'POST', body }, dispatch)
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
export const deleteInvestmentPackage = (investmentPackageId) => {
	return async (dispatch) => {
		const response = await apiRequest({ url: `/investments/packages/delete/${investmentPackageId}`, method: 'GET' }, dispatch)
		if (response && response.data.status) {
			return response.data
		} else {
			console.log(response)
			swal('Oops!', response.data.message, 'error')
		}
	}
}


// Filtered Utility Transactions
export const getFilteredInvestmentPackageSubscription = (subscriptions, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1 } = params
		/* eslint-enable */

		const queryLowered = q.toLowerCase()
		const filteredData = subscriptions.filter(
			(subscription) => subscription.status.toLowerCase().includes(queryLowered) || moment(subscription.createdAt).format('lll').toLowerCase().includes(queryLowered)
		)
		/* eslint-enable  */
		await dispatch({
			type: 'GET_INVESTMENT_PACKAGE_SUBSCRIPTIONS',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// update investment package status
export const updateInvestmentPackageStatus = (investmentPackageId, status) => {
	return async (dispatch) => {
		const body = JSON.stringify({ status })
		const response = await apiRequest({ url: `/investments/packages/update/${investmentPackageId}`, method: 'POST', body }, dispatch)
		if (response) {
			console.log(response)
			if (response.data.status) {
				await dispatch(getAllData())
				await dispatch(getInvestmentPackageDetails(investmentPackageId))
				swal('Good!', `${response.data.message}.`, 'success')
			} else {
				swal('Oops!', `${response.data.message}.`, 'error')
			}
		} else {
			swal('Oops!', 'Something went wrong with your network.', 'error')
		}
	}
}

// deactivate investment package
export const deactivateInvestmentPackage = (investmentPackages, id) => {
	const investmentPackage = investmentPackages.find((i) => i.investmentPackage_id === id)
	return async (dispatch) => {
		const response = await apiRequest({ url: `/investments/packages/deactivate/${investmentPackage.investmentPackage_id}`, method: 'GET' }, dispatch)
		if (response) {
			if (response.data.success) {
				dispatch({
					type: 'GET_INVESTMENT_PACKAGE',
					selectedInvestmentPackage: { ...investmentPackage, status: 'Inactive' },
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

//  Create Investment Package Subscription
export const createInvestmentPackage = (data) => {
	return async (dispatch) => {
		const body = JSON.stringify(data)
		const response = await apiRequest({ url: `/investments/packages/create`, method: 'POST', body }, dispatch)
		if (response && response.data.status) {
			swal('Good!', `Investment Package created Sucessfully.`, 'success')
			dispatch(getAllData())
		} else {
			console.log(response)
			swal('Oops!', response.data.message || 'Somthing went wrong with your network.', 'error')
		}
	}
}

// create new investment package subscription
export const createInvestmentPackageSubscription = (data) => {
	return async (dispatch) => {
		const body = JSON.stringify(data)
		const response = await apiRequest({ url: `/investments/subscriptions/create`, method: 'POST', body }, dispatch)
		if (response && response.data.status) {
			swal('Good!', response.data.message, 'success')
			dispatch(getAllData())
		} else {
			console.log(response)
			swal('Oops!', response.data.message || 'Somthing went wrong with your network.', 'error')
		}
	}
}
