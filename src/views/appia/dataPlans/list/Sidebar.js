// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { swal, apiRequest } from '@utils'
import { getAllData, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, FormText } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const sidebarNewDataPlan = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch()


  const [userData, setUserData] = useState({
    network: '',
    category: '',
    price: '',
    allowance: '',
    product_id: ''
  })
  const onSubmit = async (event, errors) => {
    event?.preventDefault()
    if (errors && !errors.length) {
      const body = JSON.stringify(userData)
      try {
        const response = await apiRequest({url:'/admin/rewards/data-plan/create', method:'POST', body}, dispatch)
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
        title='New Data Plan'
        headerClassName='mb-1'
        contentClassName='pt-0'
        toggleSidebar={toggleSidebar}
      >
        <AvForm onSubmit={onSubmit}>
          <FormGroup>
            <Label for='network'>Network</Label>
            <AvInput 
              name='network' 
              id='network' 
              placeholder='MTN' 
              value={userData.network}
              onChange={e => setUserData({...userData, network: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='category'>Category</Label>
            <AvInput 
              type='select' 
              id='category' 
              name='category' 
              value={userData.category}
              onChange={e => setUserData({...userData, category: e.target.value})}
              required
            >
              <option value=''>Select Option</option>
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
              <option value='monthly'>Monthly</option>
            </AvInput>
          </FormGroup>
          <FormGroup>
            <Label for='price'>Price</Label>
            <AvInput 
              type='price' 
              name='price' 
              id='price' 
              placeholder='1000' 
              value={userData.price}
              onChange={e => setUserData({...userData, price: e.target.value})}
              required 
            />
            <FormText color='muted'>You can use letters, numbers & periods</FormText>
          </FormGroup>
          <FormGroup>
            <Label for='allowance'>Allowance</Label>
            <AvInput 
              name='allowance' 
              id='allowance' 
              placeholder='1.5GB' 
              value={userData.allowance}
              onChange={e => setUserData({...userData, allowance: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='validity'>Validity</Label>
            <AvInput 
              name='validity' 
              id='validity' 
              placeholder='30Days' 
              value={userData.validity}
              onChange={e => setUserData({...userData, validity: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='product_id'>Product Id</Label>
            <AvInput 
              name='product_id' 
              id='product_id' 
              placeholder='MT2' 
              value={userData.product_id}
              onChange={e => setUserData({...userData, product_id: e.target.value})}
              required 
            />
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


export default sidebarNewDataPlan
