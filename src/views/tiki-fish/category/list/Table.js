// ** React Imports
import { Fragment, useState, useEffect } from 'react'

// ** Third Party Components
import { Edit, Trash2, Plus } from 'react-feather'
import DataTable from 'react-data-table-component'
import {
	Card,
	CardHeader,
	CardTitle,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Label,
	Input,
	Badge,
	Spinner,
	Alert,
} from 'reactstrap'

// ** Custom Components
import IconPicker from '../../../../components/IconPicker'

// ** Utils
import { swal, apiRequest } from '@utils'

// ** Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'

const CategoryTable = () => {
	// ** State
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(false)
	const [modal, setModal] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const [formData, setFormData] = useState({
		id: null,
		name: '',
		slug: '',
		description: '',
		icon: 'Beverage',
		parent_id: null,
	})

	// ** Fetch Categories
	const fetchCategories = async () => {
		setLoading(true)
		try {
			const response = await apiRequest({ url: '/categories', method: 'GET' })
			if (response && response.data && response.data.status) {
				setCategories(response.data.data)
			} else {
				console.error('Failed to fetch categories:', response?.data?.message)
				swal('Error!', response?.data?.message || 'Failed to fetch categories', 'error')
			}
		} catch (error) {
			console.error('Error fetching categories:', error)
			swal('Error!', 'Failed to fetch categories', 'error')
		} finally {
			setLoading(false)
		}
	}

	// ** Load categories on mount
	useEffect(() => {
		fetchCategories()
	}, [])

	// ** Reset Form
	const resetForm = () => {
		setFormData({
			id: null,
			name: '',
			slug: '',
			description: '',
			icon: 'Beverage',
			parent_id: null,
		})
		setEditMode(false)
	}

	// ** Toggle Modal
	const toggleModal = () => {
		setModal(!modal)
		if (modal) {
			resetForm()
		}
	}

	// ** Handle Create
	const handleCreate = () => {
		resetForm()
		setEditMode(false)
		setModal(true)
	}

	// ** Handle Edit
	const handleEdit = (category) => {
		setFormData({
			id: category.id,
			name: category.name,
			slug: category.slug,
			description: category.description || '',
			icon: category.icon || 'Beverage',
			parent_id: category.parent_id || null,
		})
		setEditMode(true)
		setModal(true)
	}

	// ** Handle Delete
	const handleDelete = async (id) => {
		const result = await swal({
			title: 'Are you sure?',
			text: 'You will not be able to recover this category!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'No, keep it',
		})

		if (result.isConfirmed) {
			try {
				const response = await apiRequest({ url: `/categories/${id}`, method: 'DELETE' })
				if (response && response.data && response.data.status) {
					swal('Deleted!', 'Category has been deleted.', 'success')
					fetchCategories()
				} else {
					swal('Error!', response?.data?.message || 'Failed to delete category', 'error')
				}
			} catch (error) {
				console.error('Error deleting category:', error)
				swal('Error!', 'Failed to delete category', 'error')
			}
		}
	}

	// ** Handle Submit
	const handleSubmit = async (e) => {
		e.preventDefault()

		// Generate slug from name if not provided
		const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')

		const payload = {
			...formData,
			slug,
		}

		try {
			let response
			if (editMode) {
				response = await apiRequest({
					url: `/categories/${formData.id}`,
					method: 'PATCH',
					body: JSON.stringify(payload),
				})
			} else {
				response = await apiRequest({
					url: '/categories',
					method: 'POST',
					body: JSON.stringify(payload),
				})
			}

			if (response && response.data && response.data.status) {
				swal(
					'Success!',
					editMode ? 'Category updated successfully' : 'Category created successfully',
					'success'
				)
				toggleModal()
				fetchCategories()
			} else {
				swal('Error!', response?.data?.message || 'Failed to save category', 'error')
			}
		} catch (error) {
			console.error('Error saving category:', error)
			swal('Error!', 'Failed to save category', 'error')
		}
	}

	// ** Table Columns
	const columns = [
		{
			name: 'Name',
			selector: 'name',
			sortable: true,
			minWidth: '200px',
			cell: (row) => (
				<div className="d-flex align-items-center">
					<span className="font-weight-bold">{row.name}</span>
				</div>
			),
		},
		{
			name: 'Icon',
			selector: 'icon',
			sortable: true,
			minWidth: '120px',
			cell: (row) => (
				<Badge color="light-primary" pill>
					{row.icon || 'Beverage'}
				</Badge>
			),
		},
		{
			name: 'Slug',
			selector: 'slug',
			sortable: true,
			minWidth: '150px',
			cell: (row) => <span className="text-muted">{row.slug}</span>,
		},
		{
			name: 'Description',
			selector: 'description',
			sortable: false,
			minWidth: '250px',
			cell: (row) => (
				<span className="text-truncate" title={row.description}>
					{row.description || '-'}
				</span>
			),
		},
		{
			name: 'Actions',
			allowOverflow: true,
			cell: (row) => (
				<div className="d-flex">
					<Button
						color="primary"
						size="sm"
						className="mr-50"
						onClick={() => handleEdit(row)}
					>
						<Edit size={14} />
					</Button>
					<Button color="danger" size="sm" onClick={() => handleDelete(row.id)}>
						<Trash2 size={14} />
					</Button>
				</div>
			),
		},
	]

	return (
		<Fragment>
			<Card>
				<CardHeader className="border-bottom">
					<CardTitle tag="h4">Category Management</CardTitle>
					<Button color="primary" onClick={handleCreate}>
						<Plus size={14} className="mr-50" />
						Add Category
					</Button>
				</CardHeader>
				<DataTable
					noHeader
					pagination
					columns={columns}
					paginationPerPage={10}
					className="react-dataTable"
					sortIcon={<span>&darr;</span>}
					paginationRowsPerPageOptions={[10, 25, 50, 100]}
					data={categories}
					progressPending={loading}
					progressComponent={<Spinner color="primary" />}
				/>
			</Card>

			{/* Create/Edit Modal */}
			<Modal isOpen={modal} toggle={toggleModal} className="modal-dialog-centered">
				<ModalHeader toggle={toggleModal}>
					{editMode ? 'Edit Category' : 'Create Category'}
				</ModalHeader>
				<Form onSubmit={handleSubmit}>
					<ModalBody>
						<FormGroup>
							<Label for="name">
								Category Name <span className="text-danger">*</span>
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Enter category name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</FormGroup>

						<FormGroup>
							<Label for="slug">Category Slug</Label>
							<Input
								id="slug"
								type="text"
								placeholder="auto-generated-from-name"
								value={formData.slug}
								onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
							/>
							<small className="text-muted">
								Leave empty to auto-generate from name
							</small>
						</FormGroup>

						<FormGroup>
							<Label for="description">Description</Label>
							<Input
								id="description"
								type="textarea"
								rows="3"
								placeholder="Enter category description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup>
							<Label>Category Icon</Label>
							<IconPicker
								value={formData.icon}
								onChange={(icon) => setFormData({ ...formData, icon })}
							/>
						</FormGroup>

						<FormGroup>
							<Label for="parent_id">Parent Category</Label>
							<Input
								id="parent_id"
								type="select"
								value={formData.parent_id || ''}
								onChange={(e) =>
									setFormData({
										...formData,
										parent_id: e.target.value || null,
									})
								}
							>
								<option value="">None (Top Level)</option>
								{categories
									.filter((cat) => cat.id !== formData.id)
									.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
							</Input>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={toggleModal}>
							Cancel
						</Button>
						<Button color="primary" type="submit">
							{editMode ? 'Update' : 'Create'}
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</Fragment>
	)
}

export default CategoryTable
