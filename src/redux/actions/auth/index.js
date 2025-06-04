// ** Handle admin Login
export const handleLogin = data => {
  return dispatch => {
    dispatch({ type: 'LOGIN', data })

    // ** Add to admin to localStorage
    localStorage.setItem('userData', JSON.stringify(data))
  }
}

// ** Handle admin Logout
export const handleLogout = () => {
  return dispatch => {
    dispatch({ type: 'LOGOUT' })
    
    // remove admin from local storage
    localStorage.removeItem('userData')
  }
}
