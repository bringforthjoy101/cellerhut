/**
 * Unified Scanner Manager
 * Intelligently manages barcode scanning across different platforms and environments
 * Handles keyboard wedge and browser API scanning
 */

import platformDetectionService from './platformDetectionService'
import keyboardWedgeScanner from './keyboardWedgeScanner'
import browserBarcodeScanner from './browserBarcodeScanner'
import scannerDiagnosticsService from './scannerDiagnosticsService'
import { PerformantLogger } from '../utils/performantLogger'

class UnifiedScannerManager {
	constructor() {
		this.isInitialized = false
		this.isInitializing = false
		this.activeScannerService = null
		this.onBarcodeCallback = null
		this.initializationAttempts = 0
		this.maxRetryAttempts = 3

		// Scanner service instances
		this.services = {
			keyboardWedge: keyboardWedgeScanner,
			browserAPI: browserBarcodeScanner,
		}

		// Service status tracking
		this.serviceStatus = {
			keyboardWedge: { available: false, initialized: false, error: null },
			browserAPI: { available: false, initialized: false, error: null },
		}

		// Platform information
		this.platformInfo = null

		// Error tracking and recovery
		this.errorHistory = []
		this.maxErrorHistory = 20
		this.lastError = null
		this.errorRecoveryAttempts = 0
		this.maxErrorRecoveryAttempts = 3

		// Performance-optimized logger
		this.logger = new PerformantLogger('UNIFIED_SCANNER')

		// Configuration - optimized for performance
		this.config = {
			debugLogging: process.env.REACT_APP_DEBUG_SCANNERS === 'true' || process.env.NODE_ENV === 'development',
			enableAutomaticFallback: true,
			enablePlatformOptimizedSelection: true,
			enableErrorRecovery: true,
			enableDiagnostics: true,
			priorityOrder: ['keyboardWedge', 'browserAPI'],
			errorRecoveryDelay: 2000, // 2 seconds
			keyboardWedgeOptions: {
				minBarcodeLength: 3,
				maxBarcodeLength: 50,
				interCharTimeout: 20,
			},
			browserAPIOptions: {
				preferredFormats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e'],
			},
		}
	}

	/**
	 * Initialize the unified scanner manager
	 */
	async initialize(onBarcodeCallback, options = {}) {
		this.logger.info('Initializing Unified Scanner Manager...')
		this.logger.debug('Initialization attempt:', ++this.initializationAttempts)

		if (this.isInitialized) {
			this.logger.warn('Unified Scanner Manager already initialized')
			return
		}

		if (this.isInitializing) {
			this.logger.warn('Unified Scanner Manager is currently initializing')
			return
		}

		this.isInitializing = true

		try {
			// Merge configuration
			this.config = { ...this.config, ...options }
			this.onBarcodeCallback = onBarcodeCallback

			// Get platform information
			this.platformInfo = platformDetectionService.getPlatformInfo()

			if (this.config.debugLogging) {
				console.log('📱 Platform Info:', {
					environment: this.platformInfo.environment.app.context,
					recommended: this.platformInfo.recommendation.primary?.service,
					availableAPIs: Object.keys(this.platformInfo.scannerAPIs).filter((api) => this.platformInfo.scannerAPIs[api].available),
				})
			}

			// Initialize scanner services based on platform
			await this.initializeScannerServices()

			// Select the best available scanner service
			this.activeScannerService = this.selectBestScannerService()

			if (!this.activeScannerService) {
				throw new Error('No compatible scanner services available')
			}

			this.isInitialized = true
			this.initializationAttempts = 0

			if (this.config.debugLogging) {
				console.log('✅ Unified Scanner Manager initialized successfully')
				console.log('🎯 Active scanner service:', this.activeScannerService)
				console.log('📊 Service status:', this.getServiceStatusSummary())
			}
		} catch (error) {
			const errorMessage = `Unified Scanner Manager initialization failed: ${error.message}`

			// Use enhanced error handling
			this.handleError(error, {
				context: 'initialization',
				attempt: this.initializationAttempts,
				platformInfo: this.platformInfo?.environment?.app?.context,
			})

			const enhancedError = new Error(errorMessage)
			enhancedError.type = 'UNIFIED_MANAGER_INIT_FAILED'
			enhancedError.attempt = this.initializationAttempts
			enhancedError.canRetry = this.initializationAttempts < this.maxRetryAttempts

			throw enhancedError
		} finally {
			this.isInitializing = false
		}
	}

