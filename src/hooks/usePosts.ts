import { useQuery } from '@tanstack/react-query';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const fetchPosts = async (): Promise<Post[]> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
};
