import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Spinner, Modal, ModalHeader, ModalBody, Label, FormGroup } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData } from '../store/action'
import { swal, apiRequest } from '@utils'

const Sidebar = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestData, setGuestData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })

  const onSubmit = async (event, errors) => {
    if (errors && !errors.length) {
      setIsSubmitting(true)
      const body = JSON.stringify(guestData)
      try {
        const response = await apiRequest({url: '/investments/investors/create', method: 'POST', body}, dispatch)
        if (response.data.status) {
          setIsSubmitting(false)
          swal('Great job!', response.data.message, 'success')
          dispatch(getAllData())
          toggleSidebar()
        } else {
          setIsSubmitting(false)
          swal('Oops!', response.data.message, 'error')
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error({error})
      }
    }
  }

  return (
    <Modal
      isOpen={open}
      toggle={toggleSidebar}
      className='modal-dialog-centered modal-lg'
    >
      <ModalHeader toggle={toggleSidebar}>Add New Guest</ModalHeader>
      <ModalBody>
        <AvForm onSubmit={onSubmit}>
          <FormGroup>
            <Label for='fullName'>Full Name</Label>
            <AvInput
              name='fullName'
              id='fullName'
              placeholder='Full Name'
              value={guestData.fullName}
              onChange={e => setGuestData({...guestData, fullName: e.target.value})}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for='email'>Email</Label>
            <AvInput
              type='email'
              name='email'
              id='email'
              placeholder='Email'
              value={guestData.email}
              onChange={e => setGuestData({...guestData, email: e.target.value})}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for='phone'>Phone</Label>
            <AvInput
              name='phone'
              id='phone'
              placeholder='Phone'
              value={guestData.phone}
              onChange={e => setGuestData({...guestData, phone: e.target.value})}
              required
            />
          </FormGroup>
          <Button type='submit' className='mr-1' color='primary' disabled={isSubmitting}>
            {isSubmitting && <Spinner color='white' size='sm' />}
            Submit
          </Button>
          <Button type='reset' color='secondary' outline onClick={toggleSidebar}>
            Cancel
          </Button>
        </AvForm>
      </ModalBody>
    </Modal>
  )
}

export default Sidebar 