const initialState = {
    allData: [],
    data: [],
    total: 1,
    params: {}, 
    selectedHistory: null
  }
  
  const admins = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_ALL_HISTORY':
        return { ...state, allData: action.data }
      case 'GET_FILTERED_HISTORY':
        return {
          ...state,
          data: action.data,
          total: action.totalPages,
          params: action.params
        }
        case 'GET_HISTORY':
      return { ...state, selectedHistory: action.selectedHistory }
      default:
        return { ...state }
    }
  }
  export default admins
  