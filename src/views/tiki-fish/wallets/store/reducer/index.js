// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedWallet: null,
  walletDetails: null,
  track: null,
  // selectedCustomerAllTransactions: [],
  // selectedCustomerTransactions: [],
  // selectedCustomerTotalTransactions: 1,
  // selectedCustomerTransactionParams: {},
  // selectedCustomerAllOrders: [],
  // selectedCustomerOrders: [],
  // selectedCustomerTotalOrders: 1,
  // selectedCustomerOrderParams: {}
}

const wallets = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_WALLET_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_WALLET':
      return { ...state, selecteWallet: action.selecteWallet }
    case 'GET_WALLET_DETAILS':
      return { ...state, walletDetails: action.walletDetails }
    case 'GET_WALLET_ALL_TRANSACTIONS':
      return { 
        ...state, 
        selectedWalletAllTransactions: action.data
      }
    case 'GET_WALLET_TRANSACTIONS':
      return {
        ...state,
        selectedWalletTransactions: action.data,
        selectedWalletTotalTransactions: action.totalPages,
        selectedWalletTransactionParams: action.params
      }
    case 'GET_WALLET_ALL_ORDERS':
      return { 
        ...state, 
        selectedWalletAllOrders: action.data
      }
    case 'GET_WALLET_ORDERS':
      return {
        ...state,
        selectedWalletOrders: action.data,
        selectedWalletTotalOrders: action.totalPages,
        selectedWalletOrderParams: action.params
      }
    default:
      return { ...state }
  }
}
export default wallets
