import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all Suppliers Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({url:'/suppliers', method:'GET'}, dispatch)
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_ALL_SUPPLIERS_DATA',
          data: response.data.data
        })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

// Get filtered suppliers data
export const getFilteredData = (suppliers, params) => {
  return async dispatch => {
    const { status = null, q = '', perPage = 10, page = 1 } = params

    const queryLowered = q?.toLowerCase()
    const filteredData = suppliers?.filter(
      supplier => 
        (supplier?.name?.toLowerCase()?.includes(queryLowered) || 
         supplier?.email?.toLowerCase()?.includes(queryLowered) ||
         supplier?.phone?.toLowerCase()?.includes(queryLowered)) && 
        supplier?.status === (status || supplier.status)
    )

    dispatch({
      type: 'GET_FILTERED_SUPPLIERS_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

// Get single supplier
export const getSupplier = (supplierId) => {
  return async dispatch => {
    const response = await apiRequest({url:`/suppliers/get-detail/${supplierId}`, method:'GET'}, dispatch)
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_A_SUPPLIER',
          selectedSupplier: response.data.data
        })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

// Create supplier
export const createSupplier = (supplierData) => {
  return async dispatch => {
    const body = JSON.stringify(supplierData)
    const response = await apiRequest({url:'/suppliers/create', method:'POST', body}, dispatch)
    if (response && response.data.status) {
        swal('Good!', `${response.data.message}.`, 'success')
        dispatch(getAllData())
        return response.data
    } else {
      swal('Oops!', `${response.data.message}.`, 'error')
      return response.data
    }
  }
}

// Update supplier
export const updateSupplier = (supplierId, supplierData) => {
  return async dispatch => {
    const body = JSON.stringify(supplierData)
    const response = await apiRequest({url:`/suppliers/update/${supplierId}`, method:'POST', body}, dispatch)
    if (response && response.data.status) {
        swal('Good!', `${response.data.message}.`, 'success')
        dispatch(getAllData())
        dispatch(getSupplier(supplierId))
        return response.data
    } else {
      swal('Oops!', `${response.data.message}.`, 'error')
      return response.data
    }
  }
}

// Delete supplier
export const deleteSupplier = (supplierId) => {
  return async dispatch => {
    const response = await apiRequest({url:`/suppliers/delete/${supplierId}`, method:'GET'}, dispatch)
    if (response && response.data.status) {
        return response.data
    } else {
      console.log(response)
      swal('Oops!', response.data.message || 'Something went wrong.', 'error')
      return response.data.status
    }
  }
}

// Get supplier payment history
export const getSupplierPaymentHistory = (supplierId, params = {}) => {
  return async dispatch => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await apiRequest({
      url:`/suppliers/${supplierId}/payment-history${queryParams ? `?${queryParams}` : ''}`, 
      method:'GET'
    }, dispatch)
    
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_SUPPLIER_PAYMENT_HISTORY',
          data: response.data.data
        })
        return response.data.data
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

// Get supplier supplies
export const getSupplierSupplies = (supplierId, params = {}) => {
  return async dispatch => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await apiRequest({
      url:`/suppliers/${supplierId}/supplies${queryParams ? `?${queryParams}` : ''}`, 
      method:'GET'
    }, dispatch)
    
    if (response && response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_SUPPLIER_SUPPLIES',
          data: response.data.data
        })
        return response.data.data
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
      return null
    }
  }
}