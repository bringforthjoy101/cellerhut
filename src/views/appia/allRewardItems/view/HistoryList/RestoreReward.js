import { useState, useEffect } from 'react'
import { useParams} from 'react-router-dom'
import { getAllHistoryData } from '../../store/action/history'
import { getAllData } from '../../store/action/index'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { swal, apiRequest } from '@utils'


const DeleteRewardSchema = Yup.object().shape({
  reward_id: Yup.string().required("required")
})


const RestoreReward = () => {
    const dispatch = useDispatch(),
    { id } = useParams()
  const store = useSelector(state => state.appiaDeletedRewards)

    const [formModal, setFormModal] = useState(false)
    
    return (
      <div>
        <Button.Ripple className='text-center mb-1 mt-1' color='success' outline onClick={() => setFormModal(!formModal)}>
          Restore Reward
        </Button.Ripple>
        <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
            <ModalHeader toggle={() => setFormModal(!formModal)}> Restore Reward</ModalHeader>
            <Formik
              initialValues={{
                reward_id: ""
              }}
              validationSchema={DeleteRewardSchema}
              onSubmit={async (values, { setSubmitting }) => {
                const body = JSON.stringify(values)
                try {
                  const response = await apiRequest({ url: '/admin/rewards/restore', method: 'POST', body }, dispatch)
                  if (response) {
                    if (response.data.success) {
                      swal('Great job!', response.data.message, 'success')
                      dispatch(getAllHistoryData())
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
                      <span className='ml-50'>Restore Reward</span>
                    </Button.Ripple>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </Modal>
      </div>
    )
  }
  export default RestoreReward