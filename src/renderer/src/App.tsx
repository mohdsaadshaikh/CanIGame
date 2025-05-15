import { Button } from '@mantine/core'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  useEffect(() => {
    window.api.getHardwareInfo().then((res) => console.log(res))
  }, [])
  return (
    <>
      <h1>Welcome to electron app</h1>
      <Button>hello</Button>
    </>
  )
}

export default App
