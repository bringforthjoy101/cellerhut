// ** Initial State
const initialState = {
	allData: [],
	data: [],
	total: 1,
	params: {},
	selectedTransaction: null,
	loading: true,
}

const reports = (state = initialState, action) => {
	switch (action.type) {
		case 'GET_ALL_TRANSACTION_DATA':
			return { ...state, allData: action.data, data: [], loading: false }
		case 'GET_FILTERED_TRANSACTION_DATA':
			return {
				...state,
				data: action.data,
				total: action.totalPages,
				params: action.params,
				loading: false,
			}
		case 'GET_TRANSACTION':
			return { ...state, selectedTransaction: action.selectedTransaction }
		default:
			return { ...state }
	}
}
export default reports
