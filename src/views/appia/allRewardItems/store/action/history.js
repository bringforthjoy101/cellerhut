import { paginateArray, sortCompare, apiRequest, swal } from '@utils'
import rewards from '../../../../../navigation/vertical/rewards'

// ** Get all reward Data
export const getAllHistoryData = () => {
    return async dispatch => {
      const response = await apiRequest({ url: '/admin/rewards/deleted', method: 'GET' }, dispatch)
      if (response) {
        if (response.data.data && response.data.success) {
          await dispatch({
            type: 'GET_ALL_HISTORY',
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
  
  // ** Get filtered reward data on page or row change
  export const getFilteredHistoryData = (rewards, params) => {
    return async dispatch => {
      const { q = '', perPage = 10, page = 1} = params
  
      /* eslint-disable  */
      const queryLowered = q.toLowerCase()
      const filteredData = rewards?.filter(
        reward =>
          (reward.name.toLowerCase().includes(queryLowered) || reward.type.toLowerCase().includes(queryLowered))
      )
      /* eslint-enable  */
  
      dispatch({
        type: 'GET_FILTERED_HISTORY',
        data: paginateArray(filteredData, perPage, page),
        totalPages: filteredData?.length,
        params
      })
    }
  }

  export const getHistory = (rewards, id) => {
    return async dispatch => {
      const history = rewards?.find(i => i?.id === id)
      dispatch({
        type: 'GET_HISTORY',
        selectedHistory: history
      })
    }
  }
  