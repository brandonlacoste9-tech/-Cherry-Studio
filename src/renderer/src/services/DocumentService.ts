import type { ProcessedDocument } from '../types'
import { nanoid } from '../utils/nanoid'

export class DocumentService {
  static async processFile(file: File): Promise<ProcessedDocument> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (this.isImageType(file.type)) {
      return this.processImage(file)
    }

    if (ext === 'pdf') {
      return this.processPDF(file)
    }

    if (this.isTextType(file.type) || this.isCodeFile(ext)) {
      return this.processText(file)
    }

    return this.processGeneric(file)
  }

  static async processText(file: File): Promise<ProcessedDocument> {
    const content = await file.text()
    return {
      id: nanoid(),
      name: file.name,
      type: 'text',
      content,
      metadata: { size: file.size, lastModified: file.lastModified }
    }
  }

  static async processImage(file: File): Promise<ProcessedDocument> {
    const base64 = await this.fileToBase64(file)
    return {
      id: nanoid(),
      name: file.name,
      type: 'image',
      content: base64,
      metadata: { mimeType: file.type, size: file.size }
    }
  }

  static async processPDF(file: File): Promise<ProcessedDocument> {
    // In a real implementation, we'd use pdf.js or similar
    // For now, return the base64 with a note
    const base64 = await this.fileToBase64(file)
    return {
      id: nanoid(),
      name: file.name,
      type: 'pdf',
      content: `[PDF Document: ${file.name}]\nBase64: ${base64.slice(0, 100)}...`,
      metadata: { size: file.size, mimeType: 'application/pdf' }
    }
  }

  static async processGeneric(file: File): Promise<ProcessedDocument> {
    const base64 = await this.fileToBase64(file)
    return {
      id: nanoid(),
      name: file.name,
      type: 'other',
      content: base64,
      metadata: { mimeType: file.type, size: file.size }
    }
  }

  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  static isImageType(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  static isTextType(mimeType: string): boolean {
    return mimeType.startsWith('text/') || mimeType === 'application/json'
  }

  static isCodeFile(ext: string): boolean {
    const codeExts = [
      'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go',
      'rs', 'rb', 'php', 'swift', 'kt', 'sh', 'bash', 'sql', 'html',
      'css', 'scss', 'yaml', 'yml', 'json', 'xml', 'md', 'toml'
    ]
    return codeExts.includes(ext)
  }

  static getAcceptedFileTypes(): string {
    return [
      'image/*',
      '.pdf',
      '.txt', '.md', '.markdown',
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp',
      '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt',
      '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.xml',
      '.csv', '.sql'
    ].join(',')
  }
}
