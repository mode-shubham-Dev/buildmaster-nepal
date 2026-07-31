import api from "./api";

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  created_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function fetchUsers(): Promise<ManagedUser[]> {
  const res = await api.get("/users");
  return res.data.users;
}

export async function fetchRoles(): Promise<string[]> {
  const res = await api.get("/roles");
  return res.data.roles;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<ManagedUser> {
  const res = await api.post("/users", payload);
  return res.data.user;
}

export async function updateUserRole(
  userId: number,
  role: string,
): Promise<ManagedUser> {
  const res = await api.put(`/users/${userId}/role`, { role });
  return res.data.user;
}

export async function deleteUser(userId: number): Promise<void> {
  await api.delete(`/users/${userId}`);
}
