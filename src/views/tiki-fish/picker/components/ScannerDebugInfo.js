import React from 'react'
import { useScannerContext } from '../../../../contexts/ScannerContext'
import { Badge, Card, CardBody, CardHeader } from 'reactstrap'
import { Wifi, WifiOff, Loader, CheckCircle, AlertCircle } from 'react-feather'

const ScannerDebugInfo = () => {
  const {
    isConnected,
    isInitializing,
    activeScanners,
    bestScanner,
    activeHandlerId,
    handlerCount,
    getHandlerStatus
  } = useScannerContext()

  const handlerStatus = getHandlerStatus()

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="mt-2" style={{ fontSize: '0.8rem' }}>
      <CardHeader className="pb-2">
        <h6 className="mb-0">
          Scanner Debug Info
          <Badge 
            color={isConnected ? 'success' : 'secondary'} 
            className="ms-2"
            pill
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </h6>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center gap-2">
            {isInitializing ? (
              <Loader size={14} className="text-warning" />
            ) : isConnected ? (
              <Wifi size={14} className="text-success" />
            ) : (
              <WifiOff size={14} className="text-secondary" />
            )}
            <span>
              Scanner Status: {isInitializing ? 'Initializing...' : isConnected ? 'Ready' : 'Not Available'}
            </span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <CheckCircle size={14} className="text-info" />
            <span>Best Scanner: {bestScanner || 'None'}</span>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={14} className="text-primary" />
            <span>Active Scanners: {activeScanners?.length || 0}</span>
          </div>
          
          <hr className="my-2" />
          
          <div>
            <strong>Handler Status:</strong>
          </div>
          <div className="ps-2">
            <div>Active Handler: <Badge color="primary" pill>{activeHandlerId || 'None'}</Badge></div>
            <div>Registered Handlers: {handlerStatus.handlerCount}</div>
            <div className="small text-muted">
              {handlerStatus.registeredHandlers.join(', ') || 'None'}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default ScannerDebugInfo