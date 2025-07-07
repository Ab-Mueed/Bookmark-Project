import React, { useState } from 'react'
import type { CategorizedBookmark } from '../../types'

interface SubcategoryData {
  bookmarks: CategorizedBookmark[]
  subcategories: Map<string, SubcategoryData>
}

interface NestedSpaceProps {
  title: string
  bookmarks: CategorizedBookmark[]
  subcategories?: Map<string, SubcategoryData>
  icon?: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo'
  onBookmarkClick?: (bookmark: CategorizedBookmark) => void
  onSpaceClick?: () => void
  className?: string
  level?: number
}

const colorVariants = {
  blue: 'from-blue-500/20 to-blue-600/20 text-blue-600',
  purple: 'from-purple-500/20 to-purple-600/20 text-purple-600',
  green: 'from-green-500/20 to-green-600/20 text-green-600',
  orange: 'from-orange-500/20 to-orange-600/20 text-orange-600',
  pink: 'from-pink-500/20 to-pink-600/20 text-pink-600',
  indigo: 'from-indigo-500/20 to-indigo-600/20 text-indigo-600'
}

const defaultIcons = {
  blue: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  purple: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  green: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orange: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  pink: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  indigo: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

export const NestedSpace: React.FC<NestedSpaceProps> = ({
  title,
  bookmarks,
  subcategories,
  icon,
  color = 'blue',
  onBookmarkClick,
  onSpaceClick,
  className = "",
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false) // All spaces are collapsed by default
  const [isHovered, setIsHovered] = useState(false)

  const handleSpaceClick = () => {
    setIsExpanded(!isExpanded)
    onSpaceClick?.()
  }

  const handleBookmarkClick = (bookmark: CategorizedBookmark) => {
    onBookmarkClick?.(bookmark)
  }

  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0]
    } catch {
      return 'link'
    }
  }

  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return ''
    }
  }

  // Recursively count all bookmarks in this space and its subcategories
  const countTotalBookmarks = (bookmarks: CategorizedBookmark[], subcategories?: Map<string, SubcategoryData>): number => {
    let total = bookmarks.length
    if (subcategories) {
      for (const subcategoryData of subcategories.values()) {
        total += countTotalBookmarks(subcategoryData.bookmarks, subcategoryData.subcategories)
      }
    }
    return total
  }

  const totalBookmarks = countTotalBookmarks(bookmarks, subcategories)

  return (
    <div 
      className={`liquid-space ${className} ${level > 0 ? 'ml-4 border-l-2 border-slate-200/50 pl-4' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Space Header */}
      <div className="liquid-space-header">
        <div className="flex items-center space-x-3">
          <div className={`liquid-space-icon bg-gradient-to-br ${colorVariants[color]}`}>
            {icon || defaultIcons[color]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{title}</h3>
            <p className="text-sm text-slate-500">{totalBookmarks} bookmarks</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Expand/Collapse Button */}
          <button
            onClick={handleSpaceClick}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isHovered ? 'bg-white/60 text-slate-600' : 'text-slate-400'
            }`}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Space Content */}
      {isExpanded && (
        <div className="space-y-2 liquid-fade-in">
          {/* Direct bookmarks in this category */}
          {bookmarks.slice(0, 5).map((bookmark, index) => (
            <div
              key={bookmark.id || `${bookmark.url}-${index}`}
              onClick={() => handleBookmarkClick(bookmark)}
              className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer"
            >
              {/* Favicon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={getFaviconUrl(bookmark.url)}
                  alt=""
                  className="w-5 h-5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <div className="hidden w-5 h-5 bg-gradient-to-br from-slate-400 to-slate-500 rounded flex items-center justify-center text-white text-xs font-medium">
                  {getDomainFromUrl(bookmark.url).charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Bookmark Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {bookmark.title}
                </h4>
                <p className="text-xs text-slate-500 truncate">{getDomainFromUrl(bookmark.url)}</p>
              </div>

              {/* External Link Icon */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          ))}

          {/* Show More Indicator for direct bookmarks */}
          {bookmarks.length > 5 && (
            <div className="text-center py-2">
              <span className="text-xs text-slate-500">
                +{bookmarks.length - 5} more bookmarks
              </span>
            </div>
          )}

          {/* Nested Subcategories */}
          {subcategories && Array.from(subcategories.entries()).map(([subcategoryName, subcategoryData]) => (
            <NestedSpace
              key={subcategoryName}
              title={subcategoryName}
              bookmarks={subcategoryData.bookmarks}
              subcategories={subcategoryData.subcategories}
              color={color}
              onBookmarkClick={onBookmarkClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
} 