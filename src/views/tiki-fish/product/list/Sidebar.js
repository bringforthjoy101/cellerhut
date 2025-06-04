// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import { swal, apiRequest } from '@utils'
import { getAllData, getFilteredData } from '../store/action'

// ** Third Party Components
import { Button, FormGroup, Label, Spinner, CustomInput } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'

const SidebarNewUsers = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch()

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    qty: '',
    unit: '',
    unitValue: '',
    category: '',
    price: '',
    costPrice: '',
    packagingPrice: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ** Function to handle form submit
  const onSubmit = async (event, errors) => {
    setIsSubmitting(true)
    event.preventDefault()
    console.log({errors})
    if (errors) setIsSubmitting(false)
    if (errors && !errors.length) {
      console.log({productData})
      setIsSubmitting(true)
      const body = JSON.stringify(productData)
      try {
        const response = await apiRequest({url:'/products/create', method:'POST', body}, dispatch)
        console.log({response})
        if (response.data.status) {
            setIsSubmitting(false)
            swal('Great job!', response.data.message, 'success')
            dispatch(getAllData())
            setProductData({
              name: '',
              description: '',
              qty: '',
              unit: '',
              unitValue: '',
              category: '',
              price: '',
              costPrice: '',
              packagingPrice: ''
            })
            toggleSidebar()
        } else {
          setIsSubmitting(false)
          swal('Oops!', response.data.message, 'error')
          setProductData({
            name: '',
            description: '',
            qty: '',
            unit: '',
            unitValue: '',
            category: '',
            price: '',
            costPrice: '',
            packagingPrice: ''
          })
          toggleSidebar()
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error({error})
      }
    }
  }

    return (
      <Sidebar
        size='lg'
        open={open}
        title='New Product'
        headerClassName='mb-1'
        contentClassName='pt-0'
        toggleSidebar={toggleSidebar}
      >
        <AvForm onSubmit={onSubmit}>
          <FormGroup>
            <Label for='name'>Product Name</Label>
            <AvInput 
              name='name' 
              id='name' 
              placeholder='Product Name' 
              value={productData.name}
              onChange={e => setProductData({...productData, name: e.target.value})}
              required 
            />
          </FormGroup>
          <FormGroup>
            <Label for='qty'>Quantity</Label>
            <AvInput 
              name='qty' 
              id='qty' 
              placeholder='Quantity' 
              value={productData.qty}
              onChange={e => setProductData({...productData, qty: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='costPrice'>Product Cost Price</Label>
            <AvInput 
              type='number' 
              name='costPrice' 
              id='costPrice' 
              placeholder='Product Cost Price' 
              value={productData.costPrice}
              onChange={e => setProductData({...productData, costPrice: e.target.value})}
            />
          </FormGroup>
          {/* <FormGroup>
            <Label for='smokeHousePrice'>Smoke House Price</Label>
            <AvInput 
              type='number' 
              name='smokeHousePrice' 
              id='smokeHousePrice' 
              placeholder='Smoke House Price' 
              value={productData.smokeHousePrice}
              onChange={e => setProductData({...productData, smokeHousePrice: e.target.value})}
            />
          </FormGroup> */}
          <FormGroup>
            <Label for='packagingPrice'>Product Packaging Price</Label>
            <AvInput 
              type='number' 
              name='packagingPrice' 
              id='packagingPrice' 
              placeholder='Product Packagaing Price' 
              value={productData.packagingPrice}
              onChange={e => setProductData({...productData, packagingPrice: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='price'>Product Selling Price</Label>
            <AvInput 
              type='number' 
              name='price' 
              id='price' 
              placeholder='Product Price' 
              value={productData.price}
              onChange={e => setProductData({...productData, price: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='unit'>Product Unit</Label>
            <AvInput 
              type='select' 
              id='unit' 
              name='unit' 
              value={productData.unit}
              onChange={e => setProductData({...productData, unit: e.target.value})}
              required
            >
              <option value=''>Select Product Unit</option>
              <option value='wrap'>Wrap</option>
              <option value='kg'>Kilogram</option>
              <option value='pck'>Pack</option>
              <option value='pcs'>Pieces</option>
              <option value='l'>Litre</option>
              <option value='g'>Gram</option>
              <option value='crate'>Crate</option>
              <option value='carton'>Carton</option>
            </AvInput>
          </FormGroup>
          <FormGroup>
            <Label for='uniteValue'>Product Unit Value</Label>
            <AvInput 
              type='number' 
              name='unitValue' 
              id='unitValue' 
              placeholder='Product Unit Value' 
              value={productData.unitValue}
              onChange={e => setProductData({...productData, unitValue: e.target.value})}
            />
          </FormGroup>
          {/* <FormGroup>
            <Label for='category'>Product Category</Label>
            <AvInput 
              type='select' 
              id='category' 
              name='category' 
              value={productData.category}
              onChange={e => setProductData({...productData, category: e.target.value})}
              required
            >
              <option value=''>Select Product Category</option>
              <option value='shop'>Shop</option>
              <option value='store'>Store</option>
            </AvInput>
          </FormGroup> */}
          <FormGroup>
            <Label for='description'>Product Description</Label>
            <AvInput 
              type='textarea'
              name='description' 
              id='description' 
              placeholder='Product Description' 
              value={productData.description}
              onChange={e => setProductData({...productData, description: e.target.value})}
            />
          </FormGroup>
          <Button type='submit' className='mr-1' color='primary' disabled={isSubmitting}>
            {isSubmitting && <Spinner color='white' size='sm' />}
            <span className='ml-50'>Submit</span>
          </Button>
          <Button type='reset' color='secondary' outline onClick={toggleSidebar}>
            Cancel
          </Button>
        </AvForm>
      </Sidebar>
    )
}


export default SidebarNewUsers
