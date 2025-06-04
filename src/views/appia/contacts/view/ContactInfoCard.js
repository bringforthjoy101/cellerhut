// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
import { DollarSign, TrendingUp, User, Check, Star, Flag, Phone } from 'react-feather'

const ContactInfo = ({ selectedContact }) => {
  // ** render user img

  const renderUserImg = () => {
    if (selectedContact !== null && selectedContact.avatar) {
      return <img src={selectedContact.avatar} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={`${selectedContact.name}`}
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
        <Row className='my-2'>
          <Col className='d-flex align-items-center justify-content-center mb-2 mb-md-0' md='5' xs='12'>
            <div className='d-flex justify-content-start'>
              {renderUserImg()}
            </div>
          </Col>
          <div className='d-flex flex-column ml-1'>
            <Col>
            <h4>Full Name: { selectedContact !== null ? `${selectedContact.name}` : 'Invoice Admin'}</h4>
              <CardText className="mt-1">
                Email: { selectedContact !== null ? selectedContact.email : 'appia.admin@appiawave.com'}
              </CardText>
              <CardText className="mt-1">User Id: { selectedContact.id}</CardText>
              <hr />
              <div className="d-flex">
                <h6>
                  Subject: <span>{selectedContact.subject}</span>
                </h6>
                <h6 className="ml-5">Date <span>{moment(selectedContact.created_at).format('lll')}</span></h6>
              </div>
              <br />
              <p>Message: <span>{selectedContact.message}</span></p>
            </Col>
          </div>
        </Row>
      </CardBody>
    </Card>
  )
}

export default ContactInfo
