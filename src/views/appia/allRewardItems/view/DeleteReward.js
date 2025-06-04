import { useState } from 'react'
import { getAllData } from '../store/action'
import { getAllHistoryData } from '../store/action/history'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { swal, apiRequest } from '@utils'


const DeleteRewardSchema = Yup.object().shape({
  reward_id: Yup.string().required("required")
})

export const DeleteReward = ({selectedReward}) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)


  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='danger' outline block onClick={() => setFormModal(!formModal)}>
        Delete Reward
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
          <ModalHeader toggle={() => setFormModal(!formModal)}>Delete Reward</ModalHeader>
          <Formik
            initialValues={{
              reward_id: selectedReward?.id
            }}
            validationSchema={DeleteRewardSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const body = JSON.stringify(values)
              try {
                const response = await apiRequest({ url: '/admin/rewards/delete', method: 'POST', body }, dispatch)
                if (response) {
                  if (response.data.success) {
                    swal('Great job!', response.data.message, 'success')
                    dispatch(getAllData())
                    dispatch(getAllHistoryData())
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
                    <label htmlFor='reward_id'>Reward Id</label>
                    <Field
                      type='number'
                      name='reward_id'
                      placeholder='reward id'
                      className={`form-control ${errors.reward_id && touched.reward_id && 'is-invalid'}`}
                    />
                    <ErrorMessage name='reward_id' component='div' className='field-error text-danger' />
                  </FormGroup>
                </ModalBody>
                <ModalFooter>
                  <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                    {isSubmitting && <Spinner color='white' size='sm' />}
                    <span className='ml-50'>Delete Reward</span>
                  </Button.Ripple>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </Modal>
    </div>
  )
}

