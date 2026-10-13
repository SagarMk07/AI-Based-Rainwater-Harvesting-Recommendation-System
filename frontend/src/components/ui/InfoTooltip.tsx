import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  content: string
  title?: string
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, title }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        className="text-[#8C948C] hover:text-forest-600 transition-colors focus:outline-none focus:ring-1 focus:ring-forest-500 rounded-full"
        aria-label={title || "More information"}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 sm:w-64 p-3 bg-[#252B26] text-white text-[11px] leading-relaxed rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 border border-white/10">
          {title && <span className="font-bold text-forest-300 block mb-1">{title}</span>}
          <span className="text-[#EEEEEA] leading-normal">{content}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#252B26]" />
        </div>
      )}
    </div>
  )
}

export default InfoTooltip
