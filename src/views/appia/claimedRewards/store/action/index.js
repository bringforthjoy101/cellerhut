import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import { data } from 'jquery'


// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/rewards/claims', method: 'POST' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_CLAIMED_REWARDS',
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
export const getFilteredData = (claimedRewards, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, role = null, category = null } = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = claimedRewards.filter(
      claimed =>
        (claimed.user_id.toLowerCase().includes(queryLowered) || claimed.names.toLowerCase().includes(queryLowered) || claimed.email.toLowerCase().includes(queryLowered) || claimed.username.toLowerCase().includes(queryLowered) || claimed.phone.toString().toLowerCase().includes(queryLowered))
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_CLAIMED_DATA',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const getClaim = (claimedRewards, id) => {
  return async dispatch => {
    const claimed = claimedRewards.find(i => i.id === id)
    dispatch({
      type: 'GET_CLAIM',
      selectedClaim: claimed
    })
  }
}

export const getUserClaimHistory = (reward_id) => {
  return async dispatch => {
    const response = await apiRequest({ url: `/admin/rewards/claims/${reward_id}`, method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_USER_CLAIM_HISTORYS',
          data: response.data.data
        })
      } else {
        console.log(response.error)
      }
    } else {
      swal('Oops!', 'Something went wrong with your network.', 'error')
    }

  }
}

export const getFilteredUserClaims = (claims, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1 } = params
    /* eslint-enable */

    const queryLowered = q?.toLowerCase()
    const filteredData = claims?.filter(
      claim => (claim?.names?.toLowerCase()?.includes(queryLowered) || claim?.email?.toLowerCase()?.includes(queryLowered) || claim?.username?.toLowerCase()?.includes(queryLowered)) || claim?.user_id?.toLowerCase()?.includes(queryLowered))
    /* eslint-enable  */
    await dispatch({
      type: 'GET_USER_CLAIM',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData?.length,
      params
    })
  }
}
