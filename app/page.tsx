'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/store'
import { connectCRM } from '@/lib/api'
import { Cloud, Hexagon, Zap, BarChart3, Database, CheckCircle2 } from 'lucide-react'

const CRM_OPTIONS = [
  { id: 'salesforce', name: 'SALESFORCE', icon: Cloud, placeholder: 'sf_live_...' },
  { id: 'hubspot', name: 'HUBSPOT', icon: Hexagon, placeholder: 'pat-na1-...' },
  { id: 'pipedrive', name: 'PIPEDRIVE', icon: BarChart3, placeholder: 'pd_api_...' },
  { id: 'zoho', name: 'ZOHO CRM', icon: Database, placeholder: 'zoho_...' },
  { id: 'ghl', name: 'GOHIGHLEVEL', icon: Zap, placeholder: 'ghl_...' },
]

export default function ConnectPage() {
  const router = useRouter()
  const { setConnection, setIsLoading } = useApp()
  const [selectedCRM, setSelectedCRM] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const selectedOption = CRM_OPTIONS.find(c => c.id === selectedCRM)

  const handleConnect = async () => {
    if (!selectedCRM || !apiKey.trim()) {
      setError('Please select a CRM and enter your API key')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const result = await connectCRM({
        provider: selectedCRM as any,
        credentials: { apiKey: apiKey.trim() },
      })

      if (result.success) {
        setConnection({
          provider: selectedCRM,
          credentials: { apiKey: apiKey.trim() },
          connected: true,
          connectedAt: new Date().toISOString(),
        })
        router.push('/dashboard')
      } else {
        setError('Connection failed. Please check your API key.')
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <main className="min-h-screen bg-pons-black flex flex-col items-center px-6 py-12 safe-area-top">
      {/* Logo */}
      <h1 className="pons-logo text-4xl mb-4">PONS</h1>
      
      {/* Title */}
      <h2 className="text-2xl font-semibold text-white mb-2">Connect Data Source</h2>
      <p className="text-gray-400 text-center text-sm mb-8 max-w-sm">
        PONS requires read-only access to your CRM to detect revenue leaks.
      </p>

      {/* CRM Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
        {CRM_OPTIONS.map((crm) => {
          const Icon = crm.icon
          const isSelected = selectedCRM === crm.id
          return (
            <button
              key={crm.id}
              onClick={() => setSelectedCRM(crm.id)}
              className={`crm-card flex flex-col items-center justify-center py-6 ${
                isSelected ? 'selected' : ''
              }`}
            >
              <Icon 
                size={24} 
                className={isSelected ? 'text-pons-blue' : 'text-gray-500'} 
              />
              <span className={`text-xs font-semibold mt-2 tracking-wide ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`}>
                {crm.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Connection Form */}
      {selectedCRM && (
        <div className="w-full max-w-sm card p-6 space-y-4">
          {/* Security Badge */}
          <div className="flex items-center gap-2 text-pons-green text-xs">
            <CheckCircle2 size={14} />
            <span className="font-semibold tracking-wide">SECURE TLS 1.3 CONNECTION</span>
          </div>

          {/* API Key Label */}
          <label className="block text-sm text-gray-400">
            {selectedOption?.name} API Key
          </label>

          {/* API Key Input */}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selectedOption?.placeholder || 'sk_live_...'}
            className="w-full"
          />

          {/* Error Message */}
          {error && (
            <p className="text-pons-red text-sm">{error}</p>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting || !apiKey.trim()}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              isConnecting ? 'opacity-50' : ''
            }`}
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Authenticate & Sync
                <span className="text-lg">→</span>
              </>
            )}
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to PONS processing your data in memory. No data is stored persistently.
          </p>
        </div>
      )}
    </main>
  )
}
