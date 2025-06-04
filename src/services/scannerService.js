import { Capture, CaptureEventIds, SktErrors } from 'socketmobile-capturejs'

class ScannerService {
  constructor() {
    this.capture = null
    this.captureDevice = null
    this.isInitialized = false
    this.onDecodedDataCallback = null
  }

  // Initialize the scanner service with app credentials
  async initialize(appInfo, onDecodedData) {
    if (this.isInitialized) {
      console.warn('Scanner service is already initialized')
      return
    }

    try {
      this.capture = new Capture()
      this.onDecodedDataCallback = onDecodedData

      // Open Capture with app credentials
      const result = await this.capture.open(appInfo, this.handleCaptureEvent.bind(this))
      console.log('Capture opened successfully:', result)
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize scanner:', error)
      if (error === SktErrors.ESKT_UNABLEOPENDEVICE) {
        throw new Error('Unable to connect to Socket Mobile Companion service. Please ensure it is running.')
      }
      throw error
    }
  }

  // Handle all capture events
  async handleCaptureEvent(event, handle) {
    if (!event) return

    try {
      switch (event.id) {
        case CaptureEventIds.DeviceArrival:
          console.log('Scanner device connected:', event.value)
          // Open the device when it arrives
          this.captureDevice = new Capture()
          await this.captureDevice.openDevice(event.value.guid, this.capture)
          console.log('Scanner device opened successfully')
          break

        case CaptureEventIds.DeviceRemoval:
          console.log('Scanner device disconnected:', event.value)
          this.captureDevice = null
          break

        case CaptureEventIds.DecodedData:
          console.log('Barcode scanned:', event.value)
          // Call the callback with the scanned data
          if (this.onDecodedDataCallback) {
            this.onDecodedDataCallback(event.value.data)
          }
          break

        default:
          console.log('Unhandled capture event:', event)
      }
    } catch (error) {
      console.error('Error handling capture event:', error)
    }
  }

  // Cleanup resources
  async cleanup() {
    if (!this.isInitialized) return

    try {
      if (this.captureDevice) {
        await this.captureDevice.close()
        this.captureDevice = null
      }
      if (this.capture) {
        await this.capture.close()
        this.capture = null
      }
      this.isInitialized = false
      this.onDecodedDataCallback = null
    } catch (error) {
      console.error('Error during scanner cleanup:', error)
      throw error
    }
  }

  // Check if scanner is connected
  isConnected() {
    return this.captureDevice !== null
  }
}

// Export a singleton instance
export const scannerService = new ScannerService()
export default scannerService 