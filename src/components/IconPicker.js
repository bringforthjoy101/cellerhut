// ** React Imports
import { useState, useMemo } from 'react'

// ** Third Party Components
import { Grid, Package, ShoppingBag, Coffee, Gift, Star } from 'react-feather'
import { Modal, ModalHeader, ModalBody, Button, Input, Row, Col, Badge } from 'reactstrap'

// ** Available category icons from shop frontend
// These match the icon names in /shop/src/components/icons/category/
const AVAILABLE_ICONS = [
	'Alcohol',
	'Bar',
	'BeerBottle',
	'BeerGlass',
	'BeerKeg',
	'BeerMug',
	'Beverage',
	'Brandy',
	'ChampagneBottle',
	'ChampagneCelebration',
	'ChampagneGlass',
	'Chips',
	'CocktailShaker',
	'Cognac',
	'Console',
	'Drink',
	'Glasses',
	'HotDrink',
	'Juggling',
	'TequilaBottle',
	'TequilaGlass',
	'TequilaShot',
	'WhiskeyBottle',
	'WhiskeyGlass',
	'WineAward',
	'WineBarrel',
	'WineBottle',
	'WineGlass',
]

// ** Icon display component - shows a placeholder icon with the name
const IconDisplay = ({ name, selected, onClick }) => {
	// Simple icon mapping for visual representation using react-feather
	const getPlaceholderIcon = (iconName) => {
		const lowerName = iconName.toLowerCase()
		if (lowerName.includes('beverage') || lowerName.includes('drink')) {
			return <Coffee size={24} />
		} else if (lowerName.includes('snack') || lowerName.includes('food')) {
			return <Package size={24} />
		} else if (lowerName.includes('care') || lowerName.includes('beauty')) {
			return <Star size={24} />
		} else if (lowerName.includes('bag') || lowerName.includes('accessories')) {
			return <ShoppingBag size={24} />
		} else if (lowerName.includes('gift') || lowerName.includes('hot')) {
			return <Gift size={24} />
		} else {
			return <Grid size={24} />
		}
	}

	return (
		<div
			className={`icon-picker-item ${selected ? 'selected' : ''}`}
			onClick={onClick}
			style={{
				border: selected ? '2px solid #7367f0' : '1px solid #d8d6de',
				borderRadius: '8px',
				padding: '12px',
				textAlign: 'center',
				cursor: 'pointer',
				transition: 'all 0.2s',
				backgroundColor: selected ? '#f8f8ff' : 'white',
			}}
			onMouseEnter={(e) => {
				if (!selected) {
					e.currentTarget.style.borderColor = '#7367f0'
					e.currentTarget.style.backgroundColor = '#fafafa'
				}
			}}
			onMouseLeave={(e) => {
				if (!selected) {
					e.currentTarget.style.borderColor = '#d8d6de'
					e.currentTarget.style.backgroundColor = 'white'
				}
			}}
		>
			<div className="mb-1" style={{ color: selected ? '#7367f0' : '#6e6b7b' }}>
				{getPlaceholderIcon(name)}
			</div>
			<small
				style={{
					fontSize: '10px',
					color: selected ? '#7367f0' : '#6e6b7b',
					fontWeight: selected ? 'bold' : 'normal',
					wordBreak: 'break-word',
				}}
			>
				{name}
			</small>
		</div>
	)
}

/**
 * IconPicker Component
 * Allows users to select from available category icons
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected icon name
 * @param {function} props.onChange - Callback when icon is selected (receives icon name)
 * @param {boolean} props.disabled - Whether the picker is disabled
 */
const IconPicker = ({ value, onChange, disabled = false }) => {
	const [modalOpen, setModalOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')

	// Filter icons based on search term
	const filteredIcons = useMemo(() => {
		if (!searchTerm) return AVAILABLE_ICONS
		return AVAILABLE_ICONS.filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))
	}, [searchTerm])

	const handleIconSelect = (iconName) => {
		onChange(iconName)
		setModalOpen(false)
		setSearchTerm('')
	}

	const toggleModal = () => {
		if (!disabled) {
			setModalOpen(!modalOpen)
		}
	}

	return (
		<>
			{/* Trigger Button */}
			<div>
				<Button color="primary" outline onClick={toggleModal} disabled={disabled} block>
					<Grid size={16} className="mr-50" />
					{value || 'Select Icon'}
				</Button>
				{value && (
					<div className="mt-50">
						<Badge color="light-primary" pill>
							Selected: {value}
						</Badge>
					</div>
				)}
			</div>

			{/* Icon Selection Modal */}
			<Modal isOpen={modalOpen} toggle={toggleModal} className="modal-dialog-centered modal-lg">
				<ModalHeader toggle={toggleModal}>Select Category Icon</ModalHeader>
				<ModalBody>
					{/* Search Input */}
					<div className="mb-2">
						<Input
							type="text"
							placeholder="Search icons... (e.g., Beverage, Snacks, Beauty)"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>

					{/* Icons Count */}
					<div className="mb-1">
						<small className="text-muted">
							Showing {filteredIcons.length} of {AVAILABLE_ICONS.length} icons
						</small>
					</div>

					{/* Icons Grid */}
					<Row>
						{filteredIcons.map((icon) => (
							<Col key={icon} xs="4" sm="3" md="2" className="mb-1">
								<IconDisplay name={icon} selected={value === icon} onClick={() => handleIconSelect(icon)} />
							</Col>
						))}
					</Row>

					{/* No Results */}
					{filteredIcons.length === 0 && (
						<div className="text-center py-3">
							<p className="text-muted">No icons found matching "{searchTerm}"</p>
						</div>
					)}

					{/* Footer with default option */}
					<div className="mt-2 pt-2 border-top">
						<Button color="secondary" size="sm" outline onClick={() => handleIconSelect('Beverage')}>
							Use Default (Beverage)
						</Button>
						<Button color="secondary" size="sm" outline className="ml-1" onClick={() => handleIconSelect('')}>
							Clear Selection
						</Button>
					</div>
				</ModalBody>
			</Modal>
		</>
	)
}

export default IconPicker
