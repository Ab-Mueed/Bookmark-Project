import React, { useState, useEffect, useRef } from 'react'
import type { CategorizedBookmark } from '../../types'

interface IntentSearchProps {
  bookmarks: CategorizedBookmark[]
  onSearchResults: (results: CategorizedBookmark[]) => void
  placeholder?: string
  className?: string
}

interface SearchIntent {
  type: 'category' | 'title' | 'url' | 'recent' | 'favorite' | 'learning' | 'work' | 'entertainment'
  query: string
  weight: number
}

export const IntentSearch: React.FC<IntentSearchProps> = ({
  bookmarks,
  onSearchResults,
  placeholder = "Search bookmarks, categories, or describe what you're looking for...",
  className = ""
}) => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Ensure bookmarks is always an array
  const safeBookmarks = bookmarks || []

  // Debug logging
  console.log('IntentSearch render:', { 
    bookmarksLength: safeBookmarks.length, 
    query, 
    isFocused,
    className 
  })

  // Intent patterns for smart search
  const intentPatterns = {
    category: /\b(category|folder|space|group|type)\b/i,
    recent: /\b(recent|latest|new|today|yesterday)\b/i,
    favorite: /\b(favorite|starred|important|essential)\b/i,
    learning: /\b(learn|study|course|tutorial|education|training)\b/i,
    work: /\b(work|job|professional|business|productivity)\b/i,
    entertainment: /\b(fun|entertainment|game|video|music|social)\b/i,
    url: /\b(https?:\/\/|www\.|\.com|\.org|\.net)\b/i
  }

  // Smart suggestions based on content
  const generateSuggestions = (input: string): string[] => {
    if (!input.trim()) return []

    const suggestions: string[] = []
    const lowerInput = input.toLowerCase()

    // Category suggestions
    const categories = [...new Set(safeBookmarks.map(b => 
      Array.isArray(b.category) ? b.category.join('/') : b.category
    ))]
    const categoryMatches = categories.filter(cat => 
      cat.toLowerCase().includes(lowerInput)
    ).slice(0, 3)
    suggestions.push(...categoryMatches)

    // Title suggestions
    const titleMatches = safeBookmarks
      .filter(b => b.title.toLowerCase().includes(lowerInput))
      .map(b => b.title)
      .slice(0, 2)
    suggestions.push(...titleMatches)

    // Intent-based suggestions
    if (intentPatterns.learning.test(input)) {
      suggestions.push('Learning courses', 'Programming tutorials', 'Study materials')
    }
    if (intentPatterns.work.test(input)) {
      suggestions.push('Work tools', 'Productivity apps', 'Business resources')
    }
    if (intentPatterns.entertainment.test(input)) {
      suggestions.push('Entertainment', 'Social media', 'Videos')
    }

    return [...new Set(suggestions)].slice(0, 5)
  }

  // Analyze search intent
  const analyzeIntent = (searchQuery: string): SearchIntent[] => {
    const intents: SearchIntent[] = []

    // Category intent
    if (intentPatterns.category.test(searchQuery)) {
      intents.push({ type: 'category', query: searchQuery, weight: 0.8 })
    }

    // Recent intent
    if (intentPatterns.recent.test(searchQuery)) {
      intents.push({ type: 'recent', query: searchQuery, weight: 0.7 })
    }

    // Favorite intent
    if (intentPatterns.favorite.test(searchQuery)) {
      intents.push({ type: 'favorite', query: searchQuery, weight: 0.7 })
    }

    // Learning intent
    if (intentPatterns.learning.test(searchQuery)) {
      intents.push({ type: 'learning', query: searchQuery, weight: 0.9 })
    }

    // Work intent
    if (intentPatterns.work.test(searchQuery)) {
      intents.push({ type: 'work', query: searchQuery, weight: 0.9 })
    }

    // Entertainment intent
    if (intentPatterns.entertainment.test(searchQuery)) {
      intents.push({ type: 'entertainment', query: searchQuery, weight: 0.9 })
    }

    // URL intent
    if (intentPatterns.url.test(searchQuery)) {
      intents.push({ type: 'url', query: searchQuery, weight: 0.6 })
    }

    // Default text search
    if (searchQuery.trim()) {
      intents.push({ type: 'title', query: searchQuery, weight: 0.5 })
    }

    return intents
  }

  // Perform intelligent search
  const performSearch = (searchQuery: string): CategorizedBookmark[] => {
    if (!searchQuery.trim()) {
      onSearchResults(safeBookmarks)
      return safeBookmarks
    }

    const intents = analyzeIntent(searchQuery)
    const scoredResults = new Map<string, { bookmark: CategorizedBookmark; score: number }>()

    intents.forEach(intent => {
      safeBookmarks.forEach(bookmark => {
        let score = 0
        const lowerQuery = intent.query.toLowerCase()
        const lowerTitle = bookmark.title.toLowerCase()
        const lowerCategory = Array.isArray(bookmark.category) 
          ? bookmark.category.join('/').toLowerCase() 
          : bookmark.category.toLowerCase()
        const lowerUrl = bookmark.url.toLowerCase()

        switch (intent.type) {
          case 'category':
            if (lowerCategory.includes(lowerQuery)) score += intent.weight * 2
            break
          case 'title':
            if (lowerTitle.includes(lowerQuery)) score += intent.weight
            if (lowerTitle.startsWith(lowerQuery)) score += intent.weight * 0.5
            break
          case 'url':
            if (lowerUrl.includes(lowerQuery)) score += intent.weight
            break
          case 'recent':
            // Prioritize recently added bookmarks
            if (bookmark.categorizedAt && Date.now() - bookmark.categorizedAt < 7 * 24 * 60 * 60 * 1000) {
              score += intent.weight
            }
            break
          case 'learning':
            if (lowerCategory.includes('learn') || lowerCategory.includes('course') || 
                lowerCategory.includes('tutorial') || lowerCategory.includes('education')) {
              score += intent.weight * 1.5
            }
            break
          case 'work':
            if (lowerCategory.includes('work') || lowerCategory.includes('business') || 
                lowerCategory.includes('productivity') || lowerCategory.includes('professional')) {
              score += intent.weight * 1.5
            }
            break
          case 'entertainment':
            if (lowerCategory.includes('entertainment') || lowerCategory.includes('social') || 
                lowerCategory.includes('video') || lowerCategory.includes('game')) {
              score += intent.weight * 1.5
            }
            break
        }

        if (score > 0) {
          const existing = scoredResults.get(bookmark.id || bookmark.url)
          if (!existing || score > existing.score) {
            scoredResults.set(bookmark.id || bookmark.url, { bookmark, score })
          }
        }
      })
    })

    // Sort by score and return results
    const sortedResults = Array.from(scoredResults.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.bookmark)

    onSearchResults(sortedResults)
    return sortedResults
  }

  // Handle search input
  const handleSearch = (value: string) => {
    setQuery(value)
    const newSuggestions = generateSuggestions(value)
    setSuggestions(newSuggestions)
    performSearch(value)

    // Add to search history
    if (value.trim() && !searchHistory.includes(value.trim())) {
      setSearchHistory(prev => [value.trim(), ...prev.slice(0, 4)])
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setSuggestions([])
    performSearch(suggestion)
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSuggestions([])
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    // Initialize with all bookmarks
    onSearchResults(safeBookmarks)
  }, [safeBookmarks])

  return (
    <div className={`relative ${className}`} style={{ minHeight: '60px' }}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="liquid-search"
          style={{ minHeight: '48px' }}
        />
        
        {/* Search Icon */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 liquid-glass rounded-2xl p-2 z-50 max-h-80 overflow-y-auto">
          {/* Search History */}
          {searchHistory.length > 0 && !query && (
            <div className="mb-3">
              <div className="text-xs font-medium text-slate-500 px-3 py-2">Recent Searches</div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-white/60 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-white/60 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 