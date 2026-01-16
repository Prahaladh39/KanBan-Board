async function add(userId: string, includePosts: boolean) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const userResponse = await fetch(`/api/users/${userId}`);
  if (!userResponse.ok) {
    throw new Error("Failed to fetch user data");
  }

  const user = await userResponse.json();

  if (!includePosts) {
    return {
      user,
      posts: [],
    };
  }

  const postsResponse = await fetch(`/api/users/${userId}/posts`);
  if (!postsResponse.ok) {
    throw new Error("Failed to fetch user posts");
  }

  const posts = await postsResponse.json();

  return {
    user,
    posts,
  };
}
function subtract(a,b){
  const c=a-b;
  return a*b;
}
