/**
 * Label Generation Utility Functions
 * Provides price tag label generation with barcode support
 */

import JsBarcode from 'jsbarcode'
import moment from 'moment'

/**
 * Label format configurations
 * Standard label sizes with dimensions in inches
 */
export const LABEL_FORMATS = {
	THERMAL_78x25: {
		name: 'Thermal Label (78x25mm)',
		id: 'thermal_78x25',
		labelWidth: '78mm',
		labelHeight: '25mm',
		labelsPerRow: 1,
		rowsPerPage: 1,
		pageSize: 'custom',
		description: 'Standard thermal printer label',
		isThermal: true
	},
	STANDARD_30: {
		name: 'Standard (30 per sheet)',
		id: 'standard_30',
		labelWidth: '2.625in',
		labelHeight: '1in',
		labelsPerRow: 3,
		rowsPerPage: 10,
		pageSize: 'letter',
		description: 'Avery 5160/8160 compatible'
	},
	LARGE_10: {
		name: 'Large (10 per sheet)',
		id: 'large_10',
		labelWidth: '4in',
		labelHeight: '2in',
		labelsPerRow: 2,
		rowsPerPage: 5,
		pageSize: 'letter',
		description: 'Avery 5163 compatible'
	},
	SHELF_TAG_80: {
		name: 'Shelf Tags (80 per sheet)',
		id: 'shelf_80',
		labelWidth: '1.75in',
		labelHeight: '0.5in',
		labelsPerRow: 4,
		rowsPerPage: 20,
		pageSize: 'letter',
		description: 'Avery 5167 compatible'
	},
	CUSTOM: {
		name: 'Custom Size',
		id: 'custom',
		labelWidth: '3in',
		labelHeight: '1.5in',
		labelsPerRow: 2,
		rowsPerPage: 6,
		pageSize: 'letter',
		description: 'User defined dimensions'
	}
}

/**
 * Generate barcode SVG string
 * @param {string} value - Value to encode in barcode
 * @param {Object} options - Barcode generation options
 * @returns {string} SVG string of barcode
 */
export const generateBarcode = (value, options = {}) => {
	try {
		if (!value) return null
		
		// Create a temporary canvas element
		const canvas = document.createElement('canvas')
		
		const defaultOptions = {
			format: 'CODE128',
			width: 2,
			height: 40,
			displayValue: false,  // Don't show value in barcode itself, we display it separately
			fontSize: 12,
			margin: 5,
			...options
		}
		
		// Check if value is numeric for EAN13
		if (/^\d+$/.test(value) && value.length === 13) {
			defaultOptions.format = 'EAN13'
		}
		
		JsBarcode(canvas, value, defaultOptions)
		
		// Convert canvas to base64 image
		return canvas.toDataURL('image/png')
	} catch (error) {
		console.error('Barcode generation error:', error)
		return null
	}
}

/**
 * Format product data for label display
 * @param {Object} product - Product object
 * @param {Object} options - Formatting options
 */
export const formatLabelData = (product, options = {}) => {
	const {
		showBarcode = true,
		showCostPrice = false,
		showDescription = false,
		showCategory = false,
		showUnit = true,
		showStoreName = false,
		storeName = 'CELLERHUT',
		showExpiryDate = false,
		expiryDate = null,
		showBatchNumber = false,
		batchNumber = null,
		showPromotion = false,
		promotionText = null,
		wasPrice = null,
		currencySymbol = 'R',
		customFields = {}
	} = options
	
	// Generate barcode value (use barcode, then SKU, then product ID)
	const barcodeValue = product.barcode || product.sku || `PRD${product.id}`
	
	// Format prices
	const currentPrice = showCostPrice ? product.costPrice : product.price
	const formattedPrice = `${currencySymbol}${parseFloat(currentPrice).toFixed(2)}`
	const formattedWasPrice = wasPrice ? `${currencySymbol}${parseFloat(wasPrice).toFixed(2)}` : null
	
	// Adjust barcode parameters based on format
	const barcodeOptions = {
		height: 35,     // Increased from 25
		fontSize: 11,   // Increased from 10
		width: 1.5,     // Better bar width
		margin: 1,      // Reduced margin for more space
		textMargin: 0
	}
	
	return {
		id: product.id,
		name: product.name || 'Unknown Product',
		price: currentPrice,
		priceFormatted: formattedPrice,
		wasPrice: formattedWasPrice,
		barcode: showBarcode ? barcodeValue : null,
		barcodeImage: showBarcode ? generateBarcode(barcodeValue, barcodeOptions) : null,
		sku: product.sku || `SKU${product.id}`,
		unit: showUnit ? (product.unit || 'pcs') : null,
		description: showDescription ? product.description : null,
		category: showCategory ? product.categoryName : null,
		storeName: showStoreName ? storeName : null,
		expiryDate: showExpiryDate && expiryDate ? expiryDate : null,
		batchNumber: showBatchNumber && batchNumber ? batchNumber : null,
		promotionText: showPromotion && promotionText ? promotionText : null,
		...customFields
	}
}

