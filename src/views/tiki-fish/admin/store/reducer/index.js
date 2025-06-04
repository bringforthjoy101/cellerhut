// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedAdmin: null,
  adminActivities: []
}

const admins = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_ADMIN_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_ADMIN_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_ADMIN':
      return { ...state, selectedAdmin: action.selectedAdmin }
    case 'GET_ALL_ADMIN_ACTIVITY':
      return {...state, adminActivities: action.data}
    default:
      return { ...state }
  }
}
export default admins
