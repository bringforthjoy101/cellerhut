// ** React Imports
import { Link } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import moment from 'moment'
import { getAllData, deleteProduct } from '../store/action'
import { store } from '@store/storeConfig/store'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// ** Third Party Components
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap'
import { MoreVertical, FileText, Trash2, Archive, Package, Link as LinkIcon, Tag } from 'react-feather'
import { exportSingleLabel } from '@src/utility/labelUtils'
import { toast } from 'react-toastify'

// ** Third Party Components

// ** Renders Client Columns
const renderClient = (row) => {
	const stateNum = Math.floor(Math.random() * 6),
		states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
		color = states[stateNum]

	if (row.image) {
		return (
			<Avatar
				className="mr-1"
				img={`${row.image ? row.image : `${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`}`}
				width="32"
				height="32"
			/>
		)
	} else {
		return <Avatar color={color || 'primary'} className="mr-1" content={`${row.name}` || 'Sample Product'} initials />
	}
}

const handleDelete = async (id) => {
	// const dispatch = useDispatch()
	return MySwal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes, delete it!',
		customClass: {
			confirmButton: 'btn btn-primary',
			cancelButton: 'btn btn-outline-danger ml-1',
		},
		buttonsStyling: false,
	}).then(async function (result) {
		if (result.value) {
			const deleted = await store.dispatch(deleteProduct(id))
			// console.log({deleted})
			if (deleted.status) {
				await store.dispatch(getAllData())
				MySwal.fire({
					icon: 'success',
					title: 'Deleted!',
					text: 'Product has been deleted.',
					customClass: {
						confirmButton: 'btn btn-primary',
					},
				})
			}
		}
	})
}

const handlePrintLabel = (product) => {
	const result = exportSingleLabel(product)
	if (result.success) {
		toast.success('Label generated successfully')
	} else {
		toast.error(result.error || 'Failed to generate label')
	}
}

