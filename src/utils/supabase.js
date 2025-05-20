import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://uxxlqpucnkhovnppsuod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eGxxcHVjbmtob3ZucHBzdW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Nzk4MDcsImV4cCI6MjA2MzE1NTgwN30.KYFzw01frLJbeWFKLdpCZwKuGYHjhGG2jKvKbugRldU'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Initializes the database tables if they don't exist
 * This should be called early in the application startup
 */
export const initDatabase = async () => {
  try {
    console.log('Checking Supabase connection and tables...')
    
    // We'll just query for rooms to see if the connection works
    // The actual table creation is handled through migrations in Supabase
    const { error } = await supabase
      .from('rooms')
      .select('id')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist code
        console.error('Tables do not exist. Please run migrations.')
      } else {
        console.error('Error connecting to Supabase:', error.message)
      }
    } else {
      console.log('Successfully connected to Supabase')
    }
    
    return { success: !error, error }
  } catch (err) {
    console.error('Failed to initialize database:', err.message)
    return { success: false, error: err }
  }
} 