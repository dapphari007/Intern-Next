export class ImageService {
  static async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      }
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload an image smaller than 2MB.'
      }
    }

    return { valid: true }
  }

  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  static getDefaultAvatar(name?: string): string {
    // Generate a simple avatar based on initials
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'
    
    // Return a data URL for a simple colored square with initials
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Background color based on name hash
      const hash = name ? name.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0
      const hue = hash % 360
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
      ctx.fillRect(0, 0, 100, 100)
      
      // Text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(initials, 50, 50)
    }
    
    return canvas.toDataURL()
  }
}