"use client";

import { use } from "react";
import { PostEditor } from "@/components/PostEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  return <PostEditor postId={postId} />;
}
