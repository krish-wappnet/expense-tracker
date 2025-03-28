// src/types/user.ts
export interface User {
    id: string;
    email: string;
    name: string;
    profilePicture?: string; // Optional, as it might not always be present
  }