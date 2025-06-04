import { useState } from 'react'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'

import { TransferApproval, TransferDisapproval} from '../store/action'

const ApproveTransferSchema = Yup.object().shape({
  trans_id: Yup.string().required("required")
})

const DisapproveTransferSchema = Yup.object().shape({
  trans_id: Yup.string().required("required"),
  remark: Yup.string().required("required")
})

export const ApproveTransfer = ({ trans_id }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)


  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='primary' outline block onClick={() => setFormModal(!formModal)}>
      Approve Transfer
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Approve Transfer</ModalHeader>
        <Formik
          initialValues={{
            trans_id
          }}
          validationSchema={ApproveTransferSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(TransferApproval(values))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >

          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='trans_id'>Transaction Id</label>
                  <Field
                    type='text'
                    name='trans_id'
                    placeholder='trans_id'
                    className={`form-control ${errors.trans_id && touched.trans_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='trans_id' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Approve</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}


// Transfer Disapproval
export const DisapproveTransfer = ({ trans_id }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)


  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='danger' outline block onClick={() => setFormModal(!formModal)}>
      Decline Transfer
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Disapprove Transfer</ModalHeader>
        <Formik
          initialValues={{
            trans_id,
            remark: ""
          }}
          validationSchema={DisapproveTransferSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(TransferDisapproval(values))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >

          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='trans_id'>Transaction Id</label>
                  <Field
                    type='text'
                    name='trans_id'
                    placeholder='trans_id'
                    className={`form-control ${errors.trans_id && touched.trans_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='trans_id' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='remark'>Remark</label>
                  <Field
                    type='text'
                    name='remark'
                    placeholder='remark'
                    className={`form-control ${errors.remark && touched.trans_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='remark' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Disapprove</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

