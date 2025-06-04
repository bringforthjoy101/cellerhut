import { paginateArray, sortCompare, apiRequest, swal } from '@utils'

// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/rewards/get', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_REWARDS',
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
export const getFilteredData = (rewards, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, role = null, status = null } = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = rewards.filter(
      reward =>
        (reward.name.toLowerCase().includes(queryLowered) || reward.type.toLowerCase().includes(queryLowered)) &&
        reward.status === (status || reward.status)
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_REWARDS',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const getReward = (rewards, id) => {
  return async dispatch => {
    const reward = rewards.find(i => i.id === id)
    dispatch({
      type: 'GET_REWARD',
      selectedReward: reward
    })
  }
}

// ** Get all service id
export const getAllServiceId = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/rewards/service-id/get', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_SERVICE_ID',
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
