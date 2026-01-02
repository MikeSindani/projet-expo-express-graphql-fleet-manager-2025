/**
 * Centralized GraphQL queries and mutations
 */

// Authentication Mutations
export const FORGOT_PASSWORD = `
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const FORGOT_PASSWORD_WITH_PHONE = `
  mutation ForgotPasswordWithPhone($telephone: String!) {
    forgotPasswordWithPhone(telephone: $telephone)
  }
`;

export const LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
        organizationId
        organizationAccess
        organization {
          id
          name
          createdAt
        }
      }
    }
  }
`;

export const LOGIN_WITH_PHONE = `
  mutation LoginWithPhone($telephone: String!, $password: String!) {
    loginWithPhone(telephone: $telephone, password: $password) {
      token
      user {
        id
        name
        email
        telephone
        role
        organizationId
        organizationAccess
        organization {
        id
        name
      }
      }
    }
  }
`;

export const REGISTER = `
  mutation Register($name: String!, $email: String!, $password: String!, $role: String!) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        role
        organizationId
        organizationAccess
        organization {
        id
        name
      }
      }
    }
  }
`;

export const REGISTER_WITH_PHONE = `
  mutation RegisterWithPhone($name: String!, $telephone: String!, $password: String!, $role: String!) {
    registerWithPhone(name: $name, telephone: $telephone, password: $password, role: $role) {
      token
      user {
        id
        name
        telephone
        role
        organizationId
        organizationAccess
      }
    }
  }
`;

export const GET_ORGANIZATION = `
  query getOrganizationUser($id: String!) {
    getOrganizationUser(userId: $id) {
      id
      name
      createdAt
    }
  }
`;

export const GET_ORGANIZATION_MEMBERS = `
  query GetOrganizationMembers($organizationId: String!) {
    organizationMembers(organizationId: $organizationId) {
      id
      name
      email
      telephone
      role
      organizationAccess
    }
  }
`;

export const GET_USER = `
  query GetUser($id: String!) {
    user(id: $id) {
      id
      name
      email
      role
      organizationId
      organizationAccess
      telephone
      licenseNumber
      licenseExpiryDate
      licenseImage
      createdAt
      organization {
        id
        name
      }
    }
  }
`;

export const GET_USER_WITH_ORG = `
  query GetUserWithOrg($id: String!) {
    user(id: $id) {
      id
      name
      email
      role
      telephone
      licenseNumber
      licenseExpiryDate
      licenseImage
      organizationId
      organizationAccess
      organization {
        id
        name
      }
      image
      createdAt
    }
  }
`;

export const GET_USERS = `
  query GetUsers {
    users {
      id
      name
      email
      role
      organizationId
      organizationAccess
      organization {
        id
        name
      }
    }
  }
`;

export const GET_VEHICLES = `
  query GetVehicles {
    vehicules {
      id
      immatriculation
      marque
      modele
      annee
      statut
      image
      registrationCardImage
      driver {
        id
        name
      }
    }
  }
`;

export const GET_REPORTS = `
  query GetReports {
    rapports {
      id
      date
      kilometrage
      incidents
      commentaires
    }
  }
`;

export const UPDATE_PROFILE = `
  mutation UpdateProfile($id: String!, $name: String!, $email: String!, $password: String!, $role: Role!) {
    updateProfile(id: $id, name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
      telephone
      licenseNumber
      organizationAccess
    }
  }
`;

export const ADD_USER_TO_ORG = `
  mutation AddUserToOrganization($email: String!, $organizationId: String!, $telephone: String!) {
    addUserToOrganization(email: $email, organizationId: $organizationId, telephone: $telephone) {
      id
      name
      email
      role
      organizationAccess
    }
  }
`;

export const MANAGE_ORGANIZATION_ACCESS = `
  mutation ManageOrganizationAccess($userId: String!, $access: Boolean!) {
    manageOrganizationAccess(userId: $userId, access: $access) {
      id
      name
      email
      organizationAccess
    }
  }
`;

export const CREATE_ORGANIZATION = `
  mutation CreateOrganization($name: String!, $userId: String) {
    createOrganization(name: $name, userId: $userId) {
      id
      name
      createdAt
    }
  }
`;

export const GET_DASHBOARD_STATS = `
  query GetDashboardStats($id: String) {
    countChauffeur(organizationId: $id)
    countVehicule(organizationId: $id)
    countIndisponibleVehicule(organizationId: $id)
    countRapport(organizationId: $id)
    rapports {
      id
      date
      kilometrage
      incidents
      commentaires
      user {
        name
        email
      }
      vehicule {
        marque
        modele
        immatriculation
      }
    }
  }
`;

export const GET_CHAUFFEURS = `
  query GetChauffeurs {
    chauffeurs {
      id
      name
      email
      telephone
      licenseNumber
      licenseExpiryDate
      licenseImage
      role
      organizationAccess
      image
    }
  }
`;

