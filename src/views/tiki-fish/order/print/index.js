// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { getOrder } from '../store/action'
import { isUserLoggedIn } from '@utils'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'

// ** Third Party Components
import { Row, Col, Table, Media, Badge, Button, ButtonGroup } from 'reactstrap'

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

const Print = () => {
	// ** Print on mount
	// useEffect(() => window.print(), [])
	const store = useSelector((state) => state.orders),
		dispatch = useDispatch(),
		{ id } = useParams()
	// const [userData, setUserData] = useState(null)
	const userData = JSON.parse(localStorage.getItem('userData'))
const { selectedOrder } = store
	useEffect(() => {
		// axios.get(`/api/invoice/invoices/${id}`).then(response => {
		//   setData(response.data)
		// })
		dispatch(getOrder(id))
		// if (isUserLoggedIn()) setUserData(JSON.parse(localStorage.getItem('userData')))
		// 
		
	}, [])
	// Auto-print when order data is loaded
	useEffect(() => {
		if (selectedOrder) {
			// Give time for component to fully render
			const printTimer = setTimeout(() => {
				window.print()
			}, 1000)
			return () => clearTimeout(printTimer)
		}
	}, [selectedOrder]) 

	const renderTable = (products) => {
		return products.map((product) => {
			return (
				<tr key={product.productId}>
					<td className="product-name">
						<span className="product-text">{product.product.name}</span>
					</td>
					<td className="text-center quantity">
						<span className="quantity-text">{product.quantity.toLocaleString()}</span>
					</td>
					<td className="text-right price">
						<span className="price-text">{Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
					<td className="text-right total">
						<span className="total-text">{Number(Number(product.price) * Number(product.quantity)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
				</tr>
			)
		})
	}

	// Thermal printer optimized product list
	const renderThermalProductList = (products) => {
		return products.map((product) => {
			return (
				<div key={product.productId} className="thermal-product-item">
					<div className="product-name">
						{product.product.name}
					</div>
					<div className="product-details">
						<span className="qty-price">
							{product.quantity.toLocaleString()} × {Number(product.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
						<span className="total-amount">
							{Number(Number(product.price) * Number(product.quantity)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
					</div>
				</div>
			)
		})
	}

	// Enhanced status mapping for all order statuses
	const orderStatus = {
		'order-pending': 'light-info', // Blue - awaiting processing
		'order-processing': 'light-warning', // Yellow - being prepared
		'order-at-local-facility': 'light-primary', // Purple - at facility
		'order-out-for-delivery': 'light-secondary', // Gray - in transit
		'order-completed': 'light-success', // Green - delivered/completed
		'order-cancelled': 'light-danger', // Red - cancelled
		'order-refunded': 'light-dark', // Dark - refunded
		// Legacy support for old status values (without 'order-' prefix)
		pending: 'light-info',
		processing: 'light-warning',
		'at-local-facility': 'light-primary',
		'out-for-delivery': 'light-secondary',
		completed: 'light-success',
		cancelled: 'light-danger',
		refunded: 'light-dark',
	}

	// Helper function to format status text for display
	const formatStatusText = (status) => {
		if (!status) return 'Unknown'

		// Remove 'order-' prefix if present
		const cleanStatus = status.replace('order-', '')

		// Convert hyphens to spaces and capitalize each word
		return cleanStatus
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	}

	// Helper function to get status color with fallback
	const getStatusColor = (status) => {
		return orderStatus[status] || 'light-secondary' // Default to gray if status not found
	}

	const handlePrint = () => {
		window.print()
	}

	const handleClose = () => {
		window.close()
	}

	return selectedOrder !== null ?  (
		<div className="invoice-print enhanced-receipt">
			{/* Print Controls - Hidden when printing */}
			<div className="print-controls no-print mb-3 text-center">
				<ButtonGroup>
					<Button color="primary" onClick={handlePrint}>
						🖨️ Print Receipt
					</Button>
					<Button color="secondary" onClick={handleClose}>
						✕ Close
					</Button>
				</ButtonGroup>
				<div className="mt-2">
					<small className="text-muted">
						This receipt will auto-print when loaded. Use the Print button to print again.
					</small>
				</div>
			</div>

			<div className="receipt-container">
				{/* Business Header */}
				<div className="business-header text-center mb-3">
					<h1 className="business-name">CELLER HUT</h1>
					<p className="business-address">500m Opposite Ilere Junction, Along Ijare Road</p>
					<p className="business-address">Akure South, Ondo State, Nigeria</p>
					<p className="business-contact">Phone: +234-XXX-XXX-XXXX | Email: info@cellerhut.com</p>
				</div>

				{/* Receipt Header */}
				<div className="receipt-header mb-3">
					<div className="receipt-title text-center">
						<h3>ORDER RECEIPT</h3>
						<h4>#{selectedOrder?.orderNumber}</h4>
					</div>
					<hr className="receipt-divider" />
				</div>

				{/* Order Information */}
				<div className="order-info mb-3">
					<div className="info-row">
						<span className="info-label">Date:</span>
						<span className="info-value">{moment(selectedOrder?.createdAt).format('DD/MM/YYYY HH:mm')}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Customer:</span>
						<span className="info-value">{selectedOrder?.customer.name}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Phone:</span>
						<span className="info-value">{selectedOrder?.customer.phone}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Payment:</span>
						<span className="info-value">{selectedOrder?.paymentMethod.toUpperCase()}</span>
					</div>
					<div className="info-row">
						<span className="info-label">Status:</span>
						<span className="info-value status-badge">
							<Badge color={getStatusColor(selectedOrder?.status)} className="print-badge">
								{formatStatusText(selectedOrder?.status)}
							</Badge>
						</span>
					</div>
					{selectedOrder?.address && (
						<div className="info-row">
							<span className="info-label">Location:</span>
							<span className="info-value">
								{selectedOrder?.address.street}, {selectedOrder?.address.suburb}, {selectedOrder?.address.city}
							</span>
						</div>
					)}
				</div>

				<hr className="receipt-divider" />

				{/* Products Table */}
				<div className="products-section mb-3">
					{/* Standard table format - hidden on thermal printers */}
					<Table className="products-table" size="sm">
						<thead>
							<tr>
								<th>Product</th>
								<th className="text-center">Qty</th>
								<th className="text-right">Price</th>
								<th className="text-right">Total</th>
							</tr>
						</thead>
						<tbody>{renderTable(selectedOrder?.orderItems)}</tbody>
					</Table>

					{/* Thermal printer optimized list - shown only on thermal printers */}
					<div className="thermal-products-list">
						{renderThermalProductList(selectedOrder?.orderItems)}
					</div>
				</div>

				<hr className="receipt-divider" />

				{/* Totals Section */}
				<div className="totals-section mb-3">
					<div className="total-row">
						<span className="total-label">Subtotal:</span>
						<span className="total-value">{Number(selectedOrder?.subTotal).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</div>
					{selectedOrder?.logistics > 0 && (
						<div className="total-row">
							<span className="total-label">Logistics:</span>
							<span className="total-value">{Number(selectedOrder?.logistics).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
						</div>
					)}
					{selectedOrder?.discount > 0 && (
						<div className="total-row">
							<span className="total-label">Discount:</span>
							<span className="total-value">-{Number(selectedOrder?.discount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
						</div>
					)}
					<hr className="total-divider" />
					<div className="total-row final-total">
						<span className="total-label">TOTAL:</span>
						<span className="total-value">{Number(selectedOrder?.amount).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</div>
				</div>

				{/* Footer */}
				<div className="receipt-footer text-center mt-4">
					<div className="attendant-info mb-2">
						<span className="attendant-label">Served by:</span> <span className="attendant-name">{selectedOrder?.admin.firstName} {selectedOrder?.admin.lastName}</span>
					</div>
					<hr className="receipt-divider" />
					<p className="thank-you-message">Thank you for your patronage!</p>
					<p className="return-message">We hope to see you again.</p>
					<div className="receipt-footer-info mt-3">
						<p className="print-time">Printed: {moment().format('DD/MM/YYYY HH:mm:ss')}</p>
					</div>
				</div>
			</div>
		</div>
	) : (
		<SpinnerComponent />
	)
}

export default Print
