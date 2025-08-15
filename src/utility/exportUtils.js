/**
 * Export Utility Functions
 * Provides Excel, CSV, and PDF export functionality for inventory counts
 */

import XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
import { parse } from 'json2csv'
import moment from 'moment'

/**
 * Generate filename with timestamp
 * @param {string} prefix - File prefix (e.g., 'InventoryCount')
 * @param {string} identifier - Unique identifier (e.g., count number)
 * @param {string} extension - File extension
 */
const generateFilename = (prefix, identifier, extension) => {
	const timestamp = moment().format('YYYYMMDD_HHmmss')
	return `${prefix}_${identifier}_${timestamp}.${extension}`
}

/**
 * Export data to Excel format
 * @param {Object} data - Data to export
 * @param {string} filename - Filename without extension
 * @param {Array} sheets - Array of sheet configurations [{name, data, columns}]
 */
export const exportToExcel = (data, filename, sheets = null) => {
	try {
		const wb = XLSX.utils.book_new()
		
		if (sheets && Array.isArray(sheets)) {
			// Multiple sheets export
			sheets.forEach(sheet => {
				const ws = XLSX.utils.json_to_sheet(sheet.data)
				
				// Auto-fit columns
				const maxWidth = 50
				const colWidths = []
				
				if (sheet.data.length > 0) {
					Object.keys(sheet.data[0]).forEach((key, i) => {
						const maxLength = Math.max(
							key.length,
							...sheet.data.map(row => (row[key] ? row[key].toString().length : 0))
						)
						colWidths[i] = { wch: Math.min(maxLength + 2, maxWidth) }
					})
					ws['!cols'] = colWidths
				}
				
				XLSX.utils.book_append_sheet(wb, ws, sheet.name)
			})
		} else {
			// Single sheet export
			const ws = XLSX.utils.json_to_sheet(data)
			
			// Auto-fit columns
			const maxWidth = 50
			const colWidths = []
			
			if (data.length > 0) {
				Object.keys(data[0]).forEach((key, i) => {
					const maxLength = Math.max(
						key.length,
						...data.map(row => (row[key] ? row[key].toString().length : 0))
					)
					colWidths[i] = { wch: Math.min(maxLength + 2, maxWidth) }
				})
				ws['!cols'] = colWidths
			}
			
			XLSX.utils.book_append_sheet(wb, ws, 'Data')
		}
		
		const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
		
		// Convert to binary
		const s2ab = s => {
			const buf = new ArrayBuffer(s.length)
			const view = new Uint8Array(buf)
			for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff
			return buf
		}
		
		const file = `${filename}.xlsx`
		FileSaver.saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), file)
		
		return { success: true, filename: file }
	} catch (error) {
		console.error('Excel export error:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename without extension
 * @param {Array} fields - Optional array of field configurations
 */
export const exportToCSV = (data, filename, fields = null) => {
	try {
		let csv
		
		if (fields) {
			// Use specified fields and labels
			csv = parse(data, { fields })
		} else {
			// Auto-detect fields from data
			csv = parse(data)
		}
		
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const file = `${filename}.csv`
		FileSaver.saveAs(blob, file)
		
		return { success: true, filename: file }
	} catch (error) {
		console.error('CSV export error:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Export data to PDF format (using print)
 * @param {string} title - Report title
 * @param {string} content - HTML content to print
 * @param {Object} options - Print options
 */
export const exportToPDF = (title, content, options = {}) => {
	try {
		// Create a hidden iframe for printing
		const printFrame = document.createElement('iframe')
		printFrame.style.position = 'absolute'
		printFrame.style.top = '-10000px'
		document.body.appendChild(printFrame)
		
		const printDocument = printFrame.contentDocument || printFrame.contentWindow.document
		
		// Build the print document
		const html = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>${title}</title>
				<style>
					* { margin: 0; padding: 0; box-sizing: border-box; }
					body { 
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
						font-size: 12px;
						line-height: 1.5;
						color: #333;
						padding: 20px;
					}
					h1 { font-size: 24px; margin-bottom: 20px; color: #2c3e50; }
					h2 { font-size: 18px; margin: 15px 0; color: #34495e; }
					h3 { font-size: 16px; margin: 10px 0; color: #34495e; }
					table { 
						width: 100%; 
						border-collapse: collapse; 
						margin: 15px 0;
						font-size: 11px;
					}
					th, td { 
						padding: 8px; 
						text-align: left; 
						border: 1px solid #ddd;
					}
					th { 
						background-color: #f8f9fa; 
						font-weight: 600;
						color: #2c3e50;
					}
					tr:nth-child(even) { background-color: #f8f9fa; }
					.header { 
						border-bottom: 2px solid #3498db; 
						padding-bottom: 10px; 
						margin-bottom: 20px;
					}
					.summary-card {
						background: #f8f9fa;
						padding: 15px;
						border-radius: 5px;
						margin: 10px 0;
					}
					.text-success { color: #27ae60; }
					.text-danger { color: #e74c3c; }
					.text-warning { color: #f39c12; }
					.text-info { color: #3498db; }
					.badge {
						display: inline-block;
						padding: 3px 8px;
						border-radius: 3px;
						font-size: 10px;
						font-weight: 600;
					}
					.badge-success { background: #d4edda; color: #155724; }
					.badge-danger { background: #f8d7da; color: #721c24; }
					.badge-warning { background: #fff3cd; color: #856404; }
					.badge-info { background: #d1ecf1; color: #0c5460; }
					.footer {
						margin-top: 30px;
						padding-top: 10px;
						border-top: 1px solid #ddd;
						font-size: 10px;
						color: #666;
						text-align: center;
					}
					@media print {
						body { padding: 0; }
						.no-print { display: none !important; }
						@page { 
							margin: 0.5in;
							size: ${options.orientation || 'portrait'};
						}
					}
				</style>
			</head>
			<body>
				${content}
				<div class="footer">
					Generated on ${moment().format('MMMM DD, YYYY [at] HH:mm:ss')}
				</div>
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
		
		return { success: true }
	} catch (error) {
		console.error('PDF export error:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Format variance report data for export
 * @param {Object} varianceData - Variance report data
 */
export const formatVarianceDataForExport = (varianceData) => {
	if (!varianceData) return []
	
	const { count, summary, variances } = varianceData
	
	// Format variance items for export
	const formattedVariances = variances?.map(item => ({
		'Product Name': item.product?.name || 'Unknown',
		SKU: item.product?.sku || 'N/A',
		Barcode: item.product?.barcode || 'N/A',
		'System Quantity': item.systemQty || 0,
		'Counted Quantity': item.countedQty || 0,
		'Variance Quantity': item.varianceQty || 0,
		'Variance %': item.variancePercent ? `${Number(item.variancePercent).toFixed(1)}%` : '0%',
		'Variance Value': item.varianceValue ? `R ${Number(item.varianceValue).toFixed(2)}` : 'R 0.00',
		Category: item.varianceCategory || 'N/A',
		Condition: item.itemCondition || 'N/A',
		'Count Method': item.countMethod || 'manual',
		Notes: item.notes || '',
		'Counted By': item.counter ? `${item.counter.firstName} ${item.counter.lastName}` : 'N/A',
		'Counted At': item.countedAt ? moment(item.countedAt).format('YYYY-MM-DD HH:mm') : 'N/A'
	})) || []
	
	return formattedVariances
}

/**
 * Format report data for export
 * @param {Object} reportData - Report data
 */
export const formatReportDataForExport = (reportData) => {
	if (!reportData) return {}
	
	const sheets = []
	
	// Summary sheet
	if (reportData.summary) {
		const summaryData = [
			{ Metric: 'Total Counts', Value: reportData.summary.totalCounts || 0 },
			{ Metric: 'Total Items', Value: reportData.summary.totalItems || 0 },
			{ Metric: 'Items Counted', Value: reportData.summary.totalCounted || 0 },
			{ Metric: 'Total Variances', Value: reportData.summary.totalVariances || 0 },
			{ Metric: 'Total Impact', Value: `R ${Math.abs(reportData.summary.totalImpact || 0).toFixed(2)}` },
			{ Metric: 'Average Accuracy', Value: `${reportData.summary.avgAccuracy || 0}%` },
			{ Metric: 'Completion Rate', Value: `${reportData.summary.completionRate || 0}%` }
		]
		sheets.push({ name: 'Summary', data: summaryData })
	}
	
	// Count details sheet
	if (reportData.counts && reportData.counts.length > 0) {
		const countsData = reportData.counts.map(count => ({
			'Count Number': count.countNumber,
			'Count Date': moment(count.countDate).format('YYYY-MM-DD'),
			Type: count.countType,
			Status: count.status,
			'Total Items': count.totalItems,
			'Counted Items': count.countedItems,
			Variances: count.variances,
			Impact: `R ${Math.abs(count.impact || 0).toFixed(2)}`,
			Accuracy: `${count.accuracy || 0}%`,
			'Created By': count.creator,
			'Assigned To': count.assignee
		}))
		sheets.push({ name: 'Counts', data: countsData })
	}
	
	// Detailed variance data sheet
	if (reportData.detailedData && reportData.detailedData.length > 0) {
		const detailedData = reportData.detailedData.map(item => ({
			'Count Number': item.countNumber,
			'Count Date': moment(item.countDate).format('YYYY-MM-DD'),
			'Product Name': item.productName,
			Category: item.categoryName,
			'System Qty': item.systemQty,
			'Counted Qty': item.countedQty,
			Variance: item.variance,
			'Variance Value': `R ${Math.abs(item.varianceValue || 0).toFixed(2)}`,
			Status: item.approved ? 'Approved' : 'Pending'
		}))
		sheets.push({ name: 'Variance Details', data: detailedData })
	}
	
	// Top variances sheet
	if (reportData.topVariances && reportData.topVariances.length > 0) {
		const topVariancesData = reportData.topVariances.map(item => ({
			Product: item.productName,
			SKU: item.sku,
			'Avg System Qty': item.avgSystemQty,
			'Avg Counted Qty': item.avgCountedQty,
			'Avg Variance': item.avgVariance,
			'Variance %': `${item.variancePercent || 0}%`,
			'Total Value': `R ${Math.abs(item.totalValue || 0).toFixed(2)}`
		}))
		sheets.push({ name: 'Top Variances', data: topVariancesData })
	}
	
	return sheets
}

export default {
	generateFilename,
	exportToExcel,
	exportToCSV,
	exportToPDF,
	formatVarianceDataForExport,
	formatReportDataForExport
}