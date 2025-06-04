// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedReward: null,
  allServiceId: []
}

const AllRewards = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_REWARDS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_REWARDS':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_REWARD':
      return { ...state, selectedReward: action.selectedReward }
      case 'GET_SERVICE_ID':
        return { ...state, allServiceId: action.data }
    default:
      return { ...state }
  }
}
export default AllRewards
