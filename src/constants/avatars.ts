// Default avatar image for users without an avatar
export const DEFAULT_AVATAR_URL =
  'https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4866.jpg';

// Helper function to get avatar URL with fallback
export const getAvatarUrl = (avatarUrl?: string | null): string => {
  return avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : DEFAULT_AVATAR_URL;
};

