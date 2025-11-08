// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedOrder: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  loading: false
}

const orders = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_ORDERS_DATA':
      return {
        ...state,
        allData: action.data,
        data: action.data,
        pagination: action.pagination || state.pagination,
        total: action.pagination?.total || action.data.length,
        params: action.params || state.params,
        loading: false
      }
    case 'GET_FILTERED_ORDER_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_ORDER':
      return { ...state, selectedOrder: action.selectedOrder }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return { ...state }
  }
}
export default orders
