// ** Initial State
const initialState = {
	// Transactions
	transactions: [],
	transactionsPagination: {
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 0,
	},
	transactionDetail: null,
	transactionWebhooks: [],

	// Logs
	logs: [],
	logsPagination: {
		total: 0,
		page: 1,
		limit: 50,
		totalPages: 0,
	},

	// Webhooks
	webhooks: [],
	webhooksPagination: {
		total: 0,
		page: 1,
		limit: 50,
		totalPages: 0,
	},

	// Statistics
	stats: {
		overview: {
			totalTransactions: 0,
			successCount: 0,
			failedCount: 0,
			pendingCount: 0,
			successRate: 0,
			totalRevenue: 0,
			recentTransactions24h: 0,
		},
		byStatus: [],
		byGateway: [],
	},

	// UI State
	loading: false,
	error: null,
}

const payments = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_ALL_TRANSACTIONS':
			return {
				...state,
				transactions: action.data,
				transactionsPagination: action.pagination,
			}

		case 'GET_TRANSACTION_DETAIL':
			return {
				...state,
				transactionDetail: action.transaction,
				transactionWebhooks: action.webhooks,
			}

		case 'CLEAR_TRANSACTION_DETAIL':
			return {
				...state,
				transactionDetail: null,
				transactionWebhooks: [],
			}

		case 'GET_PAYMENT_LOGS':
			return {
				...state,
				logs: action.data,
				logsPagination: action.pagination,
			}

		case 'GET_WEBHOOKS':
			return {
				...state,
				webhooks: action.data,
				webhooksPagination: action.pagination,
			}

		case 'GET_PAYMENT_STATS':
			return {
				...state,
				stats: action.stats,
			}

		case 'SET_PAYMENTS_LOADING':
			return {
				...state,
				loading: action.loading,
			}

		case 'SET_PAYMENTS_ERROR':
			return {
				...state,
				error: action.error,
			}

		case 'CLEAR_PAYMENT_ERROR':
			return {
				...state,
				error: null,
			}

		case 'RESET_PAYMENT_STATE':
			return initialState

		default:
			return { ...state }
	}
}

export default payments
