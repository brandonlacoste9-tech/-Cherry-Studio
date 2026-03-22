import axios from 'axios'
import type { MCPServer, MCPTool } from '../types'

export class MCPService {
  private servers: MCPServer[]

  constructor(servers: MCPServer[]) {
    this.servers = servers
  }

  async getTools(serverId: string): Promise<MCPTool[]> {
    const server = this.servers.find((s) => s.id === serverId)
    if (!server?.enabled) return []

    try {
      const response = await axios.get(`${server.url}/tools`, {
        headers: server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {}
      })
      return response.data.tools || []
    } catch {
      return []
    }
  }

  async callTool(
    serverId: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    const server = this.servers.find((s) => s.id === serverId)
    if (!server?.enabled) throw new Error('Server not found or disabled')

    const response = await axios.post(
      `${server.url}/tools/call`,
      { name: toolName, parameters: params },
      { headers: server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {} }
    )
    return response.data
  }

  async getAllTools(): Promise<{ server: MCPServer; tools: MCPTool[] }[]> {
    const enabled = this.servers.filter((s) => s.enabled)
    const results = await Promise.all(
      enabled.map(async (server) => ({
        server,
        tools: await this.getTools(server.id)
      }))
    )
    return results.filter((r) => r.tools.length > 0)
  }

  async testServer(server: MCPServer): Promise<boolean> {
    try {
      const response = await axios.get(`${server.url}/health`, {
        timeout: 5000,
        headers: server.apiKey ? { Authorization: `Bearer ${server.apiKey}` } : {}
      })
      return response.status === 200
    } catch {
      return false
    }
  }
}
