import axios from 'axios'
import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/misc/feedbacks', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_FEEDBACKS',
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
export const getFilteredData = (feedbacks, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, role = null} = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = feedbacks.filter(
      feedback =>
        (feedback.email.toLowerCase().includes(queryLowered) || feedback.name.toLowerCase().includes(queryLowered))
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

export const getFeedback = (feedbacks, id) => {
  return async dispatch => {
    const feedback = feedbacks.find(i => i.id === id)
    dispatch({
      type: 'GET_FEEDBACK',
      selectedFeedback: feedback
    })
  }
}

