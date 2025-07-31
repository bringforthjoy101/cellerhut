// ** Router Import
import Router from './router/Router'

// ** Scanner Context Provider
import { ScannerProvider } from './contexts/ScannerContext'

const App = props => (
  <ScannerProvider>
    <Router />
  </ScannerProvider>
)

export default App
