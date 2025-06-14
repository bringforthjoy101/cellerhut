// ** React Imports
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ** Third Party Components
import classnames from 'classnames'
import { Star, ShoppingCart, Heart } from 'react-feather'
import { Card, CardBody, CardText, Button, Badge } from 'reactstrap'

// ** Custom Hooks
import { useScanner } from '../../../../hooks/useScanner'

const ProductCards = props => {
  // ** Props
  const {
    store,
    products,
    activeView,
    addToCart,
    dispatch,
    getProducts,
    getCartItems,
    addToWishlist,
    deleteWishlistItem
  } = props

  // Initialize scanner
  const { isConnected } = useScanner(products)

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
      return products.map(item => {
        const CartBtnTag = item.isInCart ? Link : 'button'
        const itemQty = store.stable.find(p => p.id === item.id).qty
        return (
          <Card className='ecommerce-card' key={item.id}>
            <div className='item-img text-center mx-auto'>
              <Link to={`#`}>
                <img className='img-fluid card-img-top' src={item.image ? item.image : `${process.env.REACT_APP_IMAGE_PLACEHOLDER}/placeholder.png`} alt={item.name} />
              </Link>
            </div>
            <CardBody>
              <div className='item-wrapper'>
                <div className='item-rating'>
                  <h6 className='item-name'>
                    {item.name} ({item.unitValue}{item.unit})
                  </h6>
                </div>
                <div className='item-cost'>
                  <h6 className='item-price'>{item.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                </div>
              </div>
              <CardText className='item-description d-flex flex-row'>
                <span className='mr-auto'>{(Number(itemQty) * Number(item.price)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
                <Badge className='ml-auto' color={itemQty > 5 ? 'light-success' : 'light-danger'}>{itemQty} {itemQty > 5 ? 'Available' : 'Left'}</Badge>
              </CardText>
            </CardBody>
            <div className='item-options text-center'>
              <Button
                color='primary'
                tag={CartBtnTag}
                className='btn-cart move-cart'
                onClick={() => handleCartBtn(item.id, item.isInCart)}
                {...(item.isInCart ? { to: '/apps/ecommerce/checkout'} : {})}
              >
                <ShoppingCart className='mr-50' size={14} />
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
      {isConnected && (
        <div className='scanner-status mb-1'>
          <Badge color='success'>Scanner Connected</Badge>
        </div>
      )}
      <div
        className={classnames({
          'grid-view': activeView === 'grid',
          'list-view': activeView === 'list'
        })}
      >
        {renderProducts()}
      </div>
    </>
  )
}

export default ProductCards
