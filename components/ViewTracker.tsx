"use client";

import { increment, doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { getDb } from "@/lib/firebase/client";

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `quill-viewed-${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    updateDoc(doc(getDb(), "posts", postId), {
      viewCount: increment(1),
    }).catch(() => {
      sessionStorage.removeItem(key);
    });
  }, [postId]);

  return null;
}
