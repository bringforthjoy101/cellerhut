import { useState, useEffect } from 'react'
// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { store } from '@store/storeConfig/store'
import { useSelector, useDispatch } from 'react-redux'
import { getAllData } from '../store/action'
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
      <CardBody>
        <Button.Ripple className='text-center mb-1' color='danger' outline block onClick={() => setFormModal(!formModal)}>
          Delete Plan
      </Button.Ripple>
        <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
          <ModalHeader toggle={() => setFormModal(!formModal)}>Add Funds</ModalHeader>
          <Formik
            initialValues={{
              data_plan_id: selectedPlan.id
            }}
            validationSchema={DeletePlanSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const body = JSON.stringify(values)
              try {
                const response = await apiRequest({ url: '/admin/rewards/data-plan/delete', method: 'POST', body }, dispatch)
                if (response) {
                  if (response.data.success) {
                    swal('Great job!', response.data.message, 'success')
                    dispatch(getAllData())
                  } else {
                    swal('Oops!', response.data.message, 'error')
                  }
                } else {
                  swal('Oops!', 'Something went wrong with your network.', 'error')
                }

              } catch (error) {
                console.error({ error })
              }
              setSubmitting(false)
              setFormModal(!formModal)
            }}
          >

            {({ errors, touched, isSubmitting }) => (
              <Form>
                <ModalBody>
                  <FormGroup>
                    <label htmlFor='data_plan_id'>Plan Id</label>
                    <Field
                      type='number'
                      name='data_plan_id'
                      placeholder='plan id'
                      className={`form-control ${errors.data_plan_id && touched.data_plan_id && 'is-invalid'}`}
                    />
                    <ErrorMessage name='data_plan_id' component='div' className='field-error text-danger' />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Spinner color='white' size='sm' />}
                    <span className='ml-50'>Delete Plan</span>
                  </Button.Ripple>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </Modal>
      </CardBody>
    </Card>
  )
}

export default PlanCard
