// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedFund: null
}

const users = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_FUND_DATA':
      return { ...state, allData: action.data }
      case 'GET_FUND':
        return { ...state, selectedFund: action.selectedFund }
    case 'GET_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    default:
      return { ...state }
  }
}
export default users
