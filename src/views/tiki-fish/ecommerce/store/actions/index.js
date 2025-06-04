import axios from 'axios'

// ** GET Products
export const getProducts = params => {
  return dispatch => {
    return axios.get('/apps/ecommerce/products', { params }).then(res => {
      console.log('data length', res.data.total)
      console.log('data', res.data)
      dispatch({ type: 'GET_PRODUCTS', data: res.data, params: {...params, perPage: res.data.total} })
    })
  }
}

export const getFilteredProducts = (products, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, number = '', page = 1, status = null, className = null, level = null, group = null } = params

		/* eslint-disable  */
		const queryLowered = q.toLowerCase()
		const filteredData = products.filter(
			(product) =>
				(product.firstName.toLowerCase().includes(queryLowered) ||
					product.lastName?.toString().toLowerCase().includes(queryLowered) ||
					product.type.toLowerCase().includes(queryLowered)) &&
				product.class === (className || product.class) &&
				product.level === (level || product.level) &&
				product.group === (group || product.group) &&
				product.status === (status || product.status)
		)

		/* eslint-enable  */

		dispatch({
			type: 'GET_FILTERED_STUDENT_DATA',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData.length,
			params,
		})
	}
}

// ** Add Item to Cart
export const addToCart = id => {
  return (dispatch, getState) => {
    return axios.post('/apps/ecommerce/cart', { productId: id }).then(res => {
      console.log('res', res)
      dispatch({ type: 'ADD_TO_CART', data: res.data })
      dispatch(getProducts(getState().ecommerce.params))
    })
  }
}

// ** Update Item to Cart
export const updateCart = (productId, qty) => {
  return (dispatch, getState) => {
    return axios.post('/apps/ecommerce/cart/update', { productId, qty }).then(res => {
      console.log('resss', res)
      dispatch({ type: 'UPDATE_TO_CART', data: res.data })
      dispatch(getProducts(getState().ecommerce.params))
    })
  }
}

// ** GET Wishlist Items
export const getWishlistItems = () => {
  return dispatch => {
    return axios.get('/apps/ecommerce/wishlist').then(res => {
      dispatch({ type: 'GET_WISHLIST', data: res.data })
    })
  }
}

// ** DELETE Wishlist Item
export const deleteWishlistItem = id => {
  return dispatch => {
    return axios.delete(`/apps/ecommerce/wishlist/${id}`).then(res => {
      dispatch({ type: 'DELETE_WISHLIST_ITEM', data: res.data })
      dispatch(getWishlistItems())
    })
  }
}

// ** GET Cart Items
export const getCartItems = () => {
  return dispatch => {
    return axios.get('/apps/ecommerce/cart').then(res => {
      console.log('ress', res)
      dispatch({ type: 'GET_CART', data: res.data })
    })
  }
}

// ** GET Single Product
export const getProduct = slug => {
  return dispatch => {
    return axios.get(`/apps/ecommerce/products/${slug}`).then(res => {
      dispatch({ type: 'GET_PRODUCT', data: res.data })
    })
  }
}

// ** Add Item to Wishlist
export const addToWishlist = id => {
  return dispatch => {
    return axios.post('/apps/ecommerce/wishlist', { productId: id }).then(() => {
      dispatch({ type: 'ADD_TO_WISHLIST' })
    })
  }
}

// ** DELETE Cart Items
export const deleteCartItem = id => {
  return dispatch => {
    return axios.delete(`/apps/ecommerce/cart/${id}`).then(res => {
      dispatch({ type: 'DELETE_CART_ITEM', data: res.data })
      dispatch(getCartItems())
    })
  }
}

// ** DELETE all Cart Items
export const deleteAllCartItem = () => {
  return dispatch => {
    return axios.post(`/apps/ecommerce/cart/clear`).then(res => {
      dispatch({ type: 'DELETE_ALL_CART_ITEM', data: res.data })
      dispatch(getCartItems())
    })
  }
}
