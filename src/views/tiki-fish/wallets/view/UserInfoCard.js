// ** Custom Components
import { useState, useEffect } from 'react'
import Avatar from '@components/avatar'
import moment from 'moment'

import {useHistory, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { deleteWallet, getAllData, editWallet, getWalletDetails } from '../store/action'

const MySwal = withReactContent(Swal)

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, CustomInput } from 'reactstrap'
import { Pocket, Award, Hexagon, UserPlus, Check, Star, Flag, Phone } from 'react-feather'
import CardTitle from 'reactstrap/lib/CardTitle'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const UserInfoCard = ({ walletDetails, userRole }) => {

  const renderWalletImg = () => {
    if (walletDetails !== null && walletDetails.avatar) {
      return <img src={walletDetails.avatar} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={`${walletDetails.name}`}
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
    }
  }

  const history = useHistory()
  const dispatch = useDispatch()

  // ** Handle Delete
  const handleDelete = async (id) => {
    
        return MySwal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-danger ml-1'
          },
          buttonsStyling: false
        }).then(async function (result) {
          if (result.value) {
            const deleted = await dispatch(deleteWallet(id))
            if (deleted) {
              await dispatch(getAllData())
                MySwal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Customer has been deleted.',
                    customClass: {
                      confirmButton: 'btn btn-primary'
                    }
                  })
              history.push(`/wallets/list`)
            }
            
          }
        })
      
  }

  const getTotalSpent = (orders) => {
    const totalSpent = orders.reduce(function (accumulator, item) {
      return accumulator + item.amount
    }, 0)
    return totalSpent
  }

  const [userData, setUserData] = useState({
    name: walletDetails.name,
  })
  const [formModal, setFormModal] = useState(false)

  const onSubmit = async (event, errors) => {
    event?.preventDefault()
    if (errors && !errors.length) {
      await dispatch(editWallet(walletDetails.id, userData))
      dispatch(getWalletDetails(walletDetails.id))
      setFormModal(!formModal)
   }
  }

  const uploadImage = async (event) => {
    event?.preventDefault()
      const formData = new FormData()
      formData.append("image", event.target.files[0])
      try {
        const response = await apiRequest({
          url: "/upload-images",
          method: "POST",
          body: formData
        })
        if (response) {
          if (response?.data?.status) {
            const avatar = response.data.data
            // setIsSubmitting(false)
            setUserData({ ...userData, avatar })
          } else {
            swal("Oops!", response.data.message, "error")
          }
        } else {
          swal("Oops!", "Something went wrong with your image.", "error")
        }
      } catch (error) {
        console.error({ error })
      }
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Col xl='6' lg='12' className='d-flex flex-column justify-content-between border-container-lg'>
            <div className='user-avatar-section'>
              <div className='d-flex justify-content-start'>
              {renderWalletImg()}
                <div className='d-flex flex-column ml-1'>
                  <div className='user-info mb-1'>
                    <h4 className='mb-0'>{walletDetails !== null ? `${walletDetails.name}` : 'Customer Name'}</h4>
                    <CardText tag='span' className='text-captalize'>
                      {walletDetails?.location}
                    </CardText>
                  </div>
                  <div className='d-flex flex-wrap align-items-center'>
                    {/* <Button.Ripple tag={Link} to={`/customer/edit/${customerDetails.id}`} disabled color='primary'>
                      Edit
                    </Button.Ripple> */}
                    {/* {userRole === 'admin' || userRole === 'store' ? <Button.Ripple className='text-center' color='primary' onClick={() => setFormModal(!formModal)}>
                      Edit Wallet
                    </Button.Ripple> : ''} */}
                    {/* <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered modal-lg'>
                      <ModalHeader toggle={() => setFormModal(!formModal)}>Edit Admin</ModalHeader>
                      <AvForm onSubmit={onSubmit}>
                        <ModalBody>
                          <Row>
                            <Col xl='6' lg='12'>
                              <FormGroup>
                                <Label for='fullName'>Full Name</Label>
                                <AvInput 
                                  type='text' 
                                  name='fullName' 
                                  id='fullName' 
                                  placeholder='First Name' 
                                  value={customerDetails.fullName}
                                  onChange={e => setUserData({...userData, fullName: e.target.value})}
                                  required 
                                />
                              </FormGroup>
                            </Col>
                            <Col xl='6' lg='12'>
                              <FormGroup>
                                <Label for='phone'>Phone Number</Label>
                                <AvInput 
                                  type='text' 
                                  name='phone' 
                                  id='phone' 
                                  placeholder='Phone Number' 
                                  value={customerDetails.phone}
                                  onChange={e => setUserData({...userData, phone: e.target.value})}
                                  required 
                                />
                              </FormGroup>
                            </Col>
                            <Col xl='6' lg='12'>
                              <FormGroup>
                                <Label for='location'>Location</Label>
                                <AvInput 
                                  type='text' 
                                  name='location' 
                                  id='location' 
                                  placeholder='Location' 
                                  value={customerDetails.location}
                                  onChange={e => setUserData({...userData, location: e.target.value})}
                                />
                              </FormGroup>
                            </Col>
                            <Col xl='6' lg='12'>
                              <FormGroup>
                                <Label for='status'>User Status</Label>
                                <AvInput
                                  type='select'
                                  id='status'
                                  name='status'
                                  value={customerDetails.status}
                                  onChange={e => setUserData({ ...userData, status: e.target.value })}
                                  required
                                >
                                  <option value={customerDetails.status}>{customerDetails.status}</option>
                                  <option value='active'>Active</option>
                                  <option value='inactive'>Inactive</option>
                                </AvInput>
                              </FormGroup>
                            </Col>
                          </Row>
                        </ModalBody>
                        <ModalFooter>
                          <Button.Ripple color='primary' type='submit'>
                            <span className='ml-50'>Save Changes</span>
                          </Button.Ripple>
                        </ModalFooter>
                      </AvForm>

                    </Modal> */}
                    {userRole === 'admin' || userRole === 'store' ? <Button.Ripple className='ml-1' color='danger' outline onClick={() => handleDelete(walletDetails.id)}>
                      Delete
                    </Button.Ripple> : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex align-items-center user-total-numbers'>
              {/* <div className='d-flex align-items-center mr-2'>
                <div className='color-box bg-light-primary'>
                  <Pocket className='text-primary' />
                </div>
                <div className='ml-1'>
                  <h5 className='mb-0'>{walletDetails.orders.filter(order => order.status !== 'cancelled').length.toLocaleString()}</h5>
                  <small>Total Patronage</small>
                </div>
              </div> */}
              <div className='d-flex align-items-center'>
                <div className='color-box bg-light-success'>
                  <Pocket className='text-success' />
                </div>
                <div className='ml-1'>
                  <h5 className='mb-0'>{walletDetails.balance.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h5>
                  <small>Wallet Balance</small>
                </div>
              </div>
            </div>
            
          </Col>
          {/* <Col xl='6' lg='12' className='mt-2 mt-xl-0'>
            <div className='user-info-wrapper'>
                <div className='d-flex flex-wrap align-items-center mt-0'>
                  <div className='user-info-title'>
                    <Award className='mr-1' size={14} />
                    <CardText tag='span' className='user-info-title font-weight-bold mb-0'>
                      Phone
                    </CardText>
                  </div>
                  <CardText className='mb-0 text-capitalize'>{customerDetails?.phone}</CardText>
                </div>
                <div className='d-flex flex-wrap align-items-center mt-1'>
                  <div className='user-info-title'>
                    <Hexagon className='mr-1' size={14} />
                    <CardText tag='span' className='user-info-title font-weight-bold mb-0'>
                      Location
                    </CardText>
                  </div>
                  <CardText className='text-capitalize mb-0'>{customerDetails?.location}</CardText>
                </div>
                <div className='d-flex flex-wrap align-items-center mt-1'>
                  <div className='user-info-title'>
                    <Star className='mr-1' size={14} />
                    <CardText tag='span' className='user-info-title font-weight-bold mb-0'>
                      Status
                    </CardText>
                  </div>
                  <CardText className='text-capitalize mb-0'>{customerDetails?.status}</CardText>
                </div>
                <div className='d-flex flex-wrap align-items-center mt-1'>
                  <div className='user-info-title'>
                    <UserPlus className='mr-1' size={14} />
                    <CardText tag='span' className='user-info-title font-weight-bold mb-0'>
                      Joined Since
                    </CardText>
                  </div>
                  <CardText className='text-capitalize mb-0'>{moment(customerDetails?.createdAt).format('LL')}</CardText>
                </div>
            </div>
          </Col> */}
        </Row>
        
      </CardBody>
    </Card>
  )
}

export default UserInfoCard
