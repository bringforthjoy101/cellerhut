// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedProduct: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null
}

const products = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_PRODUCTS_DATA':
      return { ...state, allData: action.data }
    case 'GET_FILTERED_PRODUCT_DATA':
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_A_PRODUCT':
      return { ...state, selectedProduct: action.selectedProduct }
    case 'GET_CATEGORIES_SUCCESS':
      return { 
        ...state, 
        categories: action.data,
        categoriesLoading: false,
        categoriesError: null
      }
    case 'GET_CATEGORIES_ERROR':
      return { 
        ...state, 
        categoriesLoading: false,
        categoriesError: action.error
      }
    default:
      return { ...state }
  }
}
export default products
