// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedPlan: null
}

const Dataplan = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_DATA_PLANS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_DATA_PLANS':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_PLAN':
      return { ...state, selectedPlan: action.selectedPlan }
    default:
      return { ...state }
  }
}
export default Dataplan
