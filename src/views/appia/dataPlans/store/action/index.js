import { paginateArray, apiRequest, swal } from '@utils'


// ** Get all Data
export const getAllData = () => {
  return async dispatch => {
    const response = await apiRequest({ url: '/admin/rewards/data-plans/get', method: 'GET' }, dispatch)
    if (response) {
      if (response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_DATA_PLANS',
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
export const getFilteredData = (dataPlans, params) => {
  return async dispatch => {
    const { q = '', perPage = 10, page = 1, role = null, category = null } = params

    /* eslint-disable  */
    const queryLowered = q.toLowerCase()
    const filteredData = dataPlans.filter(
      plan =>
        (plan.network.toLowerCase().includes(queryLowered) || plan.category.toLowerCase().includes(queryLowered) || plan.validity.toLowerCase().includes(queryLowered) || plan.product_id.toLowerCase().includes(queryLowered)) &&
        plan.category === (category || plan.category)
    )
    /* eslint-enable  */

    dispatch({
      type: 'GET_FILTERED_DATA_PLANS',
      data: paginateArray(filteredData, perPage, page),
      totalPages: filteredData.length,
      params
    })
  }
}

export const getPlan = (dataPlans, id) => {
  return async dispatch => {
    const plan = dataPlans.find(i => i.id === id)
    dispatch({
      type: 'GET_PLAN',
      selectedPlan: plan
    })
  }
}
