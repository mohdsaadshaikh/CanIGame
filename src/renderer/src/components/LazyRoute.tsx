import { ReactNode, Suspense } from 'react'
import { Flex, Loader } from '@mantine/core'

const LazyRoute = ({ children }: { children: ReactNode }): React.JSX.Element => {
  return (
    <Suspense
      fallback={
        <Flex h="80vh" w="100%" justify="center" align="center">
          <Loader size={30} />
        </Flex>
      }
    >
      {children}
    </Suspense>
  )
}

export default LazyRoute
