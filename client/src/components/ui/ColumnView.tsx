import React, { useState, useMemo } from 'react'
import type { CategorizedBookmark } from '../../types'

interface FolderItem {
  id: string
  name: string
  type: 'folder' | 'bookmark'
  bookmarks?: CategorizedBookmark[]
  subfolders?: Map<string, FolderItem>
  path: string
}

interface ColumnViewProps {
  bookmarks: CategorizedBookmark[]
  onBookmarkClick?: (bookmark: CategorizedBookmark) => void
  className?: string
  structure?: 'flattened' | 'nested'
}

export const ColumnView: React.FC<ColumnViewProps> = ({
  bookmarks,
  onBookmarkClick,
  className = "",
  structure = 'nested',
}) => {
  const [selectedPath, setSelectedPath] = useState<string[]>([])

  // Build folder structure from bookmarks
  const folderStructure = useMemo(() => {
    const folders = new Map<string, FolderItem>()
    
    bookmarks.forEach((bookmark) => {
      const categoryPath = Array.isArray(bookmark.category) 
        ? bookmark.category.join('/') 
        : bookmark.category
      const pathParts = categoryPath.split('/').filter((part: string) => part.trim() !== '')
      
      if (pathParts.length === 0) {
        // Uncategorized bookmarks
        if (!folders.has('Uncategorized')) {
          folders.set('Uncategorized', {
            id: 'uncategorized',
            name: 'Uncategorized',
            type: 'folder',
            bookmarks: [],
            subfolders: new Map(),
            path: 'Uncategorized'
          })
        }
        folders.get('Uncategorized')!.bookmarks!.push(bookmark)
      } else {
        // Build nested folder structure
        let currentPath = ''
        let currentFolders = folders
        
        for (let i = 0; i < pathParts.length; i++) {
          const folderName = pathParts[i]
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName
          
          if (!currentFolders.has(folderName)) {
            currentFolders.set(folderName, {
              id: currentPath,
              name: folderName,
              type: 'folder',
              bookmarks: [],
              subfolders: new Map(),
              path: currentPath
            })
          }
          
          const folder = currentFolders.get(folderName)!
          
          if (i === pathParts.length - 1) {
            // Final level - add bookmark here
            folder.bookmarks!.push(bookmark)
          } else {
            // Intermediate level - prepare for next iteration
            if (!folder.subfolders) {
              folder.subfolders = new Map()
            }
            currentFolders = folder.subfolders
          }
        }
      }
    })
    
    return Array.from(folders.values())
  }, [bookmarks])

  // Get items for a specific column
  const getColumnItems = (columnIndex: number): FolderItem[] => {
    if (columnIndex === 0) {
      return folderStructure
    }
    
    if (columnIndex <= selectedPath.length) {
      let currentItems = folderStructure
      
      for (let i = 0; i < columnIndex; i++) {
        const pathPart = selectedPath[i]
        const folder = currentItems.find(item => item.name === pathPart)
        if (folder && folder.subfolders) {
          currentItems = Array.from(folder.subfolders.values())
        } else {
          return []
        }
      }
      
      return currentItems
    }
    
    return []
  }

  // Get bookmarks for the current selected folder
  const getCurrentFolderBookmarks = (): CategorizedBookmark[] => {
    if (selectedPath.length === 0) return []
    
    let currentItems = folderStructure
    
    for (let i = 0; i < selectedPath.length - 1; i++) {
      const pathPart = selectedPath[i]
      const folder = currentItems.find(item => item.name === pathPart)
      if (folder && folder.subfolders) {
        currentItems = Array.from(folder.subfolders.values())
      } else {
        return []
      }
    }
    
    const targetFolder = currentItems.find(item => item.name === selectedPath[selectedPath.length - 1])
    return targetFolder?.bookmarks || []
  }

  // Handle folder selection
  const handleFolderClick = (folder: FolderItem, columnIndex: number) => {
    const newPath = selectedPath.slice(0, columnIndex)
    newPath.push(folder.name)
    setSelectedPath(newPath)
  }

  // Handle bookmark click
  const handleBookmarkClick = (bookmark: CategorizedBookmark) => {
    // First try to use the parent's click handler
    if (onBookmarkClick) {
      onBookmarkClick(bookmark)
    } else {
      // Fallback: open URL directly
      try {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          // Chrome extension context
          chrome.tabs.create({ url: bookmark.url })
        } else {
          // Regular web context
          window.open(bookmark.url, '_blank', 'noopener,noreferrer')
        }
      } catch (error) {
        console.error('Failed to open bookmark URL:', error)
        // Last resort: try to open in current tab
        window.location.href = bookmark.url
      }
    }
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

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown date'
    return new Date(timestamp).toLocaleDateString()
  }

  // Generate columns - only create columns if there are items to show
  const columns = []
  for (let i = 0; i <= selectedPath.length; i++) {
    const columnItems = getColumnItems(i)
    if (columnItems.length > 0) {
      columns.push(columnItems)
    }
  }

  const currentBookmarks = getCurrentFolderBookmarks()

  return (
    <div className={`flex h-full overflow-x-auto ${className}`}>
      {/* Folder columns */}
      {columns.map((columnItems, columnIndex) => (
        <div 
          key={columnIndex}
          className={`flex-shrink-0 border-r border-slate-200/50 bg-white/30 backdrop-blur-sm ${
            structure === 'flattened'
              ? 'w-64'
              : currentBookmarks.length > 0 ? 'w-36' : 'w-48'
          }`}
        >
          <div className="p-3">
            <h3 className="text-xs font-medium text-slate-700 mb-2 truncate">
              {columnIndex === 0 ? 'Categories' : selectedPath[columnIndex - 1] || 'Folder'}
            </h3>
            
            <div className="space-y-1">
              {columnItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handleFolderClick(item, columnIndex)}
                    className={`w-full text-left p-2 rounded-lg hover:bg-slate-100/60 transition-colors ${
                      selectedPath[columnIndex] === item.name ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <svg className="w-3 h-3 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        <span className="text-xs font-medium text-slate-900 truncate">{item.name}</span>
                        {item.bookmarks && item.bookmarks.length > 0 && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {item.bookmarks.length}
                          </span>
                        )}
                      </div>
                      {/* Arrow indicator */}
                      {(item.subfolders && item.subfolders.size > 0) || (item.bookmarks && item.bookmarks.length > 0) ? (
                        <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      ) : null}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Bookmarks column - only show if there are bookmarks */}
      {currentBookmarks.length > 0 && (
        <div className="flex-1 min-w-96 border-r border-slate-200/50 bg-white/30 backdrop-blur-sm">
          <div className="p-4 h-full">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              Bookmarks ({currentBookmarks.length})
            </h3>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 mb-3 px-3 py-2 text-xs font-medium text-slate-600 border-b border-slate-200/50">
              <div className="col-span-4">Title</div>
              <div className="col-span-5">Summary</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-1">ID</div>
            </div>
            
            <div className="space-y-2 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              {currentBookmarks.map((bookmark, index) => (
                <div
                  key={bookmark.id || `${bookmark.url}-${index}`}
                  onClick={() => handleBookmarkClick(bookmark)}
                  title={`Click to open: ${bookmark.url}`}
                  className="group grid grid-cols-12 gap-3 p-3 rounded-lg hover:bg-slate-100/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  {/* Title Column */}
                  <div className="col-span-4 flex items-center space-x-2 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={getFaviconUrl(bookmark.url)}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden w-4 h-4 bg-gradient-to-br from-slate-400 to-slate-500 rounded flex items-center justify-center text-white text-xs font-medium">
                        {getDomainFromUrl(bookmark.url).charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {bookmark.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {getDomainFromUrl(bookmark.url)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary Column */}
                  <div className="col-span-5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {bookmark.summary || '-'}
                  </div>
                  
                  {/* Date Added Column */}
                  <div className="col-span-2 text-sm text-slate-500 flex items-center">
                    {formatDate(bookmark.dateAdded)}
                  </div>
                  
                  {/* ID Column */}
                  <div className="col-span-1 text-sm font-mono text-slate-500 flex items-center justify-between">
                    <span>{bookmark.id ? `#${bookmark.id.slice(0, 6)}` : '-'}</span>
                    <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 