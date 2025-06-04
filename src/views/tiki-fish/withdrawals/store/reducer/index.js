// ** Initial State
const initialState = {
	allData: [],
	data: [],
	total: 1,
	params: {},
	selectedWithdrawal: null,
	loading: true,
}

const withdrawals = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_ALL_WITHDRAWAL_DATA':
			return { ...state, allData: action.data, data: [], loading: false }
		case 'GET_FILTERED_WITHDRAWAL_DATA':
			return {
				...state,
				data: action.data,
				total: action.totalPages,
				params: action.params,
				loading: false,
			}
		case 'GET_WITHDRAWAL':
			return { ...state, selectedWithdrawal: action.selectedWithdrawal }
		default:
			return { ...state }
	}
}
export default withdrawals
