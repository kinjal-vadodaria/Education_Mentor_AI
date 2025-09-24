import React from 'react';
import { TagsInput as MantineTagsInput, TagsInputProps } from '@mantine/core';

// Re-export Mantine's TagsInput with proper typing
export const TagsInput: React.FC<TagsInputProps> = (props) => {
  return <MantineTagsInput {...props} />;
};