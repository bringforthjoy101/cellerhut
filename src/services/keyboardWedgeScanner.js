/**
 * Keyboard Wedge Scanner Handler
 * Detects barcode input from USB/Bluetooth scanners operating in keyboard emulation mode
 * Uses timing-based detection to distinguish scanner input from manual keyboard typing
 */

class KeyboardWedgeScanner {
	constructor() {
		this.isActive = false
		this.onBarcodeCallback = null
		this.inputBuffer = ''
		this.lastKeystrokeTime = 0
		this.timeoutId = null
		this.keyEventListener = null
		
		// Configuration options
		this.config = {
			minBarcodeLength: 3,          // Minimum characters for valid barcode
			maxBarcodeLength: 50,         // Maximum characters for valid barcode
			interCharTimeout: 20,         // Max time between characters (ms)
			scanTimeout: 200,             // Time to wait after last character (ms)
			enablePrefixSuffix: true,     // Look for prefix/suffix patterns
			prefixChars: [],              // Optional prefix characters
			suffixChars: ['\r', '\n'],    // Common suffix characters (Enter)
			debugLogging: true            // Enable detailed logging
		}
	}

	/**
	 * Initialize keyboard wedge scanner detection
	 * @param {Function} onBarcodeCallback - Callback function when barcode is detected
	 * @param {Object} options - Configuration options
	 */
	initialize(onBarcodeCallback, options = {}) {
		console.log('🔌 Initializing Keyboard Wedge Scanner...')
		
		if (this.isActive) {
			console.warn('⚠️ Keyboard wedge scanner already active')
			return
		}

		// Merge configuration options
		this.config = { ...this.config, ...options }
		this.onBarcodeCallback = onBarcodeCallback
		
		// Create global key event listener
		this.keyEventListener = this.handleKeyInput.bind(this)
		
		// Listen for keydown events globally
		document.addEventListener('keydown', this.keyEventListener, true)
		
		this.isActive = true
		
		if (this.config.debugLogging) {
			console.log('✅ Keyboard Wedge Scanner initialized with config:', {
				minLength: this.config.minBarcodeLength,
				maxLength: this.config.maxBarcodeLength,
				interCharTimeout: this.config.interCharTimeout,
				scanTimeout: this.config.scanTimeout
			})
		}
	}

	/**
	 * Handle keyboard input events
	 * @param {KeyboardEvent} event - Keyboard event
	 */
	handleKeyInput(event) {
		const currentTime = Date.now()
		const timeSinceLastKey = currentTime - this.lastKeystrokeTime
		
		// Skip modifier keys and special keys that don't produce characters
		if (this.isModifierKey(event)) {
			return
		}

		// Clear existing timeout
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}

		// Get the character from the key event
		const char = this.getCharFromEvent(event)
		
		if (!char) {
			return
		}

		// Check if this looks like scanner input (fast typing)
		const isLikelyScanner = this.inputBuffer.length === 0 || timeSinceLastKey <= this.config.interCharTimeout
		
