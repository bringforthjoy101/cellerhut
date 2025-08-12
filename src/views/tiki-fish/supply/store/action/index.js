import { apiRequest } from '@utils'

// ** Get all Supplies
export const getAllData = () => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				path: '/supplies',
			})
			dispatch({
				type: 'GET_ALL_SUPPLIES_DATA',
				data: response.data,
			})
		} catch (error) {
			console.error('Error fetching all supplies:', error)
		}
	}
}

// ** Get filtered Supplies data
export const getFilteredData = (params) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'GET',
				path: '/supplies',
				params,
			})
			dispatch({
				type: 'GET_FILTERED_SUPPLIES_DATA',
				data: response.data.supplies,
				totalPages: response.data.totalPages,
				params,
			})
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
				path: `/supplies/${id}`,
			})
			dispatch({
				type: 'GET_A_SUPPLY',
				selectedSupply: response.data,
			})
		} catch (error) {
			console.error('Error fetching supply:', error)
		}
	}
}

// ** Create Supply
export const createSupply = (supply) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				path: '/supplies',
				data: supply,
			})
			dispatch({
				type: 'CREATE_SUPPLY',
				data: response.data,
			})
			return response
		} catch (error) {
			console.error('Error creating supply:', error)
			throw error
		}
	}
}

// ** Update Supply
export const updateSupply = (id, supply) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'PUT',
				path: `/supplies/${id}`,
				data: supply,
			})
			dispatch({
				type: 'UPDATE_SUPPLY',
				data: response.data,
			})
			return response
		} catch (error) {
			console.error('Error updating supply:', error)
			throw error
		}
	}
}

// ** Delete Supply
export const deleteSupply = (id) => {
	return async (dispatch) => {
		try {
			await apiRequest({
				method: 'DELETE',
				path: `/supplies/${id}`,
			})
			dispatch({
				type: 'DELETE_SUPPLY',
				id,
			})
		} catch (error) {
			console.error('Error deleting supply:', error)
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
				path: `/supplies/${id}/approve`,
			})
			dispatch({
				type: 'APPROVE_SUPPLY',
				data: response.data,
			})
			return response
		} catch (error) {
			console.error('Error approving supply:', error)
			throw error
		}
	}
}

// ** Reject Supply
export const rejectSupply = (id) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({
				method: 'POST',
				path: `/supplies/${id}/reject`,
			})
			dispatch({
				type: 'REJECT_SUPPLY',
				data: response.data,
			})
			return response
		} catch (error) {
			console.error('Error rejecting supply:', error)
			throw error
		}
	}
}
