export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface Record {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
}
