import { useState } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'
import { ApproveTransfer, DisapproveTransfer } from './ApproveTransfer'

const PlanCard = ({ selectedTransfer }) => {
        

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
        <h5 className='mb-0'>Actions</h5>
      </CardHeader>
      <CardBody>
        <ApproveTransfer trans_id={selectedTransfer.trans_id} />
        <DisapproveTransfer trans_id={selectedTransfer.trans_id} />
      </CardBody>
    </Card>
  ) 
}

export default PlanCard
