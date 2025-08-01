/**
 * Rumba SDK Service
 * Handles barcode scanning through Socket Mobile's Rumba JavaScript API for iOS devices
 * Documentation: https://docs.socketmobile.dev/rumba/en/latest/rumbaJsApi.html
 */

import { PerformantLogger } from '../utils/performantLogger'

class RumbaSDKService {
	constructor() {
		this.isInitialized = false
		this.isAvailable = false
		this.onBarcodeCallback = null
		this.deviceInfo = null
		this.initializationAttempts = 0
		this.maxRetryAttempts = 3

		// Track scanning state
		this.isScanning = false
		this.scanningOptions = null

		// Store Rumba instance reference
		this.rumbaInstance = null
		this.domain = null
		this.configId = null

		// Performance-optimized logger
		this.logger = new PerformantLogger('RUMBA_SDK')

		// Configuration - debug logging disabled by default for performance
		this.config = {
			debugLogging: process.env.REACT_APP_DEBUG_SCANNERS === 'true' || process.env.NODE_ENV === 'development',
			autoStartScanning: true,
			scanTimeout: 30000, // 30 seconds timeout
			retryDelay: 1000, // 1 second retry delay
		}

		// Debug monitoring
		this.callbackStats = {
			totalCallbacks: 0,
			successfulCallbacks: 0,
			failedCallbacks: 0,
			lastCallbackTime: null,
			lastBarcode: null,
			callbackHistory: []
		}
	}

	/**
	 * Resolve domain name for Rumba initialization
	 */
	resolveDomain() {
		try {
			// Priority 1: Environment variable
			if (process.env.REACT_APP_RUMBA_DOMAIN) {
				const envDomain = process.env.REACT_APP_RUMBA_DOMAIN.trim()
				if (this.isValidDomain(envDomain)) {
					this.logger.debug(`Using environment domain: ${envDomain}`)
					return envDomain
				}
				this.logger.warn(`Invalid domain in environment variable: ${envDomain}`)
				this.logger.warn('Domain must be a valid hostname (e.g., "cellerhut.com" or "localhost")')
			}

			// Priority 2: Auto-detect from current hostname
			if (typeof window !== 'undefined' && window.location && window.location.hostname) {
				const hostname = window.location.hostname
				if (this.isValidDomain(hostname)) {
					return hostname
				}
			}

			// Priority 3: Fallback
			return 'localhost'
		} catch (error) {
			this.logger.warn('Error resolving domain:', error.message)
			return 'localhost'
		}
	}

	/**
	 * Validate domain name format
	 */
	isValidDomain(domain) {
		if (!domain || typeof domain !== 'string') return false

		// Trim whitespace
		domain = domain.trim()

		// Special case for localhost
		if (domain === 'localhost') return true

		// Check length limits
		if (domain.length > 253) return false

		// Basic domain validation - must contain at least one dot for real domains
		const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

		// Additional checks
		if (!domainRegex.test(domain)) return false

		// Ensure each label is not longer than 63 characters
		const labels = domain.split('.')
		for (const label of labels) {
			if (label.length === 0 || label.length > 63) return false
			if (label.startsWith('-') || label.endsWith('-')) return false
		}

		return true
	}

	/**
	 * Resolve configuration change ID
	 */
	resolveConfigId() {
		// Use environment variable or generate a default
		const configId = process.env.REACT_APP_RUMBA_CONFIG_ID || `cellerhut-rumba-${Date.now()}`

		if (process.env.REACT_APP_RUMBA_CONFIG_ID) {
			this.logger.debug(`Using environment config ID: ${configId}`)
		} else {
			this.logger.info(`No REACT_APP_RUMBA_CONFIG_ID found, generated: ${configId}`)
			this.logger.info('Consider setting REACT_APP_RUMBA_CONFIG_ID for consistent configuration')
		}

		return configId
	}

	/**
	 * Check if Rumba JavaScript API is available
	 * This indicates we're running in the Rumba app environment
	 */
	isRumbaAPIAvailable() {
		try {
			// Check for Rumba constructor (new API)
			const hasRumbaConstructor = typeof window !== 'undefined' && window.Rumba && typeof window.Rumba === 'function'

			// Check for legacy instances/objects
			const hasLegacyRumbaAPI =
				typeof window !== 'undefined' &&
				(window.RumbaJS ||
					window.rumbaJS ||
					window.socketmobile ||
					window.SocketMobile ||
					// Check for Rumba-specific webkit message handlers
					(window.webkit &&
						window.webkit.messageHandlers &&
						(window.webkit.messageHandlers.rumba || window.webkit.messageHandlers.socketmobile || window.webkit.messageHandlers.barcode)))

			const hasAnyRumbaAPI = hasRumbaConstructor || hasLegacyRumbaAPI

			if (this.config.debugLogging) {
				console.log('🔍 Rumba API availability check:', {
					hasRumbaConstructor,
					hasLegacyRumbaAPI,
					hasAnyRumbaAPI,
					hasWebkit: !!window.webkit,
					hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
					userAgent: navigator.userAgent,
					platform: navigator.platform,
				})
			}

			return hasAnyRumbaAPI
		} catch (error) {
			if (this.config.debugLogging) {
				console.log('⚠️ Error checking Rumba API availability:', error.message)
			}
			return false
		}
	}

