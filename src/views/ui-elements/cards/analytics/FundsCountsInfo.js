import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardText,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Row,
  Col
} from 'reactstrap'
import Chart from 'react-apexcharts'
import { List } from 'react-feather'
const fundCount = props => {
  const { dashData } = props
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('/card/card-analytics/support-tracker').then(res => setData(res.data))
  }, [])

  const unverified = Math.ceil(dashData?.fund_requests?.pending_fund_requests / dashData?.fund_requests?.fund_requests * 100) || 0
  
  const options = {
      plotOptions: {
        radialBar: {
          size: 150,
          offsetY: 20,
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: '65%'
          },
          track: {
            background: '#fff',
            strokeWidth: '100%'
          },
          dataLabels: {
            name: {
              offsetY: -5,
              fontFamily: 'Montserrat',
              fontSize: '1rem'
            },
            value: {
              offsetY: 15,
              fontFamily: 'Montserrat',
              fontSize: '1.714rem'
            }
          }
        }
      },
      colors: [props.danger],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: [props.primary],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100]
        }
      },
      stroke: {
        dashArray: 8
      },
      labels: ['Pending Requests']
    },
    series = [unverified]

  return dashData !== "" ? (
    <Card>
      <CardHeader className='pb-0'>
        <CardTitle tag='h4'>Fund Requests</CardTitle>
        <List size={20} />
      </CardHeader>
      <CardBody>
        <Row>
          <Col sm='2' className='d-flex flex-column flex-wrap text-center'>
            <h1 className='font-large-2 font-weight-bolder mt-2 mb-0'>{dashData?.fund_requests?.fund_requests}</h1>
            <CardText>All Requests</CardText>
          </Col>
          <Col sm='10' className='d-flex justify-content-center'>
            <Chart options={options} series={series} type='radialBar' height={270} id='support-tracker-card' />
          </Col>
        </Row>
        <div className='d-flex justify-content-between mt-1'>
          <div className='text-center'>
            <CardText className='mb-50'>Active Fund Requests</CardText>
            <span className='font-large-1 font-weight-bold'>{dashData?.fund_requests?.approved_fund_requests}</span>
          </div>
          <div className='text-center'>
            <CardText className='mb-50'>Inactive Fund Requests</CardText>
            <span className='font-large-1 font-weight-bold'>{dashData?.fund_requests?.disapproved_fund_requests}</span>
          </div>
          <div className='text-center'>
            <CardText className='mb-50'>Pending Fund Requests</CardText>
            <span className='font-large-1 font-weight-bold'>{dashData?.fund_requests?.pending_fund_requests}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  ) : null
}
export default fundCount
