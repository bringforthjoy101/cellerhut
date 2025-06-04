// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedInvestmentPackage: null,
  investmentPackageDetails: null,
  track: null,
  selectedInvestmentPackageSubscriptions: [],
  selectedInvestmentPackageSubscription: [],
  selectedInvestmentPackageTotalSubscriptions: 1,
  selectedInvestmentPackageSubscriptionParams: {},
  selectedInvestmentPackageAllSubscriptions: [],
}

const investmentPackages = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_INVESTMENT_PACKAGE_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_INVESTMENT_PACKAGE':
      return { ...state, selectedInvestmentPackage: action.selectedInvestmentPackage }
    case 'GET_INVESTMENT_PACKAGE_DETAILS':
      return { ...state, investmentPackageDetails: action.investmentPackageDetails }
    case 'GET_INVESTMENT_PACKAGE_ALL_SUBSCRIPTIONS':
      return { 
        ...state, 
        selectedInvestmentPackageAllSubscriptions: action.data
      }
    case 'GET_INVESTMENT_PACKAGE_SUBSCRIPTIONS':
      return {
        ...state,
        selectedInvestmentPackageSubscriptions: action.data,
        selectedInvestmentPackageTotalSubscriptions: action.totalPages,
        selectedInvestmentPackageSubscriptionParams: action.params
      }
    default:
      return { ...state }
  }
}
export default investmentPackages
