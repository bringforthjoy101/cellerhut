// ** React Imports
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Lock, Edit, Trash2 } from 'react-feather'
import { Media, Row, Col, Button, Form, Input, Label, FormGroup, Table, CustomInput } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, getAdmin } from '../store/action'
import { swal, apiRequest } from '@utils'

const UserAccountTab = ({ selectedAdmin }) => {
  const dispatch = useDispatch()
  // ** States
  const [img, setImg] = useState(null)
  const [adminData, setAdminData] = useState({
    firstName: selectedAdmin.firstName,
    lastName: selectedAdmin.lastName,
    email: selectedAdmin.email,
    status: selectedAdmin.status,
    role: selectedAdmin.role
    // image: 'https://res.cloudinary.com/bringforthjoy/image/upload/v1621720743/INVESTA/appia_reward_image_placeholder_um7q6g.jpg'
  })

  const onSubmit = async (event, errors) => {
    event.preventDefault()
    console.log({errors})
    if (errors && !errors.length) {
      console.log({adminData})
      const body = JSON.stringify(adminData)
      try {
        const response = await apiRequest({url:`/admins/update/${selectedAdmin.id}`, method:'POST', body}, dispatch)
        console.log({response})
        if (response.data.status) {
            swal('Great job!', response.data.message, 'success')
            dispatch(getAllData())
            dispatch(getAdmin(selectedAdmin.id))
            setAdminData({
              firstName: selectedAdmin.firstName,
              lastName: selectedAdmin.lastName,
              email: selectedAdmin.email,
              status: selectedAdmin.status,
              role: selectedAdmin.role
            })
        } else {
          swal('Oops!', response.data.message, 'error')
          setAdminData({
            firstName: selectedAdmin.firstName,
            lastName: selectedAdmin.lastName,
            email: selectedAdmin.email,
            status: selectedAdmin.status,
            role: selectedAdmin.role
          })
        }
      } catch (error) {
        console.error({error})
      }
    }
  }

  // ** Function to change user image
  const onChange = e => {
    const reader = new FileReader(),
      files = e.target.files
    reader.onload = function () {
      setImg(reader.result)
    }
    reader.readAsDataURL(files[0])
  }

  // ** Update user image on mount or change
  useEffect(() => {
    if (selectedAdmin !== null) {
      if (selectedAdmin.image) {
        return setImg(selectedAdmin.image)
      } else {
        return setImg(null)
      }
    }
  }, [selectedAdmin])

  // ** Renders User
  const renderUserAvatar = () => {
    if (img === null) {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded mr-2 my-25'
          content={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          contentStyles={{
            borderRadius: 0,
            fontSize: 'calc(36px)',
            width: '100%',
            height: '100%'
          }}
          style={{
            height: '90px',
            width: '90px'
          }}
        />
      )
    } else {
      return (
        <img
          className='user-avatar rounded mr-2 my-25 cursor-pointer'
          src={img}
          alt='user profile avatar'
          height='90'
          width='90'
        />
      )
    }
  }

  return (
    <Row>
      <Col sm='12'>
        <Media className='mb-2'>
          {renderUserAvatar()}
          <Media className='mt-50' body>
            <h4>{selectedAdmin.fullName} </h4>
            <div className='d-flex flex-wrap mt-1 px-0'>
              <Button.Ripple id='change-img' tag={Label} className='mr-75 mb-0' color='primary'>
                <span className='d-none d-sm-block'>Change</span>
                <span className='d-block d-sm-none'>
                  <Edit size={14} />
                </span>
                <input type='file' hidden id='change-img' onChange={onChange} accept='image/*' />
              </Button.Ripple>
              <Button.Ripple color='secondary' outline>
                <span className='d-none d-sm-block'>Remove</span>
                <span className='d-block d-sm-none'>
                  <Trash2 size={14} />
                </span>
              </Button.Ripple>
            </div>
          </Media>
        </Media>
      </Col>
      <Col sm='12'>
        <AvForm onSubmit={onSubmit}>
          <Row>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='name'>Admin Name</Label>
                <AvInput 
                  name='name' 
                  id='name' 
                  placeholder='Admin Name' 
                  value={selectedAdmin.name}
                  onChange={e => setAdminData({...adminData, name: e.target.value})}
                  required 
                />
                {/* <Input type='text' id='name' placeholder='Name' defaultValue={selectedAdmin.name} /> */}
              </FormGroup>
            </Col>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='price'>Admin Price</Label>
                <AvInput 
                  name='price' 
                  id='price' 
                  placeholder='Admin Price' 
                  value={selectedAdmin.price}
                  onChange={e => setAdminData({...adminData, price: e.target.value})}
                  required 
                />
                {/* <Input type='text' id='price' placeholder='Price' defaultValue={selectedAdmin.price} /> */}
              </FormGroup>
            </Col>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='qty'>Admin Qty</Label>
                <AvInput 
                  name='qty' 
                  id='qty' 
                  placeholder='Admin Qty' 
                  value={selectedAdmin.qty}
                  onChange={e => setAdminData({...adminData, qty: e.target.value})}
                  required 
                />
                {/* <Input type='text' id='qty' placeholder='Qty' defaultValue={selectedAdmin.qty} /> */}
              </FormGroup>
            </Col>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='unit'>Unit</Label>
                <AvInput 
                  type='select' 
                  id='unit' 
                  name='unit' 
                  value={selectedAdmin.unit}
                  onChange={e => setAdminData({...adminData, unit: e.target.value})}
                  required
                >
                  <option value={selectedAdmin.unit} className='text-cpitalize'>{selectedAdmin.unit}</option>
                  <option value='kg'>Kilogram</option>
                  <option value='pck'>Pack</option>
                  <option value='pcs'>Pieces</option>
                  <option value='l'>Litre</option>
                  <option value='tuber'>Tuber</option>
                  <option value='g'>Gram</option>
                  <option value='rubber'>Rubber</option>
                  <option value='bunch'>Bunch</option>
                  <option value='crate'>Crate</option>
                  <option value='carton'>Carton</option>
                </AvInput>
              </FormGroup>
            </Col>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='category'>Status</Label>
                <AvInput 
                  type='select' 
                  id='category' 
                  name='category' 
                  value={selectedAdmin.category}
                  onChange={e => setAdminData({...adminData, category: e.target.value})}
                  required
                >
                  <option value={selectedAdmin.category} className='text-cpitalize'>{selectedAdmin.category}</option>
                  <option value='shop'>Shop</option>
                  <option value='book'>Book</option>
                  <option value='store'>Store</option>
                </AvInput>
              </FormGroup>
            </Col>
            <Col md='6' sm='12'>
              <FormGroup>
                <Label for='status'>Status</Label>
                <AvInput 
                  type='select' 
                  id='status' 
                  name='status' 
                  value={selectedAdmin.status}
                  onChange={e => setAdminData({...adminData, status: e.target.value})}
                  required
                >
                  <option value={selectedAdmin.status} className='text-cpitalize'>{selectedAdmin.status}</option>
                  <option value='in stock'>In Stock</option>
                  <option value='out of stock'>Out Of Stock</option>
                </AvInput>
              </FormGroup>
            </Col>
            
            <Col className='d-flex flex-sm-row flex-column mt-2' sm='12'>
              <Button className='mb-1 mb-sm-0 mr-0 mr-sm-1' type='submit' color='primary'>
                Save Changes
              </Button>
              <Button color='secondary' outline>
                Reset
              </Button>
            </Col>
          </Row>
          </AvForm>
      </Col>
    </Row>
  )
}
export default UserAccountTab
