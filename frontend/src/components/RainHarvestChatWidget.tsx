import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react'

interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
}

const PRESET_QUESTIONS = [
  'How is optimal tank capacity calculated?',
  'What is first-flush diversion?',
  'Which soil type is best for recharge pits?',
  'What are CPWD runoff coefficients?',
]

const BOT_KNOWLEDGE: Record<string, string> = {
  'tank': 'Optimal tank sizing uses mass-curve water balance simulation balancing monthly monsoon inflow against household demand. It identifies the capacity that minimizes CapEx while reaching diminishing return thresholds.',
  'first-flush': 'First-flush diversion bypasses the initial 1.0 to 1.5 mm of rainfall containing atmospheric dust, bird droppings, and roof debris, ensuring clean water enters storage or recharge systems.',
  'soil': 'Sandy loam and gravel soils (percolation rate > 25 mm/hr) provide superior percolation for recharge pits and trenches. Clay soils exhibit low infiltration and favor storage tanks instead.',
  'cpwd': 'Standard CPWD/BIS runoff coefficients: Concrete/RCC Roof: 0.85, GI Sheet: 0.90, Clay Tiles: 0.75, Paved Courtyard: 0.65, Lawns: 0.15.',
  'cost': 'Payback periods typically range from 2.5 to 5.2 years depending on local municipal piped water tariffs and private tanker delivery dependency in your region.',
}

export const RainHarvestChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your RainHarvest AI Assistant. Ask me anything about rainwater tank sizing, runoff coefficients, filtration, or recharge structures.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')

    // Generate response
    setTimeout(() => {
      const lower = text.toLowerCase()
      let reply = 'RainHarvest AI recommends combining rooftop storage with recharge pits when soil percolation permits. Check your 5-step analysis report for specific site sizing!'

      if (lower.includes('tank') || lower.includes('capacity') || lower.includes('size')) {
        reply = BOT_KNOWLEDGE['tank']
      } else if (lower.includes('first-flush') || lower.includes('flush') || lower.includes('filter')) {
        reply = BOT_KNOWLEDGE['first-flush']
      } else if (lower.includes('soil') || lower.includes('pit') || lower.includes('recharge')) {
        reply = BOT_KNOWLEDGE['soil']
      } else if (lower.includes('cpwd') || lower.includes('coefficient') || lower.includes('roof')) {
        reply = BOT_KNOWLEDGE['cpwd']
      } else if (lower.includes('cost') || lower.includes('savings') || lower.includes('payback')) {
        reply = BOT_KNOWLEDGE['cost']
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 400)
  }

  return (
    <div className="no-print">
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close hydrological assistant' : 'Open hydrological assistant'}
          className="group relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-forest-700 hover:bg-forest-800 text-white shadow-elevated transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:ring-offset-2"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-widget-title"
          className="fixed bottom-20 right-5 sm:bottom-24 sm:right-6 z-40 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-[480px] max-h-[calc(100vh-7rem)] animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-forest-950/20">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-full bg-forest-700/80 border border-forest-600 flex items-center justify-center text-forest-200">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 id="chat-widget-title" className="text-sm font-bold text-white flex items-center gap-1.5">
                  RainHarvest Assistant
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-forest-200 font-medium">Hydrological & Sizing Expert</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-forest-200 hover:text-white hover:bg-forest-700/60 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <Sparkles className="h-3 w-3 text-forest-600 flex-shrink-0" />
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-forest-50 border border-slate-200 hover:border-forest-200 text-slate-700 hover:text-forest-800 text-[10px] font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-white">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-forest-700 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 font-mono ${
                      m.sender === 'user' ? 'text-forest-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-2.5 border-t border-slate-200 bg-slate-50/80 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tank sizing, runoff..."
              className="flex-1 h-9 px-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-9 w-9 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
export default RainHarvestChatWidget
