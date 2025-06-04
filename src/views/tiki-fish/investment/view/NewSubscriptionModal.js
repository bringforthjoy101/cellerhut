import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { AvForm, AvInput, AvSelect } from 'availity-reactstrap-validation-safe'
import { createInvestmentPackageSubscription } from '../store/action'

const NewSubscriptionModal = ({ isOpen, toggle, investmentPackageDetails, investors }) => {
  const [formData, setFormData] = useState({
    amount: '',
    investorId: '',
    investmentPackageId: investmentPackageDetails.id,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async (e, errors) => {
    // e.preventDefault()
    
    // Validate form
    if (errors && !errors.length) {
      setIsSubmitting(true)
      await dispatch(createInvestmentPackageSubscription(formData))
      setIsSubmitting(false)
      toggle()
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>New Subscription</ModalHeader>
      <AvForm onSubmit={handleSubmit}>
        <ModalBody>
          {error && <Alert color='danger'>{error}</Alert>}
          
          <FormGroup>
            <Label for='amount'>Investment Amount</Label>
            <AvInput
              type='number'
              name='amount'
              id='amount'
              placeholder='Enter amount'
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for='investorId'>Investor</Label>
            <AvInput
              type='select'
              name='investorId'
              id='investorId'
              value={formData.investorId}
              onChange={handleChange}
              required
            >
              <option value=''>Select Investor</option>
              {investors?.map((investor) => (
                <option key={investor.id} value={investor.id}>{investor.fullName} ({investor.phone})</option>
              ))}
            </AvInput>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' onClick={toggle}>Cancel</Button>
          <Button color='primary' type='submit' disabled={isSubmitting}>
            {isSubmitting && <Spinner color='white' size='sm' />}
            <span className='ml-50'>Create Subscription</span>
          </Button>
        </ModalFooter>
      </AvForm>
    </Modal>
  )
}

export default NewSubscriptionModal 