	/**
	 * Initialize scanner services based on platform detection and recommendations
	 */
	async initializeScannerServices() {
		const platformInfo = this.platformInfo
		const initPromises = []

		// Priority 1: Always try keyboard wedge first as it's most reliable
		if (this.config.debugLogging) {
			console.log(`🎯 Initializing primary service: keyboardWedge`)
		}
		initPromises.push(this.initializeSpecificService('keyboardWedge', true))

		// Priority 2: Initialize browser API as fallback
		if (this.config.debugLogging) {
			console.log(`🔄 Initializing alternative service: browserAPI`)
		}
		initPromises.push(this.initializeSpecificService('browserAPI', false))

		// Wait for all initialization attempts
		const results = await Promise.allSettled(initPromises)

		if (this.config.debugLogging) {
			const successful = results.filter((r) => r.status === 'fulfilled').length
			const failed = results.filter((r) => r.status === 'rejected').length
			console.log(`📊 Service initialization complete: ${successful} successful, ${failed} failed`)
		}
	}

	/**
	 * Initialize a specific scanner service
	 */
	async initializeSpecificService(serviceName, isPrimary = false) {
		const service = this.services[serviceName]
		if (!service) {
			throw new Error(`Unknown scanner service: ${serviceName}`)
		}

		try {
			this.logger.debug(`Initializing ${serviceName} service...`)

			// Create wrapped callback that identifies the source service
			const wrappedCallback = (barcode, scannerType) => {
				this.handleBarcodeScanned(barcode, serviceName, scannerType)
			}

			// Get service-specific options
			const serviceOptions = this.getServiceOptions(serviceName)

			// Initialize the service
			switch (serviceName) {
				case 'keyboardWedge':
					keyboardWedgeScanner.initialize(wrappedCallback, serviceOptions)
					break

				case 'browserAPI':
					await browserBarcodeScanner.initialize(wrappedCallback, serviceOptions)
					break

				default:
					throw new Error(`Unsupported service: ${serviceName}`)
			}

			// Update service status
			this.serviceStatus[serviceName] = {
				available: true,
				initialized: true,
				error: null,
				isPrimary,
			}

			this.logger.info(`${serviceName} service initialized successfully`)
		} catch (error) {
			// Update service status with error
			this.serviceStatus[serviceName] = {
				available: false,
				initialized: false,
				error: error.message,
				isPrimary,
			}

			this.logger.error(`${serviceName} service initialization failed:`, error.message)

			// Re-throw error for primary services, log for alternatives
			if (isPrimary) {
				throw error
			}
		}
	}

	/**
	 * Get service-specific configuration options
	 */
	getServiceOptions(serviceName) {
		switch (serviceName) {
			case 'keyboardWedge':
				return { ...this.config.keyboardWedgeOptions, debugLogging: this.config.debugLogging }
			case 'browserAPI':
				return { ...this.config.browserAPIOptions, debugLogging: this.config.debugLogging }
			default:
				return { debugLogging: this.config.debugLogging }
		}
	}

	/**
	 * Select the best available scanner service
	 */
	selectBestScannerService() {
		// Always prefer keyboard wedge if available
		if (this.serviceStatus.keyboardWedge?.initialized) {
			if (this.config.debugLogging) {
				console.log(`🎯 Selected primary service: keyboardWedge`)
			}
			return 'keyboardWedge'
		}

		// Fallback to browser API
		if (this.serviceStatus.browserAPI?.initialized) {
			if (this.config.debugLogging) {
				console.log(`🔄 Selected alternative service: browserAPI`)
			}
			return 'browserAPI'
		}

		return null
	}

