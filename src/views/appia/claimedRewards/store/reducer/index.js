// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedClaim: null,
  selectedUserClaimedHistory: [],
  selectedUserClaimHistory: [],
  selectedUserTotalClaim: 1,
  selectedUserClaimParams: {}
}

const ClaimedRewards = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_CLAIMED_REWARDS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_CLAIMED_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_CLAIM':
      return { ...state, selectedClaim: action.selectedClaim }
      case 'GET_USER_CLAIM_HISTORYS':
        return { 
          ...state, 
          selectedUserClaimedHistory: action.data
        }
      case 'GET_USER_CLAIM':
        return {
          ...state,
          selectedUserClaimHistory: action.data,
          selectedUserTotalClaim: action.totalPages,
          selectedUserClaimParams: action.params
        }
    default:
      return { ...state }
  }
}
export default ClaimedRewards
