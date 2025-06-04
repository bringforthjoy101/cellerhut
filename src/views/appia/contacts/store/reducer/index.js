// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedContact: null
}

const Contacts = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_CONTACTS':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_CONTACT':
      return { ...state, selectedContact: action.selectedContact }
    default:
      return { ...state }
  }
}
export default Contacts
