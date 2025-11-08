import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

// ** Third Party Components
import axios from 'axios'
import { Row, Col, Alert } from 'reactstrap'

// ** Invoice Preview Components
import PreviewCard from './PreviewCard'
import PreviewActions from './PreviewActions'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'
// import SendInvoiceSidebar from '../shared-sidebar/SidebarSendInvoice'
// import AddPaymentSidebar from '../shared-sidebar/SidebarAddPayment'

// ** Tracking Modals
import DispatchModal from '../list/DispatchModal'
import TrackingModal from '../list/TrackingModal'

import { getOrder, getAllData, getFilteredData } from '../store/action'

// ** Styles
import '@styles/base/pages/app-invoice.scss'

const InvoicePreview = () => {
	// ** Vars
	// const { id } = useParams()
	const store = useSelector((state) => state.orders),
		dispatch = useDispatch(),
		{ id } = useParams()

	// ** States
	const [data, setData] = useState(null)
	const [sendSidebarOpen, setSendSidebarOpen] = useState(false)
	const [addPaymentOpen, setAddPaymentOpen] = useState(false)
	const [dispatchModalOpen, setDispatchModalOpen] = useState(false)
	const [trackingModalOpen, setTrackingModalOpen] = useState(false)

	// ** Functions to toggle add & send sidebar
	const toggleSendSidebar = () => setSendSidebarOpen(!sendSidebarOpen)
	const toggleAddSidebar = () => setAddPaymentOpen(!addPaymentOpen)

	// ** Dispatch Handlers
	const handleDispatch = () => {
		setDispatchModalOpen(true)
	}

	const handleDispatchSuccess = () => {
		// Refresh order data after successful dispatch
		dispatch(getOrder(id))
	}

	// ** Tracking Handlers
	const handleTrack = () => {
		setTrackingModalOpen(true)
	}

	// ** Get invoice on mount based on id
	useEffect(() => {
		// axios.get(`/api/invoice/invoices/${id}`).then(response => {
		//   setData(response.data)
		// })
		dispatch(getOrder(id))
	}, [])

	const { selectedOrder } = store

	return selectedOrder !== null ? (
		<div className="invoice-preview-wrapper">
			<Row className="invoice-preview">
				<Col xl={9} md={8} sm={12}>
					<PreviewCard data={selectedOrder} />
				</Col>
				<Col xl={3} md={4} sm={12}>
					<PreviewActions id={id} data={selectedOrder} onDispatch={handleDispatch} onTrack={handleTrack} />
				</Col>
			</Row>
			{/* <SendInvoiceSidebar toggleSidebar={toggleSendSidebar} open={sendSidebarOpen} /> */}
			{/* <AddPaymentSidebar toggleSidebar={toggleAddSidebar} open={addPaymentOpen} /> */}

			{/* Dispatch Modal */}
			<DispatchModal
				isOpen={dispatchModalOpen}
				toggle={() => setDispatchModalOpen(!dispatchModalOpen)}
				order={selectedOrder}
				onDispatchSuccess={handleDispatchSuccess}
			/>

			{/* Tracking Modal */}
			<TrackingModal
				isOpen={trackingModalOpen}
				toggle={() => setTrackingModalOpen(!trackingModalOpen)}
				order={selectedOrder}
			/>
		</div>
	) : (
		<SpinnerComponent />
	)
}

export default InvoicePreview
