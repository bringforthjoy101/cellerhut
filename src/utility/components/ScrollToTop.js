import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 *
 * Automatically scrolls the window to the top (0, 0) whenever the route changes.
 * This ensures that when users navigate between pages, they always start at the
 * top of the new page rather than maintaining the scroll position from the previous page.
 *
 * Usage: Place this component inside the Router component, typically at the root level.
 *
 * Example:
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Switch>
 *     <Route path="/" component={Home} />
 *   </Switch>
 * </BrowserRouter>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top of page on route change
    window.scrollTo(0, 0)
  }, [pathname])

  // This component doesn't render anything
  return null
}

export default ScrollToTop
