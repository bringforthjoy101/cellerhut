// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedTransfer: null
}

const Transfers = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_TRANSFERS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_TRANSFER':
      return { ...state, selectedTransfer: action.selectedTransfer }
    default:
      return { ...state }
  }
}
export default Transfers
