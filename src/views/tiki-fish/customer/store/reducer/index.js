// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedCustomer: null,
  customerDetails: null,
  track: null,
  selectedCustomerAllTransactions: [],
  selectedCustomerTransactions: [],
  selectedCustomerTotalTransactions: 1,
  selectedCustomerTransactionParams: {},
  selectedCustomerAllOrders: [],
  selectedCustomerOrders: [],
  selectedCustomerTotalOrders: 1,
  selectedCustomerOrderParams: {}
}

const customers = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_CUSTOMER_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_CUSTOMER':
      return { ...state, selectedCustomer: action.selectedCustomer }
    case 'GET_CUSTOMER_DETAILS':
      return { ...state, customerDetails: action.customerDetails }
    case 'GET_CUSTOMER_ALL_TRANSACTIONS':
      return { 
        ...state, 
        selectedCustomerAllTransactions: action.data
      }
    case 'GET_CUSTOMER_TRANSACTIONS':
      return {
        ...state,
        selectedCustomerTransactions: action.data,
        selectedCustomerTotalTransactions: action.totalPages,
        selectedCustomerTransactionParams: action.params
      }
    case 'GET_CUSTOMER_ALL_ORDERS':
      return { 
        ...state, 
        selectedCustomerAllOrders: action.data
      }
    case 'GET_CUSTOMER_ORDERS':
      return {
        ...state,
        selectedCustomerOrders: action.data,
        selectedCustomerTotalOrders: action.totalPages,
        selectedCustomerOrderParams: action.params
      }
    default:
      return { ...state }
  }
}
export default customers
