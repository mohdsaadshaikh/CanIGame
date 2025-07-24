import React, { useEffect } from 'react'

const Explore = (): React.JSX.Element => {
  useEffect(() => {
    window.api.getAllGames().then((data) => console.log(data))
  }, [])

  return <div>Explore</div>
}

export default Explore
