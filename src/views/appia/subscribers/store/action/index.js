import { paginateArray, apiRequest, swal } from '@utils'

// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/misc/subscribers', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_SUBSCRIBERS',
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

export const getFilteredData = (subscribers, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, status = null} = params
    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = subscribers.filter(
      subscribe => (subscribe.email.toLowerCase().includes(queryLowered)) &&
      subscribe.status === (status || subscribe.status)
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
