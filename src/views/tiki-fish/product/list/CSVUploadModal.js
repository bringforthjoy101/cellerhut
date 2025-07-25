import { Fragment, useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import XLSX from 'xlsx'
import Uppy from '@uppy/core'
import { DragDrop } from '@uppy/react'
import { X, Download, Upload, AlertCircle, CheckCircle } from 'react-feather'
import { toast } from 'react-toastify'
import Avatar from '@components/avatar'
import { apiRequest } from '@utils'
import { getAllData } from '../store/action'

// ** Reactstrap Imports
import {
	Modal,
	ModalHeader,
	ModalBody,
	Button,
	Table,
	Row,
	Col,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Progress,
	Badge,
	Alert,
	Spinner,
} from 'reactstrap'

import 'uppy/dist/uppy.css'
import '@uppy/status-bar/dist/style.css'
import '@styles/react/libs/file-uploader/file-uploader.scss'

const ErrorToast = ({ message }) => (
	<Fragment>
		<div className="toastify-header">
			<div className="title-wrapper">
				<Avatar size="sm" color="danger" icon={<X size={12} />} />
				<h6 className="toast-title">Error!</h6>
			</div>
		</div>
		<div className="toastify-body">
			<span>{message}</span>
		</div>
	</Fragment>
)

const SuccessToast = ({ message }) => (
	<Fragment>
		<div className="toastify-header">
			<div className="title-wrapper">
				<Avatar size="sm" color="success" icon={<CheckCircle size={12} />} />
				<h6 className="toast-title">Success!</h6>
			</div>
		</div>
		<div className="toastify-body">
			<span>{message}</span>
		</div>
	</Fragment>
)

const CSVUploadModal = ({ isOpen, toggle }) => {
	const dispatch = useDispatch()

	// State management
	const [tableData, setTableData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [searchValue, setSearchValue] = useState('')
	const [fileName, setFileName] = useState('')
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [validationErrors, setValidationErrors] = useState([])
	const [validProducts, setValidProducts] = useState([])
	const [step, setStep] = useState(1) // 1: Upload, 2: Preview, 3: Results

	const requiredColumns = ['name']

	// Initialize Uppy
	const [uppy] = useState(
		() =>
			new Uppy({
				restrictions: {
					maxNumberOfFiles: 1,
					allowedFileTypes: ['.csv', '.xlsx', '.xls'],
				},
				autoProceed: true,
			})
	)

	const validateData = useCallback((data) => {
		const errors = []
		const valid = []

		data.forEach((row, index) => {
			const rowErrors = []

			// Check required fields
			requiredColumns.forEach((col) => {
				if (!row[col] || row[col].toString().trim() === '') {
					rowErrors.push(`${col} is required`)
				}
			})

			// Validate data types
			if (row.qty && isNaN(Number(row.qty))) {
				rowErrors.push('qty must be a number')
			}
			if (row.price && isNaN(Number(row.price))) {
				rowErrors.push('price must be a number')
			}
			if (row.costPrice && isNaN(Number(row.costPrice))) {
				rowErrors.push('costPrice must be a number')
			}
			if (row.categoryId && isNaN(Number(row.categoryId))) {
				rowErrors.push('categoryId must be a number')
			}

			// Validate unit values
			const validUnits = ['bottle', 'case', 'box', 'dozen', 'kg', 'pck', 'pcs', 'l', 'g', 'crate', 'carton']
			if (row.unit && !validUnits.includes(row.unit.toLowerCase())) {
				rowErrors.push(`unit must be one of: ${validUnits.join(', ')}`)
			}

			if (rowErrors.length > 0) {
				errors.push({ row: index + 1, errors: rowErrors, data: row })
			} else {
				valid.push(row)
			}
		})

		setValidationErrors(errors)
		setValidProducts(valid)
	}, [requiredColumns])

	const processFile = useCallback((file) => {
		const reader = new FileReader()
		reader.onload = function () {
			try {
				let data = []

				if (file.extension === 'csv') {
					// Process CSV
					const csvData = reader.result
					const lines = csvData.split('\n')
					const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

					for (let i = 1; i < lines.length; i++) {
						if (lines[i].trim()) {
							const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
							const row = {}
							headers.forEach((header, index) => {
								row[header] = values[index] || ''
							})
							data.push(row)
						}
					}
				} else {
					// Process Excel
					const fileData = reader.result
					const wb = XLSX.read(fileData, { type: 'binary' })
					const sheetName = wb.SheetNames[0]
					data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName])
				}

				setTableData(data)
				setFileName(file.name)
				setStep(2)
				validateData(data)
			} catch (error) {
				toast.error(<ErrorToast message="Failed to parse file. Please check the format." />, { hideProgressBar: true })
			}
		}

		if (file.extension === 'csv') {
			reader.readAsText(file.data)
		} else {
			reader.readAsBinaryString(file.data)
		}
	}, [validateData])

	useEffect(() => {
		uppy.on('complete', (result) => {
			if (result.successful.length > 0) {
				const file = result.successful[0]
				processFile(file)
			}
		})

		uppy.on('upload-error', () => {
			toast.error(<ErrorToast message="Failed to process file. Please try again." />, { hideProgressBar: true })
		})

		return () => uppy.close()
	}, [uppy, processFile])

	const handleSearch = (e) => {
		const value = e.target.value
		setSearchValue(value)

		if (value.length) {
			const filtered = tableData.filter((row) => {
				return Object.values(row).some((val) => val && val.toString().toLowerCase().includes(value.toLowerCase()))
			})
			setFilteredData(filtered)
		} else {
			setFilteredData([])
		}
	}

	const handleUpload = async () => {
		if (validProducts.length === 0) {
			toast.error(<ErrorToast message="No valid products to upload" />, { hideProgressBar: true })
			return
		}

		setIsUploading(true)
		setUploadProgress(0)

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev < 90) {
						return prev + 10
					}
					return prev
				})
			}, 200)

			const body = JSON.stringify({ products: validProducts })
			const response = await apiRequest(
				{
					url: '/products/create-multiple',
					method: 'POST',
					body,
				},
				dispatch
			)

			clearInterval(progressInterval)
			setUploadProgress(100)

			if (response.data.status) {
				setStep(3)
				toast.success(<SuccessToast message={`Successfully processed ${response.data.data.success} products!`} />, { hideProgressBar: true })
				dispatch(getAllData())
			} else {
				toast.error(<ErrorToast message={response.data.message || 'Upload failed'} />, { hideProgressBar: true })
			}
		} catch (error) {
			toast.error(<ErrorToast message="Upload failed. Please try again." />, { hideProgressBar: true })
		} finally {
			setIsUploading(false)
			setTimeout(() => setUploadProgress(0), 2000)
		}
	}

	const downloadTemplate = () => {
		const template = [
			{
				name: 'Sample Product 1',
				description: 'Sample product description',
				qty: 10,
				price: 25.99,
				costPrice: 15.0,
				packagingPrice: 2.5,
				unit: 'bottle',
				unitValue: 750,
				sku: 'SP001',
				barcode: '123456789012',
				categoryId: 1,
				tax_rate: 15.0,
				tax_inclusive: false,
				alcohol_content: 12.5,
				volume: '750ml',
				origin: 'France',
				vintage: 2020,
			},
		]

		const ws = XLSX.utils.json_to_sheet(template)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, 'Products Template')
		XLSX.writeFile(wb, 'products_template.xlsx')
	}

	const resetModal = () => {
		setTableData([])
		setFilteredData([])
		setSearchValue('')
		setFileName('')
		setValidationErrors([])
		setValidProducts([])
		setStep(1)
		setIsUploading(false)
		setUploadProgress(0)
		uppy.reset()
	}

	const handleClose = () => {
		resetModal()
		toggle()
	}

	const displayData = searchValue.length ? filteredData : tableData
	const tableHeaders = displayData.length > 0 ? Object.keys(displayData[0]) : []

	return (
		<Modal isOpen={isOpen} toggle={handleClose} size="xl" className="csv-upload-modal">
			<ModalHeader toggle={handleClose}>
				<div className="d-flex align-items-center">
					<Upload className="mr-1" size={20} />
					Bulk Upload Products
				</div>
			</ModalHeader>

			<ModalBody>
				{step === 1 && (
					<Fragment>
						<Row className="mb-2">
							<Col sm="12">
								<Alert color="info">
									<h6 className="alert-heading">Upload Instructions</h6>
									<p className="mb-0">Upload a CSV or Excel file with product data. Download the template below for the correct format.</p>
								</Alert>
							</Col>
						</Row>

						<Row className="mb-2">
							<Col sm="12">
								<Button color="primary" outline onClick={downloadTemplate} className="mb-2">
									<Download size={16} className="mr-1" />
									Download Template
								</Button>
							</Col>
						</Row>

						<Row>
							<Col sm="12">
								<Card>
									<CardBody>
										<DragDrop uppy={uppy} />
									</CardBody>
								</Card>
							</Col>
						</Row>
					</Fragment>
				)}

				{step === 2 && (
					<Fragment>
						<Row className="mb-2">
							<Col sm="8">
								<h5>Preview: {fileName}</h5>
								<div className="d-flex align-items-center mb-2">
									<Badge color="success" className="mr-1">
										{validProducts.length} Valid
									</Badge>
									<Badge color="danger">{validationErrors.length} Errors</Badge>
								</div>
							</Col>
							<Col sm="4" className="text-right">
								<Button color="secondary" outline onClick={() => setStep(1)} className="mr-1">
									Back
								</Button>
								<Button color="primary" onClick={handleUpload} disabled={validProducts.length === 0 || isUploading}>
									{isUploading ? <Spinner size="sm" className="mr-1" /> : <Upload size={16} className="mr-1" />}
									Upload {validProducts.length} Products
								</Button>
							</Col>
						</Row>

						{isUploading && (
							<Row className="mb-2">
								<Col sm="12">
									<div className="text-center mb-1">Uploading products...</div>
									<Progress value={uploadProgress} />
								</Col>
							</Row>
						)}

						{validationErrors.length > 0 && (
							<Row className="mb-2">
								<Col sm="12">
									<Alert color="warning">
										<AlertCircle size={16} className="mr-1" />
										<strong>Validation Errors Found:</strong>
										<ul className="mb-0 mt-1">
											{validationErrors.slice(0, 5).map((error, index) => (
												<li key={index}>
													Row {error.row}: {error.errors.join(', ')}
												</li>
											))}
											{validationErrors.length > 5 && <li>... and {validationErrors.length - 5} more errors</li>}
										</ul>
									</Alert>
								</Col>
							</Row>
						)}

						<Row>
							<Col sm="12">
								<Card>
									<CardHeader>
										<div className="d-flex justify-content-between align-items-center w-100">
											<CardTitle tag="h4">Data Preview</CardTitle>
											<div className="d-flex align-items-center">
												<Label for="search-input" className="mr-1">
													Search:
												</Label>
												<Input id="search-input" type="text" bsSize="sm" value={searchValue} onChange={handleSearch} style={{ width: '200px' }} />
											</div>
										</div>
									</CardHeader>
									<CardBody>
										<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
											<Table responsive striped>
												<thead>
													<tr>
														<th>#</th>
														{tableHeaders.map((header, index) => (
															<th key={index}>{header}</th>
														))}
														<th>Status</th>
													</tr>
												</thead>
												<tbody>
													{displayData.map((row, index) => {
														const hasError = validationErrors.some((err) => err.row === index + 1)
														return (
															<tr key={index} className={hasError ? 'table-danger' : 'table-success'}>
																<td>{index + 1}</td>
																{tableHeaders.map((header, colIndex) => (
																	<td key={colIndex}>{row[header]}</td>
																))}
																<td>{hasError ? <Badge color="danger">Error</Badge> : <Badge color="success">Valid</Badge>}</td>
															</tr>
														)
													})}
												</tbody>
											</Table>
										</div>
									</CardBody>
								</Card>
							</Col>
						</Row>
					</Fragment>
				)}

				{step === 3 && (
					<Row>
						<Col sm="12" className="text-center">
							<Avatar size="xl" color="success" icon={<CheckCircle size={24} />} className="mb-2" />
							<h4>Upload Complete!</h4>
							<p>Products have been successfully uploaded to your inventory.</p>
							<Button color="primary" onClick={handleClose}>
								Close
							</Button>
						</Col>
					</Row>
				)}
			</ModalBody>
		</Modal>
	)
}

export default CSVUploadModal
