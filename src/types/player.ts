/**
 * Players. We collect the minimum: a display name and ONE contact
 * (email or phone) for sign-in. Mirrors the future `players` table
 * (the contact itself lives in Supabase Auth, not in our tables).
 */
export type ContactKind = 'email' | 'phone';

export interface Player {
  id: string;
  displayName: string;
  contactKind: ContactKind;
  /** Email address or phone number used to sign in. */
  contact: string;
  createdAt: string;
  /** When the player accepted the privacy notice. */
  privacyAcceptedAt: string;
}

export interface Session {
  player: Player;
}
