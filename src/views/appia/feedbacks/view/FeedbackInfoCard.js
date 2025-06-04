// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
// import { DollarSign, TrendingUp, User, Check, Star, Flag, Phone } from 'react-feather'
import Rating from './Ratings'

const FeedbackInfoCard = ({ selectedFeedback }) => {
  // ** render user img

  const renderUserImg = () => {
    if (selectedFeedback !== null && selectedFeedback.avatar) {
      return <img src={selectedFeedback.avatar} alt='user-avatar' className='img-fluid rounded' height='104' width='104' />
    } else {
      const stateNum = Math.floor(Math.random() * 6),
        states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
        color = states[stateNum]
      return (
        <Avatar
          initials
          color={color}
          className='rounded'
          content={`${selectedFeedback.name}`}
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
            <h4>Full Name: { selectedFeedback !== null ? `${selectedFeedback.name}` : 'Invoice Admin'}</h4>
              <CardText className="mt-1">
                Email: { selectedFeedback !== null ? selectedFeedback.email : 'appia.admin@appiawave.com'}
              </CardText>
              <CardText className="mt-1">User Id: { selectedFeedback.id}</CardText>
              <Rating feedback={selectedFeedback} />
              <hr />
              <div className="d-flex">
                <h6>
                  Feature: <span>{selectedFeedback.feature}</span>
                </h6>
                <h6 className="ml-5">Date <span>{moment(selectedFeedback.created_at).format('lll')}</span></h6>
              </div>
              <br />
              <p>Message: <span>{selectedFeedback.message}</span></p>
            </Col>
          </div>
        </Row>
      </CardBody>
    </Card>
  )
}

export default FeedbackInfoCard
