import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import moment from 'moment'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all User Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({url:'/products', method:'GET'}, dispatch)
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_ALL_PRODUCTS_DATA',
          data: response.data.data
        })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

// ** Get Product Statistics
export const getProductStats = () => {
  return async dispatch => {
    const response = await apiRequest({url:'/products/stats', method:'GET'}, dispatch)
    console.log('Product Stats Response:', response) // Debug log
    if (response && response.data.data && response.data.status) {
        console.log('Product Stats Data:', response.data.data) // Debug log
        await dispatch({
          type: 'GET_PRODUCT_STATS',
          data: response.data.data
        })
        return response.data.data
    } else {
      console.log('Product Stats Error:', response)
      await dispatch({
        type: 'GET_PRODUCT_STATS_ERROR',
        error: response?.data?.message || 'Failed to load statistics'
      })
      return null
    }
  }
}

// ** Get all Categories Data
export const getCategories = () => {
  return async dispatch => {
    const response = await apiRequest({url:'/categories', method:'GET'}, dispatch)
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_CATEGORIES_SUCCESS',
          data: response.data.data
        })
    } else {
      console.log(response)
      await dispatch({
        type: 'GET_CATEGORIES_ERROR',
        error: response?.data?.message || 'Failed to load categories'
      })
    }
  }
}

// All Users Filtered Data
export const getFilteredData = (products, params) => {
  return async dispatch => {
    const { category = null, q = '', perPage = 10,  page = 1 } = params

    /* eslint-disable  */
    const queryLowered = q?.toLowerCase()
    const filteredData = products?.filter(
      product => 
        (product?.name?.toLowerCase()?.includes(queryLowered)) && product?.category === (category || product.category)
      )
  
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_PRODUCT_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

//  Get User
export const getProduct = (productId) => {
  return async dispatch => {
    const response = await apiRequest({url:`/products/get-detail/${productId}`, method:'GET'}, dispatch)
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_A_PRODUCT',
          selectedProduct: response.data.data
        })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

export const deleteProduct = (productId) => {
  return async dispatch => {
    const response = await apiRequest({url:`/products/delete/${productId}`, method:'GET'}, dispatch)
    if (response && response.data.status) {
        return response.data
    } else {
      console.log(response)
      swal('Oops!', response.data.message || 'Something went wrong.', 'error')
      return response.data.status
    }
  }
}

export const getFilteredinventoryHistories = (histories, params) => {
	return async (dispatch) => {
		const { q = '', perPage = 10, page = 1 } = params
		/* eslint-enable */

		const queryLowered = q.toLowerCase()
		const filteredData = histories?.filter(
			(history) => history?.department?.toLowerCase().includes(queryLowered) || moment(history?.createdAt).format('lll').toLowerCase().includes(queryLowered)
		)
		/* eslint-enable  */
		await dispatch({
			type: 'GET_INVENTORY_HISTORIES',
			data: paginateArray(filteredData, perPage, page),
			totalPages: filteredData?.length,
			params,
		})
	}
}

export const logInventory = (productId, inventoryData) => {
	return async (dispatch) => {
		const body = JSON.stringify({ ...inventoryData })
		const response = await apiRequest({ url: `/products/update-stock/${productId}`, method: 'POST', body }, dispatch)
		if (response) {
			if (response.data.status) {
				swal('Good!', `${response.data.message}.`, 'success')
				dispatch(getAllData())
				dispatch(getProduct(productId))
			} else {
				swal('Oops!', `${response.data.message}.`, 'error')
			}
		} else {
			console.log(response.error)
			swal('Oops!', 'Somthing went wrong with your network.', 'error')
		}
	}
}

export const uploadProductCSV = (csvFile) => {
	return async (dispatch) => {
		const formData = new FormData()
		formData.append('csv', csvFile)
		
		try {
			const response = await apiRequest({ 
				url: '/products/upload-csv', 
				method: 'POST', 
				body: formData,
				isFormData: true
			}, dispatch)
			
			if (response && response.data.status) {
				swal('Success!', `${response.data.message}`, 'success')
				dispatch(getAllData())
				return response.data
			} else {
				swal('Oops!', response.data.message || 'CSV upload failed.', 'error')
				return { status: false, message: response.data.message }
			}
		} catch (error) {
			console.log('CSV upload error:', error)
			swal('Oops!', 'Something went wrong with the CSV upload.', 'error')
			return { status: false, message: 'Network error' }
		}
	}
}

export const createMultipleProducts = (products) => {
	return async (dispatch) => {
		const body = JSON.stringify({ products })
		
		try {
			const response = await apiRequest({ 
				url: '/products/create-multiple', 
				method: 'POST', 
				body 
			}, dispatch)
			
			if (response && response.data.status) {
				swal('Success!', `${response.data.message}`, 'success')
				dispatch(getAllData())
				return response.data
			} else {
				swal('Oops!', response.data.message || 'Multiple products creation failed.', 'error')
				return { status: false, message: response.data.message }
			}
		} catch (error) {
			console.log('Multiple products creation error:', error)
			swal('Oops!', 'Something went wrong with creating multiple products.', 'error')
			return { status: false, message: 'Network error' }
		}
	}
}

