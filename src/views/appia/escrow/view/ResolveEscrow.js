import { useState } from 'react'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { escrowResolve } from '../store/action'
import { useParams } from 'react-router-dom'


const ResoveSchema = Yup.object().shape({
  escrow_id: Yup.string().required('Escrow id is required'),
  resolution: Yup.string().required('Reason is required'),
  status: Yup.string().required("Status isrequired")
})

const ResolveEscrows = ({ code, status }) => {
  const dispatch = useDispatch(),
  { id } = useParams()
const store = useSelector(state => state.appiaEscrow)
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='primary' outline block onClick={() => setFormModal(!formModal)}>
        Resolve Escrow
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Resolve Escrow</ModalHeader>
        <Formik
          initialValues={{
            escrow_id: code,
            status,
            resolution: ""
        }}
          validationSchema={ResoveSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(escrowResolve(values))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >

          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='escrow_id'>Escrow_id</label>
                  <Field
                    type='text'
                    name='escrow_id'
                    placeholder='escrow_id'
                    className={`form-control ${errors.escrow_id && touched.escrow_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='escrow_id' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="status">Status</label>
                  <Field
                    as='select'
                    name='status'
                    placeholder='select an option'
                    className={`form-control ${errors.status && touched.status && 'is-invalid'}`}
                  >
                    <option value="conteste">Contest</option>
                    <option value="complete">Complete</option>
                  </Field>
                  <ErrorMessage name='status' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='resolution'>Resolution</label>
                  <Field
                    type='text'
                    name='resolution'
                    placeholder='Resolution'
                    className={`form-control ${errors.resolution && touched.resolution && 'is-invalid'}`}
                  />
                  <ErrorMessage name='resolution' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Submit</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}


export default ResolveEscrows
