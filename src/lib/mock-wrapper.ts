// Wrapper pour retourner données vides quand mock désactivé
export function mockOrEmpty<T>(mockData: T, isEmpty: boolean = true): T {
  if (isEmpty) {
    if (Array.isArray(mockData)) return [] as T;
    if (typeof mockData === 'object' && mockData !== null) return {} as T;
    return mockData;
  }
  return mockData;
}

// Pour les endpoints qui nécessitent des données
export function mockWithFallback<T>(
  mockData: T, 
  realFn?: () => Promise<T>
): T | Promise<T> {
  if (realFn && process.env.NODE_ENV === 'production') {
    return realFn();
  }
  return mockData;
}