const initialState = {
  allProducts: [],
  stable:[],
  products: [],
  filtered: [],
  wishlist: [],
  cart: [],
  productDetail: {},
  params: {},
  totalProducts: 0
}

const ecommerceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_ALL_PRODUCTS':
      return { ...state, allProducts: action.data }
    case 'GET_FILTERED_PRODUCTS':
      return {
        ...state,
        products: action.data,
        total: action.totalPages,
        params: action.params
      }
    case 'GET_PRODUCTS':
      return { ...state, products: action.data.products, filtered: action.data.filtered, params: action.params, totalProducts: action.data.total }
    case 'GET_T_PRODUCTS':
      console.log('action', action)
      return { ...state, products: action.data, stable: action.data, params: action.params, totalProducts: action.data.length }
    case 'GET_WISHLIST':
      return { ...state, wishlist: action.data.products }
    case 'DELETE_WISHLIST_ITEM':
      return { ...state }
    case 'GET_CART':
      return { ...state, cart: action.data.products }
    case 'DELETE_CART_ITEM':
      return { ...state }
    case 'DELETE_ALL_CART_ITEM':
      return { ...state }
    case 'ADD_TO_WISHLIST':
      return { ...state }
    case 'ADD_TO_CART':
      return { ...state }
    case 'UPDATE_TO_CART':
      return { ...state }
    case 'GET_PRODUCT':
      return { ...state, productDetail: action.data.product }
    default:
      return state
  }
}

export default ecommerceReducer