export const columns = [
	{
		name: 'Product Name',
		selector: 'id',
		minWidth: '280px',
		wrap: true,
		sortable: true,
		cell: (row) => (
			<div className="d-flex justify-content-left align-items-center">
				{renderClient(row)}
				<div className="d-flex flex-column">
					<div className="d-flex align-items-center">
						<Link to={`/product/view/${row.id}`} className="user-name text-truncate mb-0 mr-1">
							<span className="font-weight-bold">
								{row.name.slice(0, 18).trim()}
								{row.name.length > 18 ? '...' : ''}
							</span>
						</Link>
						{row.product_type === 'composite' && (
							<Badge color="light-info" className="badge-sm">
								<Package size={10} className="mr-25" />
								Composite
							</Badge>
						)}
						{row.CompositeProducts && row.CompositeProducts.length > 0 && (
							<Badge color="light-warning" className="badge-sm ml-25">
								<LinkIcon size={10} className="mr-25" />
								{row.CompositeProducts.length} variants
							</Badge>
						)}
					</div>
					{row.product_type === 'composite' && row.BaseProduct && (
						<small className="text-muted">
							Based on: {row.BaseProduct.name}
						</small>
					)}
				</div>
			</div>
		),
	},
	{
		name: 'Type',
		selector: 'product_type',
		minWidth: '100px',
		sortable: true,
		cell: (row) => (
			<div className="d-flex align-items-center">
				{row.product_type === 'composite' ? (
					<Badge color="light-primary" className="badge-sm">
						<Package size={12} className="mr-25" />
						Composite
					</Badge>
				) : (
					<Badge color="light-secondary" className="badge-sm">
						Simple
					</Badge>
				)}
			</div>
		),
	},
	{
		name: 'Price',
		selector: 'price',
		minWidth: '200px',
		wrap: true,
		sortable: true,
		cell: (row) => {
			const currentPrice = Number(row.price) || 0
			
			if (row.product_type === 'composite' && row.BaseProduct && row.discount_percentage > 0) {
				const basePrice = Number(row.BaseProduct.price) || 0
				const compositeQuantity = Number(row.composite_quantity) || 1
				const originalPrice = basePrice * compositeQuantity
				
				return (
					<div className="d-flex flex-column">
						<span className="font-weight-bold text-success">
							{currentPrice.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
						</span>
						<small className="text-muted">
							<s>{originalPrice.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</s>
							<span className="text-success ml-25">({row.discount_percentage}% off)</span>
						</small>
					</div>
				)
			}
			
			return (
				<span>{currentPrice.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
			)
		},
	},
	{
		name: 'Composite Info',
		selector: 'composite_quantity',
		minWidth: '150px',
		wrap: true,
		cell: (row) => {
			if (row.product_type === 'composite') {
				return (
					<div className="d-flex flex-column">
						<small className="text-primary font-weight-bold">
							{row.composite_quantity}x units per pack
						</small>
						{row.discount_percentage > 0 && (
							<small className="text-success">
								{row.discount_percentage}% discount
							</small>
						)}
					</div>
				)
			} else if (row.CompositeProducts && row.CompositeProducts.length > 0) {
				return (
					<div className="d-flex flex-column">
						<small className="text-warning font-weight-bold">
							{row.CompositeProducts.length} composite variant{row.CompositeProducts.length > 1 ? 's' : ''}
						</small>
						<small className="text-muted">
							{row.CompositeProducts.map(comp => `${comp.composite_quantity}x`).join(', ')}
						</small>
					</div>
				)
			}
			return <span className="text-muted">-</span>
		},
	},
	{
		name: 'Qty',
		selector: 'qty',
		minWidth: '120px',
		sortable: true,
		cell: (row) => {
			const storedQty = Number(row.qty)
			
			if (row.product_type === 'composite' && row.BaseProduct) {
				const baseQty = Number(row.BaseProduct.qty) || 0
				const compositeQuantity = Number(row.composite_quantity) || 1
				const baseAvailable = Math.floor(baseQty / compositeQuantity)
				const actualAvailable = Math.min(baseAvailable, storedQty)
				
				return (
					<div className="d-flex flex-column">
						<span className={`font-weight-bold ${actualAvailable < storedQty ? 'text-warning' : 'text-success'}`}>
							{actualAvailable.toLocaleString()}
						</span>
						{actualAvailable !== storedQty && (
							<small className="text-muted">
								(stored: {storedQty.toLocaleString()})
							</small>
						)}
						{baseAvailable < storedQty && (
							<small className="text-warning">
								Limited by base
							</small>
						)}
					</div>
				)
			}
			
			// For simple products or base products with composite variants
			if (row.product_type === 'simple' && row.CompositeProducts && row.CompositeProducts.length > 0) {
				// Calculate how much is reserved for composite products
				let reservedQty = 0
				row.CompositeProducts.forEach(comp => {
					reservedQty += Number(comp.qty) * Number(comp.composite_quantity)
				})
				
				const availableForSingle = storedQty - reservedQty
				
				if (reservedQty > 0) {
					return (
						<div className="d-flex flex-column">
							<span className="font-weight-bold">{storedQty.toLocaleString()}</span>
							<small className="text-info">
								Free: {Math.max(0, availableForSingle).toLocaleString()}
							</small>
						</div>
					)
				}
			}
			
			return <span className="text-capitalize">{storedQty.toLocaleString()}</span>
		},
	},
	{
		name: 'Unit',
		selector: 'unit',
		sortable: true,
		cell: (row) => (
			<span className="text-capitalize">
				{row.unitValue} {row.unit}
			</span>
		),
	},
	{
		name: 'Category',
		selector: 'category',
		sortable: true,
		cell: (row) => <span className="text-capitalize">{row.category.name}</span>,
	},
	{
		name: 'Created Date',
		selector: 'createdAt',
		sortable: true,
		minWidth: '200px',
		wrap: true,
		cell: (row) => moment(row.createdAt).format('lll'),
	},
	{
		name: 'Actions',
		selector: 'name',
		sortable: true,
		cell: (row) => (
			<UncontrolledDropdown>
				<DropdownToggle tag="div" className="btn btn-sm">
					<MoreVertical size={14} className="cursor-pointer" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem tag={Link} to={`/product/view/${row.id}`} className="w-100">
						<FileText size={14} className="mr-50" />
						<span className="align-middle">Details</span>
					</DropdownItem>
					<DropdownItem
						tag={Link}
						to={`/product/edit/${row.id}`}
						className="w-100"
						// onClick={() => store.dispatch(getUser(row.id))}
					>
						<Archive size={14} className="mr-50" />
						<span className="align-middle">Edit</span>
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem className="w-100" onClick={() => handlePrintLabel(row)}>
						<Tag size={14} className="mr-50" />
						<span className="align-middle">Print Label</span>
					</DropdownItem>
					<DropdownItem className="w-100" onClick={() => handleDelete(row.id)}>
						<Trash2 size={14} className="mr-50" />
						<span className="align-middle">Delete</span>
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
		),
	},
]
