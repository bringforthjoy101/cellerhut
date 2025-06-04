// ** React Imports
import { Link } from 'react-router-dom'

// ** Third Party Components
import classnames from 'classnames'
import { Star, ShoppingCart, Heart } from 'react-feather'
import { Card, CardBody, CardText, Button, Badge } from 'reactstrap'

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
              {/* <div className='item-img text-center mx-auto'>
                <Link to={`/apps/ecommerce/product-detail/${item.id}`}>
                  <img className='img-fluid card-img-top' src={item.image} alt={item.name} />
                </Link>
              </div> */}
              <CardBody>
                <div className='item-wrapper'>
                  <div className='item-rating'>
                  <h6 className='item-name'>
                    {/* <Link className='text-body' to={`/apps/ecommerce/product-detail/${item.id}`}> */}
                      {item.name} ({item.unitValue}{item.unit})
                    {/* </Link> */}
                  </h6>
                  </div>
                  <div className='item-cost'>
                    <h6 className='item-price'>{item.price.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</h6>
                  </div>
                </div>
                {/* <h6 className='item-name'>
                  <Link className='text-body' to={`/apps/ecommerce/product-detail/${item.id}`}>
                    {item.name}
                  </Link>
                </h6> */}
                <CardText className='item-description d-flex flex-row'>
                  <span className='mr-auto'>{(Number(itemQty) * Number(item.price)).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
                  <Badge className='ml-auto' color={itemQty > 5 ? 'light-success' : 'light-danger'}>{itemQty} {itemQty > 5 ? 'Available' : 'Left'}</Badge>
                </CardText>
              </CardBody>
              <div className='item-options text-center'>
                {/* <div className='item-wrapper'>
                  <div className='item-cost'>
                    <h4 className='item-price'>R{item.price.toLocaleString()}</h4>
                    {item.hasFreeShipping ? (
                      <CardText className='shipping'>
                        <Badge color='light-success'>Free Shipping</Badge>
                      </CardText>
                    ) : null}
                  </div>
                </div> */}
                {/* <Button
                  className='btn-wishlist'
                  color='light'
                  onClick={() => handleWishlistClick(item.id, item.isInWishlist)}
                >
                  <Heart
                    className={classnames('mr-50', {
                      'text-danger': item.isInWishlist
                    })}
                    size={14}
                  />
                  <span>Wishlist</span>
                </Button> */}
                <Button
                  color='primary'
                  tag={CartBtnTag}
                  className='btn-cart move-cart'
                  onClick={() => handleCartBtn(item.id, item.isInCart)}
                  /*eslint-disable */
                  {...(item.isInCart
                    ? {
                        to: '/apps/ecommerce/checkout'
                      }
                    : {})}
                  /*eslint-enable */
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
    <div
      className={classnames({
        'grid-view': activeView === 'grid',
        'list-view': activeView === 'list'
      })}
    >
      {renderProducts()}
    </div>
  )
}

export default ProductCards
