import { useState } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

const PlanCard = ({ selectedFeedback }) => {

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
        <h5 className='mb-0'>Actions</h5>
      </CardHeader>
      {/* <CardBody>
        {selectedFeedback.status === "Active" ? <Button.Ripple className='text-center mb-1' color= 'danger'  block onClick={() => { store.dispatch(deactivateAdmin(store.getState().appiaAdmins.allData, selectedFeedback.admin_id)) }}> Deactivate Admin</Button.Ripple> : <Button.Ripple 

         className='text-center mb-1' 
         color='success'
         block
         onClick={() => { store.dispatch(activateAdmin(store.getState().appiaAdmins.allData, selectedFeedback.admin_id)) }}
       >
         Activate Admin
       </Button.Ripple>
        }
      </CardBody> */}
    </Card>
  ) 
}

export default PlanCard
