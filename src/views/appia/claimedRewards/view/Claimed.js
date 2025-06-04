
import moment from 'moment'

// ** Third Party Components
import { Card, CardBody, CardText, Row, Col } from 'reactstrap'
import { User, Phone, Key, Clock, Code } from 'react-feather'

const DataPlanInfo = ({ selectedClaim }) => {

  return (
    <Card>
      <CardBody>
        <Row>
          <Col xl='6' lg='6' className='mt-2 mt-xl-0'>
            <div className='user-info-wrapper'>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box '>
                    <User />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    User Names
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.names}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box'>
                    <Key />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    User Email
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.email}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box'>
                    <Phone />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Phone
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.phone}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box'>
                    <Key />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    User Id
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.user_id}
                </CardText>
              </div>
            </div>
          </Col>
          <Col xl='6' lg='6' className='mt-2 mt-xl-0'>
            <div className='user-info-wrapper'>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box'>
                    <Key />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Reward Id
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.reward_id}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box'>
                    <Key />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Transaction Id
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedClaim.transaction_id}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-secoundary'>
                    <Clock className='text-secoundary' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Date Claimed
                  </CardText>
                </div>
                <CardText className='text-capitalize mb-0'>
                  {moment(selectedClaim?.created_at).format('lll')}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-secoundary'>
                    <Code className='text-secoundary' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Claim Code
                  </CardText>
                </div>
                <CardText className='text-capitalize mb-0'>
                  {selectedClaim?.code !== null ? selectedClaim.code : "No Code"}
                </CardText>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DataPlanInfo
