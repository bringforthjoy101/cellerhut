import { useState } from 'react'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'

import { getAllData, getInvestmentPackageDetails } from '../store/action'

const AddFundsSchema = Yup.object().shape({
  amount: Yup.number()
    .lessThan(100000, `You cant add funds more than 100000`)
    .required('Amount is required').positive().integer(),
  narration: Yup.string()
    .min(3, "Reason too Short!")
    .max(50, "Reason too Long!")
    .required('Reason is required')
  // customerId: Yup.string().required("required")
})

export const AddFunds = ({ customerDetails }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='primary' outline block onClick={() => setFormModal(!formModal)}>
        Credit Wallet
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Credit {investmentPackageDetails.name}'s Wallet</ModalHeader>
        <Formik
          initialValues={{
            amount: '',
            narration: '',
            type: 'credit',
            customerId: customerDetails.id
          }}
          validationSchema={AddFundsSchema}
          onSubmit={async (values, { setSubmitting }) => {
            console.log(values)
            setSubmitting(false)
            setFormModal(!formModal)
            await dispatch(getAllData())
            await dispatch(getInvestmentPackageDetails(investmentPackageDetails.id))
          }}
        >

          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='amount'>Amount</label>
                  <Field
                    type='number'
                    name='amount'
                    placeholder='Amount'
                    className={`form-control ${errors.amount && touched.amount && 'is-invalid'}`}
                  />
                  <ErrorMessage name='amount' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='narration'>Narration</label>
                  <Field
                    type='text'
                    name='narration'
                    placeholder='Narration'
                    className={`form-control ${errors.narration && touched.narration && 'is-invalid'}`}
                  />
                  <ErrorMessage name='narration' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Credit Wallet</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

export const DeductFunds = ({ customerDetails }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='danger' outline block onClick={() => setFormModal(!formModal)}>
        Debit Wallet
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Debit {investmentPackageDetails.name}'s Wallet</ModalHeader>
        <Formik
          initialValues={{
            amount: '',
            narration: '',
            type: 'debit',
            customerId: investmentPackageDetails.id
          }}
          validationSchema={AddFundsSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(creditOrDebitCustomerWallet(values))
            setSubmitting(false)
            setFormModal(!formModal)
            await dispatch(getAllData())
            await dispatch(getInvestmentPackageDetails(investmentPackageDetails.id))
          }}
        >

          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='amount'>Amount</label>
                  <Field
                    type='number'
                    name='amount'
                    placeholder='Amount'
                    className={`form-control ${errors.amount && touched.amount && 'is-invalid'}`}
                  />
                  <ErrorMessage name='amount' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='narration'>Narration</label>
                  <Field
                    type='text'
                    name='narration'
                    placeholder='Narration'
                    className={`form-control ${errors.narration && touched.narration && 'is-invalid'}`}
                  />
                  <ErrorMessage name='narration' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Debit Wallet</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}