// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedSetting: null
}

const Settings = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_SETTINGS':
      return { ...state, allData: action.data }
      case 'GET_FILTERED_DATA':
        return {
          ...state,
          data: action.data,
          total: action.totalPages,
          params: action.params
        }
      case 'GET_SETTING':
        return { ...state, selectedSetting: action.selectedSetting }
      default:
        return { ...state }
  }
}
export default Settings
