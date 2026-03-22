import { createClient, WebDAVClient } from 'webdav'
import type { WebDAVConfig } from '../types'

export class WebDAVService {
  private client: WebDAVClient | null = null
  private config: WebDAVConfig

  constructor(config: WebDAVConfig) {
    this.config = config
    if (config.url && config.username) {
      this.client = createClient(config.url, {
        username: config.username,
        password: config.password
      })
    }
  }

  private ensureClient(): WebDAVClient {
    if (!this.client) {
      throw new Error('WebDAV client not configured')
    }
    return this.client
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = this.ensureClient()
      await client.getDirectoryContents('/')
      return true
    } catch {
      return false
    }
  }

  async ensureDirectory(path: string): Promise<void> {
    const client = this.ensureClient()
    try {
      await client.createDirectory(path)
    } catch {
      // Directory might already exist
    }
  }

  async backup(data: string, filename: string): Promise<boolean> {
    try {
      const client = this.ensureClient()
      await this.ensureDirectory(this.config.remotePath)
      await client.putFileContents(`${this.config.remotePath}${filename}`, data, {
        overwrite: true
      })
      return true
    } catch (error) {
      console.error('WebDAV backup error:', error)
      return false
    }
  }

  async restore(filename: string): Promise<string | null> {
    try {
      const client = this.ensureClient()
      const content = await client.getFileContents(
        `${this.config.remotePath}${filename}`,
        { format: 'text' }
      )
      return content as string
    } catch (error) {
      console.error('WebDAV restore error:', error)
      return null
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      const client = this.ensureClient()
      const items = await client.getDirectoryContents(this.config.remotePath)
      if (Array.isArray(items)) {
        return items
          .filter((item) => item.type === 'file' && item.basename.endsWith('.json'))
          .map((item) => item.basename)
      }
      return []
    } catch {
      return []
    }
  }

  async deleteBackup(filename: string): Promise<boolean> {
    try {
      const client = this.ensureClient()
      await client.deleteFile(`${this.config.remotePath}${filename}`)
      return true
    } catch {
      return false
    }
  }
}
