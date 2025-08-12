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
    if (currentHandlerRef.current && currentHandlerRef.current.callback) {
      currentHandlerRef.current.callback(barcode, serviceName, scannerType)
    }
  }, [])

  // Initialize the global scanner instance
  const scannerHook = useUniversalScanner(globalBarcodeHandler)

  // Register a scanner handler with priority
  const registerHandler = useCallback((id, callback, priority = 0) => {
    const handlerInfo = { id, callback, priority }
    
    setRegisteredHandlers(prev => {
      const newHandlers = new Map(prev)
      newHandlers.set(id, handlerInfo)
      return newHandlers
    })

    // Update active handler if this has higher priority
    setActiveHandler(prevActive => {
      if (!prevActive || priority > prevActive.priority) {
        currentHandlerRef.current = handlerInfo
        return handlerInfo
      }
      return prevActive
    })

    // Return cleanup function
    return () => {
      setRegisteredHandlers(prev => {
        const newHandlers = new Map(prev)
        newHandlers.delete(id)
        return newHandlers
      })

      setActiveHandler(prevActive => {
        if (prevActive && prevActive.id === id) {
          // Find next highest priority handler using functional update to get current handlers
          let nextHandler = null
          setRegisteredHandlers(currentHandlers => {
            const handlers = Array.from(currentHandlers.values())
              .filter(h => h.id !== id)
              .sort((a, b) => b.priority - a.priority)
            nextHandler = handlers[0] || null
            return currentHandlers // Don't modify, just reading
          })
          
          currentHandlerRef.current = nextHandler
          return nextHandler
        }
        return prevActive
      })
    }
  }, [])

  // Force set active handler (for explicit control)
  const setActiveHandlerById = useCallback((id) => {
    setRegisteredHandlers(prev => {
      const handler = prev.get(id)
      if (handler) {
        setActiveHandler(handler)
        currentHandlerRef.current = handler
      }
      return prev
    })
  }, [])

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