import axios from 'axios'
import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/transfers', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_TRANSFERS',
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
export const getFilteredData = (transfers, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, status = null} = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = transfers.filter(
      transfer =>
        (transfer.receiver_name.toLowerCase().includes(queryLowered) || transfer.bank.toLowerCase().includes(queryLowered)) &&
        transfer.status === (status || transfer.status)
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const getTransfer = (transfers, id) => {
  return async dispatch => {
    const transfer = transfers.find(i => i.id === id)
    dispatch({
      type: 'GET_TRANSFER',
      selectedTransfer: transfer
    })
  }
}

// Transfer Approval
export const TransferApproval = ({trans_id}) => {
  return async dispatch => {
    const body = JSON.stringify({trans_id})
    const response = await apiRequest({url:`/admin/transfer/approve`, method:'POST', body}, dispatch)
    if (response && response.data.success) {
      swal('Good!', `${response.data.message}`, 'success')
    } else {
      console.log(response)
      swal('Oops!', 'Somthing went wrong with your network.', 'error')
    }
  }
}

// Transfer Disapproval
export const TransferDisapproval = ({trans_id, remark}) => {
  return async dispatch => {
    const body = JSON.stringify({trans_id, remark})
    const response = await apiRequest({url:`/admin/transfer/decline`, method:'POST', body}, dispatch)
    console.log({response})
    if (response && response.data.success) {
      swal('Good!', `${response.data.message}`, 'success')
    } else {
      console.log(response)
      swal('Oops!', 'Somthing went wrong with your network.', 'error')
    }
  }
}