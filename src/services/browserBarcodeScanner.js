/**
 * Browser Barcode Detection API Handler
 * Uses native browser Barcode Detection API for camera-based scanning
 * Provides fallback options when native API is not available
 */

class BrowserBarcodeScanner {
	constructor() {
		this.isActive = false
		this.onBarcodeCallback = null
		this.barcodeDetector = null
		this.videoStream = null
		this.videoElement = null
		this.canvasElement = null
		this.scanningInterval = null
		
		// Configuration options
		this.config = {
			enableNativeAPI: true,        // Use native Barcode Detection API if available
			enableCameraFallback: true,   // Use camera with manual detection as fallback
			scanInterval: 200,            // Scan interval in milliseconds
			videoConstraints: {           // Camera constraints
				video: {
					facingMode: 'environment', // Prefer back camera
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			},
			supportedFormats: [           // Supported barcode formats
				'code_128',
				'code_39',
				'code_93',
				'codabar',
				'ean_13',
				'ean_8',
				'itf',
				'qr_code',
				'upc_a',
				'upc_e',
				'pdf417',
				'aztec',
				'data_matrix'
			],
			debugLogging: true
		}
	}

	/**
	 * Check if browser supports Barcode Detection API
	 * @returns {boolean}
	 */
	static isNativeAPISupported() {
		return 'BarcodeDetector' in window
	}

	/**
	 * Check if camera access is available
	 * @returns {boolean}
	 */
	static isCameraSupported() {
		return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
	}

	/**
	 * Initialize browser barcode scanner
	 * @param {Function} onBarcodeCallback - Callback function when barcode is detected
	 * @param {Object} options - Configuration options
	 */
	async initialize(onBarcodeCallback, options = {}) {
		console.log('📷 Initializing Browser Barcode Scanner...')
		
		if (this.isActive) {
			console.warn('⚠️ Browser barcode scanner already active')
			return
		}

		// Merge configuration options
		this.config = { ...this.config, ...options }
		this.onBarcodeCallback = onBarcodeCallback

		try {
			// Try to initialize native Barcode Detection API first
			if (this.config.enableNativeAPI && BrowserBarcodeScanner.isNativeAPISupported()) {
				await this.initializeNativeAPI()
			} else if (this.config.enableCameraFallback && BrowserBarcodeScanner.isCameraSupported()) {
				await this.initializeCameraFallback()
			} else {
				throw new Error('No supported barcode detection method available')
			}

			this.isActive = true
			
			if (this.config.debugLogging) {
				console.log('✅ Browser Barcode Scanner initialized')
			}

		} catch (error) {
			console.error('❌ Failed to initialize browser barcode scanner:', error)
			throw error
		}
	}

	/**
	 * Initialize native Barcode Detection API
	 */
	async initializeNativeAPI() {
		if (this.config.debugLogging) {
			console.log('🔧 Initializing native Barcode Detection API...')
		}

		try {
			// Create BarcodeDetector with supported formats
			this.barcodeDetector = new BarcodeDetector({
				formats: this.config.supportedFormats
			})

			// Get supported formats
			const supportedFormats = await BarcodeDetector.getSupportedFormats()
			
			if (this.config.debugLogging) {
				console.log('📋 Supported barcode formats:', supportedFormats)
			}

		} catch (error) {
			console.error('❌ Failed to create BarcodeDetector:', error)
			throw error
		}
	}

	/**
	 * Initialize camera fallback (for browsers without native API)
	 */
	async initializeCameraFallback() {
		if (this.config.debugLogging) {
			console.log('🔧 Initializing camera fallback...')
		}

		// Note: This would require a library like QuaggaJS or ZXing-js
		// For now, we'll just set up the camera stream
		console.warn('⚠️ Camera fallback not fully implemented - native API required')
		throw new Error('Camera fallback requires additional barcode detection library')
	}

	/**
	 * Start camera stream and scanning
	 * @param {HTMLVideoElement} videoElement - Video element to display camera stream
	 * @param {HTMLCanvasElement} canvasElement - Canvas element for image capture
	 */
	async startScanning(videoElement, canvasElement) {
		if (!this.isActive) {
			throw new Error('Scanner not initialized')
		}

		console.log('🎥 Starting camera stream and scanning...')

		this.videoElement = videoElement
		this.canvasElement = canvasElement

		try {
			// Get camera stream
			this.videoStream = await navigator.mediaDevices.getUserMedia(this.config.videoConstraints)
			
			// Set video source
			this.videoElement.srcObject = this.videoStream
			await this.videoElement.play()

			// Start scanning loop
			this.scanningInterval = setInterval(() => {
				this.scanFrame()
			}, this.config.scanInterval)

			if (this.config.debugLogging) {
				console.log('✅ Camera scanning started')
			}

		} catch (error) {
			console.error('❌ Failed to start camera scanning:', error)
			throw error
		}
	}

	/**
	 * Scan current video frame for barcodes
	 */
	async scanFrame() {
		if (!this.videoElement || !this.canvasElement || !this.barcodeDetector) {
			return
		}

		try {
			// Capture current frame to canvas
			const context = this.canvasElement.getContext('2d')
			context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height)

			// Create ImageData from canvas
			const imageData = context.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)

			// Detect barcodes in the image
			const barcodes = await this.barcodeDetector.detect(imageData)

			if (barcodes.length > 0) {
				const barcode = barcodes[0] // Take first detected barcode
				
				if (this.config.debugLogging) {
					console.log('📊 Barcode detected via camera:', {
						rawValue: barcode.rawValue,
						format: barcode.format,
						boundingBox: barcode.boundingBox
					})
				}

				// Call callback with barcode data
				if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
					this.onBarcodeCallback(barcode.rawValue)
				}

				// Stop scanning after successful detection
				this.stopScanning()
			}

		} catch (error) {
			// Ignore errors during scanning (common with poor lighting/focus)
			if (this.config.debugLogging && Math.random() < 0.01) { // Log occasionally to avoid spam
				console.log('🔍 Scanning frame (no barcode detected)')
			}
		}
	}

	/**
	 * Stop camera scanning
	 */
	stopScanning() {
		console.log('🛑 Stopping camera scanning...')

		// Stop scanning interval
		if (this.scanningInterval) {
			clearInterval(this.scanningInterval)
			this.scanningInterval = null
		}

		// Stop video stream
		if (this.videoStream) {
			this.videoStream.getTracks().forEach(track => track.stop())
			this.videoStream = null
		}

		// Clear video element
		if (this.videoElement) {
			this.videoElement.srcObject = null
			this.videoElement = null
		}

		this.canvasElement = null

		if (this.config.debugLogging) {
			console.log('✅ Camera scanning stopped')
		}
	}

	/**
	 * Scan a static image for barcodes
	 * @param {HTMLImageElement|HTMLCanvasElement|ImageData} imageSource
	 * @returns {Promise<Array>} Detected barcodes
	 */
	async scanImage(imageSource) {
		if (!this.barcodeDetector) {
			throw new Error('Native Barcode Detection API not available')
		}

		try {
			const barcodes = await this.barcodeDetector.detect(imageSource)
			
			if (this.config.debugLogging) {
				console.log(`📊 Detected ${barcodes.length} barcodes in image`)
			}

			return barcodes.map(barcode => ({
				value: barcode.rawValue,
				format: barcode.format,
				boundingBox: barcode.boundingBox
			}))

		} catch (error) {
			console.error('❌ Failed to scan image:', error)
			throw error
		}
	}

	/**
	 * Update configuration options
	 * @param {Object} options - New configuration options
	 */
	updateConfig(options) {
		this.config = { ...this.config, ...options }
		
		if (this.config.debugLogging) {
			console.log('⚙️ Browser barcode scanner config updated:', options)
		}
	}

	/**
	 * Get current scanner status
	 * @returns {Object}
	 */
	getStatus() {
		return {
			isActive: this.isActive,
			isScanning: !!this.scanningInterval,
			hasNativeAPI: BrowserBarcodeScanner.isNativeAPISupported(),
			hasCameraAccess: BrowserBarcodeScanner.isCameraSupported(),
			hasVideoStream: !!this.videoStream,
			hasCallback: typeof this.onBarcodeCallback === 'function',
			config: { ...this.config }
		}
	}

	/**
	 * Get available capabilities
	 * @returns {Object}
	 */
	static getCapabilities() {
		return {
			nativeAPI: BrowserBarcodeScanner.isNativeAPISupported(),
			camera: BrowserBarcodeScanner.isCameraSupported(),
			userAgent: navigator.userAgent
		}
	}

	/**
	 * Cleanup resources
	 */
	cleanup() {
		console.log('🧹 Cleaning up Browser Barcode Scanner...')
		
		this.stopScanning()
		this.barcodeDetector = null
		this.onBarcodeCallback = null
		this.isActive = false
		
		console.log('✅ Browser Barcode Scanner cleanup complete')
	}
}

// Export singleton instance
export const browserBarcodeScanner = new BrowserBarcodeScanner()
export default browserBarcodeScanner