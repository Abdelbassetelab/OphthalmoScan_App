export {}

// Create a type for the roles
export type Roles = 'admin' | 'doctor' | 'patient'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}