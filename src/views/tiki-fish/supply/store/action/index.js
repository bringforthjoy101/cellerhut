import { apiRequest, swal } from '@utils'

// ** Get all Supplies
export const getAllData = () => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: '/supplies'
			})
			if (response?.data?.status && response?.data?.data) {
				dispatch({
					type: 'GET_ALL_SUPPLIES_DATA',
					data: response.data.data
				})
			}
		} catch (error) {
			console.error('Error fetching all supplies:', error)
			swal('Oops!', 'Failed to fetch supplies', 'error')
		}
	}
}

// ** Get filtered Supplies data
export const getFilteredData = (params) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: '/supplies',
				params
			})
			if (response?.data?.status && response?.data?.data) {
				dispatch({
					type: 'GET_FILTERED_SUPPLIES_DATA',
					data: response.data.data,
					totalPages: response.data.totalPages || response.data.data.length,
					params
				})
			}
		} catch (error) {
			console.error('Error fetching filtered supplies:', error)
		}
	}
}

// ** Get Supply by ID
export const getSupply = (id) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: `/supplies/get-detail/${id}`
			})
			if (response?.data?.status && response?.data?.data) {
				dispatch({
					type: 'GET_A_SUPPLY',
					selectedSupply: response.data.data
				})
			}
		} catch (error) {
			console.error('Error fetching supply:', error)
			swal('Oops!', 'Failed to fetch supply details', 'error')
		}
	}
}

// ** Create Supply
export const createSupply = (supply) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				url: '/supplies/create',
				body: JSON.stringify(supply)
			})
			if (response?.data?.status) {
				dispatch({
					type: 'CREATE_SUPPLY',
					data: response.data.data
				})
				swal('Success!', response.data.message || 'Supply created successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to create supply')
			}
		} catch (error) {
			console.error('Error creating supply:', error)
			swal('Oops!', error.message || 'Failed to create supply', 'error')
			throw error
		}
	}
}

// ** Update Supply
export const updateSupply = (id, supply) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				url: `/supplies/update/${id}`,
				body: JSON.stringify(supply)
			})
			if (response?.data?.status) {
				dispatch({
					type: 'UPDATE_SUPPLY',
					data: response.data.data
				})
				swal('Success!', response.data.message || 'Supply updated successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to update supply')
			}
		} catch (error) {
			console.error('Error updating supply:', error)
			swal('Oops!', error.message || 'Failed to update supply', 'error')
			throw error
		}
	}
}

// ** Approve Supply
export const approveSupply = (id) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				url: `/supplies/${id}/approve`,
				body: JSON.stringify({})
			})
			if (response?.data?.status) {
				dispatch({
					type: 'APPROVE_SUPPLY',
					data: response.data.data
				})
				dispatch(getAllData())
				swal('Success!', 'Supply approved successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to approve supply')
			}
		} catch (error) {
			console.error('Error approving supply:', error)
			swal('Oops!', error.message || 'Failed to approve supply', 'error')
			throw error
		}
	}
}

// ** Reject Supply
export const rejectSupply = (id, notes) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				url: `/supplies/${id}/reject`,
				body: JSON.stringify({ notes })
			})
			if (response?.data?.status) {
				dispatch({
					type: 'REJECT_SUPPLY',
					data: response.data.data
				})
				dispatch(getAllData())
				swal('Success!', 'Supply rejected successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to reject supply')
			}
		} catch (error) {
			console.error('Error rejecting supply:', error)
			swal('Oops!', error.message || 'Failed to reject supply', 'error')
			throw error
		}
	}
}

// ** Pay Supply
export const paySupply = (id, paymentData) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				url: `/supplies/pay/${id}`,
				body: JSON.stringify(paymentData)
			})
			if (response?.data?.status) {
				dispatch({
					type: 'PAY_SUPPLY',
					data: response.data.data
				})
				dispatch(getAllData())
				swal('Success!', 'Payment recorded successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to record payment')
			}
		} catch (error) {
			console.error('Error recording payment:', error)
			swal('Oops!', error.message || 'Failed to record payment', 'error')
			throw error
		}
	}
}

// ** Delete Supply
export const deleteSupply = (id) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: `/supplies/delete/${id}`
			})
			if (response?.data?.status) {
				dispatch({
					type: 'DELETE_SUPPLY',
					id
				})
				dispatch(getAllData())
				swal('Success!', 'Supply deleted successfully', 'success')
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to delete supply')
			}
		} catch (error) {
			console.error('Error deleting supply:', error)
			swal('Oops!', error.message || 'Failed to delete supply', 'error')
			throw error
		}
	}
}

// ** Get Supply Payments
export const getSupplyPayments = (id) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: `/supplies/payments/${id}`
			})
			if (response?.data?.status) {
				dispatch({
					type: 'GET_SUPPLY_PAYMENTS',
					data: response.data.data
				})
				return response.data
			}
		} catch (error) {
			console.error('Error fetching supply payments:', error)
			throw error
		}
	}
}

// ** Delete Supply Payment
export const deleteSupplyPayment = (supplyId, paymentId) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'DELETE',
				url: `/supplies/${supplyId}/payments/${paymentId}`
			})
			if (response?.data?.status) {
				dispatch({
					type: 'DELETE_SUPPLY_PAYMENT',
					data: { supplyId, paymentId }
				})
				// Refresh supply data to update payment status
				dispatch(getSupply(supplyId))
				return response.data
			} else {
				throw new Error(response?.data?.message || 'Failed to delete payment')
			}
		} catch (error) {
			console.error('Error deleting payment:', error)
			throw error
		}
	}
}

// ** Get Supplies Summary
export const getSuppliesSummary = (params) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				url: '/supplies/summary',
				params
			})
			if (response?.data?.status) {
				dispatch({
					type: 'GET_SUPPLIES_SUMMARY',
					data: response.data.data
				})
				return response.data
			}
		} catch (error) {
			console.error('Error fetching supplies summary:', error)
			throw error
		}
	}
}