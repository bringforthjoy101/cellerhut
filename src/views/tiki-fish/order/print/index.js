// ** React Imports
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { getOrder } from '../store/action'
import { isUserLoggedIn } from '@utils'
import SpinnerComponent from '@src/@core/components/spinner/Loading-spinner'

// ** Third Party Components
import { Row, Col, Table, Media, Badge } from 'reactstrap'

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
	if (selectedOrder) {
		setTimeout(window.print(), 3000)
	} 

	const renderTable = (products) => {
		// products = process.env.NODE_ENV === 'production' ? JSON.parse(products) : products
		return products.map((product) => {
			return (
				<tr key={product.id}>
					<td className="ml-0 mr-0">
						<p className="card-text font-weight-bold mb-25">{product.name}</p>
					</td>
					<td className="">
						<span className="font-weight-bold">{product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
					<td className="">
						<span className="font-weight-bold">{product.qty.toLocaleString()}</span>
					</td>
					<td className="">
						<span className="font-weight-bold">{product.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
				</tr>
			)
		})
	}

	const statusObj = {
		pending: 'light-warning',
		delivered: 'light-success',
	}

	return selectedOrder !== null ?  (
		<div className="invoice-print" style={{ color: 'black' }}>
			<div className="row ml-1" style={{ width: '302px' }}>
				{/* <div className='col-md-3'> */}
				<div className="d-flex justify-content-between flex-column pb-2">
					<h2 className="text-center mb-1" style={{ color: '#000000' }}>
					CELLER HUT
					</h2>
					<span className="invoice-date-title text-center mb-1">500m Opposite Ilere Junction, Along Ijare Road, Akure South, Ondo State. Nigeria.</span>
					<div className="mt-md-0 mt-2">
						<h4 className="text-right mb-1" style={{ color: '#000000' }}>
							BILL PRINT OUT #{selectedOrder?.saleNumber}
						</h4>
						<div className="invoice-date-wrapper mb-50">
							<span className="invoice-date-title">Date:</span>
							<span className="font-weight-bold"> {moment(selectedOrder?.createdAt).format('lll')}</span>
						</div>
						<div className="invoice-date-wrapper mb-50">
							<span className="invoice-date-title">Location:</span>
							<span className="font-weight-bold"> {selectedOrder?.location}</span>
						</div>
						<div className="invoice-date-wrapper mb-50">
							<p className="invoice-date-title">Customer:</p>
							<p className="font-weight-bold">{selectedOrder?.customer.fullName} - {selectedOrder?.customer.phone}</p>
						</div>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Payment Mode:</p>
							<p className="font-weight-bold">{selectedOrder?.paymentMode.toUpperCase()}</p>
						</div>
					</div>
				</div>

				{/* <hr className="my-2" /> */}

				<Table className="mt-2 mb-0 mr-2" size="100">
					<thead>
						<tr>
							<th className="">Product</th>
							<th className="">Price</th>
							<th className="">Qty</th>
							<th className="">Total</th>
						</tr>
					</thead>
					<tbody>{renderTable(selectedOrder?.products)}</tbody>
				</Table>

				<Row className="invoice-sales-total-wrapper mt-3">
					<Col className="ml-auto" md="12">
						<div className="invoice-total-wrapper d-flex flex-column align-items-end">
							<div className="invoice-total-item">
								<p className="invoice-total-title">Subtotal:</p>
								<p className="invoice-total-amount">{selectedOrder?.subTotal.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
							<div className="invoice-total-item">
								<p className="invoice-total-title">Logistics:</p>
								<p className="invoice-total-amount">{selectedOrder?.logistics.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
							<div className="invoice-total-item">
								<p className="invoice-total-title">Discount:</p>
								<p className="invoice-total-amount">{selectedOrder?.discount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
							<hr className="my-50" />
							<div className="invoice-total-item">
								<p className="invoice-total-title">Total:</p>
								<p className="invoice-total-amount">{selectedOrder?.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
						</div>
					</Col>
					<Col className="mt-md-0 mt-3" md="12">
						<p className="mb-0">
							<span className="font-weight-bold">Attendant:</span> <span className="ml-75">{selectedOrder?.admin.firstName} {selectedOrder?.admin.lastName}</span>
						</p>
					</Col>
				</Row>

				<hr className="my-2" />

				<Row className="">
					<Col md="12">
						<span className="font-weight-bold">Thanks for your patronage, we hope to see you again.</span>
					</Col>
				</Row>
				{/* </div> */}
				{/* <div className='col-md-9'></div> */}
			</div>
		</div>
	) : (
		<SpinnerComponent />
	)
}

export default Print
