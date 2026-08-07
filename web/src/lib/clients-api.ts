import api from "./api";

export interface ClientContact {
  id: number;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
}

export interface Contract {
  id: number;
  title: string;
  contract_no: string | null;
  value: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "active" | "completed" | "terminated";
  description: string | null;
}

export interface Communication {
  id: number;
  type: "call" | "email" | "meeting" | "note";
  subject: string;
  body: string | null;
  communicated_at: string | null;
  user?: { id: number; name: string } | null;
}

export interface Client {
  id: number;
  name: string;
  type: "individual" | "company";
  email: string | null;
  phone: string | null;
  pan_vat_no: string | null;
  website: string | null;
  address: string | null;
  status: "active" | "inactive";
  notes: string | null;
  contacts_count?: number;
  contracts_count?: number;
  communications_count?: number;
  contacts?: ClientContact[];
  contracts?: Contract[];
  communications?: Communication[];
  created_at: string;
}

export interface ClientFilters {
  search?: string;
  status?: string;
}

// Clients
export async function fetchClients(
  filters: ClientFilters = {},
): Promise<Client[]> {
  const res = await api.get("/clients", { params: filters });
  return res.data.clients;
}

export async function fetchClient(id: number): Promise<Client> {
  const res = await api.get(`/clients/${id}`);
  return res.data.client;
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  const res = await api.post("/clients", payload);
  return res.data.client;
}

export async function updateClient(
  id: number,
  payload: Partial<Client>,
): Promise<Client> {
  const res = await api.put(`/clients/${id}`, payload);
  return res.data.client;
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clients/${id}`);
}

// Contacts
export async function addClientContact(
  clientId: number,
  payload: Partial<ClientContact>,
): Promise<ClientContact> {
  const res = await api.post(`/clients/${clientId}/contacts`, payload);
  return res.data.contact;
}

export async function deleteClientContact(contactId: number): Promise<void> {
  await api.delete(`/client-contacts/${contactId}`);
}

// Contracts
export async function addContract(
  clientId: number,
  payload: Partial<Contract>,
): Promise<Contract> {
  const res = await api.post(`/clients/${clientId}/contracts`, payload);
  return res.data.contract;
}

export async function deleteContract(contractId: number): Promise<void> {
  await api.delete(`/contracts/${contractId}`);
}

// Communications
export async function addCommunication(
  clientId: number,
  payload: Partial<Communication>,
): Promise<Communication> {
  const res = await api.post(`/clients/${clientId}/communications`, payload);
  return res.data.communication;
}

export async function deleteCommunication(commId: number): Promise<void> {
  await api.delete(`/communications/${commId}`);
}
