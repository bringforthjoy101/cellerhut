// ** Third Party Components
import { Badge, Card, CardBody, CardText, Button, Row, Col, Table, Media } from 'reactstrap'
import moment from 'moment'
import { isUserLoggedIn } from '@utils'
import {useState, useEffect} from 'react'
import {useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { completeOrder, nullifyOrder, getAllData, getOrder } from '../store/action'

const PreviewCard = ({ data }) => {
	const [userData, setUserData] = useState(null)
	const MySwal = withReactContent(Swal)
	// const history = useHistory()
  const dispatch = useDispatch()
	useEffect(() => {
		if (isUserLoggedIn()) setUserData(JSON.parse(localStorage.getItem('userData')))
	}, [])
	const renderTable = (products) => {
		console.log(process.env.NODE_ENV)
		// products = process.env.NODE_ENV === 'production' ? JSON.parse(products) : products
		// products = JSON.parse(products)
		return products.map((product) => {
			return (
				<tr key={product.id}>
					<td className="py-1">
						<p className="card-text font-weight-bold mb-25">{product.name} - {product.unitValue}{product.unit}</p>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">{product.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">{product.qty.toLocaleString()}</span>
					</td>
					<td className="py-1">
						<span className="font-weight-bold">{product.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
					</td>
				</tr>
			)
		})
	}

	const statusObj = {
		processing: 'light-warning',
		completed: 'light-success',
		cancelled: 'light-danger'
	}


	// const discountedAmount = (Number(data.amount) - Number(orderData.discount))
	// const taxedAmount = ((Number(orderData.tax) / 100) * Number(discountedAmount))
	// const totalAmount = Number(discountedAmount) + Number(taxedAmount) + Number(orderData.shipping)

	return data !== null ? (
		<Card className="invoice-preview-card">
			<CardBody className="invoice-padding pb-0">
				{/* Header */}
				<div className="d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0">
					<div>
						{/* <h4 className="invoice-title">{'DEMO'}</h4> */}
						<div className="logo-wrapper">
							<Media className="mr-25" left>
								<Media
									object
									className="rounded mr-50"
									src={`${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`}
									alt="Generic placeholder image"
									height="200"
								/>
							</Media>
						</div>
						{/* <div className='d-flex flex-wrap align-items-start'>
							<Button.Ripple color='success' onClick={() => handleCompleteOrder(data.id)} disabled={data.status !== 'processing'}>
								Complete Order
							</Button.Ripple>
							<Button.Ripple className='ml-1' color='danger' outline onClick={() => handleNullifyOrder(data.id)} disabled={data.status !== 'processing'}>
								Cancel Order
							</Button.Ripple>
						</div>
						<CardText className="mb-25">{data?.customer?.firstName || ''} {data?.customer?.lastName || ''}</CardText>
						<CardText className="mb-25">{data?.business?.address || ''}</CardText>
						<CardText className="mb-0">{data?.business?.phone || ''}</CardText> */}
					</div>
					<div className="mt-md-0 mt-2">
						<h4 className="invoice-title">
							BILL PRINT OUT <span className="invoice-number">#{data.orderNumber}</span>
						</h4>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Date:</p>
							<p className="invoice-date">{moment(data.createdAt).format('LLL')}</p>
						</div>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Customer:</p>
							<p className="invoice-date">{data.customer.fullName} - {data.customer.phone}</p>
						</div>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Location:</p>
							<p className="invoice-date">{data.location}</p>
						</div>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Payment Mode:</p>
							<p className="invoice-date">{data.paymentMode.toUpperCase()}</p>
						</div>
						<div className="invoice-date-wrapper">
							<p className="invoice-date-title">Order Status:</p>
							<Badge className='invoice-date' color={statusObj[data.status]}>{data.status.toUpperCase()}</Badge>
							{/* <p className="invoice-date">{data.paymentMode.toUpperCase()}</p> */}
						</div>
					</div>
				</div>
				{/* /Header */}
			</CardBody>

			<hr className="invoice-spacing" />

			{/* Address and Contact */}
			{/* <CardBody className="invoice-padding pt-0">
				<Row className="invoice-spacing">
					<Col className="p-0" lg="6">
						<h6 className="mb-2">Invoice To:</h6>
						<h6 className="mb-25">{data.client.names}</h6>
						<CardText className="mb-25">{data.client.phone}</CardText>
						<CardText className="mb-25">{data.client.location}</CardText>
					</Col>
					<Col className="p-0 mt-xl-0 mt-2" lg="6">
						<h6 className="mb-2">Payment Details:</h6>
						<table>
							<tbody>
								<tr>
									<td className="pr-1">Total Due:</td>
									<td>
										<span className="font-weight-bolder">{data.amount.toLocaleString()}</span>
									</td>
								</tr>
								<tr>
									<td className="pr-1">Bank Name:</td>
									<td>{data.business.bankName}</td>
								</tr>
								<tr>
									<td className="pr-1">Account Name:</td>
									<td>{data.business.accountName}</td>
								</tr>
								<tr>
									<td className="pr-1">Account Number:</td>
									<td>{data.business.bankAccountNumber}</td>
								</tr>
							</tbody>
						</table>
					</Col>
				</Row>
			</CardBody> */}
			{/* /Address and Contact */}

			{/* Invoice Description */}
			<Table responsive>
				<thead>
					<tr>
						<th className="py-1">Product</th>
						<th className="py-1">Price</th>
						<th className="py-1">Quantity</th>
						<th className="py-1">Total</th>
					</tr>
				</thead>
				<tbody>{renderTable(data.products)}</tbody>
			</Table>
			{/* /Invoice Description */}

			{/* Total & Sales Person */}
			<CardBody className="invoice-padding pb-0">
				<Row className="invoice-sales-total-wrapper">
					<Col className="mt-md-0 mt-3" md="6" order={{ md: 1, lg: 2 }}>
						{/* <CardText className="mb-0">
							<span className="font-weight-bold">Waiter:</span> <span className="ml-75">{data.server.fullName}</span>
						</CardText> */}
						<CardText className="mb-0">
							<span className="font-weight-bold">Initiated By:</span> <span className="ml-75">{data.admin.firstName} {data.admin.lastName}</span>
						</CardText>
					</Col>
					<Col className="d-flex justify-content-end" md="6" order={{ md: 2, lg: 1 }}>
						<div className="invoice-total-wrapper">
							<div className="invoice-total-item">
								<p className="invoice-total-title">Subtotal:</p>
								<p className="invoice-total-amount">{data.subTotal.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
							<div className="invoice-total-item">
								<p className="invoice-total-title">Logistics:</p>
								<p className="invoice-total-amount">{data.logistics?.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' }) || 0}</p>
							</div>
							<div className="invoice-total-item">
								<p className="invoice-total-title">Discount:</p>
								<p className="invoice-total-amount">{data.discount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
							<hr className="my-50" />
							<div className="invoice-total-item">
								<p className="invoice-total-title">Total:</p>
								<p className="invoice-total-amount">{data.amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</p>
							</div>
						</div>
					</Col>
				</Row>
			</CardBody>
			{/* /Total & Sales Person */}

			<hr className="invoice-spacing" />

			{/* Invoice Note */}
			<CardBody className="invoice-padding pt-0">
				<Row>
					<Col sm="12">
						<span className="font-weight-bold">Note: </span>
						<span>Thank you for your patronage, We hope to see you again.</span>
					</Col>
				</Row>
			</CardBody>
			{/* /Invoice Note */}
		</Card>
	) : null
}

export default PreviewCard
