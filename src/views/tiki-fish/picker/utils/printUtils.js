import moment from 'moment'

export const formatCurrency = (amount) => {
	return parseFloat(amount || 0).toLocaleString('en-ZA', {
		style: 'currency',
		currency: 'ZAR',
	})
}

export const generateReceiptHTML = (orderData, orderResult) => {
	const userData = JSON.parse(localStorage.getItem('userData') || '{}')

	return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Receipt - ${orderResult?.orderId || 'N/A'}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
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
            margin: 0 0 5px 0;
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
            body { 
              margin: 0; 
              padding: 10px; 
            }
            .receipt-container { 
              max-width: none; 
            }
            @page {
              margin: 0.5in;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Business Header -->
          <div class="business-header">
            <h1 class="business-name">CELLAR HUT</h1>
            <p class="business-address">500m Opposite Ilere Junction, Along Ijare Road</p>
            <p class="business-address">Akure South, Ondo State, South Africa</p>
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
              <span>${orderData?.paymentMethod?.toUpperCase() || 'CASH'}</span>
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
            ${
							orderData?.items
								?.map(
									(item) => `
              <div class="product-item">
                <div class="product-name">${item.name}</div>
                <div class="product-details">
                  <span>${item.quantity} × ${formatCurrency(item.price)}</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            `
								)
								.join('') || ''
						}
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

          ${
						orderData?.paymentMethod === 'cash' && orderData?.cashCollected
							? `
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
          `
							: ''
					}

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

export const printReceipt = (orderData, orderResult, options = {}) => {
	const { windowName = 'receipt_print', windowFeatures = 'width=800,height=600,scrollbars=yes', autoPrint = true, autoClose = true } = options

	try {
		const printWindow = window.open('', windowName, windowFeatures)

		if (!printWindow) {
			throw new Error('Failed to open print window. Please check popup blocker settings.')
		}

		const printContent = generateReceiptHTML(orderData, orderResult)

		printWindow.document.write(printContent)
		printWindow.document.close()

		if (autoPrint) {
			printWindow.onload = () => {
				// Small delay to ensure content is fully loaded
				setTimeout(() => {
					printWindow.print()

					if (autoClose) {
						// Close after printing (with delay to allow print dialog)
						setTimeout(() => {
							printWindow.close()
						}, 1000)
					}
				}, 100)
			}
		}

		return { success: true, printWindow }
	} catch (error) {
		console.error('Print receipt error:', error)
		return { success: false, error: error.message }
	}
}

export const showPrintPreview = (orderData, orderResult) => {
	const previewWindow = window.open('', 'receipt_preview', 'width=800,height=600,scrollbars=yes')

	if (!previewWindow) {
		alert('Failed to open preview window. Please check popup blocker settings.')
		return
	}

	const previewContent = generateReceiptHTML(orderData, orderResult)

	// Add preview-specific styles and controls
	const previewHTML = previewContent.replace(
		'<body>',
		`<body>
      <div style="position: fixed; top: 10px; right: 10px; z-index: 1000; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <button onclick="window.print()" style="margin-right: 10px; padding: 5px 10px;">Print</button>
        <button onclick="window.close()" style="padding: 5px 10px;">Close</button>
      </div>`
	)

	previewWindow.document.write(previewHTML)
	previewWindow.document.close()
}

// Thermal printer specific utilities
export const generateThermalReceiptHTML = (orderData, orderResult) => {
	// Optimized for thermal printers (58mm width)
	return generateReceiptHTML(orderData, orderResult).replace('max-width: 300px;', 'max-width: 200px;').replace('font-size: 12px;', 'font-size: 11px;')
}

export const printThermalReceipt = (orderData, orderResult) => {
	return printReceipt(orderData, orderResult, {
		windowName: 'thermal_receipt_print',
		windowFeatures: 'width=400,height=600,scrollbars=yes',
	})
}
