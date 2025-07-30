import { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Label, Input, Form } from 'reactstrap'
import { selectThemeColors, swal, apiRequest } from '@utils'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
	getOrder,
	// updateStatus
} from '../store/action'
import Select from 'react-select'

export const UpdateStatus = () => {
	const dispatch = useDispatch()
	const { id } = useParams()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [modal, setModal] = useState(false)

	const toggleModal = () => {
		setModal(!modal)
	}

	const onSubmit = async (event) => {
		event?.preventDefault()
		const form = event.target
		const userData = {
			status: form.status.value,
		}
		const body = JSON.stringify(userData)
		try {
			setIsSubmitting(true)
			const response = await apiRequest({ url: `/orders/update-status/${id}`, method: 'POST', body }, dispatch)
			if (response) {
				if (response.data.message) {
					swal('Great job!', response.data.message, 'success')
					dispatch(getOrder(id))
					setModal(false)
					setIsSubmitting(false)
				} else {
					swal('Oops!', response.data.message, 'error')
				}
			} else {
				swal('Oops!', 'Something went wrong with your network.', 'error')
			}
		} catch (error) {
			console.error({ error })
		}
	}

	const StatusOptions = [
		{ value: '', label: 'Select Status' },
		{ value: 'order-pending', label: 'Pending' },
		{ value: 'order-processing', label: 'Processing' },
		{ value: 'order-at-local-facility', label: 'At Local Facility' },
		{ value: 'order-out-for-delivery', label: 'Out for Delivery' },
		{ value: 'order-completed', label: 'Completed' },
		{ value: 'order-cancelled', label: 'Cancelled' },
		{ value: 'order-refunded', label: 'Refunded' },
	]

	return (
		<>
			<Button.Ripple color="info" onClick={toggleModal} block outline>
				Update Status
			</Button.Ripple>
			<Modal isOpen={modal} toggle={toggleModal} className="modal-dialog-centered" modalClassName="modal-info">
				<ModalHeader toggle={toggleModal}>Update Status</ModalHeader>
				<Form onSubmit={onSubmit}>
					<ModalBody>
						<div className="mb-1">
							<Label className="form-label" for="status">
								Status
							</Label>
							<Select
								id="status"
								name="status"
								theme={selectThemeColors}
								className="react-select"
								classNamePrefix="select"
								options={StatusOptions}
								isClearable={false}
							/>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button className="me-1" color="primary" disabled={isSubmitting}>
							{isSubmitting && <Spinner color="white" size="sm" />}
							Submit
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</>
	)
}

export default UpdateStatus
