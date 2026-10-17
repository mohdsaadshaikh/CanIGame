import { lazy, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import LazyRoute from './components/LazyRoute'
import AppLayout from './layout'

const Home = lazy(() => import('./screens/home'))
const Explore = lazy(() => import('./screens/explore'))
const AboutPC = lazy(() => import('./screens/about_pc'))
const Wishlist = lazy(() => import('./screens/wishlist'))
const Settings = lazy(() => import('./screens/settings'))
const GameDetails = lazy(() => import('./screens/game_details'))

const page = (element: ReactNode): ReactNode => <LazyRoute>{element}</LazyRoute>

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={page(<Home />)} />
          <Route path="explore" element={page(<Explore />)} />
          <Route path="wishlist" element={page(<Wishlist />)} />
          <Route path="pc" element={page(<AboutPC />)} />
          <Route path="settings" element={page(<Settings />)} />
          <Route path="game/:slug" element={page(<GameDetails />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
