// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Card, CardBody, CardHeader, CardTitle, Table, Badge } from 'reactstrap'

// ** Icons Imports
import { Package, DollarSign } from 'react-feather'

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
							<Table responsive>
								<thead>
									<tr>
										<th>Product</th>
										<th className='text-center'>Quantity</th>
										<th className='text-end'>Unit Price</th>
										<th className='text-center'>VAT Rate</th>
										<th className='text-end'>Net Amount</th>
										<th className='text-end'>VAT Amount</th>
										<th className='text-end'>Total Amount</th>
									</tr>
								</thead>
								<tbody>
									{selectedSupply.supply_items.map((item, index) => (
										<tr key={index}>
											<td>
												<div className='d-flex flex-column'>
													<span className='fw-bolder'>{item.product?.name || 'Unknown Product'}</span>
													<small className='text-muted'>{item.product?.code || '-'}</small>
												</div>
											</td>
											<td className='text-center'>
												<Badge color='light-primary' pill>
													{item.quantity}
												</Badge>
											</td>
											<td className='text-end'>${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
											<td className='text-center'>{parseFloat(item.vatRate || 0).toFixed(1)}%</td>
											<td className='text-end'>${parseFloat(item.netAmount || 0).toFixed(2)}</td>
											<td className='text-end'>${parseFloat(item.vatAmount || 0).toFixed(2)}</td>
											<td className='text-end fw-bolder'>${parseFloat(item.totalAmount || 0).toFixed(2)}</td>
										</tr>
									))}
								</tbody>
							</Table>
							
							{/* Totals Section */}
							<hr />
							<div className='d-flex justify-content-end'>
								<div className='invoice-total-wrapper' style={{ minWidth: '300px' }}>
									<div className='invoice-total-item'>
										<p className='invoice-total-title'>Subtotal:</p>
										<p className='invoice-total-amount'>${subtotal.toFixed(2)}</p>
									</div>
									<div className='invoice-total-item'>
										<p className='invoice-total-title'>Total VAT:</p>
										<p className='invoice-total-amount'>${totalVAT.toFixed(2)}</p>
									</div>
									<hr className='my-50' />
									<div className='invoice-total-item'>
										<p className='invoice-total-title'>Grand Total:</p>
										<p className='invoice-total-amount fw-bolder'>${grandTotal.toFixed(2)}</p>
									</div>
								</div>
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