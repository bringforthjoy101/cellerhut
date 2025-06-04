// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import { Card, CardBody, CardText, Button, Row, Col } from 'reactstrap'
import { DollarSign, TrendingUp, User, Check, Star, Flag, Phone, BarChart, Key, Layers, Clock, Pocket } from 'react-feather'

const DataPlanInfo = ({ selectedPlan }) => {

  return (
    <Card>
      <CardBody>
        <Row>
          <Col xl='6' lg='12' className='mt-2 mt-xl-0'>
            <div className='user-info-wrapper'>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-info'>
                    <Key className='text-info' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Product Id
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedPlan.product_id}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-warning'>
                    <BarChart className='text-warning' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Network
                  </CardText>
                </div>
                <CardText className='mb-0'>
                  {selectedPlan.network}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-secoundary'>
                    <Pocket className='text-secoundary' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Price
                  </CardText>
                </div>
                <CardText className='text-capitalize mb-0'>
                  {selectedPlan.price.toLocaleString('en-US', { style: 'currency', currency: 'ZAR' })}
                </CardText>
              </div>
            </div>
          </Col>
          <Col xl='6' lg='12' className='mt-2 mt-xl-0'>
            <div className='user-info-wrapper'>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-primary'>
                    <Layers className='text-primary' />
                  </div>
                  <CardText tag='span' className='user-info-title text-capitalize font-weight-bold mb-0 ml-1'>
                    Category
                  </CardText>
                </div>
                <CardText className='text-capitalize mb-0'>
                  {selectedPlan.category}
                </CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-secoundary'>
                    <Pocket className='text-secoundary' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Allowance
                  </CardText>
                </div>
                <CardText className='mb-0'>{selectedPlan.allowance}</CardText>
              </div>
              <div className='d-flex flex-wrap align-items-center mb-1'>
                <div className='d-flex align-items-center'>
                  <div className='color-box bg-light-success'>
                    <Clock className='text-success' />
                  </div>
                  <CardText tag='span' className='user-info-title font-weight-bold mb-0 ml-1'>
                    Validity
                  </CardText>
                </div>
                <CardText className='mb-0'>{selectedPlan.validity}</CardText>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DataPlanInfo
