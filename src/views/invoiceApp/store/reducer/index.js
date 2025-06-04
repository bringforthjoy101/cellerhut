const initialState = {
  data: [],
  total: 1,
  params: {},
  allData: [],
  selectedInvoice: null
}

const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_INVOICE_DATA':
      return {
        ...state,
        allData: action.data
      }
    case 'GET_FILTERED_INVOICE_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_INVOICE_DATA':
      return { ...state, selectedInvoice: action.selectedInvoice }
    default:
      return { ...state }
  }
}
export default invoiceReducer