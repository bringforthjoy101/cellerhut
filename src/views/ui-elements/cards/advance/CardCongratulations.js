import React, { useState, useEffect } from 'react'
import { Award } from 'react-feather'
import Avatar from '@components/avatar'
import { Card, CardBody, CardText } from 'reactstrap'
import decorationLeft from '@src/assets/images/elements/decore-left.png'
import decorationRight from '@src/assets/images/elements/decore-right.png'
import moment from 'moment/moment'

const CardCongratulations = ({userData}) => {

  const [currentTime, setCurrentTime] = useState(moment().format('LTS'))

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format('LTS'))
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  
  return (
    <Card className='card-congratulations'>
      <CardBody className='text-center'>
        <img className='congratulations-img-left' src={decorationLeft} alt='decor-left' />
        <img className='congratulations-img-right' src={decorationRight} alt='decor-right' />
        <Avatar icon={<Award size={28} />} className='shadow' color='primary' size='xl' />
        <div className='text-center'>
          <h1 className='mb-1 text-white'>Welcome {userData ? userData.firstName : 'Admin'}!</h1>
          <CardText className='m-auto w-75'>
            <h3 className='mb-1 text-white'>{currentTime}</h3>
            {moment().format('LL')}
          </CardText>
        </div>
      </CardBody>
    </Card>
  )
}

export default CardCongratulations
