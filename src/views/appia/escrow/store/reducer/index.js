// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedEscrow: null,
  selectedUserEscrowTransactions: [],
  escrowData: [],
  escrowTotal: 1,
  escrowParams: {}
  
}

const Escrow = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_ESCROW':
      return { ...state, allData: action.data }
    case 'GET_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_ESCROW':
      return { ...state, selectedEscrow: action.selectedEscrow }
    case 'GET_USER_ESCROWS_TRANSACTIONS':
      return { 
        ...state, 
        selectedUserEscrowTransactions: action.data
      }
      case 'GET_USER_ESCROW_TRANSACTIONS':
        return {
          ...state,
          escrowData: action.data,
          escrowTotal: action.totalPages,
          escrowParams: action.params
        }
    default:
      return { ...state }
  }
}
export default Escrow
