import axios from 'axios'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// ** Checks if an object is empty (returns boolean)
export const isObjEmpty = obj => Object.keys(obj).length === 0

// ** Returns K format from a number
export const kFormatter = num => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

// ** Converts HTML to string
export const htmlToString = html => html.replace(/<\/?[^>]+(>|$)/g, '')

// ** Checks if the passed date is today
const isToday = date => {
  const today = new Date()
  return (
    /* eslint-disable operator-linebreak */
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
    /* eslint-enable */
  )
}

/**
 ** Format and return date in Humanize format
 ** Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 ** Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (value, formatting = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) return value
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

// ** Returns short month of passed date
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => JSON.parse(localStorage.getItem('userData'))
// export const isUserLoggedOut = () =>  JSON.parse(localStorage.removeItem('userData'))
console.log(isUserLoggedIn())

/**
 ** This function is used for demo purpose route navigation
 ** In real app you won't need this function because your app will navigate to same route for each users regardless of ability
 ** Please note role field is just for showing purpose it's not used by anything in frontend
 ** We are checking role just for ease
 * ? NOTE: If you have different pages to navigate based on user ability then this function can be useful. However, you need to update it.
 * @param {String} userRole Role of user
 */
export const getHomeRouteForLoggedInUser = (userRole = 'admin') => {
  console.log({userRole})
  if (userRole === 'admin') return '/'
  if (userRole === 'client') return '/access-control'
  return '/login'
}

// ** React Select Theme Colors
export const selectThemeColors = theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#7367f0', // for selected option bg-color
    neutral10: '#7367f0', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed' // for input hover border-color
  }
})

export const paginateArray = (array, perPage, page) => array?.slice((page - 1) * perPage, page * perPage)

export const sortCompare = key => (a, b) => {
  const fieldA = a[key]
  const fieldB = b[key]

  let comparison = 0
  if (fieldA > fieldB) {
    comparison = 1
  } else if (fieldA < fieldB) {
    comparison = -1
  }
  return comparison
}

// Api URL
export const apiUrl = process.env.REACT_APP_API_ENDPOINT

export const Storage = {
  setItem: (itemKey, itemValue) => {
    if (typeof itemValue === 'object') {
      itemValue = JSON.stringify(itemValue)
    }
    localStorage.setItem(itemKey, itemValue)
  },

  getItem: (itemKey) => {
    const itemValue = localStorage.getItem(itemKey)
    if (!itemValue) return

    try {
      return JSON.parse(itemValue)
    } catch (err) {
      return itemValue
    }
  },

  removeItem: (itemKey) => {
    localStorage.removeItem(itemKey)
  }
}

export const apiRequest = ({ url, method, body }, dispatch) => {
  const userData = Storage.getItem('userData')
  const { accessToken } = userData
  // console.log("storeee", localStorage.removeItem('userData'))
  return axios.request({
    url,
    method,
    baseURL: apiUrl,
    data: body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    responseType: 'json',
    validateStatus: (status) => {
      return status >= 200 && status < 500 // default
    }
  }).then((response) => {
    if (response.status === 401 && response.data.message === "Auth Failed") {

      // remove admin from local storage
      localStorage.removeItem('userData')
      window.location = '/login'
    }
    return response
  }).catch((error) => {
      console.log('error', error)
  })
}

export const swal = (title, text = "", icon = "") => {
  return MySwal.fire({
    title,
    text,
    icon,
    customClass: {
      confirmButton: 'btn btn-primary'
    },
    buttonsStyling: false
  })
}
