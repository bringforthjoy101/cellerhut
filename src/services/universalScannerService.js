/**
 * Universal Scanner Service
 * Coordinates multiple barcode scanner input methods and provides a unified interface
 * Supports: Socket Mobile, Keyboard Wedge, Browser API, and Camera scanning
 */

import scannerService from './scannerService' // Socket Mobile service
import keyboardWedgeScanner from './keyboardWedgeScanner'
import browserBarcodeScanner from './browserBarcodeScanner'

class UniversalScannerService {
	constructor() {
		this.isInitialized = false
		this.isInitializing = false
		this.activeScanners = new Set()
		this.onBarcodeCallback = null
		this.preferredScannerType = null
		this.lastSuccessfulScanner = null
		
		// Scanner type priorities (higher number = higher priority)
		this.scannerPriorities = {
			socketMobile: 4,    // Highest - most reliable for dedicated hardware
			keyboardWedge: 3,   // High - works with most USB/Bluetooth scanners
			browserAPI: 2,      // Medium - good for camera scanning
			manual: 1           // Lowest - fallback manual entry
		}

		// Configuration
		this.config = {
			enableSocketMobile: true,
			enableKeyboardWedge: true,
			enableBrowserAPI: true,
			autoDetectScanners: true,
			fallbackToManual: true,
			debugLogging: true,
			// Socket Mobile config
			socketMobileConfig: null,
			// Keyboard wedge config
			keyboardWedgeConfig: {
				minBarcodeLength: 3,
				maxBarcodeLength: 50,
				interCharTimeout: 20,
				scanTimeout: 200
			},
			// Browser API config
			browserAPIConfig: {
				scanInterval: 200,
				supportedFormats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e']
			}
		}

		// Scanner status tracking
		this.scannerStatus = {
			socketMobile: { available: false, connected: false, error: null },
			keyboardWedge: { available: false, connected: false, error: null },
			browserAPI: { available: false, connected: false, error: null }
		}
	}

	/**
	 * Initialize universal scanner service
	 * @param {Function} onBarcodeCallback - Callback when barcode is scanned
	 * @param {Object} options - Configuration options
	 */
	async initialize(onBarcodeCallback, options = {}) {
		console.log('🌐 Initializing Universal Scanner Service...')
		
		if (this.isInitialized) {
			console.warn('⚠️ Universal scanner service already initialized')
			return
		}
		
		if (this.isInitializing) {
			console.warn('⚠️ Universal scanner service is currently initializing')
			return
		}

		this.isInitializing = true

		try {
			// Merge configuration
			this.config = { ...this.config, ...options }
			this.onBarcodeCallback = onBarcodeCallback

			// Detect and initialize available scanners
			await this.detectAndInitializeScanners()

			this.isInitialized = true

			if (this.config.debugLogging) {
				console.log('✅ Universal Scanner Service initialized')
				console.log('📊 Scanner status:', this.scannerStatus)
				console.log('🎯 Active scanners:', Array.from(this.activeScanners))
			}
		} finally {
			this.isInitializing = false
		}
	}

	/**
	 * Detect and initialize all available scanner types
	 */
	async detectAndInitializeScanners() {
		const initPromises = []

		// Try Socket Mobile initialization
		if (this.config.enableSocketMobile) {
			initPromises.push(this.initializeSocketMobile())
		}

		// Try Keyboard Wedge initialization
		if (this.config.enableKeyboardWedge) {
			initPromises.push(this.initializeKeyboardWedge())
		}

		// Try Browser API initialization
		if (this.config.enableBrowserAPI) {
			initPromises.push(this.initializeBrowserAPI())
		}

		// Wait for all initialization attempts (don't fail if some fail)
		await Promise.allSettled(initPromises)
	}

	/**
	 * Initialize Socket Mobile scanner
	 */
	async initializeSocketMobile() {
		try {
			console.log('🔌 Attempting Socket Mobile initialization...')
			
			// Use existing scannerService (Socket Mobile)
			const appInfo = this.config.socketMobileConfig || {
				appId: process.env.REACT_APP_SOCKETMOBILE_APP_ID,
				developerId: process.env.REACT_APP_SOCKETMOBILE_DEVELOPER_ID,
				appKey: process.env.REACT_APP_SOCKETMOBILE_APP_KEY
			}

			await scannerService.initialize(appInfo, this.handleBarcodeDetected.bind(this, 'socketMobile'))
			
			this.scannerStatus.socketMobile = {
				available: true,
				connected: scannerService.isConnected(),
				error: null
			}

			this.activeScanners.add('socketMobile')
			
			if (this.config.debugLogging) {
				console.log('✅ Socket Mobile scanner initialized')
			}

		} catch (error) {
			this.scannerStatus.socketMobile = {
				available: false,
				connected: false,
				error: error.message
			}
			
			if (this.config.debugLogging) {
				console.log('❌ Socket Mobile initialization failed:', error.message)
			}
		}
	}

