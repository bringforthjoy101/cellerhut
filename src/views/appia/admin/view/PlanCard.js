import { useState } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { activateAdmin, deactivateAdmin } from '../store/action'
import { store } from '@store/storeConfig/store'
import { EditRole } from './EditRole'


const PlanCard = ({ selectedAdmin }) => {

  // state
  const [toggleButton, setToggleButton] = useState(false)

  // ** Function to toggle sidebar
  const openButton = () => setToggleButton(!toggleButton)

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
        <h5 className='mb-0'>Actions</h5>
      </CardHeader>
      <CardBody>
        {selectedAdmin.status === "Active" ? <Button.Ripple className='text-center mb-1' color= 'danger'  block onClick={() => { store.dispatch(deactivateAdmin(store.getState().appiaAdmins.allData, selectedAdmin.admin_id)) }}> Deactivate Admin</Button.Ripple> : <Button.Ripple 

         className='text-center mb-1' 
         color='success'
         block
         onClick={() => { store.dispatch(activateAdmin(store.getState().appiaAdmins.allData, selectedAdmin.admin_id)) }}
       >
         Activate Admin
       </Button.Ripple>
        }
        <EditRole selectedAdmin={selectedAdmin} />
      </CardBody> 
    </Card>
  ) 
}

export default PlanCard
