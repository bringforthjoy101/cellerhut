import { useState, useEffect } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { store } from '@store/storeConfig/store'
import { useSelector, useDispatch } from 'react-redux'
import { swal, apiRequest } from '@utils'


const PlanCard = ({ selectedPlan }) => {
  const dispatch = useDispatch()

  const [formModal, setFormModal] = useState(false)


  const DeletePlanSchema = Yup.object().shape({
    data_plan_id: Yup.string().required("required")
  })


  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
        <h5 className='mb-0'>Actions</h5>
      </CardHeader>
      
    </Card>
  )
}

export default PlanCard
