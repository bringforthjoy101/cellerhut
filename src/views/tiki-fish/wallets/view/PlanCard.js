// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'
import { useState, useEffect } from 'react'

import { updateCustomerStatus, deactivateUser, blacklistUserAsset, trackUser, UserDetails  } from '../store/action'
import { PasswordReset, BlacklistUser, TrackingDetails, AddFunds, DeductFunds } from './AddFunds'
import { store } from '@store/storeConfig/store'
import { selectThemeColors, isUserLoggedIn } from '@utils'

const PlanCard = ({ walletDetails }) => {

  const [userData, setUserData] = useState(null)
  
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
  }, [])

  // DeductFunds

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        {/* {customerDetails.status === "active" ? <Button.Ripple className='text-center mb-1' color= 'danger' outline  block onClick={() => { store.dispatch(updateCustomerStatus(customerDetails.id, 'suspended')) }}> Suspend Customer</Button.Ripple> : <Button.Ripple 
         className='text-center mb-1' 
         color='success' 
         outline
         block
         onClick={() => { store.dispatch(updateCustomerStatus(customerDetails.id, 'active')) }}
       >
         Activate Customer
       </Button.Ripple>
        } */}
        {userData?.role === "admin" || userData?.role === "store" ? <div><AddFunds walletDetails={walletDetails} /></div> : ''}
      </CardBody>
    </Card>
  )
}

export default PlanCard
