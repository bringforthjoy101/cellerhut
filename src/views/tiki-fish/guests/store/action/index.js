import { apiRequest, swal, paginateArray } from '@utils'

export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({url: '/investments/investors', method: 'GET'}, dispatch)
    if (response && response.data.status) {
      await dispatch({
        type: 'GET_ALL_DATA',
        data: response.data.data
      })
    }
  }
}

export const getGuestDetails = (id) => {
  return async dispatch => {
    const response = await apiRequest({url: `/investments/investors/get-detail/${id}`, method: 'GET'}, dispatch)
    if (response && response.data.status) {
      await dispatch({
        type: 'GET_GUEST_DETAILS',
        data: response.data.data
      })
    }
  }
}

export const getFilteredData = (guests, params) => {
  return async dispatch => {
    const {q = '', perPage = 10, page = 1} = params

    /* eslint-disable  */
    const queryLowered = q?.toLowerCase() || ''
    const filteredData = guests.filter(
      guest =>
        (guest.fullName || '').toLowerCase().includes(queryLowered) ||
        (guest.email || '').toLowerCase().includes(queryLowered) ||
        (guest.phone || '').toLowerCase().includes(queryLowered)
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_GUEST_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const deleteGuest = (id) => {
  return async dispatch => {
    const response = await apiRequest({url: `/investments/investors/delete/${id}`, method: 'GET'}, dispatch)
    if (response && response.data.status) {
      return response.data
    } else {
      console.error(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

export const creditGuestBalance = (data) => {
  return async dispatch => {
    const body = JSON.stringify(data)
    const response = await apiRequest({url: `/investments/balance/credit`, method: 'POST', body}, dispatch)
    if (response && response.data.status) {
      swal('Good!', response.data.message, 'success')
      dispatch(getGuestDetails(data.investorId))
    } else {
      swal('Oops!', response.data.message || 'Something went wrong', 'error')
    }
  }
}

export const debitGuestBalance = (data) => {
  return async dispatch => {
    const body = JSON.stringify(data)
    const response = await apiRequest({url: `/investments/balance/debit`, method: 'POST', body}, dispatch)
    if (response && response.data.status) {
      swal('Good!', response.data.message, 'success')
      dispatch(getGuestDetails(data.investorId))
    } else {
      swal('Oops!', response.data.message || 'Something went wrong', 'error')
    }
  }
} 