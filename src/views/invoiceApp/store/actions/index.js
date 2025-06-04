import axios from 'axios'
import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// Get data
export const getData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/invoices/get', method: 'POST' }, dispatch)
    if (response) {
      console.log(response.data)
      if (response.data.data && response.data.status) {
        await dispatch({
          type: 'GET_ALL_INVOICE_DATA',
          data: response.data.data
        })
      } else {
        console.log(response.error)
      }
    } else {
      swal('Oops!', 'Somthing went wrong with your network.', 'error')
    }
  }
}

// ** Get filtered data on page or row change
export const getFilteredData = (invoices, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, status = null} = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = invoices?.filter(
      invoice =>
        (invoice?.RecipientCompanyName?.toLowerCase().includes(queryLowered) || 
        invoice?.RecipientCompanyEmail?.toLowerCase()?.includes(queryLowered)) && 
        invoice.Status.toLowerCase() === (status.toLowerCase() || invoice.Status.toLowerCase())
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_INVOICE_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const getInvoiceData = (invoices, id) => {
  return async dispatch => {
    const invoice = invoices.find(i => i.id === id)
    dispatch({
      type: 'GET_INVOICE_DATA',
      selectedContact: invoice
    })
  }
}
