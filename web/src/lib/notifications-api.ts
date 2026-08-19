import api from "./api";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  icon: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ActionItem {
  key: string;
  label: string;
  count: number;
  link: string;
  icon: string;
  tone: string;
}

export interface NotificationBundle {
  notifications: AppNotification[];
  unread_count: number;
  actions: ActionItem[];
}

export interface NotificationSummary {
  unread_count: number;
  action_count: number;
}

export async function fetchNotifications(): Promise<NotificationBundle> {
  const res = await api.get("/notifications");
  return res.data;
}

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const res = await api.get("/notifications/summary");
  return res.data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}
