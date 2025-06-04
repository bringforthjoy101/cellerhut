import { useState, useEffect } from 'react'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Row, Col } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { store } from '@store/storeConfig/store'

import { passwordReset, blacklistUser, blacklistUserAsset, trackUser } from '../store/action'


const PasswordResetSchema = Yup.object().shape({
  user_id: Yup.string().required("required")
})


const BlacklistSchema = Yup.object().shape({
  user_id: Yup.string().required("required"),
  reason: Yup.string().required("required")
})


export const PasswordReset = ({ userId }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='primary' outline block onClick={() => setFormModal(!formModal)}>
        Reset User Password
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Password Reset</ModalHeader>
        <Formik
          initialValues={{
            user_id: userId
          }}
          validationSchema={PasswordResetSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(passwordReset(values))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='user_id'>User Id</label>
                  <Field
                    type='text'
                    name='user_id'
                    placeholder='UserId'
                    className={`form-control ${errors.user_id && touched.user_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='user_id' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Reset</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

// Blacklist User
export const BlacklistUser = ({ userId }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='danger' outline block onClick={() => setFormModal(!formModal)}>
        Blacklist User
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Blacklist</ModalHeader>
        <Formik
          initialValues={{
            user_id: userId,
            reason: ""
          }}
          validationSchema={BlacklistSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(blacklistUser(values))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='user_id'>User Id</label>
                  <Field
                    type='text'
                    name='user_id'
                    placeholder='UserId'
                    className={`form-control ${errors.user_id && touched.user_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='user_id' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='user_id'>Reason</label>
                  <Field
                    type='text'
                    name='reason'
                    placeholder='Reason'
                    className={`form-control ${errors.reason && touched.reason && 'is-invalid'}`}
                  />
                  <ErrorMessage name='reason' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Blacklist</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

// Blacklist Asset
export const BlacklistUserAsset = ({ userId, phone }) => {
  const dispatch = useDispatch()
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='secondary' outline block onClick={() => setFormModal(!formModal)}>
        Blacklist User Asset
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Blacklist Asset</ModalHeader>
        <Formik
          initialValues={{
            user_id: userId,
            reason: ""
          }}
          validationSchema={BlacklistSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await dispatch(blacklistUserAsset(values, phone))
            setSubmitting(false)
            setFormModal(!formModal)
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <FormGroup>
                  <label htmlFor='user_id'>User Id</label>
                  <Field
                    type='text'
                    name='user_id'
                    placeholder='UserId'
                    className={`form-control ${errors.user_id && touched.user_id && 'is-invalid'}`}
                  />
                  <ErrorMessage name='user_id' component='div' className='field-error text-danger' />
                </FormGroup>
                <FormGroup>
                  <label htmlFor='user_id'>Reason</label>
                  <Field
                    type='text'
                    name='reason'
                    placeholder='Reason'
                    className={`form-control ${errors.reason && touched.reason && 'is-invalid'}`}
                  />
                  <ErrorMessage name='reason' component='div' className='field-error text-danger' />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button.Ripple color='primary' type='submit' disabled={isSubmitting}>
                  {isSubmitting && <Spinner color='white' size='sm' />}
                  <span className='ml-50'>Blacklist Asset</span>
                </Button.Ripple>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}


// Decode Jwt
export const TrackingDetails = ({ userDetails, trackingDetail }) => {
  const [formModal, setFormModal] = useState(false)

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='secondary' outline block onClick={() => { setFormModal(!formModal); store.dispatch(trackUser(userDetails.user_details?.user_id)) }}>
        User Tracking Details
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Tracking Details</ModalHeader>
        {trackingDetail !== null ? <ModalBody>
          <Row>
            <Col>
              <h2>Personal Details</h2>
              <div>
                <h6><span>Full Name:</span> {trackingDetail.user.names}</h6>
                <p><span>Email:</span> {trackingDetail.user.email}</p>
                <p><span>UserName:</span> {trackingDetail.user.username}</p>
                <p><span>User Id:</span> {trackingDetail.user.user_id}</p>
                <p><span>Phone:</span> {trackingDetail.user.phone}</p>
              </div>
            </Col>
            <Col>
              <h2>Device Details</h2>
              <div>
                <p><span>Device Id:</span> {trackingDetail.deviceInfo.device.id}</p>
                <p><span>Device Brand:</span> {trackingDetail.deviceInfo.device.brand}</p>
                <p><span>Device Model:</span> {trackingDetail.deviceInfo.device.model}</p>
                <p><span>Device Type:</span> {trackingDetail.deviceInfo.device.type}</p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>IP Details</h2>
              <div>
                <p><span>Region:</span> {trackingDetail.ipInfo.region}</p>
                <p><span>Time Zone:</span> {trackingDetail.ipInfo.timezone}</p>
                <p><span>City:</span> {trackingDetail.ipInfo.city}</p>
                <p><span>Country:</span> {trackingDetail.ipInfo.country}</p>
              </div>
            </Col>
          </Row>
        </ModalBody> : <ModalBody>
          <Row>
            <Col className="mx-auto">
              <h4>Tracking details not found for this User !</h4>
            </Col>
          </Row>
        </ModalBody>}
      </Modal>
    </div>
  )
}
