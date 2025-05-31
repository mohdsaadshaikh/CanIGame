import { lazy, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import LazyRoute from './components/LazyRoute'
import AppLayout from './layout'

// Delay loader for visible test
const Settings = lazy(() => import('./screens/settings'))

function App(): React.JSX.Element {
  useEffect(() => {
    window.api.getHardwareInfo().then((res) => console.log(res))
  }, [])
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              path="/settings"
              element={
                <LazyRoute>
                  <Settings />
                </LazyRoute>
              }
            />
          </Route>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