export const CREATE_VEHICULE = `
  mutation CreateVehicule($immatriculation: String!, $marque: String!, $modele: String!, $annee: Int!, $userId: String!, $driverId: String, $image: String, $registrationCardImage: String) {
    createVehicule(immatriculation: $immatriculation, marque: $marque, modele: $modele, annee: $annee, userId: $userId, driverId: $driverId, image: $image, registrationCardImage: $registrationCardImage) {
      id
      immatriculation
      marque
      modele
      annee
      statut
      image
      registrationCardImage
      driver {
        id
        name
      }
    }
  }
`;

export const UPDATE_VEHICULE = `
  mutation UpdateVehicule($id: Int!, $immatriculation: String!, $marque: String!, $modele: String!, $annee: Int!, $statut: String!) {
    updateVehicule(id: $id, immatriculation: $immatriculation, marque: $marque, modele: $modele, annee: $annee, statut: $statut) {
      id
      immatriculation
      marque
      modele
      annee
      statut
    }
  }
`;

export const DELETE_VEHICULE = `
  mutation DeleteVehicule($id: Int!) {
    deleteVehicule(id: $id)
  }
`;

export const CREATE_RAPPORT = `
  mutation CreateRapport($date: String, $kilometrage: Int!, $incidents: String, $commentaires: String, $chauffeurId: String!, $vehiculeId: Int!) {
    createRapport(date: $date, kilometrage: $kilometrage, incidents: $incidents, commentaires: $commentaires, chauffeurId: $chauffeurId, vehiculeId: $vehiculeId) {
      id
      date
      kilometrage
      incidents
      commentaires
    }
  }
`;

export const UPDATE_RAPPORT = `
  mutation UpdateRapport($id: Int!, $date: String, $kilometrage: Int, $incidents: String, $commentaires: String, $chauffeurId: String, $vehiculeId: Int) {
    updateRapport(id: $id, date: $date, kilometrage: $kilometrage, incidents: $incidents, commentaires: $commentaires, chauffeurId: $chauffeurId, vehiculeId: $vehiculeId) {
      id
      date
      kilometrage
      incidents
      commentaires
    }
  }
`;

export const DELETE_RAPPORT = `
  mutation DeleteRapport($id: Int!) {
    deleteRapport(id: $id)
  }
`;

export const CREATE_CHAUFFEUR = `
  mutation CreateChauffeur($name: String!, $email: String, $password: String!, $role: Role!, $telephone: String, $licenseNumber: String, $licenseExpiryDate: String, $licenseImage: String, $organizationId: String , $image: String) {
    createChauffeur(name: $name, email: $email, password: $password, role: $role, telephone: $telephone, licenseNumber: $licenseNumber, licenseExpiryDate: $licenseExpiryDate, licenseImage: $licenseImage, organizationId: $organizationId , image: $image) {
      id
      name
      email
      role
      image 
      telephone
      licenseNumber
      licenseExpiryDate
      licenseImage
      organizationAccess
      organizationId
    }
  }
`;

export const UPDATE_CHAUFFEUR = `
  mutation UpdateChauffeur($id: ID!, $name: String, $email: String, $password: String, $telephone: String, $role: Role, $licenseNumber: String, $licenseExpiryDate: String, $licenseImage: String, $organizationId: String, $image: String) {
    updateChauffeur(id: $id, name: $name, email: $email, password: $password, telephone: $telephone, role: $role, licenseNumber: $licenseNumber, licenseExpiryDate: $licenseExpiryDate, licenseImage: $licenseImage, organizationId: $organizationId, image: $image) {
      id
      name
      email
      role
      image 
      telephone
      licenseNumber
      licenseExpiryDate
      licenseImage
      organizationAccess
      organizationId
    }
  }
`;

export const DELETE_CHAUFFEUR = `
  mutation DeleteChauffeur($id: String!) {
    deleteChauffeur(id: $id)
  }
`;

export const SEARCH_QUERY = `
  query Search($query: String!, $organizationId: String) {
    search(query: $query, organizationId: $organizationId) {
      chauffeurs {
        id
        name
        email
        telephone
        licenseNumber
        role
      }
      vehicules {
        id
        immatriculation
        marque
        modele
        annee
        statut
      }
      rapports {
        id
        date
        kilometrage
        incidents
        commentaires
        user {
          id
          name
        }
        vehicule {
          id
          immatriculation
        }
      }
    }
  }
`;


// Notifications
export const GET_NOTIFICATIONS = `
  query GetNotifications {
    notifications {
      id
      message
      read
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      message
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

// Subscriptions
export const NOTIFICATION_RECEIVED = `
  subscription NotificationReceived {
    notificationReceived {
      id
      message
      read
    }
  }
`;

export const LOGOUT = `
  mutation Logout($token: String!) {
    logout(token: $token)
  }
`;

export const UPLOAD_FILE = `
  mutation uploadFile($file: Upload!, $folder: Folder!) {
    uploadFile(file: $file, folder: $folder)
  }
`;



