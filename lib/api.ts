/**
 * Configuration de l'API Backend
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
}

/**
 * Headers par défaut pour toutes les requêtes
 */
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (includeAuth) {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}

/**
 * Gestion des erreurs API
 */
const handleError = (error: any) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const message = error.response.data?.message || 'Une erreur est survenue'
    const errors = error.response.data?.errors || {}
    
    return {
      success: false,
      message,
      errors,
      status: error.response.status,
    }
  } else if (error.request) {
    // Erreur de requête (pas de réponse)
    return {
      success: false,
      message: 'Impossible de contacter le serveur',
      errors: {},
    }
  } else {
    // Autre erreur
    return {
      success: false,
      message: error.message || 'Une erreur inattendue est survenue',
      errors: {},
    }
  }
}

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Inscription
   */
  async register(data: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    language?: string
  }) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // Stocker le token
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Connexion avec email ou téléphone
   */
  async login(login: string, password: string) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({ login, password }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // Stocker le token
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Déconnexion
   */
  async logout() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      })
      
      // Nettoyer le localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      return { success: true }
    } catch (error) {
      // Nettoyer quand même en cas d'erreur
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      return handleError(error)
    }
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  async getUser() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/user`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      localStorage.setItem('user', JSON.stringify(result))
      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Récupérer l'utilisateur du localStorage
   */
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
}

/**
 * Service des annonces
 */
export const annonceService = {
  /**
   * Récupérer toutes les annonces (avec pagination)
   */
  async getAll(params?: {
    page?: number
    category?: string
    search?: string
    min_price?: number
    max_price?: number
    etat?: string
    city?: string
    district?: string
    date_from?: string
    date_to?: string
    status?: string
    user_lat?: number
    user_lng?: number
    distance_km?: number
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.category) queryParams.append('category', params.category)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.min_price !== undefined) queryParams.append('min_price', params.min_price.toString())
      if (params?.max_price !== undefined) queryParams.append('max_price', params.max_price.toString())
      if (params?.etat) queryParams.append('etat', params.etat)
      if (params?.city) queryParams.append('city', params.city)
      if (params?.district) queryParams.append('district', params.district)
      if (params?.date_from) queryParams.append('date_from', params.date_from)
      if (params?.date_to) queryParams.append('date_to', params.date_to)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.user_lat !== undefined) queryParams.append('user_lat', params.user_lat.toString())
      if (params?.user_lng !== undefined) queryParams.append('user_lng', params.user_lng.toString())
      if (params?.distance_km !== undefined) queryParams.append('distance_km', params.distance_km.toString())

      const response = await fetch(
        `${API_CONFIG.baseURL}/annonces?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: getHeaders(false),
        }
      )
      const result = await response.json()
      
      if (!response.ok) {
        // Some backends still return a created resource even with a non-2xx.
        const maybeId = result?.data?.id || result?.id
        if (maybeId) {
          return { success: true, data: result, warning: true }
        }
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Récupérer une annonce par ID
   */
  async getById(id: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}`, {
        method: 'GET',
        headers: getHeaders(false),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Créer une annonce
   */
  async create(data: {
    title: string
    description: string
    price: number
    negotiable?: boolean
    category_id: number
    custom_category?: string | null
    city: string
    district: string
    latitude?: number
    longitude?: number
    etat: string
  }) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/annonces`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Mettre à jour une annonce
   */
  async update(id: number, data: Partial<{
    title: string
    description: string
    price: number
    negotiable: boolean
    category_id: number
    city: string
    district: string
    etat: string
  }>) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Supprimer une annonce
   */
  async delete(id: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Upload photos pour une annonce
   */
  async uploadPhotos(id: number, photos: File[]) {
    try {
      const formData = new FormData()
      photos.forEach((photo) => {
        formData.append('photos[]', photo)
      })

      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}/photos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Upload audio pour la description d'une annonce
   */
  async uploadAudio(id: number, formData: FormData) {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}/audio`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Upload video pour une annonce
   */
  async uploadVideo(id: number, formData: FormData) {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_CONFIG.baseURL}/annonces/${id}/video`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },
}

/**
 * Service des catégories
 */
export const categoryService = {
  /**
   * Récupérer toutes les catégories
   */
  async getAll() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/categories`, {
        method: 'GET',
        headers: getHeaders(false),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },
}

/**
 * Service des favoris
 */
export const favoriteService = {
  /**
   * Récupérer les favoris de l'utilisateur
   */
  async getAll() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // FavoriteResource::collection retourne { data: [...] }
      return { success: true, data: result.data || result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Ajouter aux favoris
   */
  async add(annonceId: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites/${annonceId}`, {
        method: 'POST',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Retirer des favoris
   */
  async remove(annonceId: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/favorites/${annonceId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },
}

/**
 * Service du profil
 */
export const profileService = {
  /**
   * Récupérer le profil
   */
  async get() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Mettre à jour le profil
   */
  async update(data: Partial<{
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    language: string
  }>) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // Mettre à jour l'utilisateur dans localStorage
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return { success: true, data: result.user, message: result.message }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Upload photo de profil
   */
  async uploadPhoto(photo: File) {
    try {
      const formData = new FormData()
      formData.append('photo', photo)

      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_CONFIG.baseURL}/profile/photo`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // Mettre à jour l'utilisateur dans localStorage
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return { success: true, data: result, message: result.message }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Récupérer les annonces de l'utilisateur
   */
  async getAnnonces() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/profile/annonces`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // AnnonceResource::collection retourne { data: [...] }
      return { success: true, data: result.data || result }
    } catch (error) {
      return handleError(error)
    }
  },
}

/**
 * Service des notifications
 */
export const notificationService = {
  /**
   * Récupérer toutes les notifications
   */
  async getAll() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      const unreadCount = Array.isArray(result) ? result.filter((n: any) => !n.read_at).length : 0
      return { success: true, data: unreadCount }
    } catch (error) {
      return handleError(error)
    }
  },
}

/**
 * Service des conversations et messages
 */
export const messageService = {
  /**
   * Récupérer toutes les conversations
   */
  async getConversations() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Récupérer les messages d'une conversation
   */
  async getMessages(conversationId: number) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Envoyer un message
   */
  async sendMessage(conversationId: number, content: string, type: 'text' | 'audio' = 'text') {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, content }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      return { success: true, data: result }
    } catch (error) {
      return handleError(error)
    }
  },

  /**
   * Compter les conversations non lues
   */
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/conversations`, {
        method: 'GET',
        headers: getHeaders(),
      })
      const result = await response.json()
      
      if (!response.ok) {
        throw { response: { data: result, status: response.status } }
      }

      // TODO: Ajuster selon la structure exacte de la réponse du backend
      const unreadCount = Array.isArray(result) ? result.filter((c: any) => c.unread_count > 0).length : 0
      return { success: true, data: unreadCount }
    } catch (error) {
      return handleError(error)
    }
  },
}
