// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { store } from '@store/storeConfig/store'


const PlanCard = ({ selectedUser, userData }) => {

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        {selectedUser.status === "Active" ? <Button.Ripple className='text-center mb-1' color= 'danger' outline  block onClick={() => { store.dispatch(deactivateUser(store.getState().appiaUsers.allData, selectedUser.user_id)) }}> Deactivate User</Button.Ripple> : <Button.Ripple 
         className='text-center mb-1' 
         color='success' 
         outline
         block
         onClick={() => { store.dispatch(activateUser(store.getState().appiaUsers.allData, selectedUser.user_id)) }}
       >
         Activate User
       </Button.Ripple>
        }
        <PasswordReset userId={selectedUser.user_id} userData={userData} />
        <BlacklistUser userId={selectedUser.user_id} userData={userData} />
        <BlacklistUserAsset userId={selectedUser.user_id} phone={selectedUser.phone} />
      </CardBody>
    </Card>
  )
}

export default PlanCard
