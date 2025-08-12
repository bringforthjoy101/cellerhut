// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Card, CardBody, CardHeader, CardTitle, Table, Badge, Row, Col } from 'reactstrap'

// ** Icons Imports
import { Package, DollarSign } from 'react-feather'

// ** Currency Utils
import { formatRandWithSeparator } from '../../shared/currencyUtils'

const SupplyItems = ({ selectedSupply }) => {
	// ** Calculate totals
	const calculateTotals = () => {
		if (!selectedSupply?.supply_items) return { subtotal: 0, totalVAT: 0, grandTotal: 0 }
		
		const subtotal = selectedSupply.supply_items.reduce((sum, item) => sum + parseFloat(item.netAmount || 0), 0)
		const totalVAT = selectedSupply.supply_items.reduce((sum, item) => sum + parseFloat(item.vatAmount || 0), 0)
		const grandTotal = selectedSupply.supply_items.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0)
		
		return { subtotal, totalVAT, grandTotal }
	}

	const { subtotal, totalVAT, grandTotal } = calculateTotals()

	return (
		<Fragment>
			<Card>
				<CardHeader>
					<CardTitle tag='h4'>
						<Package className='me-50' size={20} />
						Supply Items
					</CardTitle>
				</CardHeader>
				<CardBody>
					{selectedSupply?.supply_items && selectedSupply.supply_items.length > 0 ? (
						<>
							<div className='table-responsive'>
								<Table hover className='mb-0'>
									<thead>
										<tr>
											<th style={{ minWidth: '200px' }}>Product</th>
											<th className='text-center' style={{ minWidth: '80px' }}>Qty</th>
											<th className='text-end' style={{ minWidth: '120px' }}>Unit Price</th>
											<th className='text-center' style={{ minWidth: '80px' }}>VAT %</th>
											<th className='text-end' style={{ minWidth: '120px' }}>Net</th>
											<th className='text-end' style={{ minWidth: '100px' }}>VAT</th>
											<th className='text-end' style={{ minWidth: '120px' }}>Total</th>
										</tr>
									</thead>
									<tbody>
										{selectedSupply.supply_items.map((item, index) => (
											<tr key={index}>
												<td>
													<div className='d-flex flex-column'>
														<span className='fw-bolder text-nowrap'>{item.product?.name || 'Unknown Product'}</span>
														<small className='text-muted'>{item.product?.sku || item.product?.code || '-'}</small>
													</div>
												</td>
												<td className='text-center'>
													<Badge color='light-primary' pill>
														{item.quantity}
													</Badge>
												</td>
												<td className='text-end text-nowrap'>{formatRandWithSeparator(item.unitPrice)}</td>
												<td className='text-center'>{parseFloat(item.vatRate || 0).toFixed(1)}%</td>
												<td className='text-end text-nowrap'>{formatRandWithSeparator(item.netAmount)}</td>
												<td className='text-end text-nowrap'>{formatRandWithSeparator(item.vatAmount)}</td>
												<td className='text-end fw-bolder text-nowrap'>{formatRandWithSeparator(item.totalAmount)}</td>
											</tr>
										))}
									</tbody>
								</Table>
							</div>
							
							{/* Totals Section */}
							<div className='mt-3 pt-2 border-top'>
								<Row>
									<Col xs={12} sm={6} className='order-sm-1 order-2 mt-3 mt-sm-0'>
										{/* Can add notes or additional info here if needed */}
									</Col>
									<Col xs={12} sm={6} className='order-sm-2 order-1'>
										<div className='d-flex justify-content-sm-end'>
											<div style={{ minWidth: '250px', maxWidth: '350px' }}>
												<div className='d-flex justify-content-between mb-2'>
													<span className='fw-bold'>Subtotal:</span>
													<span className='text-end'>{formatRandWithSeparator(subtotal)}</span>
												</div>
												<div className='d-flex justify-content-between mb-2'>
													<span className='fw-bold'>Total VAT:</span>
													<span className='text-end'>{formatRandWithSeparator(totalVAT)}</span>
												</div>
												<hr className='my-2' />
												<div className='d-flex justify-content-between'>
													<h5 className='mb-0'>Grand Total:</h5>
													<h5 className='mb-0 text-primary'>{formatRandWithSeparator(grandTotal)}</h5>
												</div>
											</div>
										</div>
									</Col>
								</Row>
							</div>
						</>
					) : (
						<div className='text-center py-3'>
							<Package size={48} className='text-muted mb-2' />
							<p className='text-muted'>No items in this supply</p>
						</div>
					)}
				</CardBody>
			</Card>
		</Fragment>
	)
}

export default SupplyItems