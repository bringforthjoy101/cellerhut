// ** React Imports
import { Link } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ** Third Party Components
import classnames from 'classnames'
import { Star, ShoppingCart, Heart, CheckCircle, AlertCircle, Camera } from 'react-feather'
import { Card, CardBody, CardText, Button, Badge, Spinner } from 'reactstrap'

// ** Custom Hooks and Contexts
import { useScannerHandler, useScannerContext } from '../../../../contexts/ScannerContext'

const ProductCards = (props) => {
	// ** Props
	const { store, products, activeView, addToCart, dispatch, getProducts, getCartItems, addToWishlist, deleteWishlistItem } = props

	// Handle barcode scanning for cart operations
	const handleBarcodeScanned = useCallback(
		(barcode, serviceName, scannerType) => {
			console.log(`🛒 ProductCards: Barcode scanned ${barcode} from ${serviceName}`)
			
			// Find product by barcode
			const product = products.find((p) => p.barcode === barcode)

			if (product) {
				// Add product to cart
				dispatch(addToCart(product.id))
				dispatch(getCartItems())
				dispatch(getProducts(store.params))
				console.log('✅ ProductCards: Product added to cart via barcode scanning')
			} else {
				console.warn(`❌ ProductCards: Product with barcode ${barcode} not found`)
			}
		},
		[dispatch, products, addToCart, getCartItems, getProducts, store.params]
	)

	// Register as medium-priority scanner handler for product cards
	useScannerHandler('product-cards', handleBarcodeScanned, 5, true)

	// Get scanner status from context
	const {
		isInitialized,
		isInitializing,
		isConnected,
		isScanning,
		activeScanners,
		bestScanner,
		scannerCount,
		statusSummary,
		statusLevel,
		recommendations,
		lastError,
		canRetry,
		startScanning,
		stopScanning,
		retryInitialization,
		activeHandlerId
	} = useScannerContext()

	// ** Handle Move/Add to cart
	const handleCartBtn = (id, val) => {
		if (val === false) {
			dispatch(addToCart(id))
		}
		dispatch(getCartItems())
		dispatch(getProducts(store.params))
	}

	// ** Handle Wishlist item toggle
	const handleWishlistClick = (id, val) => {
		if (val) {
			dispatch(deleteWishlistItem(id))
		} else {
			dispatch(addToWishlist(id))
		}
		dispatch(getProducts(store.params))
	}

	// ** Renders products
	const renderProducts = () => {
		if (products.length) {
			return products.map((item) => {
				const CartBtnTag = item.isInCart ? Link : 'button'
				const itemQty = store.stable.find((p) => p.id === item.id).qty
				return (
					<Card className="ecommerce-card" key={item.id}>
						<div className="item-img text-center mx-auto">
							<Link to={`#`}>
								<img
									className="img-fluid card-img-top"
									src={item.image ? item.image : `${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`}
									alt={item.name}
								/>
							</Link>
						</div>
						<CardBody>
							<div className="item-wrapper">
								<div className="item-rating">
									<h6 className="item-name">
										{item.name} ({item.unitValue}
										{item.unit})
									</h6>
								</div>
								<div className="item-cost">
									<h6 className="item-price">{Number(item.price).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
								</div>
							</div>
							<CardText className="item-description d-flex flex-row">
								<span className="mr-auto">
									{(Number(itemQty) * Number(item.price)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
								</span>
								<Badge className="ml-auto" color={itemQty > 5 ? 'light-success' : 'light-danger'}>
									{itemQty} {itemQty > 5 ? 'Available' : 'Left'}
								</Badge>
							</CardText>
						</CardBody>
						<div className="item-options text-center">
							<Button
								color="primary"
								tag={CartBtnTag}
								className="btn-cart move-cart"
								onClick={() => handleCartBtn(item.id, item.isInCart)}
								{...(item.isInCart ? { to: '/apps/ecommerce/checkout' } : {})}
							>
								<ShoppingCart className="mr-50" size={14} />
								<span>{item.isInCart ? 'View In Cart' : 'Add To Cart'}</span>
							</Button>
						</div>
					</Card>
				)
			})
		}
	}

	return (
		<>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
			{/* Enhanced Scanner Status Display */}
			<div className="scanner-status mb-2">
				<div className="d-flex align-items-center flex-wrap">
					{isInitializing && (
						<Badge color="info" className="mr-2 mb-1">
							<Spinner size="sm" className="mr-1" />
							Initializing...
						</Badge>
					)}
					{isConnected && !isInitializing && (
						<Badge color="success" className="mr-2 mb-1">
							<CheckCircle size={12} className="mr-1" />
							{scannerCount > 1 ? `${scannerCount} Scanners Ready` : 'Scanner Ready'}
						</Badge>
					)}
					{!isConnected && !isInitializing && (
						<Badge color="secondary" className="mr-2 mb-1">
							<AlertCircle size={12} className="mr-1" />
							No Scanners
						</Badge>
					)}
					{isScanning && (
						<Badge color="warning" className="mr-2 mb-1">
							<Camera size={12} className="mr-1" />
							Scanning Active
						</Badge>
					)}
					{bestScanner && isConnected && !isInitializing && (
						<Badge color="light-info" className="mr-2 mb-1">
							Using:{' '}
							{bestScanner === 'socketMobile'
								? 'Socket Mobile'
								: bestScanner === 'keyboardWedge'
								? 'USB Scanner'
								: bestScanner === 'browserAPI'
								? 'Camera'
								: bestScanner}
						</Badge>
					)}
				</div>
				{statusSummary && <small className="text-muted d-block mt-1">{statusSummary}</small>}
			</div>
			<div
				className={classnames({
					'grid-view': activeView === 'grid',
					'list-view': activeView === 'list',
				})}
			>
				{renderProducts()}
			</div>
		</>
	)
}

export default ProductCards
