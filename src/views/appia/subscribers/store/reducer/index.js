// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {}
}

const Subscribers = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_SUBSCRIBERS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_DATA':
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
export default Subscribers
