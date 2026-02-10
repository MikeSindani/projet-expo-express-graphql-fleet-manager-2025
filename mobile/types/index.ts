export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "GESTIONNAIRE" | "CHAUFFEUR";
  organizationId?: number;
  organizationAccess?: boolean;
  image?: string;
  licenseExpiryDate?: string;
  licenseImage?: string;
  organization?: Organization;
}

export interface Chauffeur {
  id: string;
  name: string;
  email: string;
  telephone: string;
  licenseNumber: string;
  licenseExpiryDate?: string;
  licenseImage?: string;
  image?: string;
  role: "CHAUFFEUR";
  createdAt?: string;
  organizationAccess?: boolean;
}

export interface Vehicule {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  statut: string;
  driverId?: string;
  driver?: User;
  image?: string;
  images?: { id: number; url: string }[];
  registrationCardImage?: string;
  createdAt?: string;
}

export interface Rapport {
  id: string;
  chauffeurId: string;
  vehiculeId: number;
  date: string;
  kilometrage: number;
  incidents: string;
  commentaires: string;
  type?: string;
  images?: { id: number; url: string }[];
  createdAt?: string;
}
