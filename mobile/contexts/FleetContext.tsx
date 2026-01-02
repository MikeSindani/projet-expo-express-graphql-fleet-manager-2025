import { useMutation, useQuery } from "@/lib/graphql-hooks";
import {
    CREATE_CHAUFFEUR,
    CREATE_RAPPORT,
    CREATE_VEHICULE,
    DELETE_CHAUFFEUR,
    DELETE_RAPPORT,
    DELETE_VEHICULE,
    GET_CHAUFFEURS,
    GET_REPORTS,
    GET_VEHICLES,
    MANAGE_ORGANIZATION_ACCESS,
    UPDATE_CHAUFFEUR,
    UPDATE_RAPPORT,
    UPDATE_VEHICULE
} from "@/lib/graphql-queries";
import { Chauffeur, Rapport, User, Vehicule } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  CHAUFFEURS: "fleet_chauffeurs",
  VEHICULES: "fleet_vehicules",
  RAPPORTS: "fleet_rapports",
} as const;

// Define the context shape
interface FleetContextType {
  chauffeurs: Chauffeur[];
  vehicules: Vehicule[];
  rapports: Rapport[];
  isLoading: boolean;
  addChauffeur: (chauffeur: any) => Promise<User | any>;
  updateChauffeur: (id: string, updates: Partial<Chauffeur>) => Promise<void>;
  deleteChauffeur: (id: string) => Promise<void>;
  addVehicule: (vehicule: any) => Promise<Vehicule | any>;
  updateVehicule: (id: string, updates: Partial<Vehicule>) => Promise<void>;
  deleteVehicule: (id: string) => Promise<void>;
  addRapport: (rapport: any) => Promise<Rapport | any>;
  deleteRapport: (id: string) => Promise<void>;
  manageAccess: (id: string, access: boolean) => Promise<void>;
  refreshFleetData: (silent?: boolean) => Promise<void>;
}

