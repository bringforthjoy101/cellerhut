// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { activateUser, deactivateUser, blacklistUserAsset, trackUser, UserDetails  } from '../store/action'
import { PasswordReset, BlacklistUser, TrackingDetails } from './AddFunds'
import { store } from '@store/storeConfig/store'


const PlanCard = ({ userData, userDetails, track }) => {


  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        {userDetails.user_details.status === "active" ? <Button.Ripple className='text-center mb-1' color= 'danger' outline  block onClick={() => { store.dispatch(deactivateUser(store.getState().appiaUsers.allData, userDetails.user_details.user_id)) }}> Deactivate User</Button.Ripple> : <Button.Ripple 
         className='text-center mb-1' 
         color='success' 
         outline
         block
         onClick={() => { store.dispatch(activateUser(store.getState().appiaUsers.allData, userDetails.user_details.user_id)) }}
       >
         Activate User
       </Button.Ripple>
        }
        <PasswordReset userId={userDetails.user_details.user_id} userData={userData} />
        <BlacklistUser userId={userDetails.user_details.user_id} userData={userData} />
        <Button.Ripple className='text-center mb-1' color= 'danger' outline  block onClick={() => { store.dispatch(blacklistUserAsset(userDetails.user_details.phone)) }}> Blacklist Asset</Button.Ripple>
        <TrackingDetails userDetails={userDetails} trackingDetail={track} /> 
      </CardBody>
    </Card>
  )
}

export default PlanCard
