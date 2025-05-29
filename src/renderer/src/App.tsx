import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './layout'
import Settings from './screens/settings'

function App(): React.JSX.Element {
  useEffect(() => {
    window.api.getHardwareInfo().then((res) => console.log(res))
  }, [])
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