	/**
	 * Initialize Keyboard Wedge scanner
	 */
	async initializeKeyboardWedge() {
		try {
			console.log('⌨️ Attempting Keyboard Wedge initialization...')
			
			keyboardWedgeScanner.initialize(
				this.handleBarcodeDetected.bind(this, 'keyboardWedge'),
				this.config.keyboardWedgeConfig
			)
			
			this.scannerStatus.keyboardWedge = {
				available: true,
				connected: true, // Always "connected" if initialized
				error: null
			}

			this.activeScanners.add('keyboardWedge')
			
			if (this.config.debugLogging) {
				console.log('✅ Keyboard Wedge scanner initialized')
			}

		} catch (error) {
			this.scannerStatus.keyboardWedge = {
				available: false,
				connected: false,
				error: error.message
			}
			
			if (this.config.debugLogging) {
				console.log('❌ Keyboard Wedge initialization failed:', error.message)
			}
		}
	}

	/**
	 * Initialize Browser API scanner
	 */
	async initializeBrowserAPI() {
		try {
			console.log('📷 Attempting Browser API initialization...')
			
			// Check if browser supports barcode detection
			if (!browserBarcodeScanner.constructor.isNativeAPISupported()) {
				throw new Error('Browser Barcode Detection API not supported')
			}

			await browserBarcodeScanner.initialize(
				this.handleBarcodeDetected.bind(this, 'browserAPI'),
				this.config.browserAPIConfig
			)
			
			this.scannerStatus.browserAPI = {
				available: true,
				connected: false, // Not connected until camera scanning starts
				error: null
			}

			this.activeScanners.add('browserAPI')
			
			if (this.config.debugLogging) {
				console.log('✅ Browser API scanner initialized')
			}

		} catch (error) {
			this.scannerStatus.browserAPI = {
				available: false,
				connected: false,
				error: error.message
			}
			
			if (this.config.debugLogging) {
				console.log('❌ Browser API initialization failed:', error.message)
			}
		}
	}

