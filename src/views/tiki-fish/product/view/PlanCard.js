// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { store } from '@store/storeConfig/store'
import { LogInventory } from './LogInventory'


const PlanCard = ({ selectedUser, userData }) => {

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        <LogInventory />
      </CardBody>
    </Card>
  )
}

export default PlanCard
