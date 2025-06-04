// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedOrder: null
}

const orders = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_ORDERS_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_ORDER_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_ORDER':
      return { ...state, selectedOrder: action.selectedOrder }
    default:
      return { ...state }
  }
}
export default orders
