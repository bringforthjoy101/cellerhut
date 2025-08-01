import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Badge } from 'reactstrap'
import moment from 'moment'

const PrintReceipt = ({ 
  isOpen, 
  toggle, 
  orderData, 
  orderResult,
  autoPrint = true 
}) => {
  const [shouldPrint, setShouldPrint] = useState(false)

  const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
  }

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })
  }

  const getPaymentMethodDisplay = (paymentMethod) => {
    switch (paymentMethod?.toLowerCase()) {
      case 'card': return 'POS'
      case 'mobile': return 'BANK TRANSFER'
      case 'cash': return 'CASH'
      default: return (paymentMethod || 'CASH').toUpperCase()
    }
  }

  const generatePrintHTML = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${orderResult?.orderId || 'N/A'}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .receipt-container {
              max-width: 300px;
              margin: 0 auto;
            }
            .business-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .business-name {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }
            .business-address {
              margin: 2px 0;
              font-size: 10px;
            }
            .receipt-header {
              text-align: center;
              margin: 15px 0;
            }
            .receipt-title {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
            }
            .order-info {
              margin: 15px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .info-label {
              font-weight: bold;
            }
            .products-section {
              margin: 15px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
            }
            .product-item {
              margin: 8px 0;
            }
            .product-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .product-details {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
            }
            .totals-section {
              margin: 15px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .final-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 8px;
            }
            .cash-details {
              margin: 10px 0;
              padding: 8px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .cash-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .change-row {
              font-weight: bold;
              font-size: 13px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin: 10px 0;
            }
            .print-time {
              font-size: 10px;
              margin-top: 15px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .receipt-container { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Business Header -->
            <div class="business-header">
              <h1 class="business-name">CELLER HUT</h1>
              <p class="business-address">500m Opposite Ilere Junction, Along Ijare Road</p>
              <p class="business-address">Akure South, Ondo State, Nigeria</p>
              <p class="business-address">Phone: +234-XXX-XXX-XXXX</p>
            </div>

            <!-- Receipt Header -->
            <div class="receipt-header">
              <h2 class="receipt-title">ORDER RECEIPT</h2>
              <div class="receipt-title">#${orderResult?.orderId || 'N/A'}</div>
            </div>

            <!-- Order Information -->
            <div class="order-info">
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${moment().format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span>Walk-in Customer</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment:</span>
                <span>${getPaymentMethodDisplay(orderData?.paymentMethod)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span>COMPLETED</span>
              </div>
              <div class="info-row">
                <span class="info-label">Served by:</span>
                <span>${userData.firstName || 'Staff'} ${userData.lastName || ''}</span>
              </div>
            </div>

            <!-- Products Section -->
            <div class="products-section">
              ${orderData?.items?.map(item => `
                <div class="product-item">
                  <div class="product-name">${item.name}</div>
                  <div class="product-details">
                    <span>${item.quantity} × ${formatCurrency(item.price)}</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              `).join('') || ''}
            </div>

            <!-- Totals Section -->
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(orderData?.subtotal || 0)}</span>
              </div>
              <div class="total-row">
                <span>Tax (15% incl):</span>
                <span>${formatCurrency(orderData?.tax || 0)}</span>
              </div>
              <div class="total-row final-total">
                <span>TOTAL:</span>
                <span>${formatCurrency(orderData?.total || 0)}</span>
              </div>
            </div>

            ${orderData?.paymentMethod === 'cash' && orderData?.cashCollected ? `
              <!-- Cash Details -->
              <div class="cash-details">
                <div class="cash-row">
                  <span>Cash Received:</span>
                  <span>${formatCurrency(orderData.cashCollected)}</span>
                </div>
                <div class="cash-row change-row">
                  <span>Change Given:</span>
                  <span>${formatCurrency(orderData.changeAmount || 0)}</span>
                </div>
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="receipt-footer">
              <p class="thank-you">Thank you for your patronage!</p>
              <p>We hope to see you again.</p>
              <p class="print-time">Printed: ${moment().format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    const printContent = generatePrintHTML()
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  // Auto-print when modal opens (if autoPrint is enabled)
  useEffect(() => {
    if (isOpen && autoPrint && orderResult?.orderId) {
      const printTimer = setTimeout(() => {
        handlePrint()
      }, 500)
      return () => clearTimeout(printTimer)
    }
  }, [isOpen, autoPrint, orderResult])

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center">
          <span>Order Receipt - #{orderResult?.orderId || 'N/A'}</span>
        </div>
      </ModalHeader>
      
      <ModalBody>
        <div className="receipt-preview p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          {/* Business Header */}
          <div className="text-center mb-3 pb-3 border-bottom">
            <h4 className="mb-1">CELLER HUT</h4>
            <small className="text-muted d-block">500m Opposite Ilere Junction, Along Ijare Road</small>
            <small className="text-muted d-block">Akure South, Ondo State, Nigeria</small>
            <small className="text-muted d-block">Phone: +234-XXX-XXX-XXXX</small>
          </div>

          {/* Receipt Header */}
          <div className="text-center mb-3">
            <h5>ORDER RECEIPT</h5>
            <h6>#{orderResult?.orderId || 'N/A'}</h6>
          </div>

          {/* Order Information */}
          <div className="mb-3">
            <div className="d-flex justify-content-between py-1">
              <span><strong>Date:</strong></span>
              <span>{moment().format('DD/MM/YYYY HH:mm')}</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span><strong>Customer:</strong></span>
              <span>Walk-in Customer</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span><strong>Payment:</strong></span>
              <span>{getPaymentMethodDisplay(orderData?.paymentMethod)}</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span><strong>Status:</strong></span>
              <span>
                <Badge color="success" className="badge-sm">COMPLETED</Badge>
              </span>
            </div>
          </div>

          {/* Products */}
          <div className="mb-3">
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderData?.items?.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="font-weight-bold">{item.name}</div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatPrice(item.price)}</td>
                    <td className="text-right">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mb-3 pt-2 border-top">
            <div className="d-flex justify-content-between py-1">
              <span>Subtotal:</span>
              <span>{formatPrice(orderData?.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span>Tax (15% included):</span>
              <span>{formatPrice(orderData?.tax)}</span>
            </div>
            <div className="d-flex justify-content-between py-2 border-top font-weight-bold">
              <span>TOTAL:</span>
              <span>{formatPrice(orderData?.total)}</span>
            </div>
          </div>

          {/* Cash Details */}
          {orderData?.paymentMethod === 'cash' && orderData?.cashCollected && (
            <div className="mb-3 p-2 bg-light border rounded">
              <div className="d-flex justify-content-between py-1">
                <span><strong>Cash Received:</strong></span>
                <span className="font-weight-bold">{formatPrice(orderData.cashCollected)}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span><strong>Change Given:</strong></span>
                <span className="font-weight-bold text-success">{formatPrice(orderData.changeAmount || 0)}</span>
              </div>
            </div>
          )}

          <div className="text-center pt-3 border-top">
            <p className="mb-1"><strong>Thank you for your patronage!</strong></p>
            <p className="mb-0">We hope to see you again.</p>
            <small className="text-muted">Printed: {moment().format('DD/MM/YYYY HH:mm:ss')}</small>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handlePrint}>
          🖨️ Print Receipt
        </Button>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default PrintReceipt