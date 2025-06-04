// ** React Imports
import { Link } from 'react-router-dom'
import moment from 'moment'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
import { Pocket, DollarSign, TrendingUp, User, Check, Star, Flag, Phone, Clock } from 'react-feather'
import CardTitle from 'reactstrap/lib/CardTitle'

const UserInfoCard = ({ selectedEscrow, detail }) => {
  // ** render user img
  const renderSenderImg = () => {
    if (selectedEscrow !== null && selectedEscrow.avatar) {
      return <img src={selectedEscrow.avatar} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={selectedEscrow.sender.names}
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

  const renderReceiverImg = () => {
    if (selectedEscrow !== null && selectedEscrow.avatar) {
      return <img src={selectedEscrow.avatar} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={selectedEscrow.receiver.names}
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

  return (
    <Card>
      <CardBody>
        <Row className="mb-2">
        <Col xl='6' lg='12' className='d-flex flex-column justify-content-center mx-auto'>
          <h1>Transaction Details</h1>
          <p><span>Transaction Amount: </span>{selectedEscrow.amount}</p>
          <p><span>Transaction Date: </span>{moment(selectedEscrow.updated_at).format('lll')}</p>
          <p><span>Transaction status: </span>{selectedEscrow.status}</p>
          {selectedEscrow.complain !== null ? <div>
          <p><span>Complain Subject: </span>{selectedEscrow.complain.subject}</p>
          <p><span>Complain Comment: </span>{selectedEscrow.complain.comment}</p></div> : ""}
          </Col>
        </Row>
        <Row>
          <Col xl='6' lg='12' className='d-flex flex-column justify-content-between border-container-lg'>
            <div className='user-avatar-section'>
              <h3>Sender Details</h3>
              <div className='d-flex justify-content-start'>
                {renderSenderImg()}
                <div className='d-flex flex-column ml-1'>
                  <div className='user-info mt-2'>
                    <h4 className='mb-0'>{selectedEscrow !== null ? selectedEscrow.sender.names : 'Eleanor Aguilar'}</h4>
                    <CardText tag='span'>
                      {selectedEscrow !== null ? selectedEscrow.sender.email : 'eleanor.aguilar@gmail.com'}
                    </CardText>
                  </div>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Sender Id: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.sender.id}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Username: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.sender.username}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Phone:</span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.sender.phone}</h6>
                </div>
              </div>
            </div>
          </Col>
          <Col xl='6' lg='12' className='mt-2 mt-xl-0'>
          <div className='user-avatar-section'>
              <h3>Receiver Details</h3>
              <div className='d-flex justify-content-start'>
                {renderReceiverImg()}
                <div className='d-flex flex-column ml-1'>
                  <div className='user-info mt-2'>
                    <h4 className='mb-0'>{selectedEscrow !== null ? selectedEscrow.receiver.names : 'Eleanor Aguilar'}</h4>
                    <CardText tag='span'>
                      {selectedEscrow !== null ? selectedEscrow.receiver.email : 'eleanor.aguilar@gmail.com'}
                    </CardText>
                  </div>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Receiver Id: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.receiver.id}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Username: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.receiver.username === null ? 'Not found' : selectedEscrow.receiver.username}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Phone:</span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.receiver.phone}</h6>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {selectedEscrow.beneficiary !== null ? <Row className="mt-3">
        <Col xl='6' lg='12' className='d-flex flex-column justify-content-center mx-auto'>
          <div className='user-avatar-section'>
              <h3>Beneficiary Details</h3>
              <div className='d-flex justify-content-start'>
                {renderReceiverImg()}
                <div className='d-flex flex-column ml-1'>
                  <div className='user-info mt-2'>
                    <h4 className='mb-0'>{selectedEscrow.beneficiary.names}</h4>
                    <CardText tag='span'>
                      {selectedEscrow !== null ? selectedEscrow.beneficiary.email : 'eleanor.aguilar@gmail.com'}
                    </CardText>
                  </div>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Beneficiary Id: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.receiver.id}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Username: </span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.beneficiary.username === null ? 'Not found' : selectedEscrow.beneficiary.username}</h6>
                </div>
              </div>
              <div className='d-flex align-items-center mr-2 mt-1'>
                <div className='color-box'>
                  <span>Phone:</span>
                </div>
                <div className='ml-1'>
                  <h6 className='mb-0'>{selectedEscrow.beneficiary.phone}</h6>
                </div>
              </div>
            </div>
          </Col>
        </Row> : ""}
      </CardBody>
    </Card>
  )
}

export default UserInfoCard
