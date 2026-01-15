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
  const c=a+b;
  const ex='hello'+c;
  const nr='life is beatiful';
  const fax='life is not easy mate';
  const yes='no, its not easy';
  const amr='america loves oil';
  const dr='do does diddy';
  const exc=a+b;
  const final=c+exc
  const exr='this is final'
}
