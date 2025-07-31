import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useUniversalScanner } from '../hooks/useUniversalScanner'

const ScannerContext = createContext()

export const useScannerContext = () => {
  const context = useContext(ScannerContext)
  if (!context) {
    throw new Error('useScannerContext must be used within a ScannerProvider')
  }
  return context
}

export const ScannerProvider = ({ children }) => {
  const [activeHandler, setActiveHandler] = useState(null)
  const [registeredHandlers, setRegisteredHandlers] = useState(new Map())
  const currentHandlerRef = useRef(null)

  // Global barcode handler that routes to the active handler
  const globalBarcodeHandler = useCallback((barcode, serviceName, scannerType) => {
    console.log(`🌐 Global scanner received barcode: ${barcode} from ${serviceName}`)
    
    if (currentHandlerRef.current && currentHandlerRef.current.callback) {
      console.log(`📱 Routing to active handler: ${currentHandlerRef.current.id}`)
      currentHandlerRef.current.callback(barcode, serviceName, scannerType)
    } else {
      console.warn('❌ No active scanner handler registered')
    }
  }, [])

  // Initialize the global scanner instance
  const scannerHook = useUniversalScanner(globalBarcodeHandler)

  // Register a scanner handler with priority
  const registerHandler = useCallback((id, callback, priority = 0) => {
    console.log(`📝 Registering scanner handler: ${id} with priority ${priority}`)
    
    const handlerInfo = { id, callback, priority }
    
    setRegisteredHandlers(prev => {
      const newHandlers = new Map(prev)
      newHandlers.set(id, handlerInfo)
      return newHandlers
    })

    // Update active handler if this has higher priority
    setActiveHandler(prevActive => {
      if (!prevActive || priority > prevActive.priority) {
        console.log(`🔄 Setting ${id} as active handler (priority: ${priority})`)
        currentHandlerRef.current = handlerInfo
        return handlerInfo
      }
      return prevActive
    })

    // Return cleanup function
    return () => {
      console.log(`🗑️ Unregistering scanner handler: ${id}`)
      
      setRegisteredHandlers(prev => {
        const newHandlers = new Map(prev)
        newHandlers.delete(id)
        return newHandlers
      })

      setActiveHandler(prevActive => {
        if (prevActive && prevActive.id === id) {
          // Find next highest priority handler
          const handlers = Array.from(registeredHandlers.values())
            .filter(h => h.id !== id)
            .sort((a, b) => b.priority - a.priority)
          
          const nextHandler = handlers[0] || null
          currentHandlerRef.current = nextHandler
          
          if (nextHandler) {
            console.log(`🔄 Switching to next handler: ${nextHandler.id} (priority: ${nextHandler.priority})`)
          } else {
            console.log('📭 No scanner handlers remaining')
          }
          
          return nextHandler
        }
        return prevActive
      })
    }
  }, [registeredHandlers])

  // Force set active handler (for explicit control)
  const setActiveHandlerById = useCallback((id) => {
    const handler = registeredHandlers.get(id)
    if (handler) {
      console.log(`🎯 Explicitly setting active handler: ${id}`)
      setActiveHandler(handler)
      currentHandlerRef.current = handler
    } else {
      console.warn(`❌ Handler not found: ${id}`)
    }
  }, [registeredHandlers])

  // Get status of all handlers
  const getHandlerStatus = useCallback(() => {
    return {
      activeHandler: activeHandler?.id || null,
      registeredHandlers: Array.from(registeredHandlers.keys()),
      handlerCount: registeredHandlers.size
    }
  }, [activeHandler, registeredHandlers])

  const contextValue = {
    // Scanner hook properties
    ...scannerHook,
    
    // Context-specific methods
    registerHandler,
    setActiveHandlerById,
    getHandlerStatus,
    
    // Current state
    activeHandlerId: activeHandler?.id || null,
    handlerCount: registeredHandlers.size
  }

  return (
    <ScannerContext.Provider value={contextValue}>
      {children}
    </ScannerContext.Provider>
  )
}

// Hook for components that need to register as scanner handlers
export const useScannerHandler = (id, callback, priority = 0, enabled = true) => {
  const { registerHandler } = useScannerContext()
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (enabled && callback) {
      cleanupRef.current = registerHandler(id, callback, priority)
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [id, callback, priority, enabled, registerHandler])

  return cleanupRef.current
}