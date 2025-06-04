// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { AddFunds, DeductFunds } from './AddFunds'
import { store } from '@store/storeConfig/store'


const PlanCard = ({ selectedUser, userData }) => {

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        <AddFunds userId={selectedUser.user_details.user_id} userData={userData} />
        <DeductFunds userId={selectedUser.user_details.user_id} userData={userData} />
      </CardBody>
    </Card>
  )
}

export default PlanCard
