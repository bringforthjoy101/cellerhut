// ** Custom Components
import Avatar from '@components/avatar'
import { apiRequest } from '@utils'

// ** Third Party Components
import { Card, CardBody, CardText, Row, Col, Button, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { useState, Fragment } from 'react'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import {useHistory, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { deleteProduct, getAllData } from '../store/action'
import moment from 'moment/moment'

const MySwal = withReactContent(Swal)


const UserInfoCard = ({ selectedProduct }) => {
  const [picker, setPicker] = useState([new Date(), new Date()])
  const [selected, setSelected] = useState([])
  const [modal, setModal] = useState(false)
  const [profit, setProfit] = useState({ qty: 0, sales: 0, profit: 0 })

  const renderImg = () => {
    if (selectedProduct !== null && selectedProduct.image) {
      return <img src={`${selectedProduct.image ? selectedProduct.image : `${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`}`} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={selectedProduct.name}
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
            const deleted = await dispatch(deleteProduct(id))
            if (deleted) {
              await dispatch(getAllData())
                MySwal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Product has been deleted.',
                    customClass: {
                      confirmButton: 'btn btn-primary'
                    }
                  })
              history.push(`/products/list`)
            }
            
          }
        })
      
  }

  const handleRangeSearch = (date) => {
    console.log({date})
		const range = date.map((d) => new Date(d).getTime())
		setPicker(range)
    const body = JSON.stringify({ startDate: moment(picker[0]).format('L').split('/').join('-'), endDate: moment(picker[1]).format('L').split('/').join('-') })
    if (date.length === 2) {
      apiRequest({ url: `/products/get-profit/${selectedProduct.id}`, method: 'POST', body }).then((response) => {
        console.log({response})
        if (response) {
          if (response.data.data && response.data.status) {
            setProfit(response.data.data)
          } else {
            console.log(response.error)
            MySwal.fire({
              icon: 'error',
              title: 'Oops!',
              text: response.data.message,
              customClass: {
                confirmButton: 'btn btn-primary'
              }
            })
          }
        } else {
          MySwal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Somthing went wrong! Please try again.',
            customClass: {
              confirmButton: 'btn btn-primary'
            }
          })
        }
      })
    }
		
		
		// dispatch(
		// 	getSalesReport({ startDate: moment(date[0]).format('L').split('/').join('-'), endDate: moment(date[1]).format('L').split('/').join('-'), category: currentCategory.value })
		// )
	}

  return (
    <Card>
      <CardBody>
        <Row>
          <Col xl='6' lg='12' className='d-flex flex-column justify-content-between border-container-lg'>
            <div className='user-avatar-section d-flex justify-content-between'>
              <div className='d-flex justify-content-start'>
                {/* {renderImg()} */}
                <div className='d-flex flex-column ml-1'>
                  <div className='user-info mt-2'>
                    <h4 className='mb-2'>{selectedProduct.name}</h4>
                  </div>
                  <div className='d-flex flex-wrap align-items-center'>
                    <Button.Ripple tag={Link} to={`/product/edit/${selectedProduct.id}`} color='primary' className='mr-1 mb-1'>
                      Edit
                    </Button.Ripple>
                    <Button.Ripple color='danger' outline onClick={() => handleDelete(selectedProduct.id)} className='mr-1 mb-1'>
                      Delete
                    </Button.Ripple>
                    <Button.Ripple color="primary" onClick={() => setModal((prev) => !prev)} className='mb-1'>
                      Calculate Profit
                    </Button.Ripple>
                  </div>
                </div>
              </div>
              <div className='d-flex justify-content-end'>
                <Row className='d-flex justify-content-end'>
                  <Col lg="12" md="12" sm="12">
                    <Flatpickr
                      value={picker}
                      id="range-picker"
                      className="form-control"
                      onChange={(date) => handleRangeSearch(date)}
                      options={{
                        mode: 'range',
                        defaultDate: ['2020-02-01', '2020-02-15'],
                      }}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
          <Col xl='6' lg='12' className='d-flex flex-column justify-content-between border-container-lg'>
            <div className='user-avatar-section'>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Cost Price: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{Number(selectedProduct.costPrice).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div>
              {/* <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Smoke House Price: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{(selectedProduct.smokeHousePrice).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div> */}
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Selling Price: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{Number(selectedProduct.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Packaging Price: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{Number(selectedProduct.packagingPrice).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div>
            </div>
            <div className='user-avatar-section'>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Unit: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedProduct.unitValue}{selectedProduct.unit}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Profit Margin: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{(Number(selectedProduct.price) - (Number(selectedProduct.costPrice) + Number(selectedProduct.packagingPrice))).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Product Qty: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedProduct.qty} {selectedProduct.unit}</h6>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Modal isOpen={modal} toggle={() => setModal((prev) => !prev)} className={'modal-dialog-centered modal-lg'} key={1}>
          <ModalHeader toggle={() => setModal((prev) => !prev)}>{selectedProduct.name}'s profit from {moment(picker[0]).format('LL')} to {moment(picker[1]).format('LL')}</ModalHeader>
          <ModalBody>
            <Fragment>
              <h2>QTY Sold:- {profit.qty.toLocaleString()} Units</h2>
              <h2>Sales Value:- {profit.sales.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR'})}</h2>
              <h2>Profit:- {profit.profit.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR'})}</h2>
            </Fragment>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setModal((prev) => !prev)} outline>
              Accept
            </Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  )
}

export default UserInfoCard
