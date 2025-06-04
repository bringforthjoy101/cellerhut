import axios from 'axios'
import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/escrows', method: 'GET' }, dispatch)
    if (response && response.data.data && response.data.success) {
      await dispatch({
        type: 'GET_ALL_ESCROW',
        data: response.data.data
      })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

// ** Get filtered data on page or row change
export const getFilteredData = (escrows, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, role = null, status = null } = params
    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = escrows.filter(
      escrow =>
        (escrow.escrow_id.toLowerCase().includes(queryLowered) || escrow.receiver.names.toLowerCase().includes(queryLowered) || escrow.sender.names.toLowerCase().includes(queryLowered)) &&
        escrow.role === (role || escrow.role) &&
        escrow.status === (status || escrow.status)
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

//  Get Escrow
export const getEscrow = (escrows, id) => {
  return async dispatch => {
    const escrow = escrows.find(i => i.escrow_id === id)
    dispatch({
      type: 'GET_ESCROW',
      selectedEscrow: escrow
    })
  }
}

// Get Transactions
export const getAllUserEscrowTransactions = (sender_id) => {
  return async dispatch => {
    const response = await apiRequest({ url: `/admin/escrows/${sender_id}`, method: 'GET' }, dispatch)
    if (response && response.data.data && response.data.success) {
      await dispatch({
        type: 'GET_USER_ESCROWS_TRANSACTIONS',
        data: response.data.data
      })
    } else {
      console.log(response)
      swal('Oops!', 'Somthing went wrong with your network.', 'error')
    }
  }
}

// Filter Transaction
export const getFilteredUserTransactions = (userTransactions, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, status = null } = params
    /* eslint-enable */

    const queryLowered = q.toLowerCase()
    // console.log({userTransactions}, typeof userTransactions)
    const filteredData = userTransactions?.filter(
      transaction => {
        let found = false

        if ((transaction.trans_id || '').toLowerCase().includes(queryLowered)) {
          found = true
        }

        if ((transaction?.receiver.names || '').toLowerCase().includes(queryLowered)) {
          found = true
        }
        return found
      }

    )
      .sort(sortCompare('trans_id'))
      .reverse()
    /* eslint-enable  */
    await dispatch({
      type: 'GET_USER_ESCROW_TRANSACTIONS',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData?.length,
      params
    })
  }
}

// Resolve Escrow
export const escrowResolve = ({escrow_id, status, resolution}) => {
  return async dispatch => {
    const body = JSON.stringify({escrow_id, status, resolution})
    const response = await apiRequest({url:`/admin/escrow/resolve`, method:'POST', body}, dispatch)
    console.log({response})
    if (response && response.data.success) {
      swal('Good!', `${response.data.message}.`, 'success')
      dispatch(getAllData())
    } else {
      console.log(response)
      swal('Oops!', 'Somthing went wrong with your network.', 'error')
    }
  }
}

