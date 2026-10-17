import { Button, Container, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconHeart } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

const Wishlist = (): React.JSX.Element => {
  const navigate = useNavigate()

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">
        Wishlist
      </Title>
      <Stack align="center" gap="md" py="xl" ta="center">
        <ThemeIcon size={64} radius="xl" variant="light">
          <IconHeart size={32} />
        </ThemeIcon>
        <Text size="lg" fw={600}>
          Your wishlist is empty
        </Text>
        <Text c="dimmed" maw={420}>
          Saving games is coming soon. In the meantime, browse the catalogue to find something to
          play.
        </Text>
        <Button variant="light" onClick={() => navigate('/explore')}>
          Explore games
        </Button>
      </Stack>
    </Container>
  )
}

export default Wishlist
