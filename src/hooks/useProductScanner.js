import { useEffect, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import scannerService from '../services/scannerService'

// Get Socket Mobile credentials from environment variables
const appInfo = {
  appId: process.env.REACT_APP_SOCKETMOBILE_APP_ID,
  developerId: process.env.REACT_APP_SOCKETMOBILE_DEVELOPER_ID,
  appKey: process.env.REACT_APP_SOCKETMOBILE_APP_KEY
}

export const useProductScanner = (onBarcodeScanned) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Handle scanned barcode for product forms
  const handleScannedBarcode = useCallback((barcode) => {
    setIsScanning(false)
    
    if (onBarcodeScanned && typeof onBarcodeScanned === 'function') {
      onBarcodeScanned(barcode)
      toast.success(`Barcode scanned successfully: ${barcode}`, {
        position: 'top-right',
        autoClose: 4000
      })
    } else {
      toast.error('No barcode handler provided', {
        position: 'top-right',
        autoClose: 3000
      })
    }
  }, [onBarcodeScanned])

  // Initialize scanner
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        await scannerService.initialize(appInfo, handleScannedBarcode)
        setIsConnected(true)
        toast.success('Scanner connected and ready to scan!', {
          position: 'top-right',
          autoClose: 3000
        })
      } catch (error) {
        setIsConnected(false)
        const errorMessage = error.message || 'Failed to initialize scanner'
        toast.error(`Scanner Error: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 6000
        })
        console.error('Scanner initialization error:', error)
      }
    }

    initializeScanner()

    // Cleanup on unmount
    return () => {
      scannerService.cleanup()
      setIsConnected(false)
    }
  }, [handleScannedBarcode])

  // Trigger scanning mode (visual feedback)
  const startScanning = useCallback(() => {
    if (isConnected) {
      setIsScanning(true)
      toast.info('Ready to scan - please scan a barcode', {
        position: 'top-right',
        autoClose: 3000
      })
      
      // Auto-stop scanning after 30 seconds
      setTimeout(() => {
        if (isScanning) {
          setIsScanning(false)
          toast.warning('Scanning timeout - please try again', {
            position: 'top-right',
            autoClose: 3000
          })
        }
      }, 30000)
    } else {
      toast.error('Scanner not connected. Please ensure Socket Mobile Companion is running.', {
        position: 'top-right',
        autoClose: 5000
      })
    }
  }, [isConnected, isScanning])

  // Return scanner status and methods
  return {
    isConnected,
    isScanning,
    startScanning,
    // Expose scanner service connection status
    scannerService: scannerService.isConnected()
  }
}