import moment from 'moment'

// Storage keys
const STORAGE_KEYS = {
  HELD_ORDERS: 'cellarhut_held_orders',
  ORDER_TABS: 'cellarhut_order_tabs',
  ACTIVE_ORDER_ID: 'cellarhut_active_order_id',
  SESSION_ID: 'cellarhut_session_id'
}

// Configuration
const CONFIG = {
  MAX_HELD_ORDERS: 50,
  RETENTION_DAYS: 7,
  AUTO_CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  EXPIRATION_WARNING_HOURS: 48,
  COMPRESSION_THRESHOLD: 1024 * 50 // 50KB
}

/**
 * Generate a unique session ID for this browser session
 */
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current session ID or create new one
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID)
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
  return sessionId
}

/**
 * Create order metadata
 */
const createOrderMetadata = (order) => {
  return {
    ...order,
    id: order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: order.createdAt || moment().toISOString(),
    updatedAt: moment().toISOString(),
    sessionId: getSessionId(),
    version: 1
  }
}

/**
 * Validate order data structure
 */
const validateOrder = (order) => {
  if (!order || typeof order !== 'object') return false
  
  const requiredFields = ['id', 'items', 'subtotal', 'tax', 'total', 'paymentMethod']
  return requiredFields.every(field => order.hasOwnProperty(field))
}

/**
 * Clean up old orders based on retention policy
 */
const cleanupOldOrders = (orders) => {
  const cutoffDate = moment().subtract(CONFIG.RETENTION_DAYS, 'days')
  
  return orders.filter(order => {
    const orderDate = moment(order.createdAt || order.heldAt)
    return orderDate.isAfter(cutoffDate)
  })
}

/**
 * Save held orders to localStorage
 */
export const saveHeldOrdersToStorage = (orders) => {
  try {
    if (!Array.isArray(orders)) {
      console.warn('saveHeldOrdersToStorage: orders must be an array')
      return false
    }

    // Validate orders
    const validOrders = orders.filter(order => {
      if (!validateOrder(order)) {
        console.warn('Invalid order detected, skipping:', order)
        return false
      }
      return true
    })

    // Add metadata to orders
    const ordersWithMetadata = validOrders.map(createOrderMetadata)

    // Clean up old orders
    const cleanedOrders = cleanupOldOrders(ordersWithMetadata)

    // Limit number of orders
    const limitedOrders = cleanedOrders.slice(-CONFIG.MAX_HELD_ORDERS)

    // Save to localStorage
    const storageData = {
      orders: limitedOrders,
      lastUpdated: moment().toISOString(),
      sessionId: getSessionId(),
      version: 1
    }

    localStorage.setItem(STORAGE_KEYS.HELD_ORDERS, JSON.stringify(storageData))
    
    console.log(`✅ Saved ${limitedOrders.length} held orders to localStorage`)
    return true
  } catch (error) {
    console.error('Error saving held orders to localStorage:', error)
    return false
  }
}

/**
 * Load held orders from localStorage
 */
export const loadHeldOrdersFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HELD_ORDERS)
    
    if (!stored) {
      console.log('No held orders found in localStorage')
      return []
    }

    const storageData = JSON.parse(stored)
    
    // Validate storage data structure
    if (!storageData || !Array.isArray(storageData.orders)) {
      console.warn('Invalid held orders data structure in localStorage')
      return []
    }

    // Clean up old orders
    const cleanedOrders = cleanupOldOrders(storageData.orders)

    // Validate each order
    const validOrders = cleanedOrders.filter(validateOrder)

    console.log(`✅ Loaded ${validOrders.length} held orders from localStorage`)
    return validOrders
  } catch (error) {
    console.error('Error loading held orders from localStorage:', error)
    return []
  }
}

/**
 * Save order tabs configuration
 */
export const saveOrderTabsToStorage = (tabs) => {
  try {
    if (!Array.isArray(tabs)) {
      console.warn('saveOrderTabsToStorage: tabs must be an array')
      return false
    }

    const tabsData = {
      tabs: tabs.map(tab => ({
        id: tab.id,
        title: tab.title || `Order ${tab.id}`,
        isActive: tab.isActive || false,
        hasUnsavedChanges: tab.hasUnsavedChanges || false,
        createdAt: tab.createdAt || moment().toISOString(),
        updatedAt: moment().toISOString()
      })),
      lastUpdated: moment().toISOString(),
      sessionId: getSessionId()
    }

    localStorage.setItem(STORAGE_KEYS.ORDER_TABS, JSON.stringify(tabsData))
    return true
  } catch (error) {
    console.error('Error saving order tabs to localStorage:', error)
    return false
  }
}

/**
 * Load order tabs configuration
 */
export const loadOrderTabsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDER_TABS)
    
    if (!stored) {
      return []
    }

    const tabsData = JSON.parse(stored)
    
    if (!tabsData || !Array.isArray(tabsData.tabs)) {
      return []
    }

    return tabsData.tabs
  } catch (error) {
    console.error('Error loading order tabs from localStorage:', error)
    return []
  }
}

