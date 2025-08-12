// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedSupplier: null,
  paymentHistory: []
}

const suppliersReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_SUPPLIERS_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_SUPPLIERS_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_A_SUPPLIER':
      return { ...state, selectedSupplier: action.selectedSupplier }
    case 'GET_SUPPLIER_PAYMENT_HISTORY':
      return { ...state, paymentHistory: action.data }
    default:
      return { ...state }
  }
}
export default suppliersReducer