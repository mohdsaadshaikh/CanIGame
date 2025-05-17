import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './layout'

function App(): React.JSX.Element {
  useEffect(() => {
    window.api.getHardwareInfo().then((res) => console.log(res))
  }, [])
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