/**
 * Save active order ID
 */
export const saveActiveOrderId = (orderId) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER_ID, orderId || '')
    return true
  } catch (error) {
    console.error('Error saving active order ID:', error)
    return false
  }
}

/**
 * Load active order ID
 */
export const loadActiveOrderId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER_ID) || null
  } catch (error) {
    console.error('Error loading active order ID:', error)
    return null
  }
}

/**
 * Clear all picker-related storage
 */
export const clearPickerStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('✅ Cleared all picker storage')
    return true
  } catch (error) {
    console.error('Error clearing picker storage:', error)
    return false
  }
}

/**
 * Get storage size in KB
 */
export const getStorageSize = () => {
  try {
    let totalSize = 0
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length
      }
    })
    return Math.round(totalSize / 1024) // Convert to KB
  } catch (error) {
    console.error('Error calculating storage size:', error)
    return 0
  }
}

/**
 * Check if order is expired
 */
export const isOrderExpired = (order) => {
  const createdAt = moment(order.createdAt || order.heldAt)
  const hoursSinceCreation = moment().diff(createdAt, 'hours')
  return hoursSinceCreation > CONFIG.EXPIRATION_WARNING_HOURS
}

/**
 * Get expired orders
 */
export const getExpiredOrders = () => {
  const orders = loadHeldOrdersFromStorage()
  return orders.filter(isOrderExpired)
}

/**
 * Export held orders as JSON
 */
export const exportOrdersAsJSON = (orders) => {
  const dataStr = JSON.stringify(orders, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `held_orders_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
  
  return true
}

/**
 * Import orders from JSON
 */
export const importOrdersFromJSON = (jsonString) => {
  try {
    const orders = JSON.parse(jsonString)
    
    if (!Array.isArray(orders)) {
      throw new Error('Invalid JSON format: expected array of orders')
    }
    
    // Validate and merge with existing orders
    const existingOrders = loadHeldOrdersFromStorage()
    const mergedOrders = [...existingOrders, ...orders]
    
    // Remove duplicates by ID
    const uniqueOrders = Array.from(
      new Map(mergedOrders.map(order => [order.id, order])).values()
    )
    
    saveHeldOrdersToStorage(uniqueOrders)
    
    return { success: true, imported: orders.length, total: uniqueOrders.length }
  } catch (error) {
    console.error('Error importing orders:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Add customer metadata to order
 */
export const addCustomerMetadata = (orderId, metadata) => {
  const orders = loadHeldOrdersFromStorage()
  const updatedOrders = orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        customerName: metadata.name,
        customerPhone: metadata.phone,
        customerEmail: metadata.email,
        customerNotes: metadata.notes,
        priority: metadata.priority || 'normal',
        updatedAt: moment().toISOString()
      }
    }
    return order
  })
  
  saveHeldOrdersToStorage(updatedOrders)
  return true
}

/**
 * Get storage quota info
 */
export const getStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const { usage, quota } = await navigator.storage.estimate()
      return {
        used: Math.round((usage || 0) / (1024 * 1024)), // MB
        total: Math.round((quota || 0) / (1024 * 1024)), // MB
        percentage: Math.round(((usage || 0) / (quota || 1)) * 100)
      }
    } catch (error) {
      console.error('Error getting storage quota:', error)
    }
  }
  return null
}

/**
 * Get storage statistics
 */
export const getStorageStats = () => {
  try {
    const heldOrders = loadHeldOrdersFromStorage()
    const orderTabs = loadOrderTabsFromStorage()
    const activeOrderId = loadActiveOrderId()

    return {
      heldOrdersCount: heldOrders.length,
      orderTabsCount: orderTabs.length,
      activeOrderId,
      storageSize: JSON.stringify({
        heldOrders,
        orderTabs,
        activeOrderId
      }).length,
      lastCleanup: moment().toISOString()
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return null
  }
}

/**
 * Auto cleanup function - should be called periodically
 */
export const performAutoCleanup = () => {
  try {
    const orders = loadHeldOrdersFromStorage()
    const cleanedOrders = cleanupOldOrders(orders)
    
    if (cleanedOrders.length !== orders.length) {
      saveHeldOrdersToStorage(cleanedOrders)
      console.log(`🧹 Auto cleanup: Removed ${orders.length - cleanedOrders.length} old orders`)
    }
    
    return true
  } catch (error) {
    console.error('Error during auto cleanup:', error)
    return false
  }
}

/**
 * Initialize storage with periodic cleanup
 */
export const initializeOrderStorage = () => {
  try {
    // Perform initial cleanup
    performAutoCleanup()

    // Set up periodic cleanup
    setInterval(() => {
      performAutoCleanup()
    }, CONFIG.AUTO_CLEANUP_INTERVAL)

    console.log('✅ Order storage initialized with auto cleanup')
    return true
  } catch (error) {
    console.error('Error initializing order storage:', error)
    return false
  }
}

// Export configuration for external access
export const getStorageConfig = () => ({ ...CONFIG })
export const getStorageKeys = () => ({ ...STORAGE_KEYS })