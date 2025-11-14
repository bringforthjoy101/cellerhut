// ** Initial State
const initialState = {
	broadcasts: [],
	broadcastDetails: null,
	broadcastPagination: {
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 0,
	},
	logs: [],
	logsPagination: {
		total: 0,
		page: 1,
		limit: 50,
		totalPages: 0,
	},
	logsParams: {},
	stats: {
		overall: {},
		by_type: [],
		devices: [],
		broadcasts: {},
	},
	loading: false,
	error: null,
}

const notifications = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_ALL_BROADCASTS':
			return {
				...state,
				broadcasts: action.data,
				broadcastPagination: action.pagination,
			}

		case 'GET_BROADCAST_DETAILS':
			return {
				...state,
				broadcastDetails: action.broadcast,
			}

		case 'SEND_BROADCAST_SUCCESS':
			return {
				...state,
				error: null,
			}

		case 'GET_NOTIFICATION_LOGS':
			return {
				...state,
				logs: action.data,
				logsPagination: action.pagination,
				logsParams: action.params,
			}

		case 'GET_NOTIFICATION_STATS':
			return {
				...state,
				stats: action.stats,
			}

		case 'SET_NOTIFICATIONS_LOADING':
			return {
				...state,
				loading: action.loading,
			}

		case 'SET_NOTIFICATIONS_ERROR':
			return {
				...state,
				error: action.error,
			}

		case 'CLEAR_NOTIFICATION_ERROR':
			return {
				...state,
				error: null,
			}

		case 'RESET_NOTIFICATION_STATE':
			return initialState

		default:
			return { ...state }
	}
}

export default notifications
