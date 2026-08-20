import api from "./api";

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface ProfileUpdatePayload {
  name: string;
  phone?: string | null;
}

export interface PasswordChangePayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export async function fetchProfile(): Promise<ProfileUser> {
  const res = await api.get("/profile");
  return res.data.user;
}

export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<void> {
  await api.put("/profile", payload);
}

export async function changePassword(
  payload: PasswordChangePayload,
): Promise<void> {
  await api.put("/profile/password", payload);
}
