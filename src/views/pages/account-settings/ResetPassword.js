import {useState} from 'react'
import { FormGroup, Row, Col, Button } from 'reactstrap'
import InputEmailToggle from '@components/input-email-toggle'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { swal, apiRequest } from '@utils'
import { useDispatch } from 'react-redux'

const PasswordTabContent = () => {
  const dispatch = useDispatch()
  const [userData, setUserData] = useState({
    email: ''
  })

  const onSubmit = async (event, errors) => {
    event.preventDefault()
    if (errors && !errors.length) {
      const body = JSON.stringify(userData)
      try {
        const response = await apiRequest({url:'/admin/reset_password', method:'POST', body}, dispatch)
        if (response.data.success) {
            swal('Great job!', response.data.message, 'success')
        } else {
          swal('Oops!', response.data.message, 'error')
        }
      } catch (error) {
        console.error({error})
      }
    }
  }
  
  return (
    <AvForm onSubmit={onSubmit}>
      <Row>
        <Col sm='6'>
          <FormGroup>
            <InputEmailToggle
              tag={AvInput}
              className='input-group-merge'
              label='Email'
              htmlFor='email'
              name='email'
              required
              value={userData.email}
              onChange={e => setUserData({...userData, email: e.target.value})}
            />
          </FormGroup>
        </Col>
        <Col className='mt-1' sm='12'>
          <Button.Ripple className='mr-1' color='primary'>
            Save changes
          </Button.Ripple>
          <Button.Ripple color='secondary' outline>
            Cancel
          </Button.Ripple>
        </Col>
      </Row>
    </AvForm>
  )
}

export default PasswordTabContent
