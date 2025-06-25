import { lazy, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import LazyRoute from './components/LazyRoute'
import AppLayout from './layout'

const Home = lazy(() => import('./screens/home'))
const Explore = lazy(() => import('./screens/explore'))
const AboutPC = lazy(() => import('./screens/about_pc'))
const Wishlist = lazy(() => import('./screens/wishlist'))
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
              path="/"
              element={
                <LazyRoute>
                  <Home />
                </LazyRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <LazyRoute>
                  <Explore />
                </LazyRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <LazyRoute>
                  <Wishlist />
                </LazyRoute>
              }
            />
            <Route
              path="/pc"
              element={
                <LazyRoute>
                  <AboutPC />
                </LazyRoute>
              }
            />
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
