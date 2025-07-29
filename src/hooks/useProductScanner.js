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
  const [isInitializing, setIsInitializing] = useState(false)
  const [lastError, setLastError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Handle scanned barcode for product forms
  const handleScannedBarcode = useCallback((barcode) => {
    console.log('📊 Barcode received in hook:', barcode)
    setIsScanning(false)
    
    if (onBarcodeScanned && typeof onBarcodeScanned === 'function') {
      onBarcodeScanned(barcode)
      toast.success(`Barcode scanned: ${barcode}`, {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false
      })
    } else {
      console.error('No barcode handler provided')
      toast.error('No barcode handler provided', {
        position: 'top-right',
        autoClose: 3000
      })
    }
  }, [onBarcodeScanned])

  // Get user-friendly error message and actions
  const getErrorUI = useCallback((error) => {
    const canRetry = error?.canRetry && retryCount < 3
    
    const errorMessages = {
      'SERVICE_UNAVAILABLE': {
        title: 'Scanner Service Not Running',
        message: 'Please start Socket Mobile Companion app and try again.',
        action: canRetry ? 'Retry Connection' : 'Manual Entry Only'
      },
      'INVALID_CREDENTIALS': {
        title: 'Scanner Configuration Error',
        message: 'Invalid app credentials. Contact administrator.',
        action: 'Manual Entry Only'
      },
      'NOT_SUPPORTED': {
        title: 'Scanner Not Supported',
        message: 'Scanner functionality not supported on this device.',
        action: 'Manual Entry Only'
      },
      'CONNECTION_ERROR': {
        title: 'Connection Failed',
        message: 'Unable to connect to scanner service.',
        action: canRetry ? 'Retry Connection' : 'Check Network'
      }
    }

    return errorMessages[error?.type] || {
      title: 'Scanner Error',
      message: error?.message || 'Unknown scanner error occurred.',
      action: canRetry ? 'Retry Connection' : 'Manual Entry Only'
    }
  }, [retryCount])

  // Retry scanner initialization
  const retryInitialization = useCallback(async () => {
    if (retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please use manual barcode entry.', {
        position: 'top-right',
        autoClose: 5000
      })
      return
    }

    setRetryCount(prev => prev + 1)
    setIsInitializing(true)
    setLastError(null)

    try {
      const delayMs = Math.pow(2, retryCount) * 1000 // Exponential backoff
      await scannerService.retryInitialization(appInfo, handleScannedBarcode, delayMs)
      
      setIsConnected(true)
      setRetryCount(0)
      toast.success(`Scanner connected successfully! (Attempt ${retryCount + 1})`, {
        position: 'top-right',
        autoClose: 3000
      })
    } catch (error) {
      const errorUI = getErrorUI(error)
      setLastError({ ...error, ui: errorUI })
      setIsConnected(false)
      
      toast.error(`${errorUI.title}: ${errorUI.message}`, {
        position: 'top-right',
        autoClose: 6000
      })
    } finally {
      setIsInitializing(false)
    }
  }, [retryCount, handleScannedBarcode, getErrorUI])

  // Initialize scanner
  useEffect(() => {
    const initializeScanner = async () => {
      console.log('🚀 useProductScanner: Starting initialization...')
      setIsInitializing(true)
      setLastError(null)

      try {
        await scannerService.initialize(appInfo, handleScannedBarcode)
        setIsConnected(true)
        setRetryCount(0)
        
        toast.success('Scanner connected and ready!', {
          position: 'top-right',
          autoClose: 3000,
          icon: '📱'
        })
      } catch (error) {
        console.error('🚨 useProductScanner: Initialization failed:', error)
        
        const errorUI = getErrorUI(error)
        setLastError({ ...error, ui: errorUI })
        setIsConnected(false)
        
        // Show different toast based on error type
        if (error.type === 'SERVICE_UNAVAILABLE') {
          toast.error(`${errorUI.title}: ${errorUI.message}`, {
            position: 'top-right',
            autoClose: 0, // Don't auto-close for service issues
            closeOnClick: true
          })
        } else {
          toast.error(`${errorUI.title}: ${errorUI.message}`, {
            position: 'top-right',
            autoClose: 6000
          })
        }
      } finally {
        setIsInitializing(false)
      }
    }

    initializeScanner()

    // Cleanup on unmount
    return () => {
      console.log('🧹 useProductScanner: Cleaning up...')
      scannerService.cleanup()
      setIsConnected(false)
      setIsScanning(false)
      setIsInitializing(false)
      setLastError(null)
      setRetryCount(0)
    }
  }, [handleScannedBarcode, getErrorUI])

  // Trigger scanning mode (visual feedback)
  const startScanning = useCallback(() => {
    console.log('🎯 startScanning called, scanner status:', { isConnected, isScanning, isInitializing })
    
    if (isInitializing) {
      toast.info('Scanner is initializing, please wait...', {
        position: 'top-right',
        autoClose: 2000
      })
      return
    }

    if (isConnected) {
      setIsScanning(true)
      toast.info('Ready to scan - point scanner at barcode', {
        position: 'top-right',
        autoClose: 5000,
        icon: '📷'
      })
      
      // Auto-stop scanning after 30 seconds
      const timeoutId = setTimeout(() => {
        setIsScanning(false)
        toast.warning('Scanning timeout - please try again', {
          position: 'top-right',
          autoClose: 3000
        })
      }, 30000)

      // Store timeout ID for cleanup if needed
      return () => clearTimeout(timeoutId)
    } else {
      const errorMessage = lastError?.ui?.message || 'Scanner not connected'
      toast.error(`Cannot scan: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000
      })
    }
  }, [isConnected, isScanning, isInitializing, lastError])

  // Manual stop scanning
  const stopScanning = useCallback(() => {
    console.log('🛑 Manual stop scanning')
    setIsScanning(false)
    toast.info('Scanning stopped', {
      position: 'top-right',
      autoClose: 2000
    })
  }, [])

  // Get detailed scanner status
  const getScannerStatus = useCallback(() => {
    return {
      isConnected,
      isScanning,
      isInitializing,
      lastError: lastError?.ui || null,
      retryCount,
      canRetry: lastError?.canRetry && retryCount < 3,
      serviceStatus: scannerService.getStatus()
    }
  }, [isConnected, isScanning, isInitializing, lastError, retryCount])

  // Return scanner status and methods
  return {
    // Status
    isConnected,
    isScanning,
    isInitializing,
    lastError: lastError?.ui || null,
    retryCount,
    canRetry: lastError?.canRetry && retryCount < 3,
    
    // Methods
    startScanning,
    stopScanning,
    retryInitialization,
    getScannerStatus,
    
    // Legacy compatibility
    scannerService: scannerService.isConnected()
  }
}