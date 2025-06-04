// ** Reactstrap
import { Card, CardHeader, CardBody, Badge, UncontrolledTooltip, Button } from 'reactstrap'
import { useState, useEffect } from 'react'

import { updateInvestmentPackageStatus, deactivateUser, blacklistUserAsset, trackUser, UserDetails  } from '../store/action'
import { PasswordReset, BlacklistUser, TrackingDetails, AddFunds, DeductFunds } from './AddFunds'
import { store } from '@store/storeConfig/store'
import { selectThemeColors, isUserLoggedIn, apiRequest } from '@utils'
import NewSubscriptionModal from './NewSubscriptionModal'

const PlanCard = ({ investmentPackageDetails }) => {

  const [userData, setUserData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [investors, setInvestors] = useState([])
  
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem('userData')))
    }
    
    // Fetch investors list using apiRequest
    apiRequest({
      url: '/investments/investors',
      method: 'GET'
    })
      .then(response => setInvestors(response.data.data))
      .catch(error => console.error('Error fetching investors:', error))
  }, [])

  const toggleModal = () => setIsModalOpen(!isModalOpen)

  // DeductFunds

  return (
    <Card className='plan-card border-primary'>
      <CardHeader className='d-flex justify-content-between align-items-center pt-75 pb-1'>
      </CardHeader>
      <CardBody>
        {investmentPackageDetails.status === "active" ? <Button.Ripple className='text-center mb-1' color= 'danger' outline  block onClick={() => { store.dispatch(updateInvestmentPackageStatus(investmentPackageDetails.id, 'suspended')) }}> Suspend Customer</Button.Ripple> : <Button.Ripple 
         className='text-center mb-1' 
         color='success' 
         outline
         block
         onClick={toggleModal}
       >
         New Subscription
       </Button.Ripple>
        }
        <NewSubscriptionModal 
          isOpen={isModalOpen}
          toggle={toggleModal}
          investmentPackageDetails={investmentPackageDetails}
          investors={investors}
        />
        {/* {userData?.role === "admin" || userData?.role === "store" ? <div><AddFunds customerDetails={customerDetails} /> <DeductFunds customerDetails={customerDetails} /> </div> : ''} */}
      </CardBody>
    </Card>
  )
}

export default PlanCard
