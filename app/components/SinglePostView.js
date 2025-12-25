"use client";

import PostCard from "./PostCard";

export default function SinglePostView({ post, user, citySlug }) {
  return (
    <div className="space-y-6">
      {/* Postagem principal */}
      <PostCard media={post} citySlug={citySlug} />
    </div>
  );
}