	/**
	 * Handle barcode scanned from any service
	 */
	handleBarcodeScanned(barcode, serviceName, scannerType) {
		this.logger.debug(`Barcode scanned via ${serviceName}:`, {
			barcode,
			serviceName,
			scannerType,
			timestamp: new Date().toISOString(),
		})

		// Call the main callback with service information
		if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
			this.onBarcodeCallback(barcode, serviceName, scannerType)
		} else {
			this.logger.warn('No barcode callback registered in Unified Scanner Manager')
		}
	}

	/**
	 * Start scanning with the active scanner service
	 */
	async startScanning(options = {}) {
		if (!this.isInitialized) {
			throw new Error('Unified Scanner Manager not initialized')
		}

		if (!this.activeScannerService) {
			throw new Error('No active scanner service available')
		}

		if (this.config.debugLogging) {
			console.log(`🎯 Starting scanning with ${this.activeScannerService} service...`)
		}

		try {
			const service = this.services[this.activeScannerService]

			switch (this.activeScannerService) {
				case 'keyboardWedge':
					// Keyboard wedge doesn't need explicit start - it's always listening
					if (this.config.debugLogging) {
						console.log('✅ Keyboard wedge scanner ready (always listening)')
					}
					break

				case 'browserAPI':
					if (!options.videoElement || !options.canvasElement) {
						throw new Error('Video and canvas elements required for browser API scanning')
					}
					await browserBarcodeScanner.startScanning(options.videoElement, options.canvasElement)
					break

				default:
					throw new Error(`Unknown active scanner service: ${this.activeScannerService}`)
			}

			if (this.config.debugLogging) {
				console.log(`✅ Scanning started with ${this.activeScannerService}`)
			}

			return this.activeScannerService
		} catch (error) {
			console.error(`❌ Failed to start scanning with ${this.activeScannerService}:`, error.message)

			// Try fallback service if enabled
			if (this.config.enableAutomaticFallback) {
				return this.tryFallbackScanning(options, error)
			}

			throw error
		}
	}

	/**
	 * Try fallback scanning when primary service fails
	 */
	async tryFallbackScanning(options, originalError) {
		if (this.config.debugLogging) {
			console.log('🔄 Attempting fallback scanning...')
		}

		// Get list of available fallback services
		const fallbackServices = this.config.priorityOrder.filter(
			(service) => service !== this.activeScannerService && this.serviceStatus[service]?.initialized
		)

		for (const fallbackService of fallbackServices) {
			try {
				if (this.config.debugLogging) {
					console.log(`🔄 Trying fallback service: ${fallbackService}`)
				}

				// Temporarily switch to fallback service
				const originalService = this.activeScannerService
				this.activeScannerService = fallbackService

				await this.startScanning(options)

				if (this.config.debugLogging) {
					console.log(`✅ Fallback successful: ${fallbackService}`)
				}

				return fallbackService
			} catch (fallbackError) {
				if (this.config.debugLogging) {
					console.log(`❌ Fallback ${fallbackService} failed:`, fallbackError.message)
				}
				continue
			}
		}

		// If all fallbacks failed, restore original service and throw
		this.activeScannerService = this.selectBestScannerService()
		throw new Error(`All scanner services failed. Original error: ${originalError.message}`)
	}

	/**
	 * Stop scanning
	 */
	stopScanning() {
		if (!this.activeScannerService) {
			return
		}

		if (this.config.debugLogging) {
			console.log(`🛑 Stopping scanning with ${this.activeScannerService}...`)
		}

		try {
			switch (this.activeScannerService) {
				case 'keyboardWedge':
					// Keyboard wedge doesn't need explicit stop
					break

				case 'browserAPI':
					browserBarcodeScanner.stopScanning()
					break
			}

			if (this.config.debugLogging) {
				console.log(`✅ Scanning stopped for ${this.activeScannerService}`)
			}
		} catch (error) {
			console.error(`❌ Error stopping ${this.activeScannerService}:`, error.message)
		}
	}

	/**
	 * Switch to a specific scanner service
	 */
	async switchToService(serviceName, options = {}) {
		if (!this.serviceStatus[serviceName]?.initialized) {
			throw new Error(`Scanner service ${serviceName} is not initialized`)
		}

		if (this.config.debugLogging) {
			console.log(`🔄 Switching from ${this.activeScannerService} to ${serviceName}`)
		}

		// Stop current service
		this.stopScanning()

		// Switch active service
		this.activeScannerService = serviceName

		// Start new service if options provided
		if (Object.keys(options).length > 0) {
			await this.startScanning(options)
		}

		return serviceName
	}

	/**
	 * Get comprehensive status information
	 */
	getStatus() {
		return {
			isInitialized: this.isInitialized,
			isInitializing: this.isInitializing,
			activeScannerService: this.activeScannerService,
			serviceStatus: { ...this.serviceStatus },
			platformInfo: this.platformInfo
				? {
						environment: this.platformInfo.environment.app.context,
						recommendedService: this.platformInfo.recommendation.primary?.service,
						availableAPIs: Object.keys(this.platformInfo.scannerAPIs).filter((api) => this.platformInfo.scannerAPIs[api].available),
				  }
				: null,
			initializationAttempts: this.initializationAttempts,
			maxRetryAttempts: this.maxRetryAttempts,
		}
	}

	/**
	 * Get service status summary
	 */
	getServiceStatusSummary() {
		const initialized = Object.keys(this.serviceStatus).filter((service) => this.serviceStatus[service].initialized)
		const failed = Object.keys(this.serviceStatus).filter((service) => this.serviceStatus[service].error !== null)

		return {
			initializedServices: initialized,
			failedServices: failed,
			activeService: this.activeScannerService,
			totalServices: Object.keys(this.serviceStatus).length,
		}
	}

	/**
	 * Get comprehensive diagnostics
	 */
	getDiagnostics() {
		return {
			manager: {
				isInitialized: this.isInitialized,
				isInitializing: this.isInitializing,
				activeScannerService: this.activeScannerService,
				initializationAttempts: this.initializationAttempts,
			},
			services: Object.keys(this.services).map((serviceName) => ({
				name: serviceName,
				status: this.serviceStatus[serviceName],
				diagnostics: this.services[serviceName].getDiagnostics ? this.services[serviceName].getDiagnostics() : null,
			})),
			platform: this.platformInfo ? platformDetectionService.getDiagnosticSummary() : null,
			configuration: {
				enableAutomaticFallback: this.config.enableAutomaticFallback,
				enablePlatformOptimizedSelection: this.config.enablePlatformOptimizedSelection,
				priorityOrder: this.config.priorityOrder,
			},
			timestamp: new Date().toISOString(),
		}
	}

	/**
	 * Retry failed scanner services
	 */
	async retryFailedServices() {
		if (this.config.debugLogging) {
			console.log('🔄 Retrying failed scanner services...')
		}

		const failedServices = Object.keys(this.serviceStatus).filter((service) => this.serviceStatus[service].error !== null)

		if (failedServices.length === 0) {
			if (this.config.debugLogging) {
				console.log('✅ No failed services to retry')
			}
			return
		}

		const retryPromises = failedServices.map((serviceName) => this.initializeSpecificService(serviceName, false))

		await Promise.allSettled(retryPromises)

		// Update active service if current one failed
		if (!this.serviceStatus[this.activeScannerService]?.initialized) {
			this.activeScannerService = this.selectBestScannerService()
		}

		if (this.config.debugLogging) {
			console.log('🔄 Service retry complete. Status:', this.getServiceStatusSummary())
		}
	}

	/**
	 * Cleanup all resources
	 */
	async cleanup() {
		if (this.config.debugLogging) {
			console.log('🧹 Cleaning up Unified Scanner Manager...')
		}

		// Stop scanning
		this.stopScanning()

		// Cleanup individual services
		const cleanupPromises = Object.keys(this.services).map((serviceName) => {
			const service = this.services[serviceName]
			if (service && service.cleanup && this.serviceStatus[serviceName]?.initialized) {
				return service.cleanup().catch((error) => {
					console.error(`❌ Error cleaning up ${serviceName}:`, error.message)
				})
			}
			return Promise.resolve()
		})

		await Promise.allSettled(cleanupPromises)

		// Reset state
		this.isInitialized = false
		this.isInitializing = false
		this.activeScannerService = null
		this.onBarcodeCallback = null
		this.initializationAttempts = 0
		this.platformInfo = null

		// Reset service status
		Object.keys(this.serviceStatus).forEach((serviceName) => {
			this.serviceStatus[serviceName] = {
				available: false,
				initialized: false,
				error: null,
			}
		})

		if (this.config.debugLogging) {
			console.log('✅ Unified Scanner Manager cleanup complete')
		}
	}

	/**
	 * Handle and track errors with recovery mechanisms
	 */
	handleError(error, context = {}) {
		const errorInfo = {
			timestamp: new Date().toISOString(),
			error: {
				message: error.message,
				type: error.constructor.name,
				stack: error.stack,
			},
			context,
			recoveryAttempts: this.errorRecoveryAttempts,
		}

		// Add to error history
		this.errorHistory.unshift(errorInfo)
		if (this.errorHistory.length > this.maxErrorHistory) {
			this.errorHistory = this.errorHistory.slice(0, this.maxErrorHistory)
		}

		this.lastError = errorInfo

		if (this.config.debugLogging) {
			console.error('❌ Unified Scanner Manager Error:', errorInfo)
		}

		// Attempt error recovery if enabled
		if (this.config.enableErrorRecovery && this.errorRecoveryAttempts < this.maxErrorRecoveryAttempts) {
			this.attemptErrorRecovery(errorInfo)
		}

		return errorInfo
	}

	/**
	 * Attempt to recover from errors
	 */
	async attemptErrorRecovery(errorInfo) {
		this.errorRecoveryAttempts++

		if (this.config.debugLogging) {
			console.log(`🔄 Attempting error recovery (attempt ${this.errorRecoveryAttempts}/${this.maxErrorRecoveryAttempts})...`)
		}

		try {
			// Wait before recovery attempt
			await new Promise((resolve) => setTimeout(resolve, this.config.errorRecoveryDelay))

			// Strategy 1: Retry failed services
			if (errorInfo.context.serviceName) {
				await this.retrySpecificService(errorInfo.context.serviceName)
			} else {
				// Strategy 2: Retry all failed services
				await this.retryFailedServices()
			}

			// Strategy 3: Switch to fallback service if available
			if (!this.activeScannerService || !this.serviceStatus[this.activeScannerService]?.initialized) {
				const fallbackService = this.selectBestScannerService()
				if (fallbackService) {
					this.activeScannerService = fallbackService
					if (this.config.debugLogging) {
						console.log(`🔄 Switched to fallback service: ${fallbackService}`)
					}
				}
			}

			// Reset error recovery counter on successful recovery
			this.errorRecoveryAttempts = 0
			this.lastError = null

			if (this.config.debugLogging) {
				console.log('✅ Error recovery successful')
			}
		} catch (recoveryError) {
			if (this.config.debugLogging) {
				console.error('❌ Error recovery failed:', recoveryError.message)
			}

			// If all recovery attempts failed, run diagnostics
			if (this.errorRecoveryAttempts >= this.maxErrorRecoveryAttempts && this.config.enableDiagnostics) {
				this.runEmergencyDiagnostics()
			}
		}
	}

	/**
	 * Retry a specific service
	 */
	async retrySpecificService(serviceName) {
		if (this.config.debugLogging) {
			console.log(`🔄 Retrying specific service: ${serviceName}`)
		}

		await this.initializeSpecificService(serviceName, false)
	}

	/**
	 * Run emergency diagnostics when all recovery attempts fail
	 */
	async runEmergencyDiagnostics() {
		if (this.config.debugLogging) {
			console.log('🚨 Running emergency diagnostics...')
		}

		try {
			const diagnostics = await scannerDiagnosticsService.runFullDiagnostics()

			if (this.config.debugLogging) {
				console.log('📊 Emergency diagnostics complete:', {
					issues: diagnostics.commonIssues?.length || 0,
					recommendations: diagnostics.recommendations?.length || 0,
					summary: scannerDiagnosticsService.createDiagnosticsSummary(diagnostics),
				})
			}

			return diagnostics
		} catch (diagnosticsError) {
			console.error('❌ Emergency diagnostics failed:', diagnosticsError.message)
			return null
		}
	}

	/**
	 * Get error history and diagnostics
	 */
	getErrorDiagnostics() {
		return {
			lastError: this.lastError,
			errorHistory: [...this.errorHistory],
			errorRecoveryAttempts: this.errorRecoveryAttempts,
			maxErrorRecoveryAttempts: this.maxErrorRecoveryAttempts,
			totalErrors: this.errorHistory.length,
			recentErrors: this.errorHistory.slice(0, 5), // Last 5 errors
			errorTypes: this.getErrorTypeStatistics(),
			recoveryStatus: {
				enabled: this.config.enableErrorRecovery,
				attemptsRemaining: Math.max(0, this.maxErrorRecoveryAttempts - this.errorRecoveryAttempts),
			},
		}
	}

	/**
	 * Get error type statistics
	 */
	getErrorTypeStatistics() {
		const typeStats = {}

		this.errorHistory.forEach((errorInfo) => {
			const type = errorInfo.error.type
			typeStats[type] = (typeStats[type] || 0) + 1
		})

		return typeStats
	}

	/**
	 * Clear error history
	 */
	clearErrorHistory() {
		this.errorHistory = []
		this.lastError = null
		this.errorRecoveryAttempts = 0

		if (this.config.debugLogging) {
			console.log('🗑️ Error history cleared')
		}
	}

	/**
	 * Enhanced diagnostics integration
	 */
	async runDiagnostics() {
		if (!this.config.enableDiagnostics) {
			return null
		}

		try {
			return await scannerDiagnosticsService.runFullDiagnostics()
		} catch (error) {
			this.handleError(error, { context: 'diagnostics' })
			return null
		}
	}

	/**
	 * Get health status
	 */
	getHealthStatus() {
		const statusSummary = this.getServiceStatusSummary()
		const errorDiagnostics = this.getErrorDiagnostics()
		const recentErrors = errorDiagnostics.recentErrors.length

		let health = 'healthy'
		const issues = []

		if (!this.isInitialized) {
			health = 'critical'
			issues.push('Manager not initialized')
		} else if (statusSummary.initializedServices.length === 0) {
			health = 'critical'
			issues.push('No scanner services available')
		} else if (recentErrors > 3) {
			health = 'degraded'
			issues.push(`${recentErrors} recent errors`)
		} else if (statusSummary.failedServices.length > 0) {
			health = 'degraded'
			issues.push(`${statusSummary.failedServices.length} failed services`)
		}

		return {
			status: health,
			issues,
			services: {
				total: statusSummary.totalServices,
				initialized: statusSummary.initializedServices.length,
				failed: statusSummary.failedServices.length,
				active: statusSummary.activeService,
			},
			errors: {
				recent: recentErrors,
				total: errorDiagnostics.totalErrors,
				recoveryEnabled: errorDiagnostics.recoveryStatus.enabled,
			},
			timestamp: new Date().toISOString(),
		}
	}
}

// Export singleton instance
export const unifiedScannerManager = new UnifiedScannerManager()
export default unifiedScannerManager