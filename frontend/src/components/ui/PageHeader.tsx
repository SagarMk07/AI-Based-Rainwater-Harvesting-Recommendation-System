import React from 'react'

export interface PageHeaderProps {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDFD8] pb-5 mb-8 ${className}`}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl sm:text-3xl font-black text-[#252B26] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#687068] mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto no-print">
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