const FleetContext = React.createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL Queries
  const { data: serverChauffeurs, refetch: refetchChauffeurs } = useQuery(GET_CHAUFFEURS);
  const { data: serverVehicules, refetch: refetchVehicules } = useQuery(GET_VEHICLES);
  const { data: serverRapports, refetch: refetchRapports } = useQuery(GET_REPORTS);

  // GraphQL Mutations
  const [createChauffeurMutation] = useMutation(CREATE_CHAUFFEUR);
  const [updateChauffeurMutation] = useMutation(UPDATE_CHAUFFEUR);
  const [deleteChauffeurMutation] = useMutation(DELETE_CHAUFFEUR);

  const [createVehiculeMutation] = useMutation(CREATE_VEHICULE);
  const [updateVehiculeMutation] = useMutation(UPDATE_VEHICULE);
  const [deleteVehiculeMutation] = useMutation(DELETE_VEHICULE);

  const [createRapportMutation] = useMutation(CREATE_RAPPORT);
  const [updateRapportMutation] = useMutation(UPDATE_RAPPORT);
  const [deleteRapportMutation] = useMutation(DELETE_RAPPORT);
  
  const [manageAccessMutation] = useMutation(MANAGE_ORGANIZATION_ACCESS);

  const refreshFleetData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      await Promise.all([
        refetchChauffeurs(),
        refetchVehicules(),
        refetchRapports(),
      ]);
    } catch (error) {
      console.error("Error refreshing fleet data:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [refetchChauffeurs, refetchVehicules, refetchRapports]);

  // Initial Load & Auto Refresh
  useEffect(() => {
    loadLocalData();
    // Rafraîchir toutes les 30 secondes pour garder l'interface à jour (silencieusement)
    const interval = setInterval(() => refreshFleetData(true), 30000);
    return () => clearInterval(interval);
  }, [refreshFleetData]);

  // Sync Server Data to Local State & Storage
  useEffect(() => {
    if (serverChauffeurs?.chauffeurs) {
      setChauffeurs(serverChauffeurs.chauffeurs);
      AsyncStorage.setItem(STORAGE_KEYS.CHAUFFEURS, JSON.stringify(serverChauffeurs.chauffeurs));
    }
  }, [serverChauffeurs]);

  useEffect(() => {
    if (serverVehicules?.vehicules) {
      setVehicules(serverVehicules.vehicules);
      AsyncStorage.setItem(STORAGE_KEYS.VEHICULES, JSON.stringify(serverVehicules.vehicules));
    }
  }, [serverVehicules]);

  useEffect(() => {
    if (serverRapports?.rapports) {
      setRapports(serverRapports.rapports);
      AsyncStorage.setItem(STORAGE_KEYS.RAPPORTS, JSON.stringify(serverRapports.rapports));
    }
  }, [serverRapports]);

  const loadLocalData = async () => {
    try {
      const [chauffeursData, vehiculesData, rapportsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CHAUFFEURS),
        AsyncStorage.getItem(STORAGE_KEYS.VEHICULES),
        AsyncStorage.getItem(STORAGE_KEYS.RAPPORTS),
      ]);

      if (chauffeursData) setChauffeurs(JSON.parse(chauffeursData));
      if (vehiculesData) setVehicules(JSON.parse(vehiculesData));
      if (rapportsData) setRapports(JSON.parse(rapportsData));
    } catch (error) {
      console.error("Error loading fleet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Chauffeurs ---
  const addChauffeur = useCallback(
    async (chauffeur: any) => {
      // 1. Optimistic Update
      const tempId = Date.now().toString();
      const newChauffeur = { ...chauffeur, id: tempId, createdAt: new Date().toISOString() };
      const updated = [...chauffeurs, newChauffeur];
      setChauffeurs(updated);

      // 2. Server Sync
      try {
        const result = await createChauffeurMutation(chauffeur);
        // Replace temp ID with real ID from server
        if (result?.createChauffeur) {
           const finalUpdated = updated.map(c => c.id === tempId ? result.createChauffeur : c);
           setChauffeurs(finalUpdated);
           await AsyncStorage.setItem(STORAGE_KEYS.CHAUFFEURS, JSON.stringify(finalUpdated));
           refreshFleetData(true);
           return result.createChauffeur;
        }
      } catch (error) {
        console.error("Failed to sync addChauffeur to server:", error);
        // Rollback optimistic update on error if preferred, or keep as is for offline
        refreshFleetData(true); // Try to sync again
      }
      return newChauffeur;
    },
    [chauffeurs, createChauffeurMutation, refreshFleetData],
  );

  const updateChauffeur = useCallback(
    async (id: string, updates: Partial<Chauffeur>) => {
      const updated = chauffeurs.map((c) => (c.id === id ? { ...c, ...updates } : c));
      setChauffeurs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.CHAUFFEURS, JSON.stringify(updated));

      try {
        await updateChauffeurMutation({ id, ...updates });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync updateChauffeur to server:", error);
      }
    },
    [chauffeurs, updateChauffeurMutation, refreshFleetData],
  );

  const deleteChauffeur = useCallback(
    async (id: string) => {
      const updated = chauffeurs.filter((c) => c.id !== id);
      setChauffeurs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.CHAUFFEURS, JSON.stringify(updated));

      try {
        await deleteChauffeurMutation({ id });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync deleteChauffeur to server:", error);
      }
    },
    [chauffeurs, deleteChauffeurMutation, refreshFleetData],
  );

  const manageAccess = useCallback(
    async (id: string, access: boolean) => {
      const updated = chauffeurs.map((c) => (c.id === id ? { ...c, organizationAccess: access } : c));
      setChauffeurs(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.CHAUFFEURS, JSON.stringify(updated));

      try {
         await manageAccessMutation({ userId: id, access });
         refreshFleetData(true);
      } catch (error) {
        console.error("Failed to manage access:", error);
         // rollback locally if needed
         refreshFleetData(true); 
      }
    },
    [chauffeurs, manageAccessMutation, refreshFleetData]
  );

  // --- Vehicules ---
  const addVehicule = useCallback(
    async (vehicule: any) => {
      const tempId = Date.now().toString(); // Local temp ID
      const newVehicule = { ...vehicule, id: tempId, createdAt: new Date().toISOString() };
      const updated = [...vehicules, newVehicule];
      setVehicules(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICULES, JSON.stringify(updated));

      try {
        const result = await createVehiculeMutation(vehicule);
        if (result?.createVehicule) {
            const finalUpdated = updated.map(v => v.id === tempId ? result.createVehicule : v);
            setVehicules(finalUpdated);
            await AsyncStorage.setItem(STORAGE_KEYS.VEHICULES, JSON.stringify(finalUpdated));
            refreshFleetData(true);
            return result.createVehicule;
        }
      } catch (error) {
        console.error("Failed to sync addVehicule to server:", error);
        refreshFleetData(true);
      }
      return newVehicule;
    },
    [vehicules, createVehiculeMutation, refreshFleetData],
  );

  const updateVehicule = useCallback(
    async (id: string, updates: Partial<Vehicule>) => {
      const existingVehicule = vehicules.find((v) => v.id === id);
      if (!existingVehicule) {
        console.error("Vehicle not found for update:", id);
        return;
      }

      const updatedVehicule = { ...existingVehicule, ...updates };
      const updatedList = vehicules.map((v) => (v.id === id ? updatedVehicule : v));
      setVehicules(updatedList);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICULES, JSON.stringify(updatedList));

      try {
        // Backend requires all fields for update
        await updateVehiculeMutation({
          id: parseInt(id),
          immatriculation: updatedVehicule.immatriculation,
          marque: updatedVehicule.marque,
          modele: updatedVehicule.modele,
          annee: updatedVehicule.annee,
          statut: updatedVehicule.statut,
        });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync updateVehicule to server:", error);
        // Revert optimistic update if needed, or just log error (offline strategy keeps local change)
        refreshFleetData(true);
      }
    },
    [vehicules, updateVehiculeMutation, refreshFleetData],
  );

  const deleteVehicule = useCallback(
    async (id: string) => {
      const updated = vehicules.filter((v) => v.id !== id);
      setVehicules(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICULES, JSON.stringify(updated));

      try {
        await deleteVehiculeMutation({ id: parseInt(id) });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync deleteVehicule to server:", error);
      }
    },
    [vehicules, deleteVehiculeMutation, refreshFleetData],
  );

  // --- Rapports ---
  const addRapport = useCallback(
    async (rapport: any) => {
      const tempId = Date.now().toString();
      const newRapport = { ...rapport, id: tempId, createdAt: new Date().toISOString() };
      const updated = [...rapports, newRapport];
      setRapports(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.RAPPORTS, JSON.stringify(updated));

      try {
        const result = await createRapportMutation(rapport);
        if (result?.createRapport) {
            const finalUpdated = updated.map(r => r.id === tempId ? result.createRapport : r);
            setRapports(finalUpdated);
            await AsyncStorage.setItem(STORAGE_KEYS.RAPPORTS, JSON.stringify(finalUpdated));
            refreshFleetData(true);
            return result.createRapport;
        }
      } catch (error) {
        console.error("Failed to sync addRapport to server:", error);
        refreshFleetData(true);
      }
      return newRapport;
    },
    [rapports, createRapportMutation, refreshFleetData],
  );


  const updateRapport = useCallback(
    async (id: string, updates: Partial<Rapport>) => {
      const existingRapport = rapports.find((r) => r.id === id);
      if (!existingRapport) {
        console.error("Rapport not found for update:", id);
        return;
      }

      const updatedRapport = { ...existingRapport, ...updates };
      const updatedList = rapports.map((r) => (r.id === id ? updatedRapport : r));
      setRapports(updatedList);
      await AsyncStorage.setItem(STORAGE_KEYS.RAPPORTS, JSON.stringify(updatedList));

      try {
        // Backend requires all fields for update
        await updateRapportMutation({
          id: parseInt(id),
          incident: updatedRapport.incidents,
          kilometrage: updatedRapport.kilometrage,
          commentaire: updatedRapport.commentaires,
          date: updatedRapport.date,
          chauffeurId: updatedRapport.chauffeurId,
          vehiculeId: updatedRapport.vehiculeId,
        });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync updateRapport to server:", error);
        // Revert optimistic update if needed, or just log error (offline strategy keeps local change)
        refreshFleetData(true);
      }
    },
    [rapports, updateRapportMutation, refreshFleetData],
  );

  const deleteRapport = useCallback(
    async (id: string) => {
      const updated = rapports.filter((r) => r.id !== id);
      setRapports(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.RAPPORTS, JSON.stringify(updated));

      try {
        await deleteRapportMutation({ id: parseInt(id) });
        refreshFleetData(true);
      } catch (error) {
        console.error("Failed to sync deleteRapport to server:", error);
      }
    },
    [rapports, deleteRapportMutation, refreshFleetData],
  );

  const value = useMemo(
    () => ({
      chauffeurs,
      vehicules,
      rapports,
      isLoading,
      addChauffeur,
      updateChauffeur,
      deleteChauffeur,
      addVehicule,
      updateVehicule,
      deleteVehicule,
      addRapport,
      updateRapport,
      deleteRapport,
      manageAccess,
      refreshFleetData,
    }),
    [
      chauffeurs,
      vehicules,
      rapports,
      isLoading,
      addChauffeur,
      updateChauffeur,
      deleteChauffeur,
      addVehicule,
      updateVehicule,
      deleteVehicule,
      addRapport,
      updateRapport,
      deleteRapport,
      manageAccess,
      refreshFleetData,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const context = React.useContext(FleetContext);
  if (context === undefined) {
    throw new Error("useFleet must be used within a FleetProvider");
  }
  return context;
}
