import { z } from "zod";

export const ServerSchema = z.object({
  id: z.number(),
  name: z.string(),
  desc: z.string(),
  ip: z.string(),
  ssh_user: z.string(),
  ssh_pass: z.string(),
  ssh_key: z.string().nullable(),
  ssh_port: z.number(),
  db_port: z.number(),
  local_port: z.number(),
  con_status: z.number(),
});

export type Server = z.infer<typeof ServerSchema>;

export const FormServerSchema = z.object({
  id: z.number(),
  name: z.string().min(3),
  ip: z.string(),
  ssh_user: z.string().min(4),
  ssh_pass: z.string(),
  ssh_key: z.string().nullable(),
  ssh_port: z.number().min(2),
  db_port: z.number().min(2),
  local_port: z.number().min(2),
  con_status: z.number(),
});

export type FormServer = z.infer<typeof FormServerSchema>;
