import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Skeleton,
  Stack,
  Text,
  Title
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconCpu,
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconRefresh,
  IconDeviceSdCard
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { HardwareInfo } from '../../../../types'

const AboutPC = (): React.JSX.Element => {
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHardwareInfo = async (): Promise<void> => {
    try {
      setLoading(true)
      const info = await window.api.getHardwareInfo()
      setHardwareInfo(info)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch hardware info:', err)
      setError('Failed to load hardware information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHardwareInfo()
  }, [])

  const formatBytes = (bytes: number): string => `${bytes.toFixed(2)} GB`
  const formatGHz = (ghz: number): string => `${ghz.toFixed(2)} GHz`

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Stack gap="xl">
          <Skeleton height={60} />
          <Grid>
            {[...Array(6)].map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 4 }}>
                <Skeleton height={200} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    )
  }

  if (error || !hardwareInfo) {
    return (
      <Container size="xl" py="md">
        <Alert icon={<IconAlertTriangle size={24} />} title="Hardware Detection Error" color="red">
          <Flex justify="space-between" align="center">
            <Text> {error || 'Hardware information not available'}</Text>
            <Button
              variant="light"
              size="sm"
              onClick={fetchHardwareInfo}
              leftSection={<IconRefresh size={16} />}
            >
              Retry Detection
            </Button>
          </Flex>
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xs">
      <Stack gap="md">
        <Box>
          <Group justify="space-between" align="center">
            <div>
              <Title order={1} size="h1" fw={900}>
                System Information
              </Title>
              <Text size="lg" c="dimmed">
                {hardwareInfo.system.manufacturer} {hardwareInfo.system.model}
              </Text>
            </div>
            <ActionIcon variant="light" size="lg" onClick={fetchHardwareInfo} loading={loading}>
              <IconRefresh size={20} />
            </ActionIcon>
          </Group>
        </Box>

        <Stack gap="md">
          <Card shadow="md" radius="lg" withBorder>
            <Stack gap="md">
              <Group gap="sm">
                <IconDeviceDesktop size={24} />
                <Text fw={700} size="lg">
                  System Information
                </Text>
              </Group>

              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Hardware
                    </Text>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Manufacturer
                      </Text>
                      <Text size="sm" fw={500}>
                        {hardwareInfo.system.manufacturer}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Model
                      </Text>
                      <Text size="sm" fw={500}>
                        {hardwareInfo.system.model}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Version
                      </Text>
                      <Text size="sm" fw={500}>
                        {hardwareInfo.system.version}
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Operating System
                    </Text>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Platform
                      </Text>
                      <Text size="sm" fw={500}>
                        {hardwareInfo.os.platform}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Hostname
                      </Text>
                      <Text size="sm" fw={500}>
                        {hardwareInfo.os.hostname}
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="md" radius="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <IconCpu size={24} />
                      <div>
                        <Text fw={700} size="lg">
                          {hardwareInfo.cpu.brand}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {hardwareInfo.cpu.manufacturer}
                        </Text>
                      </div>
                    </Group>
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Core Configuration
                        </Text>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Total Cores
                          </Text>
                          <Text size="sm" fw={500}>
                            {hardwareInfo.cpu.cores}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Physical Cores
                          </Text>
                          <Text size="sm" fw={500}>
                            {hardwareInfo.cpu.physicalCores}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Processors
                          </Text>
                          <Text size="sm" fw={500}>
                            {hardwareInfo.cpu.processors}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Clock Speeds
                        </Text>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Base Speed
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatGHz(hardwareInfo.cpu.speed)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Max Speed
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatGHz(hardwareInfo.cpu.speedMax)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Min Speed
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatGHz(hardwareInfo.cpu.speedMin)}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
          <Stack gap="md">
            {hardwareInfo.gpu.map((gpu, index) => (
              <Card key={index} shadow="md" radius="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <IconDeviceGamepad2 size={24} />

                      <div>
                        <Text fw={700} size="lg">
                          {gpu.model}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {gpu.vendor}
                        </Text>
                      </div>
                    </Group>
                    {gpu.vram > 0 && (
                      <Badge color="green" variant="light" size="lg">
                        {gpu.vram} MB VRAM
                      </Badge>
                    )}
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Hardware Information
                        </Text>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Vendor
                          </Text>
                          <Text size="sm" fw={500}>
                            {gpu.vendor}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Model
                          </Text>
                          <Text size="sm" fw={500}>
                            {gpu.model}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Memory
                        </Text>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            VRAM
                          </Text>
                          <Text size="sm" fw={500}>
                            {gpu.vram} MB
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>
            ))}
          </Stack>
          <Grid>
            <Grid.Col span={12}>
              <Card shadow="md" radius="lg" withBorder>
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <IconDeviceSdCard size={24} />
                      <Text fw={700} size="lg">
                        System Memory
                      </Text>
                    </Group>
                    <Badge color="blue" variant="light" size="lg">
                      {formatBytes(hardwareInfo.memory.total)}
                    </Badge>
                  </Group>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Total
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatBytes(hardwareInfo.memory.total)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Used
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatBytes(hardwareInfo.memory.used)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Free
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatBytes(hardwareInfo.memory.free)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Available
                          </Text>
                          <Text size="sm" fw={500}>
                            {formatBytes(hardwareInfo.memory.available)}
                          </Text>
                        </Group>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Stack>
    </Container>
  )
}

export default AboutPC