/**
 * Generate label HTML for a single product
 * @param {Object} labelData - Formatted label data
 * @param {Object} format - Label format configuration
 */
const generateSingleLabel = (labelData, format) => {
	// Special layout for thermal labels
	if (format.isThermal) {
		return `
			<div class="label thermal-label">
				<div class="thermal-content">
					${labelData.storeName ? `
						<div class="store-header">${labelData.storeName}</div>
					` : ''}
					${labelData.promotionText ? `
						<div class="promotion-badge">${labelData.promotionText}</div>
					` : ''}
					<div class="main-section">
						<div class="product-info">
							<div class="product-name">${labelData.name}</div>
							${labelData.unit ? `<div class="unit-info">${labelData.unit}</div>` : ''}
						</div>
						<div class="price-info">
							${labelData.wasPrice ? `<div class="was-price">${labelData.wasPrice}</div>` : ''}
							<div class="current-price">${labelData.priceFormatted}</div>
						</div>
					</div>
					${labelData.barcodeImage ? `
						<div class="barcode-section">
							<img src="${labelData.barcodeImage}" alt="barcode" class="barcode-image" />
							<div class="barcode-text">${labelData.barcode}</div>
						</div>
					` : ''}
					<div class="bottom-info">
						${labelData.sku ? `<span class="sku">SKU: ${labelData.sku}</span>` : ''}
						${labelData.expiryDate ? `<span class="expiry">EXP: ${labelData.expiryDate}</span>` : ''}
						${labelData.batchNumber ? `<span class="batch">LOT: ${labelData.batchNumber}</span>` : ''}
					</div>
				</div>
			</div>
		`
	}
	
	// Standard label layout
	const fontSize = format.id === 'shelf_80' ? '9px' : '11px'
	const nameSize = format.id === 'shelf_80' ? '10px' : '14px'
	const priceSize = format.id === 'shelf_80' ? '11px' : '16px'
	
	return `
		<div class="label">
			<div class="label-content">
				${labelData.storeName ? `
					<div class="store-name" style="font-size: ${fontSize};">${labelData.storeName}</div>
				` : ''}
				<div class="product-name" style="font-size: ${nameSize};">${labelData.name}</div>
				${labelData.barcodeImage ? `
					<div class="barcode-container">
						<img src="${labelData.barcodeImage}" alt="barcode" class="barcode-image" />
					</div>
				` : ''}
				<div class="price-section">
					${labelData.wasPrice ? `<div class="was-price" style="font-size: ${fontSize}; text-decoration: line-through;">${labelData.wasPrice}</div>` : ''}
					<div class="price" style="font-size: ${priceSize};">${labelData.priceFormatted}</div>
					${labelData.unit ? `<div class="unit" style="font-size: ${fontSize};">${labelData.unit}</div>` : ''}
				</div>
				<div class="sku" style="font-size: ${fontSize};">SKU: ${labelData.sku}</div>
				${labelData.category ? `<div class="category" style="font-size: ${fontSize};">${labelData.category}</div>` : ''}
			</div>
		</div>
	`
}

/**
 * Export price labels as printable document
 * @param {Array} products - Array of products to generate labels for
 * @param {Object} options - Export options
 */
