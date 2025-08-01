import { useState, useEffect, useCallback, useMemo } from 'react'

interface UseSearchOptions {
  debounceMs?: number
  minSearchLength?: number
}

export function useSmoothSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  options: UseSearchOptions = {}
) {
  const { debounceMs = 300, minSearchLength = 0 } = options
  
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search term
  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [searchTerm, debounceMs])

  // Memoized search function for better performance
  const searchFunction = useCallback((item: T, term: string): boolean => {
    if (!term || term.length < minSearchLength) return true
    
    const lowerTerm = term.toLowerCase()
    
    return searchFields.some(field => {
      const value = item[field]
      if (value == null) return false
      
      // Handle different data types
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerTerm)
      }
      
      if (Array.isArray(value)) {
        return value.some(v => 
          typeof v === 'string' && v.toLowerCase().includes(lowerTerm)
        )
      }
      
      if (typeof value === 'object' && value !== null) {
        // Handle nested objects (like company.name)
        return Object.values(value).some(v => 
          typeof v === 'string' && v.toLowerCase().includes(lowerTerm)
        )
      }
      
      return String(value).toLowerCase().includes(lowerTerm)
    })
  }, [searchFields, minSearchLength])

  // Memoized filtered results
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return items
    }
    
    return items.filter(item => searchFunction(item, debouncedSearchTerm))
  }, [items, debouncedSearchTerm, searchFunction, minSearchLength])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    filteredItems,
    clearSearch,
    hasActiveSearch: debouncedSearchTerm.length >= minSearchLength
  }
}

// Hook for server-side search (like the current user management implementation)
export function useServerSearch<T>(
  fetchFunction: (searchTerm: string, ...args: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: UseSearchOptions = {}
) {
  const { debounceMs = 300 } = options
  
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  // Fetch data when debounced search term or dependencies change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsSearching(true)
        setError(null)
        const result = await fetchFunction(debouncedSearchTerm, ...dependencies)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    fetchData()
  }, [debouncedSearchTerm, ...dependencies])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
    data,
    error,
    clearSearch,
    hasActiveSearch: debouncedSearchTerm.length > 0
  }
}