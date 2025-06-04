// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedSettlement: null
}

const settlements = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_SETTLEMENTS_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_SETTLEMENT_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_SETTLEMENT':
      return { ...state, selectedSettlement: action.selectedSettlement }
    default:
      return { ...state }
  }
}
export default settlements
