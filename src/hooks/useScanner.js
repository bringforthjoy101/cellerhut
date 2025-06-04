import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import scannerService from '../services/scannerService'
import { addToCart } from '../views/tiki-fish/ecommerce/store/actions' // Adjust the import path as needed

// Get Socket Mobile credentials from environment variables
const appInfo = {
  appId: process.env.REACT_APP_SOCKETMOBILE_APP_ID,
  developerId: process.env.REACT_APP_SOCKETMOBILE_DEVELOPER_ID,
  appKey: process.env.REACT_APP_SOCKETMOBILE_APP_KEY
}

export const useScanner = (products) => {
  const dispatch = useDispatch()

  // Handle scanned barcode
  const handleScannedBarcode = useCallback((barcode) => {
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode)
    
    if (product) {
      // Add product to cart
      dispatch(addToCart(product.id))
      toast.success(`Added ${product.name} to cart`)
    } else {
      toast.error('Product not found')
    }
  }, [dispatch, products])

  // Initialize scanner
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        await scannerService.initialize(appInfo, handleScannedBarcode)
        toast.info('Scanner initialized. Ready to scan.')
      } catch (error) {
        toast.error(error.message || 'Failed to initialize scanner')
        console.error('Scanner initialization error:', error)
      }
    }

    initializeScanner()

    // Cleanup on unmount
    return () => {
      scannerService.cleanup()
    }
  }, [handleScannedBarcode])

  // Return scanner status and methods
  return {
    isConnected: scannerService.isConnected(),
    // Add any additional scanner methods or status here
  }
} 