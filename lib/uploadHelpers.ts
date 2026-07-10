export async function uploadProfilePhoto(photo: File) {
  try {
    const formData = new FormData()
    formData.append('photo', photo)

    const token = localStorage.getItem('auth_token')
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api') + '/profile/photo', {
      method: 'POST',
      headers,
      body: formData,
    })

    const result = await response.json()
    if (!response.ok) {
      return { success: false, message: result?.message || 'Erreur lors de l\'upload', errors: result?.errors }
    }

    return { success: true, data: result, message: result?.message }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erreur réseau' }
  }
}
