import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  telephone: z.string().default(""),
  licenseNumber: z.string().min(1, "Le numéro de permis est requis"),
  licenseExpiryDate: z.string().default(""),
});

export type DriverFormData = z.infer<typeof driverSchema>;
