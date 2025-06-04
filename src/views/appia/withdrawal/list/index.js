// ** User List Component
import {useState, useEffect} from 'react'
import TableWithButtons from './TableWithButtons'
import Table from './Table'
import { isUserLoggedIn } from '@utils'

// ** Styles
import '@styles/react/apps/app-users.scss'

const Funds = () => {
  const [userData, setUserData] = useState(null)


  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])

  
  return (
    <div className='app-user-list'>
      {userData?.role_name === 'Financial Admin' || userData?.role_name === "Super Admin"  ? <TableWithButtons /> : <Table /> }
    </div>
  )
}

export default Funds
