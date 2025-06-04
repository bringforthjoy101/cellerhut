const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedGuest: null
}

const guests = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_GUEST_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_GUEST_DETAILS':
      return { ...state, selectedGuest: action.data }
    default:
      return { ...state }
  }
}

export default guests 