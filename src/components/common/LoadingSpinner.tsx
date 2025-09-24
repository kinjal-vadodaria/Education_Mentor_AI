import { } from 'react';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'lg',
  fullScreen = false,
}) => {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Stack align="center" gap="md">
        <Loader size={size} color="blue" />
        {message && (
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        )}
      </Stack>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Center style={{ height: '100vh', width: '100vw' }}>
        {content}
      </Center>
    );
  }

  return <Center py="xl">{content}</Center>;
};