	/**
	 * Detect if we're running in iOS Safari or Rumba app
	 */
	getEnvironmentInfo() {
		const userAgent = navigator.userAgent || ''
		const platform = navigator.platform || ''

		const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
		const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent)
		const isRumbaApp = this.isRumbaAPIAvailable()

		return {
			isIOS,
			isSafari,
			isRumbaApp,
			userAgent: userAgent.substring(0, 100) + '...', // Truncate for logging
			platform,
			hasWebkit: !!window.webkit,
			hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
		}
	}

	/**
	 * Initialize Rumba SDK service
	 */
	async initialize(onBarcodeCallback, options = {}) {
		this.logger.info('Initializing Rumba SDK Service...')
		this.logger.debug('Initialization attempt:', ++this.initializationAttempts)

		if (this.isInitialized) {
			this.logger.warn('Rumba SDK service already initialized')
			return
		}

		// Merge configuration
		this.config = { ...this.config, ...options }
		this.onBarcodeCallback = onBarcodeCallback

		try {
			// Check environment
			const envInfo = this.getEnvironmentInfo()
			if (this.config.debugLogging) {
				console.log('📱 Environment info:', envInfo)
			}

			// Check if Rumba API is available
			this.isAvailable = this.isRumbaAPIAvailable()

			if (!this.isAvailable) {
				throw new Error('Rumba JavaScript API not available - not running in Rumba app')
			}

			// Initialize Rumba SDK
			await this.initializeRumbaAPI()

			this.isInitialized = true
			this.initializationAttempts = 0

			if (this.config.debugLogging) {
				console.log('✅ Rumba SDK Service initialized successfully')
			}
		} catch (error) {
			const errorMessage = `Rumba SDK initialization failed: ${error.message}`

			// Enhanced error diagnostics
			const diagnostics = {
				attempt: this.initializationAttempts,
				error: {
					message: error.message,
					type: error.constructor.name,
					stack: this.config.debugLogging ? error.stack : null,
				},
				environment: {
					hasRumbaConstructor: typeof window.Rumba === 'function',
					hasRumbaJS: !!window.RumbaJS,
					hasLegacyRumbaJS: !!window.rumbaJS,
					hasWebkit: !!window.webkit,
					domain: this.domain,
					configId: this.configId,
				},
				available: this.isAvailable,
				canRetry: this.initializationAttempts < this.maxRetryAttempts,
				timestamp: new Date().toISOString(),
			}

			if (this.config.debugLogging) {
				console.error('❌ Rumba SDK initialization error:', diagnostics)

				// Provide specific troubleshooting suggestions
				if (!diagnostics.environment.hasRumbaConstructor && !diagnostics.environment.hasRumbaJS) {
					console.error('💡 Troubleshooting: No Rumba API detected. Ensure you are running in Rumba app environment.')
				} else if (error.message.includes('domain')) {
					console.error('💡 Troubleshooting: Domain configuration issue. Check REACT_APP_RUMBA_DOMAIN environment variable.')
				} else if (error.message.includes('configId') || error.message.includes('configuration')) {
					console.error('💡 Troubleshooting: Configuration ID issue. Check REACT_APP_RUMBA_CONFIG_ID environment variable.')
				}
			}

			const enhancedError = new Error(errorMessage)
			enhancedError.type = 'RUMBA_INIT_FAILED'
			enhancedError.attempt = this.initializationAttempts
			enhancedError.canRetry = this.initializationAttempts < this.maxRetryAttempts
			enhancedError.diagnostics = diagnostics
			enhancedError.context = 'rumbaSDK_initialization'

			throw enhancedError
		}
	}

	/**
	 * Initialize the Rumba JavaScript API with multiple fallback strategies
	 */
	async initializeRumbaAPI() {
		const fallbackStrategies = [
			{ name: 'Rumba Constructor', method: () => this.initializeDirectAPI() },
			{ name: 'Global RumbaJS Instance', method: () => this.initializeGlobalRumbaJS() },
			{ name: 'WebKit Message Handlers', method: () => this.initializeWebkitHandlers() },
			{ name: 'Legacy rumbaJS', method: () => this.initializeLegacyAPI() },
			{ name: 'Socket Mobile Bridge', method: () => this.initializeSocketMobileBridge() },
			{ name: 'Polling Detection', method: () => this.initializePollingDetection() },
		]

		let lastError = null
		
		for (const strategy of fallbackStrategies) {
			try {
				if (this.config.debugLogging) {
					console.log(`🔌 Trying ${strategy.name}...`)
				}
				
				await strategy.method()
				
				if (this.config.debugLogging) {
					console.log(`✅ ${strategy.name} successful`)
				}
				return strategy.name
			} catch (error) {
				lastError = error
				if (this.config.debugLogging) {
					console.log(`❌ ${strategy.name} failed:`, error.message)
				}
				continue
			}
		}

		throw new Error(`All Rumba API initialization strategies failed. Last error: ${lastError?.message}`)
	}

	/**
	 * Initialize using direct RumbaJS API with proper constructor
	 */
	async initializeDirectAPI() {
		try {
			// Resolve domain and config ID
			this.domain = this.resolveDomain()
			this.configId = this.resolveConfigId()

			if (this.config.debugLogging) {
				console.log('🔧 Initializing Rumba with parameters:', {
					domain: this.domain,
					configId: this.configId,
				})
			}

			// Create proper Rumba instance according to official documentation
			if (typeof window.Rumba === 'function') {
				// Use the proper constructor with domain and config ID
				this.rumbaInstance = new window.Rumba(this.domain, this.configId)

				if (this.config.debugLogging) {
					console.log('✅ Rumba instance created successfully with constructor')
				}
			} else if (window.RumbaJS) {
				// Fallback to legacy API if constructor not available
				console.warn('⚠️ Using legacy RumbaJS API - proper constructor not available')
				this.rumbaInstance = window.RumbaJS
			} else {
				throw new Error('Neither Rumba constructor nor RumbaJS instance available')
			}

			// Set up barcode scanning callback with verification
			let callbackRegistered = false
			let callbackMethod = null
			
			if (this.rumbaInstance.onBarcodeScanned !== undefined) {
				this.rumbaInstance.onBarcodeScanned = (barcodeData) => {
					this.handleBarcodeScanned(barcodeData)
				}
				callbackRegistered = true
				callbackMethod = 'onBarcodeScanned'
			} else if (this.rumbaInstance.setBarcodeCallback) {
				this.rumbaInstance.setBarcodeCallback((barcodeData) => {
					this.handleBarcodeScanned(barcodeData)
				})
				callbackRegistered = true
				callbackMethod = 'setBarcodeCallback'
			} else {
				throw new Error('No supported barcode callback method found')
			}

			// Verify callback registration
			if (this.config.debugLogging && callbackRegistered) {
				console.log(`✅ Rumba callback registered successfully using: ${callbackMethod}`)
				console.log('📋 Callback verification:', {
					method: callbackMethod,
					hasSystemCallback: !!this.onBarcodeCallback,
					rumbaInstanceMethods: Object.keys(this.rumbaInstance).filter(key => 
						typeof this.rumbaInstance[key] === 'function'
					)
				})
			}

			// Test callback registration by verifying it exists
			this.verifyCallbackRegistration(callbackMethod)

			// Test the callback chain during initialization (optional)
			if (this.config.debugLogging) {
				this.testCallbackChain()
			}

			// Enable barcode scanning if available
			if (this.rumbaInstance.enableBarcodeScanning) {
				await this.rumbaInstance.enableBarcodeScanning(true)
			} else if (this.rumbaInstance.enableScanning) {
				await this.rumbaInstance.enableScanning(true)
			}

			// Get device info if available
			if (this.rumbaInstance.getDeviceInfo) {
				this.deviceInfo = await this.rumbaInstance.getDeviceInfo()
			}

			if (this.config.debugLogging) {
				console.log('✅ Rumba direct API initialized successfully', {
					hasInstance: !!this.rumbaInstance,
					domain: this.domain,
					configId: this.configId,
					deviceInfo: this.deviceInfo,
					availableMethods: Object.keys(this.rumbaInstance || {}).filter((key) => typeof this.rumbaInstance[key] === 'function'),
				})
			}
		} catch (error) {
			// Enhanced error context for direct API initialization
			const errorContext = {
				method: 'initializeDirectAPI',
				domain: this.domain,
				configId: this.configId,
				hasRumbaConstructor: typeof window.Rumba === 'function',
				hasRumbaJS: !!window.RumbaJS,
				hasInstance: !!this.rumbaInstance,
				timestamp: new Date().toISOString(),
			}

			if (this.config.debugLogging) {
				console.error('❌ Direct API initialization failed:', {
					error: error.message,
					context: errorContext,
				})

				// Specific troubleshooting for direct API failures
				if (error.message.includes('Neither Rumba constructor nor RumbaJS')) {
					console.error('💡 Troubleshooting: Rumba API not available. Verify you are in Rumba app environment.')
				} else if (error.message.includes('barcode callback')) {
					console.error('💡 Troubleshooting: Rumba instance does not support expected callback methods. API version mismatch possible.')
				} else if (error.message.includes('domain') || error.message.includes('configId')) {
					console.error('💡 Troubleshooting: Invalid domain or config ID parameters for Rumba constructor.')
				}
			}

			const enhancedError = new Error(`Direct API initialization failed: ${error.message}`)
			enhancedError.context = errorContext
			enhancedError.originalError = error

			throw enhancedError
		}
	}

	/**
	 * Initialize using webkit message handlers
	 */
	async initializeWebkitHandlers() {
		try {
			// Set up global callback for barcode events
			window.rumbaJSCallback = (data) => {
				if (data && data.type === 'barcode' && data.value) {
					this.handleBarcodeScanned(data.value)
				}
			}

			// Try different message handler names
			const handlers = ['rumba', 'socketmobile', 'barcode']
			let activeHandler = null

			for (const handlerName of handlers) {
				if (window.webkit.messageHandlers[handlerName]) {
					activeHandler = window.webkit.messageHandlers[handlerName]
					break
				}
			}

			if (!activeHandler) {
				throw new Error('No compatible webkit message handler found')
			}

			// Send initialization message
			activeHandler.postMessage({
				action: 'initialize',
				config: {
					enableBarcodeScanning: true,
					autoStart: this.config.autoStartScanning,
				},
			})

			if (this.config.debugLogging) {
				console.log('✅ Webkit message handlers initialized')
			}
		} catch (error) {
			throw new Error(`Webkit handlers initialization failed: ${error.message}`)
		}
	}

	/**
	 * Initialize using legacy rumbaJS API
	 */
	async initializeLegacyAPI() {
		if (!window.rumbaJS) {
			throw new Error('Legacy rumbaJS not available')
		}

		try {
			// Set up callback
			window.rumbaJS.setBarcodeCallback((barcodeData) => {
				this.handleBarcodeScanned(barcodeData)
			})

			// Enable scanning
			if (window.rumbaJS.enableScanning) {
				window.rumbaJS.enableScanning(true)
			}

			if (this.config.debugLogging) {
				console.log('✅ Legacy rumbaJS API initialized')
			}
		} catch (error) {
			throw new Error(`Legacy API initialization failed: ${error.message}`)
		}
	}

	/**
	 * Initialize using global RumbaJS instance detection
	 */
	async initializeGlobalRumbaJS() {
		if (!window.RumbaJS && typeof window.Rumba !== 'function') {
			throw new Error('No global Rumba instances found')
		}

		try {
			let rumbaInstance = null

			// Try different global object patterns
			if (window.RumbaJS && typeof window.RumbaJS === 'object') {
				rumbaInstance = window.RumbaJS
			} else if (typeof window.Rumba === 'function') {
				// Use proper constructor with domain and config
				this.domain = this.resolveDomain()
				this.configId = this.resolveConfigId()
				rumbaInstance = new window.Rumba(this.domain, this.configId)
			}

			if (!rumbaInstance) {
				throw new Error('Failed to create Rumba instance')
			}

			this.rumbaInstance = rumbaInstance

			// Set up callback
			if (rumbaInstance.onBarcodeScanned !== undefined) {
				rumbaInstance.onBarcodeScanned = (barcodeData) => {
					this.handleBarcodeScanned(barcodeData)
				}
			} else if (rumbaInstance.setBarcodeCallback) {
				rumbaInstance.setBarcodeCallback((barcodeData) => {
					this.handleBarcodeScanned(barcodeData)
				})
			} else {
				throw new Error('No supported callback method on global RumbaJS instance')
			}

			// Enable scanning
			if (rumbaInstance.enableBarcodeScanning) {
				await rumbaInstance.enableBarcodeScanning(true)
			} else if (rumbaInstance.enableScanning) {
				await rumbaInstance.enableScanning(true)
			}

			if (this.config.debugLogging) {
				console.log('✅ Global RumbaJS instance initialized')
			}
		} catch (error) {
			throw new Error(`Global RumbaJS initialization failed: ${error.message}`)
		}
	}

	/**
	 * Initialize using Socket Mobile bridge detection
	 */
	async initializeSocketMobileBridge() {
		// Check for various Socket Mobile bridge patterns
		const bridgePatterns = [
			'SocketMobile',
			'socketMobile', 
			'SOCKETMOBILE',
			'SMBridge',
			'CaptureSDK'
		]

		let bridgeObject = null
		let bridgeName = null

		for (const pattern of bridgePatterns) {
			if (window[pattern]) {
				bridgeObject = window[pattern]
				bridgeName = pattern
				break
			}
		}

		if (!bridgeObject) {
			throw new Error('No Socket Mobile bridge found')
		}

		try {
			if (this.config.debugLogging) {
				console.log(`Found Socket Mobile bridge: ${bridgeName}`)
			}

			// Try to initialize through the bridge
			if (bridgeObject.initialize) {
				await bridgeObject.initialize({
					onBarcode: (barcodeData) => {
						this.handleBarcodeScanned(barcodeData)
					}
				})
			} else if (bridgeObject.setBarcodeCallback) {
				bridgeObject.setBarcodeCallback((barcodeData) => {
					this.handleBarcodeScanned(barcodeData)
				})
			} else {
				throw new Error(`Bridge ${bridgeName} has no supported initialization method`)
			}

			this.rumbaInstance = bridgeObject

			if (this.config.debugLogging) {
				console.log(`✅ Socket Mobile bridge ${bridgeName} initialized`)
			}
		} catch (error) {
			throw new Error(`Socket Mobile bridge initialization failed: ${error.message}`)
		}
	}

	/**
	 * Initialize using polling detection for late-loading APIs
	 */
	async initializePollingDetection() {
		const maxAttempts = 10
		const pollInterval = 500 // 500ms
		let attempts = 0

		if (this.config.debugLogging) {
			console.log('Starting polling detection for late-loading Rumba APIs...')
		}

		return new Promise((resolve, reject) => {
			const pollForAPI = () => {
				attempts++

				// Check for APIs that might load after page load
				const apiChecks = [
					() => window.Rumba && typeof window.Rumba === 'function',
					() => window.RumbaJS,
					() => window.rumbaJS,
					() => window.webkit && window.webkit.messageHandlers && 
					      (window.webkit.messageHandlers.rumba || window.webkit.messageHandlers.socketmobile)
				]

				for (let i = 0; i < apiChecks.length; i++) {
					try {
						if (apiChecks[i]()) {
							if (this.config.debugLogging) {
								console.log(`✅ Polling detected API after ${attempts} attempts`)
							}
							
							// Try to initialize with the detected API
							this.initializeDirectAPI()
								.then(() => resolve('Polling Detection'))
								.catch((error) => {
									if (attempts >= maxAttempts) {
										reject(new Error(`Polling detection failed after ${maxAttempts} attempts: ${error.message}`))
									} else {
										setTimeout(pollForAPI, pollInterval)
									}
								})
							return
						}
					} catch (error) {
						// Continue to next check
						continue
					}
				}

				if (attempts >= maxAttempts) {
					reject(new Error(`Polling detection timeout after ${maxAttempts} attempts`))
				} else {
					setTimeout(pollForAPI, pollInterval)
				}
			}

			pollForAPI()
		})
	}

	/**
	 * Test the callback chain during initialization
	 */
	testCallbackChain() {
		try {
			if (this.config.debugLogging) {
				console.log('🧪 Testing Rumba callback chain...')
			}

			// Simulate a test barcode scan to verify the callback chain works
			// We'll use a recognizable test barcode that won't interfere with real scanning
			const testBarcode = 'TEST_CALLBACK_' + Date.now()
			
			// Test if we can call our internal callback
			if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
				setTimeout(() => {
					try {
						if (this.config.debugLogging) {
							console.log('🧪 Executing test callback with:', testBarcode)
						}
						
						// Test the callback chain with our fixed parameters
						this.onBarcodeCallback(testBarcode, 'hardware')
						
						if (this.config.debugLogging) {
							console.log('✅ Test callback executed successfully')
						}
					} catch (testError) {
						console.error('❌ Test callback failed:', testError.message)
					}
				}, 100) // Small delay to ensure initialization is complete
			} else {
				console.warn('⚠️ Cannot test callback - no system callback registered')
			}

		} catch (error) {
			console.error('❌ Error testing callback chain:', error.message)
		}
	}

	/**
	 * Verify callback registration was successful
	 */
	verifyCallbackRegistration(callbackMethod) {
		try {
			if (!this.rumbaInstance) {
				throw new Error('No Rumba instance available for callback verification')
			}

			let callbackExists = false
			
			if (callbackMethod === 'onBarcodeScanned') {
				callbackExists = typeof this.rumbaInstance.onBarcodeScanned === 'function'
			} else if (callbackMethod === 'setBarcodeCallback') {
				// For setBarcodeCallback, we can't directly verify, but we can check if method exists
				callbackExists = typeof this.rumbaInstance.setBarcodeCallback === 'function'
			}

			if (this.config.debugLogging) {
				console.log('🔍 Callback registration verification:', {
					method: callbackMethod,
					callbackExists,
					rumbaInstanceType: typeof this.rumbaInstance,
					hasSystemCallback: !!this.onBarcodeCallback
				})
			}

			if (!callbackExists && callbackMethod === 'onBarcodeScanned') {
				console.warn('⚠️ Warning: onBarcodeScanned callback may not be properly registered')
			}

		} catch (error) {
			console.error('❌ Error verifying callback registration:', error.message)
			if (this.config.debugLogging) {
				console.error('Verification error details:', error)
			}
		}
	}

	/**
	 * Update callback history for debugging purposes
	 */
	updateCallbackHistory(barcode, status, error, timestamp) {
		const historyEntry = {
			barcode,
			status,
			error,
			timestamp,
			id: Date.now() + Math.random().toString(36).substr(2, 9)
		}

		this.callbackStats.callbackHistory.unshift(historyEntry)
		
		// Keep only last 20 entries to prevent memory issues
		if (this.callbackStats.callbackHistory.length > 20) {
			this.callbackStats.callbackHistory = this.callbackStats.callbackHistory.slice(0, 20)
		}

		if (this.config.debugLogging) {
			console.log('📝 Updated callback history:', {
				latestEntry: historyEntry,
				historyLength: this.callbackStats.callbackHistory.length
			})
		}
	}

	/**
	 * Handle barcode scanned from Rumba API
	 */
	handleBarcodeScanned(barcodeData) {
		const timestamp = new Date().toISOString()
		
		// Update callback statistics
		this.callbackStats.totalCallbacks++
		this.callbackStats.lastCallbackTime = timestamp
		this.callbackStats.lastBarcode = barcodeData

		if (this.config.debugLogging) {
			console.log('📊 Barcode scanned via Rumba SDK:', {
				data: barcodeData,
				timestamp,
				isScanning: this.isScanning,
				hasCallback: !!this.onBarcodeCallback,
				callbackStats: {
					total: this.callbackStats.totalCallbacks,
					successful: this.callbackStats.successfulCallbacks,
					failed: this.callbackStats.failedCallbacks
				}
			})
		}

		// Update scanning state
		this.isScanning = false

		// Call the registered callback with correct parameters
		if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
			try {
				// Fix: Use 'hardware' as scannerType instead of service name to match expected signature
				// The unified scanner manager expects: (barcode, scannerType) and converts to (barcode, serviceName, scannerType)
				this.onBarcodeCallback(barcodeData, 'hardware')
				
				// Update success statistics
				this.callbackStats.successfulCallbacks++
				this.updateCallbackHistory(barcodeData, 'success', null, timestamp)
				
				if (this.config.debugLogging) {
					console.log('✅ Rumba SDK callback executed successfully')
				}
			} catch (error) {
				// Update failure statistics
				this.callbackStats.failedCallbacks++
				this.updateCallbackHistory(barcodeData, 'error', error.message, timestamp)
				
				console.error('❌ Error executing Rumba SDK callback:', error)
				if (this.config.debugLogging) {
					console.error('Callback error details:', {
						error: error.message,
						stack: error.stack,
						barcodeData,
						callbackType: typeof this.onBarcodeCallback,
						stats: this.callbackStats
					})
				}
			}
		} else {
			// Update failure statistics for missing callback
			this.callbackStats.failedCallbacks++
			this.updateCallbackHistory(barcodeData, 'no_callback', 'No callback registered', timestamp)
			
			console.warn('⚠️ No barcode callback registered in Rumba SDK')
			if (this.config.debugLogging) {
				console.log('Debug: Callback status:', {
					hasCallback: !!this.onBarcodeCallback,
					callbackType: typeof this.onBarcodeCallback,
					barcodeData,
					stats: this.callbackStats
				})
			}
		}
	}

	/**
	 * Start barcode scanning
	 */
	async startScanning(options = {}) {
		if (!this.isInitialized || !this.isAvailable) {
			throw new Error('Rumba SDK not initialized or not available')
		}

		if (this.config.debugLogging) {
			console.log('🎯 Starting Rumba SDK barcode scanning...')
		}

		this.isScanning = true
		this.scanningOptions = options

		try {
			// Method 1: Use our Rumba instance if available
			if (this.rumbaInstance && this.rumbaInstance.startScanning) {
				await this.rumbaInstance.startScanning(options)
				return
			}

			// Method 2: Direct API fallback
			if (window.RumbaJS && window.RumbaJS.startScanning) {
				await window.RumbaJS.startScanning(options)
				return
			}

			// Method 3: Webkit handlers
			if (window.webkit && window.webkit.messageHandlers) {
				const handlers = ['rumba', 'socketmobile', 'barcode']
				for (const handlerName of handlers) {
					const handler = window.webkit.messageHandlers[handlerName]
					if (handler) {
						handler.postMessage({
							action: 'startScanning',
							options,
						})
						return
					}
				}
			}

			// Method 4: Legacy API
			if (window.rumbaJS && window.rumbaJS.startScanning) {
				window.rumbaJS.startScanning(options)
				return
			}

			// If no specific start method, scanning might be auto-enabled
			if (this.config.debugLogging) {
				console.log('✅ Rumba SDK scanning ready (auto-enabled)')
			}

			// Set up timeout for auto-stop
			if (this.config.scanTimeout > 0) {
				setTimeout(() => {
					if (this.isScanning) {
						this.stopScanning()
						if (this.config.debugLogging) {
							console.log('⏰ Rumba SDK scanning timeout')
						}
					}
				}, this.config.scanTimeout)
			}
		} catch (error) {
			this.isScanning = false
			throw new Error(`Failed to start Rumba SDK scanning: ${error.message}`)
		}
	}

	/**
	 * Stop barcode scanning
	 */
	stopScanning() {
		if (this.config.debugLogging) {
			console.log('🛑 Stopping Rumba SDK barcode scanning...')
		}

		this.isScanning = false

		try {
			// Method 1: Use our Rumba instance if available
			if (this.rumbaInstance && this.rumbaInstance.stopScanning) {
				this.rumbaInstance.stopScanning()
				return
			}

			// Method 2: Direct API fallback
			if (window.RumbaJS && window.RumbaJS.stopScanning) {
				window.RumbaJS.stopScanning()
				return
			}

			// Method 3: Webkit handlers
			if (window.webkit && window.webkit.messageHandlers) {
				const handlers = ['rumba', 'socketmobile', 'barcode']
				for (const handlerName of handlers) {
					const handler = window.webkit.messageHandlers[handlerName]
					if (handler) {
						handler.postMessage({ action: 'stopScanning' })
						return
					}
				}
			}

			// Method 4: Legacy API
			if (window.rumbaJS && window.rumbaJS.stopScanning) {
				window.rumbaJS.stopScanning()
				return
			}

			if (this.config.debugLogging) {
				console.log('✅ Rumba SDK scanning stopped')
			}
		} catch (error) {
			console.error('❌ Error stopping Rumba SDK scanning:', error.message)
		}
	}

	/**
	 * Check if currently scanning
	 */
	isCurrentlyScanning() {
		return this.isScanning
	}

	/**
	 * Get service status
	 */
	getStatus() {
		return {
			isInitialized: this.isInitialized,
			isAvailable: this.isAvailable,
			isScanning: this.isScanning,
			deviceInfo: this.deviceInfo,
			attempts: this.initializationAttempts,
			maxAttempts: this.maxRetryAttempts,
			environment: this.getEnvironmentInfo(),
		}
	}

	/**
	 * Get callback monitoring statistics
	 */
	getCallbackStats() {
		return {
			...this.callbackStats,
			successRate: this.callbackStats.totalCallbacks > 0 ? 
				(this.callbackStats.successfulCallbacks / this.callbackStats.totalCallbacks * 100).toFixed(2) + '%' : 'N/A',
			failureRate: this.callbackStats.totalCallbacks > 0 ? 
				(this.callbackStats.failedCallbacks / this.callbackStats.totalCallbacks * 100).toFixed(2) + '%' : 'N/A'
		}
	}

	/**
	 * Reset callback statistics (useful for testing)
	 */
	resetCallbackStats() {
		this.callbackStats = {
			totalCallbacks: 0,
			successfulCallbacks: 0,
			failedCallbacks: 0,
			lastCallbackTime: null,
			lastBarcode: null,
			callbackHistory: []
		}
		
		if (this.config.debugLogging) {
			console.log('🔄 Callback statistics reset')
		}
	}

	/**
	 * Test individual initialization strategies for debugging
	 */
	async testInitializationStrategy(strategyName) {
		const strategies = {
			'Rumba Constructor': () => this.initializeDirectAPI(),
			'Global RumbaJS Instance': () => this.initializeGlobalRumbaJS(),
			'WebKit Message Handlers': () => this.initializeWebkitHandlers(),
			'Legacy rumbaJS': () => this.initializeLegacyAPI(),
			'Socket Mobile Bridge': () => this.initializeSocketMobileBridge(),
			'Polling Detection': () => this.initializePollingDetection(),
		}

		if (!strategies[strategyName]) {
			throw new Error(`Unknown strategy: ${strategyName}`)
		}

		if (this.config.debugLogging) {
			console.log(`🧪 Testing strategy: ${strategyName}`)
		}

		try {
			await strategies[strategyName]()
			return {
				success: true,
				strategy: strategyName,
				message: `${strategyName} initialization successful`
			}
		} catch (error) {
			return {
				success: false,
				strategy: strategyName,
				error: error.message,
				message: `${strategyName} initialization failed: ${error.message}`
			}
		}
	}

	/**
	 * Get available initialization strategies
	 */
	getAvailableStrategies() {
		return [
			'Rumba Constructor',
			'Global RumbaJS Instance', 
			'WebKit Message Handlers',
			'Legacy rumbaJS',
			'Socket Mobile Bridge',
			'Polling Detection'
		]
	}

	/**
	 * Get comprehensive diagnostics
	 */
	getDiagnostics() {
		return {
			service: {
				isInitialized: this.isInitialized,
				isAvailable: this.isAvailable,
				isScanning: this.isScanning,
				attempts: this.initializationAttempts,
				maxAttempts: this.maxRetryAttempts,
			},
			api: {
				hasRumbaConstructor: typeof window.Rumba === 'function',
				hasRumbaJS: !!window.RumbaJS,
				hasLegacyRumbaJS: !!window.rumbaJS,
				hasWebkit: !!window.webkit,
				hasMessageHandlers: !!(window.webkit && window.webkit.messageHandlers),
				messageHandlers: window.webkit && window.webkit.messageHandlers ? Object.keys(window.webkit.messageHandlers) : [],
			},
			rumbaInstance: {
				hasInstance: !!this.rumbaInstance,
				domain: this.domain,
				configId: this.configId,
				availableMethods: this.rumbaInstance ? Object.keys(this.rumbaInstance).filter((key) => typeof this.rumbaInstance[key] === 'function') : [],
			},
			device: {
				deviceInfo: this.deviceInfo,
				userAgent: navigator.userAgent,
				platform: navigator.platform,
			},
			callback: {
				hasCallback: this.onBarcodeCallback !== null,
				callbackType: typeof this.onBarcodeCallback,
				stats: this.callbackStats,
				successRate: this.callbackStats.totalCallbacks > 0 ? 
					(this.callbackStats.successfulCallbacks / this.callbackStats.totalCallbacks * 100).toFixed(2) + '%' : 'N/A',
				recentHistory: this.callbackStats.callbackHistory.slice(0, 5) // Last 5 entries
			},
			environment: this.getEnvironmentInfo(),
			timestamp: new Date().toISOString(),
		}
	}

	/**
	 * Cleanup resources
	 */
	async cleanup() {
		if (this.config.debugLogging) {
			console.log('🧹 Cleaning up Rumba SDK Service...')
		}

		// Stop scanning if running
		if (this.isScanning) {
			this.stopScanning()
		}

		// Clean up global callbacks
		if (window.rumbaJSCallback) {
			delete window.rumbaJSCallback
		}

		// Clean up Rumba instance
		if (this.rumbaInstance) {
			try {
				// Try to properly cleanup the instance if it has cleanup methods
				if (this.rumbaInstance.cleanup) {
					this.rumbaInstance.cleanup()
				} else if (this.rumbaInstance.destroy) {
					this.rumbaInstance.destroy()
				}
			} catch (error) {
				console.warn('⚠️ Error cleaning up Rumba instance:', error.message)
			}
			this.rumbaInstance = null
		}

		// Reset state
		this.isInitialized = false
		this.isAvailable = false
		this.isScanning = false
		this.onBarcodeCallback = null
		this.deviceInfo = null
		this.initializationAttempts = 0
		this.scanningOptions = null
		this.domain = null
		this.configId = null

		// Reset callback statistics
		this.resetCallbackStats()

		if (this.config.debugLogging) {
			console.log('✅ Rumba SDK Service cleanup complete')
		}
	}

	/**
	 * Retry initialization
	 */
	async retryInitialization(onBarcodeCallback, options = {}) {
		if (this.initializationAttempts >= this.maxRetryAttempts) {
			throw new Error(`Maximum retry attempts (${this.maxRetryAttempts}) exceeded`)
		}

		if (this.config.debugLogging) {
			console.log(`⏱️ Retrying Rumba SDK initialization in ${this.config.retryDelay}ms...`)
		}

		await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay))
		return this.initialize(onBarcodeCallback, options)
	}
}

// Export singleton instance
export const rumbaSDKService = new RumbaSDKService()
export default rumbaSDKService
