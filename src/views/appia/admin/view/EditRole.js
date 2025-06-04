import { useState, useEffect } from 'react'
import { isUserLoggedIn } from '@utils'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, changeAdminRole } from '../store/action'
import { store } from '@store/storeConfig/store'


export const EditRole = ({ selectedAdmin }) => {
  const dispatch = useDispatch()
  const { id } = useParams()
  const [userData, setUserData] = useState({
    role: ''
  })
  const [formModal, setFormModal] = useState(false)

  const onSubmit = async (event, errors) => {
    event?.preventDefault()
    if (errors && !errors.length) {
      await dispatch(changeAdminRole(id, userData.role))
      dispatch(getAllData())
      setFormModal(!formModal)
   }
  }

  return (
    <div>
      <Button.Ripple className='text-center mb-1' color='primary' outline block onClick={() => setFormModal(!formModal)}>
        Edit Role
      </Button.Ripple>
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Change Role</ModalHeader>
        <AvForm onSubmit={onSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for='role'>User Role</Label>
              <AvInput
                type='select'
                id='role'
                name='role'
                value={userData.role}
                onChange={e => setUserData({ ...userData, role: e.target.value })}
                required
              >
                <option value='0'>Select Role</option>
                <option value='1'>Control Admin</option>
                <option value='2'>Financial Admin</option>
                <option value='3'>Super Admin</option>
              </AvInput>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button.Ripple color='primary' type='submit'>
              <span className='ml-50'>Change Role</span>
            </Button.Ripple>
          </ModalFooter>
        </AvForm>

      </Modal>
    </div>
  )
}
export default EditRole
