export type UserRole = "writer" | "admin";
export type PostStatus = "draft" | "published";
export type PayoutStatus = "pending" | "paid";

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  bio: string;
  role: UserRole;
  createdAt: string | null;
};

export type PostView = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  canonicalPath: string;
  content: string;
  tags: string[];
  status: PostStatus;
  createdAt: string | null;
  publishedAt: string | null;
  viewCount: number;
};

export type Payout = {
  id: string;
  authorId: string;
  authorName: string;
  month: string;
  totalAdRevenue: number;
  writerShare: number;
  status: PayoutStatus;
  paidAt: string | null;
};

export type RevenueShareConfig = {
  writerPercent: number;
};
