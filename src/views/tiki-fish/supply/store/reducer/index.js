// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedSupply: null
}

const suppliesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_SUPPLIES_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_SUPPLIES_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_A_SUPPLY':
      return { ...state, selectedSupply: action.selectedSupply }
    case 'CREATE_SUPPLY':
      return { 
        ...state, 
        allData: [...state.allData, action.data],
        data: [...state.data, action.data]
      }
    case 'UPDATE_SUPPLY':
      const updatedAllData = state.allData.map(supply => (
        supply.id === action.data.id ? action.data : supply
      ))
      const updatedData = state.data.map(supply => (
        supply.id === action.data.id ? action.data : supply
      ))
      return {
        ...state,
        allData: updatedAllData,
        data: updatedData,
        selectedSupply: action.data
      }
    case 'DELETE_SUPPLY':
      return {
        ...state,
        allData: state.allData.filter(supply => supply.id !== action.id),
        data: state.data.filter(supply => supply.id !== action.id)
      }
    case 'APPROVE_SUPPLY':
    case 'REJECT_SUPPLY':
      const statusUpdatedAllData = state.allData.map(supply => (
        supply.id === action.data.id ? action.data : supply
      ))
      const statusUpdatedData = state.data.map(supply => (
        supply.id === action.data.id ? action.data : supply
      ))
      return {
        ...state,
        allData: statusUpdatedAllData,
        data: statusUpdatedData,
        selectedSupply: action.data
      }
    default:
      return { ...state }
  }
}

export default suppliesReducer