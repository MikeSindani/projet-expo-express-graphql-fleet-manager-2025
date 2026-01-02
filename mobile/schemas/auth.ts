import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide").min(1, "L'email est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
