import React, { useState } from 'react';
import { Container, Title, Text, Card, Group, Button, Stack, Badge, Image, Grid, TextInput, Select } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSearch, IconCalendar, IconUser, IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  tags: string[];
}

const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with AI-Powered Learning',
    excerpt: 'Discover how artificial intelligence is revolutionizing the way we learn and teach.',
    content: 'AI-powered learning platforms are transforming education by providing personalized learning experiences...',
    author: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    category: 'AI & Education',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
    tags: ['AI', 'Education', 'Learning'],
  },
  {
    id: '2',
    title: 'Best Practices for Online Teaching',
    excerpt: 'Essential tips and strategies for effective online education delivery.',
    content: 'Online teaching requires different approaches compared to traditional classroom settings...',
    author: 'Prof. Michael Chen',
    date: '2024-01-10',
    category: 'Teaching',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    tags: ['Teaching', 'Online Learning', 'Best Practices'],
  },
  {
    id: '3',
    title: 'The Future of Interactive Quizzes',
    excerpt: 'How adaptive quizzes are making assessments more engaging and effective.',
    content: 'Interactive quizzes powered by AI can adapt to student performance in real-time...',
    author: 'Dr. Emily Rodriguez',
    date: '2024-01-05',
    category: 'Assessment',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    tags: ['Quizzes', 'Assessment', 'Interactive'],
  },
  {
  id: "4",
  title: "The Future of Remote Work: Tech Trends to Watch",
  excerpt: "Explore how emerging technologies are reshaping the remote work landscape.",
  content: "From virtual reality meetings to AI-based productivity tools, the future of remote work is being shaped by rapid technological advancements...",
  author: "James Patel",
  date: "2024-03-22",
  category: "Future of Work",
  imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  tags: ["Remote Work", "Technology", "Workplace"]
},
{
  id: "5",
  title: "Sustainable Tech: Innovations Driving a Greener Tomorrow",
  excerpt: "Dive into how green technology is making an impact on the environment and the economy.",
  content: "Clean energy solutions, eco-friendly manufacturing, and sustainable data centers are leading the charge toward a more sustainable tech industry...",
  author: "Laura Kim",
  date: "2024-05-10",
  category: "Sustainability",
  imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  tags: ["Sustainability", "Green Tech", "Innovation"]
}
];

export const Blog: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = ['All', 'AI & Education', 'Teaching', 'Assessment', 'Technology'];

  const filteredPosts = samplePosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <Container size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => setSelectedPost(null)}
            mb="xl"
          >
            ← Back to Blog
          </Button>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Image
              src={selectedPost.imageUrl}
              height={300}
              alt={selectedPost.title}
              mb="md"
            />

            <Title order={1} mb="md">{selectedPost.title}</Title>

            <Group mb="lg">
              <Badge color="blue" variant="light">
                <IconCalendar size={14} style={{ marginRight: 5 }} />
                {new Date(selectedPost.date).toLocaleDateString()}
              </Badge>
              <Badge color="green" variant="light">
                <IconUser size={14} style={{ marginRight: 5 }} />
                {selectedPost.author}
              </Badge>
              <Badge color="purple" variant="light">
                <IconTag size={14} style={{ marginRight: 5 }} />
                {selectedPost.category}
              </Badge>
            </Group>

            <Text size="lg" mb="xl" style={{ lineHeight: 1.6 }}>
              {selectedPost.content}
            </Text>

            <Group>
              {selectedPost.tags.map(tag => (
                <Badge key={tag} variant="outline" color="gray">
                  #{tag}
                </Badge>
              ))}
            </Group>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container size="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title order={1} mb="xl" ta="center">
          {t('Blog', 'Blog')}
        </Title>

        {/* Search and Filter */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Group grow>
            <TextInput
              placeholder="Search posts..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
            <Select
              data={categories}
              placeholder="Select category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              clearable
            />
          </Group>
        </Card>

        {/* Blog Posts Grid */}
        <Grid>
          {filteredPosts.map((post) => (
            <Grid.Col key={post.id} span={{ base: 12, md: 6, lg: 4 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Card.Section>
                    <Image
                      src={post.imageUrl}
                      height={200}
                      alt={post.title}
                    />
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Badge color="blue" variant="light">
                      {post.category}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {new Date(post.date).toLocaleDateString()}
                    </Text>
                  </Group>

                  <Title order={3} mb="sm" lineClamp={2}>
                    {post.title}
                  </Title>

                  <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                    {post.excerpt}
                  </Text>

                  <Group justify="space-between" mt="auto">
                    <Text size="sm" c="dimmed">
                      By {post.author}
                    </Text>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      Read More
                    </Button>
                  </Group>
                </Card>
              </motion.div>
            </Grid.Col>
          ))}
        </Grid>

        {filteredPosts.length === 0 && (
          <Text ta="center" c="dimmed" size="lg" mt="xl">
            No posts found matching your criteria.
          </Text>
        )}
      </motion.div>
    </Container>
  );
};
