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

const initialState = {
	counts: [],
	currentCount: null,
	countDetail: null,
	varianceReport: null,
	analytics: null,
	pagination: {
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0
	},
	loading: false,
	error: null
}

const inventoryCountReducer = (state = initialState, action) => {
	switch (action.type) {
		case GET_COUNTS:
			return {
				...state,
				counts: action.payload.counts || [],
				pagination: action.payload.pagination || state.pagination,
				error: null
			}
			
		case GET_COUNT_DETAIL:
			return {
				...state,
				countDetail: action.payload,
				currentCount: action.payload.count,
				error: null
			}
			
		case CREATE_COUNT:
			return {
				...state,
				counts: [action.payload, ...state.counts],
				currentCount: action.payload,
				error: null
			}
			
		case UPDATE_COUNT_STATUS:
			return {
				...state,
				counts: state.counts.map(count => (
					count.id === action.payload.id ? action.payload : count
				)),
				currentCount: state.currentCount?.id === action.payload.id 
					? action.payload 
					: state.currentCount,
				error: null
			}
			
		case RECORD_COUNT:
			if (state.countDetail) {
				const updatedItems = state.countDetail.count.countItems.map(item => (
					item.id === action.payload.id ? action.payload : item
				))
				return {
					...state,
					countDetail: {
						...state.countDetail,
						count: {
							...state.countDetail.count,
							countItems: updatedItems
						}
					}
				}
			}
			return state
			
		case BULK_RECORD_COUNTS:
			return {
				...state,
				error: null
			}
			
		case GET_VARIANCE_REPORT:
			return {
				...state,
				varianceReport: action.payload,
				error: null
			}
			
		case APPROVE_COUNT:
			return {
				...state,
				counts: state.counts.map(count => (
					count.id === action.payload.id ? action.payload : count
				)),
				currentCount: action.payload,
				error: null
			}
			
		case CANCEL_COUNT:
			return {
				...state,
				counts: state.counts.filter(count => count.id !== action.payload),
				error: null
			}
			
		case GET_COUNT_ANALYTICS:
			return {
				...state,
				analytics: action.payload,
				error: null
			}
			
		case SET_LOADING:
			return {
				...state,
				loading: action.payload
			}
			
		case SET_ERROR:
			return {
				...state,
				error: action.payload,
				loading: false
			}
			
		case CLEAR_ERROR:
			return {
				...state,
				error: null
			}
			
		default:
			return state
	}
}

export default inventoryCountReducer