// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { swal, apiRequest } from '@utils'
import { getAllData, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, FormText } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const SidebarNewUsers = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch()

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: ''
  })
  // ** Function to handle form submit
  const onSubmit = async (event, errors) => {
    event?.preventDefault()
    if (errors && !errors.length) {
      const body = JSON.stringify(userData)
      try {
        const response = await apiRequest({url:'/admin/register', method:'POST', body}, dispatch)
        if (response) {
          if (response.data.success) {
            swal('Great job!', response.data.message, 'success')
            dispatch(getAllData())
            toggleSidebar()
          } else {
            swal('Oops!', response.data.message, 'error')
          }
        } else {
          swal('Oops!', 'Something went wrong with your network.', 'error')
        }
        
      } catch (error) {
        console.error({error})
      }
    }
  }

  useEffect(() => {
    onSubmit()
    dispatch(getAllData())
  }, [dispatch])

    return (
      <Sidebar
        size='lg'
        open={open}
        title='New Admin'
        headerClassName='mb-1'
        contentClassName='pt-0'
        toggleSidebar={toggleSidebar}
      >
        <AvForm onSubmit={onSubmit}>
          <FormGroup>
            <Label for='first_name'>First Name</Label>
            <AvInput 
              name='first_name' 
              id='first_name' 
              placeholder='John Doe' 
              value={userData.first_name}
              onChange={e => setUserData({...userData, first_name: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='last_name'>Last Name</Label>
            <AvInput 
              name='last_name' 
              id='last_name' 
              placeholder='johnDoe99' 
              value={userData.last_name}
              onChange={e => setUserData({...userData, last_name: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='email'>Email</Label>
            <AvInput 
              type='email' 
              name='email' 
              id='email' 
              placeholder='john.doe@example.com' 
              value={userData.email}
              onChange={e => setUserData({...userData, email: e.target.value})}
              required 
            />
            <FormText color='muted'>You can use letters, numbers & periods</FormText>
          </FormGroup>
          <FormGroup>
            <Label for='phone'>Phone</Label>
            <AvInput 
              name='phone' 
              id='phone' 
              placeholder='(397) 294-5153' 
              value={userData.phone}
              onChange={e => setUserData({...userData, phone: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='role'>User Role</Label>
            <AvInput 
              type='select' 
              id='role' 
              name='role' 
              value={userData.role}
              onChange={e => setUserData({...userData, role: e.target.value})}
              required
            >
              <option value='0'>Select Option</option>
              <option value='1'>Control Admin</option>
              <option value='2'>Financial Admin</option>
              <option value='3'>Super Admin</option>
            </AvInput>
          </FormGroup>
          <Button type='submit' className='mr-1' color='primary'>
            Submit
          </Button>
          <Button type='reset' color='secondary' outline onClick={toggleSidebar}>
            Cancel
          </Button>
        </AvForm>
      </Sidebar>
    )
}


export default SidebarNewUsers
