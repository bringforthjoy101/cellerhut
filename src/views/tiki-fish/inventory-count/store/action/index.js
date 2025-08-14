import { apiRequest } from '@utils'
import {
	GET_COUNTS,
	GET_COUNT_DETAIL,
	CREATE_COUNT,
	UPDATE_COUNT_STATUS,
	RECORD_COUNT,
	BULK_RECORD_COUNTS,
	GET_VARIANCE_REPORT,
	APPROVE_COUNT,
	CANCEL_COUNT,
	GET_COUNT_ANALYTICS,
	SET_LOADING,
	SET_ERROR,
	CLEAR_ERROR
} from '../actionTypes'

// Get all counts with filters
export const getCounts = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: '/inventory/counts',
				method: 'GET',
				params
			})
			
			if (response.data.status) {
				dispatch({
					type: GET_COUNTS,
					payload: response.data.data
				})
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Get single count detail
export const getCountDetail = (id) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${id}`,
				method: 'GET'
			})
			
			if (response.data.status) {
				dispatch({
					type: GET_COUNT_DETAIL,
					payload: response.data.data
				})
				return response.data.data
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Create new count
export const createCount = (data) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: '/inventory/counts/create',
				method: 'POST',
				body: JSON.stringify(data)
			})
			
			if (response.data.status) {
				dispatch({
					type: CREATE_COUNT,
					payload: response.data.data
				})
				return response.data.data
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Update count status
export const updateCountStatus = (id, status, notes = '') => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${id}/status`,
				method: 'PUT',
				body: JSON.stringify({ status, notes })
			})
			
			if (response.data.status) {
				dispatch({
					type: UPDATE_COUNT_STATUS,
					payload: response.data.data
				})
				return true
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Record count for single item
export const recordCount = (countId, itemId, data) => {
	return async (dispatch) => {
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${countId}/items/${itemId}`,
				method: 'PUT',
				body: JSON.stringify(data)
			})
			
			if (response.data.status) {
				dispatch({
					type: RECORD_COUNT,
					payload: response.data.data
				})
				return response.data.data
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		}
	}
}

// Bulk record counts
export const bulkRecordCounts = (countId, items) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${countId}/items/bulk`,
				method: 'POST',
				body: JSON.stringify({ items })
			})
			
			if (response.data.status) {
				dispatch({
					type: BULK_RECORD_COUNTS,
					payload: response.data.data
				})
				return true
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Get variance report
export const getVarianceReport = (id) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${id}/variances`,
				method: 'GET'
			})
			
			if (response.data.status) {
				dispatch({
					type: GET_VARIANCE_REPORT,
					payload: response.data.data
				})
				return response.data.data
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Approve count
export const approveCount = (id, options = {}) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			// Handle both old string format and new object format
			let approvalNotes = ''
			let createAdjustments = true
			
			if (typeof options === 'string') {
				// Legacy string format
				approvalNotes = options
				createAdjustments = arguments[2] !== undefined ? arguments[2] : true
			} else {
				// New object format
				approvalNotes = options.notes || ''
				createAdjustments = options.createAdjustments !== undefined ? options.createAdjustments : true
			}
			
			const response = await apiRequest({ 
				url: `/inventory/counts/${id}/approve`,
				method: 'POST',
				body: JSON.stringify({ approvalNotes, createAdjustments })
			})
			
			if (response.data.status) {
				dispatch({
					type: APPROVE_COUNT,
					payload: response.data.data
				})
				return true
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Cancel count
export const cancelCount = (id, reason = '') => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: `/inventory/counts/${id}`,
				method: 'DELETE',
				body: JSON.stringify({ reason })
			})
			
			if (response.data.status) {
				dispatch({
					type: CANCEL_COUNT,
					payload: id
				})
				return true
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
				return false
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
			return false
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Get count analytics
export const getCountAnalytics = (params = {}) => {
	return async (dispatch) => {
		dispatch({ type: SET_LOADING, payload: true })
		try {
			const response = await apiRequest({ 
				url: '/inventory/counts/analytics',
				method: 'GET',
				params
			})
			
			if (response.data.status) {
				dispatch({
					type: GET_COUNT_ANALYTICS,
					payload: response.data.data
				})
				return response.data.data
			} else {
				dispatch({ type: SET_ERROR, payload: response.data.message })
			}
		} catch (error) {
			dispatch({ type: SET_ERROR, payload: error.message })
		} finally {
			dispatch({ type: SET_LOADING, payload: false })
		}
	}
}

// Clear error
export const clearError = () => ({
	type: CLEAR_ERROR
})