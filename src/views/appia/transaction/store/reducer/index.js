// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedTransaction: null
}

const users = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_TRANSACTIONS_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_TRANSACTION_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_TRANSACTION':
      return { ...state, selectedTransaction: action.selectedTransaction }
    default:
      return { ...state }
  }
}
export default users
