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
  organization?: Organization;
}

export interface Chauffeur {
  id: string;
  name: string;
  email: string;
  telephone: string;
  licenseNumber: string;
  role: "CHAUFFEUR";
  createdAt?: string;
  organizationAccess?: boolean;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  statut: "DISPONIBLE" | "EN_COURSE" | "EN_MAINTENANCE";
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
  createdAt?: string;
}
