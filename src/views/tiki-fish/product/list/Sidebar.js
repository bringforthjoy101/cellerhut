// ** Custom Components
import Sidebar from '@components/sidebar'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Uppy from '@uppy/core'
import thumbnailGenerator from '@uppy/thumbnail-generator'
import { DragDrop } from '@uppy/react'
// import FileUploaderBasic from '@views/forms/form-elements/file-uploader/FileUploaderBasic'

import { swal, apiUrl, Storage, apiRequest } from '@utils'
import { getAllData, getFilteredData, getCategories } from '../store/action'
import { useProductScanner } from '../../../../hooks/useProductScanner'

// ** Third Party Components
import { Button, FormGroup, Label, Spinner, CustomInput, Card, CardBody, InputGroup, InputGroupAddon } from 'reactstrap'
import { AvForm, AvInput } from 'availity-reactstrap-validation-safe'
import { Camera, X, RefreshCw } from 'react-feather'

const SidebarNewUsers = ({ open, toggleSidebar }) => {
  const dispatch = useDispatch()
  const { categories, categoriesLoading, categoriesError } = useSelector(state => state.products)

  const [uppy] = useState(() => new Uppy({
    meta: { type: 'product-image' },
    restrictions: { maxNumberOfFiles: 1 },
    autoProceed: true
  }))

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    qty: '',
    unit: '',
    unitValue: '',
    category: '',
    price: '',
    costPrice: '',
    packagingPrice: '',
    barcode: '',
    image: '',
    sku: '',
    alcohol_content: '',
    volume: '',
    origin: '',
    vintage: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle barcode scanning
  const handleBarcodeScanned = (barcode) => {
    setProductData(prev => ({...prev, barcode}))
  }

  // Initialize scanner hook
  const { isConnected, isScanning, startScanning } = useProductScanner(handleBarcodeScanned)
  
  const uploadImage = async (file) => {
    console.log('Uploading file:', file)
    const formData = new FormData()
    formData.append('image', file)
    
    const userData = Storage.getItem('userData')
    const { accessToken } = userData

    try {
      const response = await fetch(`${apiUrl}/upload-images`, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
          // Don't set Content-Type, let the browser set it with the boundary
        },
        body: formData
      })

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (data.status) {
        const imageUrl = data.data.url
        setProductData(prev => ({...prev, image: imageUrl}))
        return imageUrl
      } else {
        swal('Oops!', data.message || 'Failed to upload image', 'error')
        return null
      }
    } catch (error) {
      console.error('Upload error details:', error)
      swal('Error!', 'Failed to upload image. Please try again.', 'error')
      return null
    }
  }

  // Fetch categories on component mount
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      dispatch(getCategories())
    }
  }, [dispatch, categories.length, categoriesLoading])

  useEffect(() => {
    uppy.use(thumbnailGenerator)
    
    uppy.on('thumbnail:generated', async (file, preview) => {
      console.log('Uppy file object:', file)
      setProductData(prev => ({...prev, imagePreview: preview}))
      
      // Get the actual file from Uppy
      const fileToUpload = uppy.getFile(file.id)
      console.log('File to upload:', fileToUpload)
      
      if (fileToUpload && fileToUpload.data) {
        // Create a new File object with the correct name
        const uploadFile = new File([fileToUpload.data], fileToUpload.name, {
          type: fileToUpload.type || 'image/jpeg'
        })
        const imageUrl = await uploadImage(uploadFile)
        if (imageUrl) {
          setProductData(prev => ({...prev, image: imageUrl}))
        }
      } else {
        console.error('No file data found in Uppy file object')
        swal('Error!', 'Failed to get file data for upload', 'error')
      }
    })

    // Add file upload success and error handlers
    uppy.on('upload-success', (file, response) => {
      console.log('Upload success:', file, response)
    })

    uppy.on('upload-error', (file, error, response) => {
      console.error('Upload error:', file, error, response)
      swal('Error!', 'Failed to upload image', 'error')
    })

    return () => uppy.close()
  }, [])

  // ** Function to remove uploaded image
  const removeImage = () => {
    setProductData(prev => ({
      ...prev, 
      image: '',
      imagePreview: ''
    }))
    // Clear all files from Uppy
    uppy.getFiles().forEach(file => {
      uppy.removeFile(file.id)
    })
  }

  // ** Function to replace image (same as remove, user can upload new one)
  const replaceImage = () => {
    removeImage()
    // Force a small delay to ensure state is updated before showing drag-drop again
    setTimeout(() => {
      // Trigger a re-render by focusing on the component
    }, 100)
  }

  // ** Function to handle form submit
  const onSubmit = async (event, errors) => {
    setIsSubmitting(true)
    event.preventDefault()
    if (errors) setIsSubmitting(false)
    if (errors && !errors.length) {
      try {
        const productPayload = {
          ...productData
        }
        delete productPayload.imagePreview // Remove the preview URL as it's not needed in the API

        const body = JSON.stringify(productPayload)
        const response = await apiRequest({
          url: '/products/create',
          method: 'POST',
          body
        }, dispatch)

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
            packagingPrice: '',
            barcode: '',
            image: '',
            imagePreview: '',
            sku: '',
            alcohol_content: '',
            volume: '',
            origin: '',
            vintage: ''
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
            packagingPrice: '',
            barcode: '',
            image: '',
            imagePreview: '',
            sku: '',
            alcohol_content: '',
            volume: '',
            origin: '',
            vintage: ''
          })
          toggleSidebar()
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error({error})
        swal('Error!', 'Failed to process the request. Please try again.', 'error')
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
              <option value='bottle'>Bottle</option>
              <option value='case'>Case</option>
              <option value='box'>Box</option>
              <option value='can'>Can</option>
              <option value='dozen'>Dozen</option>
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
          <FormGroup>
            <Label for='categoryId'>Product Category</Label>
            <AvInput 
              type='select' 
              id='categoryId' 
              name='categoryId' 
              value={productData.categoryId}
              onChange={e => setProductData({...productData, categoryId: e.target.value})}
              required
              disabled={categoriesLoading}
            >
              <option value=''>
                {categoriesLoading ? 'Loading categories...' : 'Select Product Category'}
              </option>
              {categoriesError ? (
                <option value='' disabled>Error loading categories</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </AvInput>
          </FormGroup>
          <FormGroup>
            <Label for='productImage'>Product Image</Label>
            <Card>
              <CardBody>
                {!productData.imagePreview ? (
                  <DragDrop uppy={uppy} />
                ) : (
                  <div>
                    <img 
                      className='rounded mb-2' 
                      src={productData.imagePreview} 
                      alt='product' 
                      style={{ maxWidth: '200px', display: 'block' }}
                    />
                    <div className='d-flex gap-1'>
                      <Button 
                        size='sm' 
                        color='warning' 
                        outline 
                        onClick={replaceImage}
                        className='mr-1'
                      >
                        <RefreshCw size={14} className='mr-50' />
                        Replace
                      </Button>
                      <Button 
                        size='sm' 
                        color='danger' 
                        outline 
                        onClick={removeImage}
                      >
                        <X size={14} className='mr-50' />
                        Remove
                      </Button>
                    </div>
                    <small className='text-muted d-block mt-1'>
                      Click "Replace" to upload a different image or "Remove" to delete this image
                    </small>
                  </div>
                )}
                {!productData.imagePreview && (
                  <small className='text-muted'>
                    Drag and drop an image file here or click to browse
                  </small>
                )}
              </CardBody>
            </Card>
          </FormGroup>
          <FormGroup>
            <Label for='sku'>Product SKU</Label>
            <AvInput 
              type='text' 
              name='sku' 
              id='sku' 
              placeholder='Product SKU' 
              value={productData.sku}
              onChange={e => setProductData({...productData, sku: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='alcohol_content'>Product Alcohol Content</Label>
            <AvInput 
              type='number' 
              name='alcohol_content' 
              id='alcohol_content' 
              placeholder='Product Alcohol Content' 
              value={productData.alcohol_content}
              onChange={e => setProductData({...productData, alcohol_content: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='volume'>Product Volume</Label>
            <AvInput 
              type='number' 
              name='volume' 
              id='volume' 
              placeholder='Product Volume' 
              value={productData.volume}
              onChange={e => setProductData({...productData, volume: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='origin'>Product Origin</Label>
            <AvInput 
              type='text' 
              name='origin' 
              id='origin' 
              placeholder='Product Origin' 
              value={productData.origin}
              onChange={e => setProductData({...productData, origin: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for='barcode'>Product Barcode</Label>
            <InputGroup>
              <AvInput 
                type='text' 
                name='barcode' 
                id='barcode' 
                placeholder='Product Barcode' 
                value={productData.barcode}
                onChange={e => setProductData({...productData, barcode: e.target.value})}
              />
              <InputGroupAddon addonType='append'>
                <Button 
                  color={isConnected ? (isScanning ? 'warning' : 'success') : 'secondary'}
                  onClick={startScanning}
                  disabled={!isConnected}
                  title={isConnected ? 'Scan Barcode' : 'Scanner not connected'}
                >
                  <Camera size={16} />
                  {isScanning && <Spinner size='sm' className='ml-1' />}
                </Button>
              </InputGroupAddon>
            </InputGroup>
            <small className='text-muted'>
              Scanner status: {isConnected ? 'Connected' : 'Disconnected'}
              {isScanning && ' - Ready to scan'}
            </small>
          </FormGroup>
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
