import { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Spinner } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { useDispatch } from 'react-redux'
import { creditGuestBalance, debitGuestBalance, getGuestDetails } from '../store/action'

const BalanceActions = ({ guestId }) => {
  const dispatch = useDispatch()
  const [creditModal, setCreditModal] = useState(false)
  const [debitModal, setDebitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    investorId: guestId
  })

  const toggleCreditModal = () => {
    setCreditModal(!creditModal)
    setFormData({ amount: '', description: '', investorId: guestId })
  }

  const toggleDebitModal = () => {
    setDebitModal(!debitModal)
    setFormData({ amount: '', description: '', investorId: guestId })
  }

  const handleCreditSubmit = async (event, errors) => {
    if (errors && !errors.length) {
      setIsSubmitting(true)
      await dispatch(creditGuestBalance(formData))
    //   dispatch(getGuestDetails(guestId))
      setIsSubmitting(false)
      toggleCreditModal()
    }
  }

  const handleDebitSubmit = async (event, errors) => {
    if (errors && !errors.length) {
      setIsSubmitting(true)
      await dispatch(debitGuestBalance(formData))
    //   dispatch(getGuestDetails(guestId))
      setIsSubmitting(false)
      toggleDebitModal()
    }
  }

  const renderForm = (handleSubmit) => (
    <AvForm onSubmit={handleSubmit}>
      <ModalBody>
        <FormGroup>
          <Label for='amount'>Amount</Label>
          <AvInput
            type='number'
            name='amount'
            id='amount'
            placeholder='Enter amount'
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for='narration'>Description</Label>
          <AvInput
            type='textarea'
            name='description'
            id='description'
            placeholder='Enter description'
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={creditModal ? toggleCreditModal : toggleDebitModal}>Cancel</Button>
        <Button color='primary' type='submit' disabled={isSubmitting}>
          {isSubmitting && <Spinner color='white' size='sm' />}
          <span className='ml-50'>Submit</span>
        </Button>
      </ModalFooter>
    </AvForm>
  )

  return (
    <div className='d-flex mt-2'>
      <Button.Ripple color='success' className='mr-1' onClick={toggleCreditModal}>
        Credit Balance
      </Button.Ripple>
      <Button.Ripple color='danger' outline onClick={toggleDebitModal}>
        Debit Balance
      </Button.Ripple>

      {/* Credit Modal */}
      <Modal isOpen={creditModal} toggle={toggleCreditModal}>
        <ModalHeader toggle={toggleCreditModal}>Credit Balance</ModalHeader>
        {renderForm(handleCreditSubmit)}
      </Modal>

      {/* Debit Modal */}
      <Modal isOpen={debitModal} toggle={toggleDebitModal}>
        <ModalHeader toggle={toggleDebitModal}>Debit Balance</ModalHeader>
        {renderForm(handleDebitSubmit)}
      </Modal>
    </div>
  )
}

export default BalanceActions 