// lib/useMock.ts
export function useMockMode(): boolean {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('mock') === 'true') return true
    }
  
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development'
  }
  