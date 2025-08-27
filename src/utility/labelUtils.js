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
			displayValue: true,
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
		customFields = {}
	} = options
	
	// Generate barcode value (use barcode, then SKU, then product ID)
	const barcodeValue = product.barcode || product.sku || `PRD${product.id}`
	
	return {
		id: product.id,
		name: product.name || 'Unknown Product',
		price: showCostPrice ? product.costPrice : product.price,
		priceFormatted: `R ${parseFloat(showCostPrice ? product.costPrice : product.price).toFixed(2)}`,
		barcode: showBarcode ? barcodeValue : null,
		barcodeImage: showBarcode ? generateBarcode(barcodeValue) : null,
		sku: product.sku || `SKU${product.id}`,
		unit: showUnit ? (product.unit || 'pcs') : null,
		description: showDescription ? product.description : null,
		category: showCategory ? product.categoryName : null,
		...customFields
	}
}

/**
 * Generate label HTML for a single product
 * @param {Object} labelData - Formatted label data
 * @param {Object} format - Label format configuration
 */
const generateSingleLabel = (labelData, format) => {
	const fontSize = format.id === 'shelf_80' ? '9px' : '11px'
	const nameSize = format.id === 'shelf_80' ? '10px' : '14px'
	const priceSize = format.id === 'shelf_80' ? '11px' : '16px'
	
	return `
		<div class="label">
			<div class="label-content">
				<div class="product-name" style="font-size: ${nameSize};">${labelData.name}</div>
				${labelData.barcodeImage ? `
					<div class="barcode-container">
						<img src="${labelData.barcodeImage}" alt="barcode" class="barcode-image" />
					</div>
				` : ''}
				<div class="price-section">
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
						size: ${format.pageSize};
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
						padding: 0.5in 0.1875in;
					}
					
					.label-sheet {
						width: 100%;
						margin: 0 auto;
					}
					
					.label-row {
						display: flex;
						justify-content: space-between;
						margin-bottom: 0;
					}
					
					.label {
						width: ${format.labelWidth};
						height: ${format.labelHeight};
						padding: 0.0625in;
						border: 1px dotted #ccc;
						overflow: hidden;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					
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
						height: ${format.id === 'shelf_80' ? '25px' : '35px'};
						display: flex;
						justify-content: center;
						align-items: center;
					}
					
					.barcode-image {
						max-width: 100%;
						max-height: 100%;
						height: auto;
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
						}
						
						.label {
							border: none;
							page-break-inside: avoid;
						}
						
						.label-row {
							page-break-inside: avoid;
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
	
	return `
		<div style="display: flex; justify-content: center; padding: 20px; background: #f5f5f5;">
			<div style="width: ${format.labelWidth}; height: ${format.labelHeight}; background: white; border: 1px solid #ddd; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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