		if (isLikelyScanner) {
			// Add to buffer
			this.inputBuffer += char
			this.lastKeystrokeTime = currentTime
			
			if (this.config.debugLogging && this.inputBuffer.length <= 5) {
				console.log('📝 Scanner input detected, buffer:', this.inputBuffer)
			}
			
			// Check for immediate suffix characters (like Enter)
			if (this.config.enablePrefixSuffix && this.config.suffixChars.includes(char)) {
				this.processPotentialBarcode(true)
				return
			}
			
			// Check buffer length limits
			if (this.inputBuffer.length >= this.config.maxBarcodeLength) {
				if (this.config.debugLogging) {
					console.log('⚠️ Buffer exceeded max length, processing...')
				}
				this.processPotentialBarcode(false)
				return
			}
			
			// Set timeout to process barcode after scan completion
			this.timeoutId = setTimeout(() => {
				this.processPotentialBarcode(false)
			}, this.config.scanTimeout)
			
		} else {
			// Likely manual keyboard input - reset buffer
			if (this.inputBuffer.length > 0) {
				if (this.config.debugLogging) {
					console.log('⌨️ Manual keyboard input detected, clearing buffer')
				}
				this.resetBuffer()
			}
		}
	}

	/**
	 * Process potential barcode from input buffer
	 * @param {boolean} hasEndChar - Whether scan ended with suffix character
	 */
	processPotentialBarcode(hasEndChar) {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}

		let barcodeData = this.inputBuffer.trim()
		
		// Remove suffix characters if present
		if (this.config.enablePrefixSuffix) {
			for (const suffix of this.config.suffixChars) {
				if (barcodeData.endsWith(suffix)) {
					barcodeData = barcodeData.slice(0, -suffix.length)
					hasEndChar = true
					break
				}
			}
		}

		// Validate barcode
		const isValidBarcode = this.validateBarcode(barcodeData, hasEndChar)
		
		if (isValidBarcode) {
			if (this.config.debugLogging) {
				console.log('✅ Valid barcode detected:', barcodeData)
			}
			
			// Call the callback with the barcode
			if (this.onBarcodeCallback && typeof this.onBarcodeCallback === 'function') {
				this.onBarcodeCallback(barcodeData)
			}
		} else {
			if (this.config.debugLogging) {
				console.log('❌ Invalid barcode rejected:', {
					data: barcodeData,
					length: barcodeData.length,
					hasEndChar
				})
			}
		}

		this.resetBuffer()
	}

	/**
	 * Validate if the input string is a valid barcode
	 * @param {string} data - Barcode data
	 * @param {boolean} hasEndChar - Whether scan ended with suffix character
	 * @returns {boolean}
	 */
	validateBarcode(data, hasEndChar) {
		// Check length
		if (data.length < this.config.minBarcodeLength || data.length > this.config.maxBarcodeLength) {
			return false
		}

		// Must contain only printable characters (typical for barcodes)
		if (!/^[\x20-\x7E]+$/.test(data)) {
			return false
		}

		// If suffix characters are expected, require them for validation
		if (this.config.enablePrefixSuffix && this.config.suffixChars.length > 0 && !hasEndChar) {
			// Allow barcodes without suffix if they're long enough and look valid
			return data.length >= this.config.minBarcodeLength + 2
		}

		return true
	}

	/**
	 * Check if key event is a modifier key or special key
	 * @param {KeyboardEvent} event
	 * @returns {boolean}
	 */
	isModifierKey(event) {
		const modifierKeys = [
			'Control', 'Alt', 'Shift', 'Meta',
			'CapsLock', 'NumLock', 'ScrollLock',
			'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
			'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
			'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
			'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
		]
		
		return modifierKeys.includes(event.key) || event.ctrlKey || event.altKey || event.metaKey
	}

	/**
	 * Extract character from keyboard event
	 * @param {KeyboardEvent} event
	 * @returns {string|null}
	 */
	getCharFromEvent(event) {
		// For printable characters, use event.key
		if (event.key.length === 1) {
			return event.key
		}
		
		// Handle special cases
		switch (event.key) {
			case 'Enter':
				return '\r'
			case 'Tab':
				return '\t'
			default:
				return null
		}
	}

	/**
	 * Reset input buffer and timing
	 */
	resetBuffer() {
		this.inputBuffer = ''
		this.lastKeystrokeTime = 0
		
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
	}

	/**
	 * Update configuration options
	 * @param {Object} options - New configuration options
	 */
	updateConfig(options) {
		this.config = { ...this.config, ...options }
		
		if (this.config.debugLogging) {
			console.log('⚙️ Keyboard wedge scanner config updated:', options)
		}
	}

	/**
	 * Get current scanner status
	 * @returns {Object}
	 */
	getStatus() {
		return {
			isActive: this.isActive,
			bufferLength: this.inputBuffer.length,
			hasCallback: typeof this.onBarcodeCallback === 'function',
			config: { ...this.config }
		}
	}

	/**
	 * Stop keyboard wedge scanner
	 */
	cleanup() {
		console.log('🧹 Cleaning up Keyboard Wedge Scanner...')
		
		if (this.keyEventListener) {
			document.removeEventListener('keydown', this.keyEventListener, true)
			this.keyEventListener = null
		}
		
		this.resetBuffer()
		this.onBarcodeCallback = null
		this.isActive = false
		
		console.log('✅ Keyboard Wedge Scanner cleanup complete')
	}
}

// Export singleton instance
export const keyboardWedgeScanner = new KeyboardWedgeScanner()
export default keyboardWedgeScanner