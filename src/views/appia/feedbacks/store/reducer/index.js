// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedFeedback: null
}

const Feedbacks = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_FEEDBACKS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_FEEDBACK':
      return { ...state, selectedFeedback: action.selectedFeedback }
    default:
      return { ...state }
  }
}
export default Feedbacks