export const exportPriceLabels = (products, options = {}) => {
	try {
		if (!products || products.length === 0) {
			return { success: false, error: 'No products provided' }
		}
		
		const {
			format = LABEL_FORMATS.STANDARD_30,
			quantities = {},
			labelOptions = {},
			title = 'Price Labels'
		} = options
		
		// Generate labels based on quantities
		const allLabels = []
		products.forEach(product => {
			const quantity = quantities[product.id] || 1
			const labelData = formatLabelData(product, labelOptions)
			
			for (let i = 0; i < quantity; i++) {
				allLabels.push(labelData)
			}
		})
		
		// Generate label grid HTML
		let labelsHtml = '<div class="label-sheet">'
		let currentRow = '<div class="label-row">'
		let labelsInRow = 0
		
		allLabels.forEach((label, index) => {
			if (labelsInRow >= format.labelsPerRow) {
				currentRow += '</div>'
				labelsHtml += currentRow
				currentRow = '<div class="label-row">'
				labelsInRow = 0
			}
			
			currentRow += generateSingleLabel(label, format)
			labelsInRow++
		})
		
		// Close any open row
		if (labelsInRow > 0) {
			// Fill empty spaces in the last row
			while (labelsInRow < format.labelsPerRow) {
				currentRow += '<div class="label empty-label"></div>'
				labelsInRow++
			}
			currentRow += '</div>'
			labelsHtml += currentRow
		}
		
		labelsHtml += '</div>'
		
		// Create print window
		const printFrame = document.createElement('iframe')
		printFrame.style.position = 'absolute'
		printFrame.style.top = '-10000px'
		printFrame.style.left = '-10000px'
		document.body.appendChild(printFrame)
		
		const printDocument = printFrame.contentDocument || printFrame.contentWindow.document
		
		// Generate complete HTML document
		const html = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<title>${title}</title>
				<style>
					@page {
						size: ${format.pageSize === 'custom' ? `${format.labelWidth} ${format.labelHeight}` : format.pageSize};
						margin: 0;
					}
					
					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
					}
					
					body {
						font-family: Arial, sans-serif;
						margin: 0;
						padding: ${format.isThermal ? '0' : '0.5in 0.1875in'};
					}
					
					.label-sheet {
						width: 100%;
						margin: 0 auto;
					}
					
					.label-row {
						display: flex;
						justify-content: ${format.isThermal ? 'center' : 'space-between'};
						margin-bottom: 0;
					}
					
					.label {
						width: ${format.labelWidth};
						height: ${format.labelHeight};
						padding: ${format.isThermal ? '2mm' : '0.0625in'};
						border: ${format.isThermal ? 'none' : '1px dotted #ccc'};
						overflow: hidden;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					
					/* Thermal label specific styles */
					.thermal-label {
						padding: 2mm;
						background: white;
					}
					
					.thermal-content {
						width: 100%;
						height: 100%;
						display: flex;
						flex-direction: column;
						justify-content: space-between;
					}
					
					.store-header {
						font-size: 8px;
						font-weight: bold;
						text-align: center;
						border-bottom: 1px solid #000;
						padding-bottom: 1mm;
						margin-bottom: 1mm;
					}
					
					.promotion-badge {
						position: absolute;
						top: 2mm;
						right: 2mm;
						background: #000;
						color: white;
						padding: 1mm 2mm;
						font-size: 7px;
						font-weight: bold;
						border-radius: 2px;
					}
					
					.main-section {
						display: flex;
						justify-content: space-between;
						align-items: center;
						flex-grow: 1;
						padding: 0 1mm;
					}
					
					.product-info {
						flex: 1;
						text-align: left;
					}
					
					.thermal-label .product-name {
						font-size: 10px;
						font-weight: bold;
						line-height: 1.1;
						margin-bottom: 0.5mm;
						max-width: 40mm;
						word-wrap: break-word;
						white-space: normal;
					}
					
					.unit-info {
						font-size: 8px;
						color: #333;
					}
					
					.price-info {
						text-align: right;
						padding-left: 2mm;
					}
					
					.was-price {
						font-size: 9px;
						text-decoration: line-through;
						color: #666;
					}
					
					.current-price {
						font-size: 14px;
						font-weight: bold;
						color: #000;
					}
					
					.barcode-section {
						text-align: center;
						margin: 2mm 0;
						padding: 1mm 0;
					}
					
					.thermal-label .barcode-image {
						height: 35px;
						width: auto;
						max-width: 90%;
						display: inline-block;
					}
					
					.barcode-text {
						font-size: 9px;
						margin-top: 1px;
						font-family: monospace;
						letter-spacing: 0.5px;
					}
					
					.bottom-info {
						display: flex;
						justify-content: space-between;
						font-size: 7px;
						color: #333;
						padding: 0 1mm;
						border-top: 0.5px solid #ddd;
						padding-top: 1mm;
					}
					
					.bottom-info span {
						flex: 1;
					}
					
					/* Standard label styles */
					.empty-label {
						border: none;
					}
					
					.label-content {
						width: 100%;
						text-align: center;
					}
					
					.product-name {
						font-weight: bold;
						margin-bottom: 2px;
						line-height: 1.2;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
					
					.barcode-container {
						margin: 3px 0;
						height: ${format.id === 'shelf_80' ? '30px' : '40px'};
						display: flex;
						justify-content: center;
						align-items: center;
					}
					
					.barcode-image {
						max-width: 95%;
						height: ${format.id === 'shelf_80' ? '28px' : '38px'};
						width: auto;
					}
					
					.price-section {
						display: flex;
						justify-content: center;
						align-items: baseline;
						gap: 5px;
						margin: 2px 0;
					}
					
					.price {
						font-weight: bold;
						color: #000;
					}
					
					.unit {
						color: #666;
					}
					
					.sku {
						color: #666;
						margin-top: 2px;
					}
					
					.category {
						color: #999;
						font-style: italic;
						margin-top: 1px;
					}
					
					@media print {
						body {
							padding: 0;
							-webkit-print-color-adjust: exact;
							print-color-adjust: exact;
						}
						
						.label {
							border: none;
							page-break-inside: avoid;
						}
						
						.label-row {
							page-break-inside: avoid;
						}
						
						.thermal-label {
							margin: 0;
							padding: 1mm;
						}
						
						.promotion-badge {
							background: #000 !important;
							-webkit-print-color-adjust: exact;
							print-color-adjust: exact;
						}
						
						@page {
							margin: 0;
						}
					}
				</style>
			</head>
			<body>
				${labelsHtml}
			</body>
			</html>
		`
		
		printDocument.open()
		printDocument.write(html)
		printDocument.close()
		
		// Wait for content to load then print
		setTimeout(() => {
			printFrame.contentWindow.focus()
			printFrame.contentWindow.print()
			
			// Remove iframe after printing
			setTimeout(() => {
				document.body.removeChild(printFrame)
			}, 1000)
		}, 500)
		
		return { success: true, labelCount: allLabels.length }
	} catch (error) {
		console.error('Label export error:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Export single product label
 * @param {Object} product - Product to generate label for
 * @param {Object} options - Export options
 */
export const exportSingleLabel = (product, options = {}) => {
	return exportPriceLabels([product], {
		...options,
		quantities: { [product.id]: 1 }
	})
}

/**
 * Generate label preview HTML
 * @param {Object} product - Product to preview
 * @param {Object} options - Preview options
 */
export const generateLabelPreview = (product, options = {}) => {
	const labelData = formatLabelData(product, options.labelOptions || {})
	const format = options.format || LABEL_FORMATS.STANDARD_30
	
	// Apply same styles as print version for consistency
	const previewStyles = format.isThermal ? `
		<style>
			.preview-container .thermal-label {
				padding: 2mm;
				width: 78mm;
				height: 25mm;
			}
			.preview-container .thermal-content {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.preview-container .store-header {
				font-size: 8px;
				font-weight: bold;
				text-align: center;
				border-bottom: 1px solid #000;
				padding-bottom: 1mm;
				margin-bottom: 1mm;
			}
			.preview-container .main-section {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-grow: 1;
				padding: 0 1mm;
			}
			.preview-container .product-info {
				flex: 1;
				text-align: left;
			}
			.preview-container .product-name {
				font-size: 10px;
				font-weight: bold;
				line-height: 1.1;
				margin-bottom: 0.5mm;
				max-width: 40mm;
				word-wrap: break-word;
				white-space: normal;
			}
			.preview-container .unit-info {
				font-size: 8px;
				color: #333;
			}
			.preview-container .price-info {
				text-align: right;
				padding-left: 2mm;
			}
			.preview-container .current-price {
				font-size: 14px;
				font-weight: bold;
				color: #000;
			}
			.preview-container .barcode-section {
				text-align: center;
				margin: 2mm 0;
				padding: 1mm 0;
			}
			.preview-container .barcode-image {
				height: 35px !important;
				width: auto;
				max-width: 90%;
				display: inline-block;
			}
			.preview-container .barcode-text {
				font-size: 9px;
				margin-top: 1px;
				font-family: monospace;
				letter-spacing: 0.5px;
			}
			.preview-container .bottom-info {
				display: flex;
				justify-content: space-between;
				font-size: 7px;
				color: #333;
				padding: 0 1mm;
				border-top: 0.5px solid #ddd;
				padding-top: 1mm;
			}
			.preview-container .promotion-badge {
				position: absolute;
				top: 2mm;
				right: 2mm;
				background: #000;
				color: white;
				padding: 1mm 2mm;
				font-size: 7px;
				font-weight: bold;
				border-radius: 2px;
			}
		</style>
	` : ''
	
	return `
		${previewStyles}
		<div class="preview-container" style="display: flex; justify-content: center; padding: 20px; background: #f5f5f5;">
			<div style="width: ${format.labelWidth}; height: ${format.labelHeight}; background: white; border: 1px solid #ddd; ${format.isThermal ? 'padding: 0;' : 'padding: 10px;'} box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
				${generateSingleLabel(labelData, format)}
			</div>
		</div>
	`
}

// Export all utilities
export default {
	LABEL_FORMATS,
	generateBarcode,
	formatLabelData,
	exportPriceLabels,
	exportSingleLabel,
	generateLabelPreview
}