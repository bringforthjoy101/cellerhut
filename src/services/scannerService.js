import { Capture, CaptureEventIds, SktErrors } from 'socketmobile-capturejs'

class ScannerService {
  constructor() {
    this.capture = null
    this.captureDevice = null
    this.isInitialized = false
    this.onDecodedDataCallback = null
    this.initializationAttempts = 0
    this.maxRetryAttempts = 3
  }

  // Check if Socket Mobile Companion service is available
  async checkCompanionService() {
    try {
      const testCapture = new Capture()
      const testResult = await testCapture.open({ 
        appId: 'test', 
        developerId: 'test', 
        appKey: 'test' 
      }, () => {})
      await testCapture.close()
      return true
    } catch (error) {
      console.log('Companion service check failed:', error)
      return false
    }
  }

  // Log environment variables safely (without exposing sensitive data)
  logEnvironmentCheck() {
    const envVars = {
      appId: process.env.REACT_APP_SOCKETMOBILE_APP_ID ? 'SET' : 'MISSING',
      developerId: process.env.REACT_APP_SOCKETMOBILE_DEVELOPER_ID ? 'SET' : 'MISSING',
      appKey: process.env.REACT_APP_SOCKETMOBILE_APP_KEY ? 'SET' : 'MISSING'
    }
    console.log('Scanner Environment Variables Check:', envVars)
    
    if (process.env.REACT_APP_SOCKETMOBILE_APP_ID) {
      console.log('App ID starts with:', process.env.REACT_APP_SOCKETMOBILE_APP_ID.substring(0, 10) + '...')
    }
    
    return envVars.appId === 'SET' && envVars.developerId === 'SET' && envVars.appKey === 'SET'
  }

  // Get detailed error message based on error type
  getDetailedErrorMessage(error) {
    console.log('Scanner error details:', {
      error,
      errorType: typeof error,
      errorMessage: error?.message,
      errorCode: error?.code,
      isSocketMobileError: Object.values(SktErrors).includes(error)
    })

    if (error === SktErrors.ESKT_UNABLEOPENDEVICE) {
      return {
        type: 'SERVICE_UNAVAILABLE',
        message: 'Socket Mobile Companion service is not running. Please start the Companion app and try again.',
        solution: 'Start Socket Mobile Companion service'
      }
    }
    
    if (error === SktErrors.ESKT_INVALIDAPPKEY) {
      return {
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid app credentials. Please check your Socket Mobile app configuration.',
        solution: 'Verify app ID, developer ID, and app key'
      }
    }
    
    if (error === SktErrors.ESKT_NOTSUPPORTED) {
      return {
        type: 'NOT_SUPPORTED',
        message: 'Scanner functionality is not supported on this device or browser.',
        solution: 'Use a supported device and browser'
      }
    }

    if (error?.message?.includes('network') || error?.message?.includes('connection')) {
      return {
        type: 'CONNECTION_ERROR',
        message: 'Unable to connect to scanner service. Check your network connection.',
        solution: 'Check network connection and retry'
      }
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown scanner initialization error occurred.',
      solution: 'Try refreshing the page or restart the application'
    }
  }

  // Initialize the scanner service with app credentials
  async initialize(appInfo, onDecodedData) {
    console.log('🔄 Starting scanner initialization...')
    console.log('Initialization attempt:', ++this.initializationAttempts)
    
    if (this.isInitialized) {
      console.warn('⚠️ Scanner service is already initialized')
      return
    }

    // Check environment variables
    const envCheck = this.logEnvironmentCheck()
    if (!envCheck) {
      const error = new Error('Missing required environment variables for Scanner configuration')
      console.error('❌ Environment check failed')
      throw error
    }

    // Log app info (safely)
    console.log('📱 App Info Check:', {
      appId: appInfo.appId ? appInfo.appId.substring(0, 15) + '...' : 'MISSING',
      developerId: appInfo.developerId ? appInfo.developerId.substring(0, 15) + '...' : 'MISSING',
      appKey: appInfo.appKey ? 'SET (' + appInfo.appKey.length + ' chars)' : 'MISSING'
    })

    try {
      console.log('🔌 Creating Capture instance...')
      this.capture = new Capture()
      this.onDecodedDataCallback = onDecodedData

      console.log('🚀 Opening Capture with app credentials...')
      const result = await this.capture.open(appInfo, this.handleCaptureEvent.bind(this))
      
      console.log('✅ Capture opened successfully:', result)
      this.isInitialized = true
      this.initializationAttempts = 0 // Reset counter on success
      
    } catch (error) {
      const errorDetails = this.getDetailedErrorMessage(error)
      console.error('❌ Scanner initialization failed:', {
        attempt: this.initializationAttempts,
        errorType: errorDetails.type,
        errorMessage: errorDetails.message,
        solution: errorDetails.solution,
        originalError: error
      })

      // Enhanced error throwing with more context
      const enhancedError = new Error(errorDetails.message)
      enhancedError.type = errorDetails.type
      enhancedError.solution = errorDetails.solution
      enhancedError.attempt = this.initializationAttempts
      enhancedError.canRetry = this.initializationAttempts < this.maxRetryAttempts
      
      throw enhancedError
    }
  }

