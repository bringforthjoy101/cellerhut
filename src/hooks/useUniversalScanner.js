import { useEffect, useCallback, useState, useRef, useMemo } from 'react'
import { toast } from 'react-toastify'
import universalScannerService from '../services/universalScannerService'

export const useUniversalScanner = (onBarcodeScanned, options = {}) => {
	const [isInitialized, setIsInitialized] = useState(false)
	const [isInitializing, setIsInitializing] = useState(false)
	const [isScanning, setIsScanning] = useState(false)
	const [scannerStatus, setScannerStatus] = useState({
		activeScanners: [],
		bestScanner: null,
		scannerStatus: {},
		capabilities: {}
	})
	const [lastError, setLastError] = useState(null)
	
	// Use ref to store the latest callback without causing re-renders
	const onBarcodeCallbackRef = useRef(onBarcodeScanned)
	useEffect(() => {
		onBarcodeCallbackRef.current = onBarcodeScanned
	}, [onBarcodeScanned])
	
	// Component-level initialization guard
	const hasInitializedRef = useRef(false)
	
	// Notification state management
	const [lastNotification, setLastNotification] = useState({
		type: null,
		message: null,
		timestamp: null
	})
	const [notificationSettings] = useState({
		debounceTime: 30000, // 30 seconds
		showInitialization: true,
		quietMode: false
	})
	
	// Memoize options to prevent unnecessary re-renders
	const memoizedOptions = useMemo(() => ({
		debugLogging: true,
		...options
	}), [JSON.stringify(options)])

	// Handle scanned barcode
	const handleBarcodeScanned = useCallback((barcode, scannerType) => {
		console.log(`📊 Barcode received from ${scannerType}:`, barcode)
		setIsScanning(false)

		if (onBarcodeCallbackRef.current && typeof onBarcodeCallbackRef.current === 'function') {
			onBarcodeCallbackRef.current(barcode, scannerType)
			
			// Show success toast with scanner type
			const scannerNames = {
				socketMobile: 'Socket Mobile',
				keyboardWedge: 'USB Scanner',
				browserAPI: 'Camera',
				manual: 'Manual'
			}
			
			toast.success(`Barcode scanned via ${scannerNames[scannerType] || scannerType}: ${barcode}`, {
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
	}, [])

	// Smart notification system with debouncing and deduplication
	const showSmartNotification = useCallback((type, message, options = {}) => {
		// Skip if in quiet mode
		if (notificationSettings.quietMode) return

		const now = Date.now()
		const { 
			force = false, 
			toastType = 'success',
			autoClose = 3000,
			toastId = null
		} = options

		// Check if this is a duplicate notification within debounce time
		const isDuplicate = lastNotification.type === type && 
			lastNotification.message === message &&
			lastNotification.timestamp &&
			(now - lastNotification.timestamp) < notificationSettings.debounceTime

		if (isDuplicate && !force) {
			console.log(`🔇 Skipping duplicate notification: ${message}`)
			return
		}

		// Update notification state
		setLastNotification({
			type,
			message,
			timestamp: now
		})

		// Show the notification with optional toast ID for deduplication
		const toastOptions = {
			position: 'top-right',
			autoClose,
			hideProgressBar: false,
			...(toastId && { toastId })
		}

		switch (toastType) {
			case 'success':
				toast.success(message, toastOptions)
				break
			case 'error':
				toast.error(message, toastOptions)
				break
			case 'info':
				toast.info(message, toastOptions)
				break
			case 'warning':
				toast.warning(message, toastOptions)
				break
			default:
				toast(message, toastOptions)
		}
	}, [lastNotification, notificationSettings])

	// Update scanner status
	const updateStatus = useCallback(() => {
		if (!universalScannerService.isInitialized) {
			return // Don't update status if service isn't initialized
		}
		
		const status = universalScannerService.getStatus()
		const summary = universalScannerService.getStatusSummary()
		
		setScannerStatus({
			...status,
			summary: summary.summary,
			level: summary.level,
			recommendations: summary.recommendations
		})
	}, [])

	// Initialize universal scanner
	useEffect(() => {
		let isActive = true // Flag to prevent state updates on unmounted component
		
		const initializeScanner = async () => {
			// Prevent multiple concurrent initializations at component level
			if (hasInitializedRef.current) {
				console.log('⚠️ useUniversalScanner: Component already initialized scanner, skipping...')
				return
			}
			
			// Prevent multiple concurrent initializations at service level
			if (universalScannerService.isInitialized) {
				console.log('⚠️ useUniversalScanner: Service already initialized, skipping...')
				hasInitializedRef.current = true
				setIsInitialized(true)
				updateStatus()
				return
			}
			
			console.log('🌐 useUniversalScanner: Starting initialization...')
			hasInitializedRef.current = true
			
			if (isActive) {
				setIsInitializing(true)
				setLastError(null)
			}

			try {
				await universalScannerService.initialize(handleBarcodeScanned, memoizedOptions)
				
				if (isActive) {
					setIsInitialized(true)
					updateStatus()
					
					const status = universalScannerService.getStatusSummary()
					
					// Only show initialization notification if enabled and scanners are available
					if (notificationSettings.showInitialization && status.activeScannerCount > 0) {
						showSmartNotification(
							'scanner_initialized',
							`📱 Scanner ready: ${status.summary}`,
							{
								toastType: 'success',
								autoClose: 3000,
								toastId: 'scanner-status'
							}
						)
					}
				}

			} catch (error) {
				console.error('🚨 useUniversalScanner: Initialization failed:', error)
				if (isActive) {
					setLastError(error)
					setIsInitialized(false)
					
					showSmartNotification(
						'scanner_init_failed',
						`Scanner initialization failed: ${error.message}`,
						{
							toastType: 'error',
							autoClose: 6000,
							toastId: 'scanner-error'
						}
					)
				}
			} finally {
				if (isActive) {
					setIsInitializing(false)
				}
			}
		}

		initializeScanner()

		// Cleanup on unmount
		return () => {
			isActive = false // Prevent state updates after unmount
			console.log('🧹 useUniversalScanner: Cleaning up...')
			
			// Reset component-level guard
			hasInitializedRef.current = false
			
			// Only cleanup if we were the ones who initialized it
			if (universalScannerService.isInitialized) {
				universalScannerService.cleanup()
			}
			
			setIsInitialized(false)
			setIsScanning(false)
			setIsInitializing(false)
			setLastError(null)
		}
	}, [handleBarcodeScanned, memoizedOptions, updateStatus])

	// Stop scanning
	const stopScanning = useCallback(() => {
		console.log('🛑 Stopping universal scanner...')
		universalScannerService.stopScanning()
		setIsScanning(false)
		
		toast.info('Scanning stopped', {
			position: 'top-right',
			autoClose: 2000
		})
	}, [])

	// Start scanning
	const startScanning = useCallback(async (scanningOptions = {}) => {
		console.log('🎯 Starting universal scanner...')
		
		if (isInitializing) {
			toast.info('Scanner is initializing, please wait...', {
				position: 'top-right',
				autoClose: 2000
			})
			return
		}

		if (!isInitialized) {
			toast.error('Scanner not initialized', {
				position: 'top-right',
				autoClose: 3000
			})
			return
		}

		try {
			const bestScanner = await universalScannerService.startScanning(scanningOptions)
			setIsScanning(true)
			
			const scannerNames = {
				socketMobile: 'Socket Mobile scanner',
				keyboardWedge: 'USB barcode scanner',
				browserAPI: 'camera scanner',
				manual: 'manual entry'
			}
			
			toast.info(`Ready to scan with ${scannerNames[bestScanner] || bestScanner}`, {
				position: 'top-right',
				autoClose: 5000,
				icon: '📷'
			})

			// Auto-stop scanning after 30 seconds for camera scanning
			if (bestScanner === 'browserAPI') {
				setTimeout(() => {
					if (isScanning) {
						stopScanning()
						showSmartNotification(
							'scanner_timeout',
							'⏰ Camera scanning timeout - please try again',
							{
								toastType: 'warning',
								autoClose: 3000,
								toastId: 'scanner-timeout'
							}
						)
					}
				}, 30000)
			}

		} catch (error) {
			console.error('Failed to start scanning:', error)
			toast.error(`Cannot start scanning: ${error.message}`, {
				position: 'top-right',
				autoClose: 5000
			})
		}
	}, [isInitialized, isInitializing, isScanning, stopScanning])

	// Retry initialization
	const retryInitialization = useCallback(async () => {
		console.log('🔄 Retrying scanner initialization...')
		setIsInitializing(true)
		setLastError(null)

		try {
			await universalScannerService.retryFailedScanners()
			updateStatus()
			
			const status = universalScannerService.getStatusSummary()
			showSmartNotification(
				'scanner_retry_success',
				`🔄 Retry successful: ${status.summary}`,
				{
					toastType: 'success',
					autoClose: 3000,
					toastId: 'scanner-retry'
				}
			)

		} catch (error) {
			setLastError(error)
			showSmartNotification(
				'scanner_retry_failed',
				`Retry failed: ${error.message}`,
				{
					toastType: 'error',
					autoClose: 5000,
					toastId: 'scanner-retry-error'
				}
			)
		} finally {
			setIsInitializing(false)
		}
	}, [updateStatus])

	// Set preferred scanner
	const setPreferredScanner = useCallback((scannerType) => {
		universalScannerService.setPreferredScanner(scannerType)
		updateStatus()
		
		showSmartNotification(
			'scanner_preference_changed',
			`🎯 Preferred scanner set to ${scannerType}`,
			{
				toastType: 'info',
				autoClose: 2000,
				toastId: 'scanner-preference'
			}
		)
	}, [updateStatus])

	// Get detailed status
	const getDetailedStatus = useCallback(() => {
		return universalScannerService.getStatus()
	}, [])

	// Return scanner interface
	return {
		// Status
		isInitialized,
		isInitializing,
		isScanning,
		isConnected: scannerStatus.activeScanners.length > 0,
		
		// Scanner information
		activeScanners: scannerStatus.activeScanners,
		bestScanner: scannerStatus.bestScanner,
		scannerCount: scannerStatus.activeScanners.length,
		statusSummary: scannerStatus.summary,
		statusLevel: scannerStatus.level,
		recommendations: scannerStatus.recommendations || [],
		capabilities: scannerStatus.capabilities,
		
		// Error handling
		lastError,
		canRetry: !!lastError,
		
		// Methods
		startScanning,
		stopScanning,
		retryInitialization,
		setPreferredScanner,
		getDetailedStatus,
		
		// Legacy compatibility
		scannerService: scannerStatus.activeScanners.length > 0
	}
}