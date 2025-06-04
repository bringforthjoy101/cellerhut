import moment from 'moment'
import { paginateArray, sortCompare, apiRequest, swal } from '@utils'


import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export const apiUrl = process.env.REACT_APP_API_ENDPOINT

// ** Get all Data
export const getAllFundsData = () => {
  return async dispatch => {
    const response = await apiRequest({url:'/admin/fund', method:'GET'}, dispatch)
    if (response && response.data.data && response.data.success) {
        await dispatch({
          type: 'GET_ALL_FUND_DATA',
          data: response.data.data.sort((a, b) => b.log_id - a.log_id)
        })
    } else {
      console.log(response)
      swal('Oops!', 'Something went wrong.', 'error')
    }
  }
}

export const reviewFunds = (log_id, action, admins) => {
  const status = action === 'approve' ? 'approved' : 'disapproved'
  return async dispatch => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(async function (result) {
      if (result.value) {
        const body = JSON.stringify({log_id})
        const response = await apiRequest({url:`/admin/fund/${action}`, method:'POST', body}, dispatch)
        if (response && response.data.success) {
          dispatch(getAllFundsData())
          swal('Good!', `Fund was successfully ${status}`, 'success')
        } else {
          swal('Oops!', 'Somthing went wrong with your network.', 'error')
          console.log(response)
        }
      }
    })
  }
}