  // Retry initialization with exponential backoff
  async retryInitialization(appInfo, onDecodedData, delayMs = 1000) {
    if (this.initializationAttempts >= this.maxRetryAttempts) {
      throw new Error(`Maximum retry attempts (${this.maxRetryAttempts}) exceeded`)
    }

    console.log(`⏱️ Retrying initialization in ${delayMs}ms...`)
    await new Promise(resolve => setTimeout(resolve, delayMs))
    
    return this.initialize(appInfo, onDecodedData)
  }

  // Handle all capture events
  async handleCaptureEvent(event, handle) {
    if (!event) {
      console.warn('⚠️ Received empty capture event')
      return
    }

    console.log('📡 Capture event received:', {
      eventId: event.id,
      eventType: this.getEventTypeName(event.id),
      hasValue: !!event.value
    })

    try {
      switch (event.id) {
        case CaptureEventIds.DeviceArrival:
          console.log('🔌 Scanner device connected:', {
            guid: event.value?.guid,
            name: event.value?.name,
            type: event.value?.type
          })
          
          // Open the device when it arrives
          this.captureDevice = new Capture()
          await this.captureDevice.openDevice(event.value.guid, this.capture)
          console.log('✅ Scanner device opened successfully')
          break

        case CaptureEventIds.DeviceRemoval:
          console.log('🔌 Scanner device disconnected:', {
            guid: event.value?.guid,
            name: event.value?.name
          })
          this.captureDevice = null
          break

        case CaptureEventIds.DecodedData:
          console.log('📊 Barcode scanned successfully:', {
            data: event.value?.data,
            dataLength: event.value?.data?.length,
            symbolType: event.value?.symbolType,
            timestamp: new Date().toISOString()
          })
          
          // Call the callback with the scanned data
          if (this.onDecodedDataCallback) {
            this.onDecodedDataCallback(event.value.data)
          } else {
            console.warn('⚠️ No barcode callback registered')
          }
          break

        case CaptureEventIds.Error:
          console.error('❌ Scanner error event:', event.value)
          break

        default:
          console.log('❓ Unhandled capture event:', {
            eventId: event.id,
            eventType: this.getEventTypeName(event.id),
            value: event.value
          })
      }
    } catch (error) {
      console.error('❌ Error handling capture event:', {
        eventId: event.id,
        eventType: this.getEventTypeName(event.id),
        error: error.message,
        stack: error.stack
      })
    }
  }

  // Get human-readable event type name
  getEventTypeName(eventId) {
    const eventMap = {
      [CaptureEventIds.DeviceArrival]: 'DeviceArrival',
      [CaptureEventIds.DeviceRemoval]: 'DeviceRemoval',
      [CaptureEventIds.DecodedData]: 'DecodedData',
      [CaptureEventIds.Error]: 'Error'
    }
    return eventMap[eventId] || `Unknown(${eventId})`
  }

  // Cleanup resources
  async cleanup() {
    console.log('🧹 Starting scanner cleanup...')
    
    if (!this.isInitialized) {
      console.log('⚠️ Scanner not initialized, nothing to cleanup')
      return
    }

    try {
      if (this.captureDevice) {
        console.log('🔌 Closing capture device...')
        await this.captureDevice.close()
        this.captureDevice = null
        console.log('✅ Capture device closed')
      }
      
      if (this.capture) {
        console.log('📱 Closing main capture...')
        await this.capture.close()
        this.capture = null
        console.log('✅ Main capture closed')
      }
      
      this.isInitialized = false
      this.onDecodedDataCallback = null
      this.initializationAttempts = 0
      
      console.log('✅ Scanner cleanup completed successfully')
    } catch (error) {
      console.error('❌ Error during scanner cleanup:', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  // Check if scanner is connected
  isConnected() {
    const connected = this.captureDevice !== null && this.isInitialized
    console.log('🔍 Scanner connection status:', {
      hasDevice: this.captureDevice !== null,
      isInitialized: this.isInitialized,
      connected
    })
    return connected
  }

  // Get scanner status information
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasCapture: this.capture !== null,
      hasDevice: this.captureDevice !== null,
      isConnected: this.isConnected(),
      attempts: this.initializationAttempts,
      maxAttempts: this.maxRetryAttempts
    }
  }

  // Reset scanner state (useful for troubleshooting)
  reset() {
    console.log('🔄 Resetting scanner state...')
    this.capture = null
    this.captureDevice = null
    this.isInitialized = false
    this.onDecodedDataCallback = null
    this.initializationAttempts = 0
    console.log('✅ Scanner state reset complete')
  }
}

// Export a singleton instance
export const scannerService = new ScannerService()
export default scannerService 