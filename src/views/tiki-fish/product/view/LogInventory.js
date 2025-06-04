import { useState, useEffect } from 'react'
import { isUserLoggedIn } from '@utils'
import { Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { getAllData, logInventory } from '../store/action'
import { store } from '@store/storeConfig/store'

export const LogInventory = ({ selectedInventory }) => {
	const dispatch = useDispatch()
	const { id } = useParams()
	const [inventoryData, setInventoryData] = useState({
		qty: null,
		type: null,
		department: null,
		description: null,
	})
	const [formModal, setFormModal] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const onSubmit = async (event, errors) => {
		Object.keys(inventoryData).forEach((key) => {
			if (!inventoryData[key]) {
				delete inventoryData[key]
			}
		})
		setIsSubmitting(true)
		event?.preventDefault()
		if (errors && !errors.length) {
			await dispatch(logInventory(id, inventoryData))
			setInventoryData({
				qty: null,
				type: null,
				department: null,
				description: null,
			})
			dispatch(getAllData())
			setFormModal(!formModal)
			setIsSubmitting(false)
		}
		setIsSubmitting(false)
	}

	return (
		<div>
			<Button.Ripple className="text-center mb-1" color="primary" outline block onClick={() => setFormModal(!formModal)}>
				Update Stock
			</Button.Ripple>
			<Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className="modal-dialog-centered">
				<ModalHeader toggle={() => setFormModal(!formModal)}>Update Stock</ModalHeader>
				<AvForm onSubmit={onSubmit}>
					<ModalBody>
						<FormGroup>
							<Label for="type">Stock Type</Label>
							<AvInput
								type="select"
								id="type"
								name="type"
								value={inventoryData.type}
								onChange={(e) => setInventoryData({ ...inventoryData, type: e.target.value })}
								required
							>
								<option value="">Select Inventory Type</option>
								<option value="IN">IN</option>
								<option value="OUT">OUT</option>
							</AvInput>
						</FormGroup>
						<FormGroup>
							<Label for="qty">Qty</Label>
							<AvInput
								name="qty"
								id="qty"
								placeholder="Qty"
								value={inventoryData.qty}
								onChange={(e) => setInventoryData({ ...inventoryData, qty: e.target.value })}
								required
							/>
						</FormGroup>
						<FormGroup>
							<Label for="department">Department</Label>
							<AvInput
								type="select"
								name="department"
								id="department"
								value={inventoryData.department}
								onChange={(e) => setInventoryData({ ...inventoryData, department: e.target.value })}
							>
								<option value="">Select Department</option>
								<option value="Supplier">Supplier</option>
								<option value="Others">Others</option>
							</AvInput>
						</FormGroup>
						<FormGroup>
							<Label for="description">Description</Label>
							<AvInput
								name="description"
								id="description"
								placeholder="Description"
								value={inventoryData.description}
								onChange={(e) => setInventoryData({ ...inventoryData, description: e.target.value })}
							/>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button.Ripple color="primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <Spinner color="white" size="sm" />}
							<span className="ml-50">Log Inventory</span>
						</Button.Ripple>
					</ModalFooter>
				</AvForm>
			</Modal>
		</div>
	)
}
export default LogInventory