	/**
	 * Handle barcode detected from any scanner type
	 * @param {string} scannerType - Type of scanner that detected the barcode
	 * @param {string} barcodeData - Scanned barcode data
	 */
	handleBarcodeDetected(scannerType, barcodeData) {
		if (this.config.debugLogging) {
			console.log(`📊 Barcode detected via ${scannerType}:`, barcodeData)
		}

		// Update last successful scanner
		this.lastSuccessfulScanner = scannerType

		// Call the main callback
		if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
			this.onBarcodeCallback(barcodeData, scannerType)
		}
	}

	/**
	 * Start scanning with the best available scanner
	 * @param {Object} options - Scanning options
	 */
	async startScanning(options = {}) {
		console.log('🎯 Starting scan with best available scanner...')

		// Determine best scanner to use
		const bestScanner = this.getBestAvailableScanner()
		
		if (!bestScanner) {
			throw new Error('No scanners available')
		}

		console.log(`🎯 Using ${bestScanner} scanner`)

		switch (bestScanner) {
			case 'socketMobile':
				// Socket Mobile is always "ready" when connected
				if (this.config.debugLogging) {
					console.log('✅ Socket Mobile scanner ready')
				}
				break

			case 'keyboardWedge':
				// Keyboard wedge is always listening
				if (this.config.debugLogging) {
					console.log('✅ Keyboard Wedge scanner ready')
				}
				break

			case 'browserAPI':
				// Need to start camera scanning
				if (options.videoElement && options.canvasElement) {
					await browserBarcodeScanner.startScanning(options.videoElement, options.canvasElement)
					this.scannerStatus.browserAPI.connected = true
				} else {
					throw new Error('Video and canvas elements required for browser scanning')
				}
				break

			default:
				throw new Error(`Unknown scanner type: ${bestScanner}`)
		}

		return bestScanner
	}

	/**
	 * Stop all active scanning
	 */
	stopScanning() {
		console.log('🛑 Stopping all scanner scanning...')

		// Stop browser API scanning
		if (this.activeScanners.has('browserAPI')) {
			browserBarcodeScanner.stopScanning()
			this.scannerStatus.browserAPI.connected = false
		}

		// Keyboard wedge and Socket Mobile don't need explicit "stop"
		// as they're always listening or event-driven
	}

	/**
	 * Get the best available scanner based on priority and availability
	 * @returns {string|null}
	 */
	getBestAvailableScanner() {
		// If user has a preference and it's available, use it
		if (this.preferredScannerType && this.activeScanners.has(this.preferredScannerType)) {
			return this.preferredScannerType
		}

		// If we had a previously successful scanner, prefer it
		if (this.lastSuccessfulScanner && this.activeScanners.has(this.lastSuccessfulScanner)) {
			return this.lastSuccessfulScanner
		}

		// Otherwise, use highest priority available scanner
		let bestScanner = null
		let highestPriority = 0

		for (const [scannerType, priority] of Object.entries(this.scannerPriorities)) {
			if (this.activeScanners.has(scannerType) && priority > highestPriority) {
				bestScanner = scannerType
				highestPriority = priority
			}
		}

		return bestScanner
	}

	/**
	 * Set preferred scanner type
	 * @param {string} scannerType
	 */
	setPreferredScanner(scannerType) {
		if (this.activeScanners.has(scannerType)) {
			this.preferredScannerType = scannerType
			
			if (this.config.debugLogging) {
				console.log(`🎯 Preferred scanner set to: ${scannerType}`)
			}
		} else {
			console.warn(`⚠️ Cannot set preferred scanner: ${scannerType} not available`)
		}
	}

	/**
	 * Get comprehensive scanner status
	 * @returns {Object}
	 */
	getStatus() {
		return {
			isInitialized: this.isInitialized,
			activeScanners: Array.from(this.activeScanners),
			scannerStatus: { ...this.scannerStatus },
			bestAvailableScanner: this.getBestAvailableScanner(),
			preferredScanner: this.preferredScannerType,
			lastSuccessfulScanner: this.lastSuccessfulScanner,
			capabilities: {
				socketMobile: this.config.enableSocketMobile,
				keyboardWedge: this.config.enableKeyboardWedge,
				browserAPI: this.config.enableBrowserAPI && browserBarcodeScanner.constructor.isNativeAPISupported(),
				camera: browserBarcodeScanner.constructor.isCameraSupported()
			}
		}
	}

	/**
	 * Get human-readable status summary
	 * @returns {Object}
	 */
	getStatusSummary() {
		const status = this.getStatus()
		const activeScannerCount = status.activeScanners.length
		const bestScanner = status.bestAvailableScanner

		let summary = ''
		let level = 'success'

		if (activeScannerCount === 0) {
			summary = 'No scanners available'
			level = 'error'
		} else if (activeScannerCount === 1) {
			summary = `${bestScanner} scanner ready`
			level = 'success'
		} else {
			summary = `${activeScannerCount} scanners ready (using ${bestScanner})`
			level = 'success'
		}

		return {
			summary,
			level,
			activeScannerCount,
			bestScanner,
			recommendations: this.getRecommendations(status)
		}
	}

	/**
	 * Get recommendations based on current status
	 * @param {Object} status
	 * @returns {Array}
	 */
	getRecommendations(status) {
		const recommendations = []

		// If no scanners available
		if (status.activeScanners.length === 0) {
			recommendations.push('Connect a USB barcode scanner or enable camera access')
		}

		// If only keyboard wedge available
		if (status.activeScanners.length === 1 && status.activeScanners.includes('keyboardWedge')) {
			recommendations.push('For best results, connect a dedicated barcode scanner')
		}

		// If Socket Mobile failed but configured
		if (this.config.enableSocketMobile && !status.activeScanners.includes('socketMobile')) {
			recommendations.push('Start Socket Mobile Companion service for enhanced scanner features')
		}

		// If browser API available but not used
		if (status.capabilities.browserAPI && !status.activeScanners.includes('browserAPI')) {
			recommendations.push('Use camera scanning as backup option')
		}

		return recommendations
	}

	/**
	 * Retry failed scanner initializations
	 */
	async retryFailedScanners() {
		console.log('🔄 Retrying failed scanner initializations...')
		
		const retryPromises = []

		// Retry Socket Mobile if failed
		if (this.config.enableSocketMobile && !this.activeScanners.has('socketMobile')) {
			retryPromises.push(this.initializeSocketMobile())
		}

		// Retry Browser API if failed
		if (this.config.enableBrowserAPI && !this.activeScanners.has('browserAPI')) {
			retryPromises.push(this.initializeBrowserAPI())
		}

		await Promise.allSettled(retryPromises)
		
		if (this.config.debugLogging) {
			console.log('🔄 Retry complete. Active scanners:', Array.from(this.activeScanners))
		}
	}

	/**
	 * Cleanup all scanner resources
	 */
	async cleanup() {
		console.log('🧹 Cleaning up Universal Scanner Service...')

		// Cleanup individual scanners
		if (this.activeScanners.has('socketMobile')) {
			await scannerService.cleanup()
		}

		if (this.activeScanners.has('keyboardWedge')) {
			keyboardWedgeScanner.cleanup()
		}

		if (this.activeScanners.has('browserAPI')) {
			browserBarcodeScanner.cleanup()
		}

		// Reset state
		this.activeScanners.clear()
		this.onBarcodeCallback = null
		this.preferredScannerType = null
		this.lastSuccessfulScanner = null
		this.isInitialized = false
		this.isInitializing = false

		// Reset scanner status
		Object.keys(this.scannerStatus).forEach(key => {
			this.scannerStatus[key] = { available: false, connected: false, error: null }
		})

		console.log('✅ Universal Scanner Service cleanup complete')
	}
}

// Export singleton instance
export const universalScannerService = new UniversalScannerService()
export default universalScannerService