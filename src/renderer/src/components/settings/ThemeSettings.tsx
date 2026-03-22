import React from 'react'
import { Moon, Sun, Monitor, Type, Bell, Zap, Clock, Eye } from 'lucide-react'
import { useSettingsStore } from '../../store'
import type { ThemeMode } from '../../types'

export const ThemeSettings: React.FC = () => {
  const { settings, updateSettings, setTheme } = useSettingsStore()

  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'system', label: 'System', icon: <Monitor size={16} /> }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Theme</h3>
        <div className="flex gap-2">
          {themes.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors ${
                settings.theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'
              }`}
            >
              {icon}
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Font Size</h3>
        <div className="flex items-center gap-3">
          <Type size={14} className="text-zinc-400" />
          <input
            type="range"
            min="12"
            max="20"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
            className="flex-1 accent-blue-500"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400 w-8">{settings.fontSize}px</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chat Settings</h3>

        {([
          {
            key: 'sendWithEnter' as const,
            label: 'Send with Enter',
            description: 'Press Enter to send (Shift+Enter for new line)',
            icon: <Zap size={16} />
          },
          {
            key: 'streamingEnabled' as const,
            label: 'Streaming responses',
            description: 'Show responses as they are generated',
            icon: <Zap size={16} />
          },
          {
            key: 'showTokenCount' as const,
            label: 'Show token count',
            description: 'Display token usage for each message',
            icon: <Eye size={16} />
          },
          {
            key: 'showTimestamps' as const,
            label: 'Show timestamps',
            description: 'Show time for each message',
            icon: <Clock size={16} />
          },
          {
            key: 'enableNotifications' as const,
            label: 'Notifications',
            description: 'System notifications for responses',
            icon: <Bell size={16} />
          }
        ] as const).map(({ key, label, description, icon }) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              <div className="text-zinc-400">{icon}</div>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-400">{description}</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ [key]: !settings[key] })}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                settings[key] ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings[key] ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
