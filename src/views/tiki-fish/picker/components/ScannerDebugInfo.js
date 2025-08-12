import React, { useState, useEffect } from 'react'
import { useScannerContext } from '../../../../contexts/ScannerContext'
import { Badge, Card, CardBody, CardHeader, Button, Collapse, Progress, Alert } from 'reactstrap'
import { Wifi, WifiOff, Loader, CheckCircle, AlertCircle, RefreshCw, Play, Square, Settings, Eye, EyeOff } from 'react-feather'
import unifiedScannerManager from '../../../../services/unifiedScannerManager'
import performantLogger from '../../../../utils/performantLogger'

const ScannerDebugInfo = ({ forceVisible = false, showInProduction = false }) => {
  const {
    isConnected,
    isInitializing,
    activeScanners,
    bestScanner,
    activeHandlerId,
    handlerCount,
    getHandlerStatus
  } = useScannerContext()

  const [isExpanded, setIsExpanded] = useState(false)
  const [unifiedStats, setUnifiedStats] = useState(null)
  const [realTimeEvents, setRealTimeEvents] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [testResults, setTestResults] = useState({})
  const [isVisible, setIsVisible] = useState(forceVisible)

  const handlerStatus = getHandlerStatus()

  // Control visibility - show in development, production (if iPad), or when forced
  const shouldShow = forceVisible || 
    showInProduction || 
    process.env.NODE_ENV === 'development' || 
    (navigator.userAgent && (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)))

  if (!shouldShow && !isVisible) {
    return (
      <Button 
        color="info" 
        size="sm" 
        onClick={() => setIsVisible(true)}
        className="position-fixed"
        style={{ top: '10px', right: '10px', zIndex: 1050 }}
      >
        <Eye size={14} /> Debug
      </Button>
    )
  }

  // Update stats periodically
  useEffect(() => {
    if (!isMonitoring) return

    const updateStats = () => {
      try {
        setUnifiedStats(unifiedScannerManager.getStatus())
      } catch (error) {
        console.error('Error updating debug stats:', error)
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [isMonitoring])

  // Add real-time event logging
  const addEvent = (type, message, data = null) => {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    }
    setRealTimeEvents(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 events
  }

  // Test functions
  const testScannerAPI = async () => {
    addEvent('test', 'Testing Scanner API availability...')
    try {
      const status = unifiedScannerManager.getStatus()
      setTestResults(prev => ({
        ...prev,
        scannerAPI: { status, success: true }
      }))
      addEvent('success', `Scanner API available`, { status })
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        scannerAPI: { error: error.message, success: false }
      }))
      addEvent('error', `Scanner API test failed: ${error.message}`)
    }
  }

  const testScannerStatus = async () => {
    addEvent('test', 'Testing scanner status...')
    try {
      const statusSummary = unifiedScannerManager.getServiceStatusSummary()
      setTestResults(prev => ({
        ...prev,
        status: { success: true, message: 'Scanner status retrieved', data: statusSummary }
      }))
      addEvent('success', 'Scanner status test completed')
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        status: { error: error.message, success: false }
      }))
      addEvent('error', `Status test failed: ${error.message}`)
    }
  }

  const testServiceDiagnostics = async () => {
    addEvent('test', 'Running scanner diagnostics...')
    try {
      const diagnostics = unifiedScannerManager.getDiagnostics()
      setTestResults(prev => ({
        ...prev,
        diagnostics: { success: true, data: diagnostics }
      }))
      addEvent('success', 'Diagnostics completed', diagnostics)
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        diagnostics: { success: false, error: error.message }
      }))
      addEvent('error', `Diagnostics failed: ${error.message}`)
    }
  }

  const simulateBarcodeScan = () => {
    const testBarcode = 'TEST_' + Date.now()
    addEvent('test', `Simulating scan: ${testBarcode}`)
    try {
      // Simulate a keyboard wedge scan by dispatching keyboard events
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)
      addEvent('success', `Simulated scan completed: ${testBarcode}`)
    } catch (error) {
      addEvent('error', `Simulation failed: ${error.message}`)
    }
  }

  const switchToService = async (serviceName) => {
    addEvent('info', `Switching to ${serviceName} service...`)
    try {
      await unifiedScannerManager.switchToService(serviceName)
      addEvent('success', `Switched to ${serviceName}`)
    } catch (error) {
      addEvent('error', `Failed to switch to ${serviceName}: ${error.message}`)
    }
  }

  const retryScannerInit = async () => {
    addEvent('info', 'Retrying scanner initialization...')
    try {
      await unifiedScannerManager.retryFailedServices()
      addEvent('success', 'Scanner initialization retry completed')
    } catch (error) {
      addEvent('error', `Scanner retry failed: ${error.message}`)
    }
  }

  return (
    <Card className="mt-2" style={{ fontSize: '0.75rem', maxWidth: '100%' }}>
      <CardHeader className="pb-2 d-flex justify-content-between align-items-center">
        <h6 className="mb-0 d-flex align-items-center gap-2">
          Scanner Debug Panel
          <Badge 
            color={isConnected ? 'success' : 'secondary'} 
            pill
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {isVisible && (
            <Button 
              color="light" 
              size="sm" 
              onClick={() => setIsVisible(false)}
            >
              <EyeOff size={12} />
            </Button>
          )}
        </h6>
        <div className="d-flex gap-1">
          <Button 
            color={isMonitoring ? 'success' : 'secondary'} 
            size="sm" 
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? <Square size={12} /> : <Play size={12} />}
          </Button>
          <Button 
            color="info" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings size={12} />
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        {/* Core Status */}
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            {isInitializing ? (
              <Loader size={14} className="text-warning" />
            ) : isConnected ? (
              <Wifi size={14} className="text-success" />
            ) : (
              <WifiOff size={14} className="text-secondary" />
            )}
            <span>
              Status: {isInitializing ? 'Initializing...' : isConnected ? 'Ready' : 'Not Available'}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={14} className="text-info" />
            <span>Active: {bestScanner || 'None'}</span>
            <Badge color="primary" pill className="ms-2">{activeScanners?.length || 0} available</Badge>
          </div>
        </div>


        {/* Quick Test Buttons */}
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-1 mb-2">
            <Button color="primary" size="sm" onClick={testScannerAPI}>
              Test Scanner API
            </Button>
            <Button color="secondary" size="sm" onClick={testScannerStatus}>
              Test Status
            </Button>
            <Button color="info" size="sm" onClick={simulateBarcodeScan}>
              Simulate Scan
            </Button>
            <Button color="warning" size="sm" onClick={retryScannerInit}>
              <RefreshCw size={12} /> Retry Init
            </Button>
            <Button 
              color="outline-danger" 
              size="sm" 
              onClick={() => {
                setTestResults({})
                setRealTimeEvents([])
                // Clear stats only
                addEvent('info', 'Debug data cleared')
              }}
            >
              Clear Results
            </Button>
          </div>
        </div>

        {/* Real-time Events */}
        <div className="mb-3">
          <strong>Real-time Events:</strong>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="border rounded p-2 mt-1">
            {realTimeEvents.length === 0 ? (
              <div className="text-muted small">No events yet...</div>
            ) : (
              realTimeEvents.map(event => (
                <div key={event.id} className="d-flex align-items-center gap-2 mb-1">
                  <Badge 
                    color={event.type === 'error' ? 'danger' : 
                           event.type === 'success' ? 'success' : 
                           event.type === 'test' ? 'warning' : 'info'} 
                    pill
                  >
                    {event.type}
                  </Badge>
                  <span className="small text-muted">{event.timestamp}</span>
                  <span className="small">{event.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expanded Diagnostics */}
        <Collapse isOpen={isExpanded}>
          <hr />
          
          {/* Service Status */}
          {unifiedStats && (
            <div className="mb-3">
              <strong>Service Status:</strong>
              <div className="ps-2 mt-1">
                {Object.entries(unifiedStats.serviceStatus || {}).map(([service, status]) => (
                  <div key={service} className="d-flex justify-content-between align-items-center mb-1">
                    <span>{service}:</span>
                    <div className="d-flex gap-1">
                      <Badge color={status.initialized ? 'success' : 'secondary'} pill>
                        {status.initialized ? 'Ready' : 'Failed'}
                      </Badge>
                      {status.initialized && (
                        <Button 
                          color="outline-primary" 
                          size="sm" 
                          onClick={() => switchToService(service)}
                        >
                          Switch
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="mb-3">
              <strong>Test Results:</strong>
              <div className="ps-2 mt-1">
                {Object.entries(testResults).map(([test, result]) => (
                  <Alert 
                    key={test} 
                    color={result.success ? 'success' : 'danger'} 
                    className="py-2 mb-2"
                  >
                    <strong>{test}:</strong> {result.success ? 'PASSED' : 'FAILED'}
                    {result.error && <div className="small">{result.error}</div>}
                    {result.message && <div className="small">{result.message}</div>}
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Handler Details */}
          <div className="mb-3">
            <strong>Handler Details:</strong>
            <div className="ps-2 mt-1">
              <div>Active Handler: <Badge color="primary" pill>{activeHandlerId || 'None'}</Badge></div>
              <div>Registered: {handlerStatus.handlerCount}</div>
              <div className="small text-muted">
                {handlerStatus.registeredHandlers.join(', ') || 'None'}
              </div>
            </div>
          </div>

          {/* Logging Performance */}
          <div className="mb-3">
            <strong>Logging Performance:</strong>
            <div className="ps-2 mt-1 small">
              <div>Log Level: <Badge color="info" pill>{performantLogger.getConfig().logLevel}</Badge></div>
              <div>Batching: {performantLogger.getConfig().batchEnabled ? 'Enabled' : 'Disabled'}</div>
              <div>Buffer: {performantLogger.getConfig().currentBufferSize}/{performantLogger.getConfig().maxBufferSize}</div>
              <div>Environment: {performantLogger.getConfig().isProduction ? 'Production' : 'Development'}</div>
              <div className="text-success">Performance Mode: {process.env.REACT_APP_DEBUG_SCANNERS === 'true' ? 'Debug' : 'Optimized'}</div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mb-3">
            <strong>Environment:</strong>
            <div className="ps-2 mt-1 small">
              <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              <div>Platform: {navigator.platform}</div>
              <div>Touch Points: {navigator.maxTouchPoints}</div>
              <div>Has WebKit: {typeof window.webkit !== 'undefined' ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </Collapse>
      </CardBody>
    </Card>
  )
}

export default ScannerDebugInfo