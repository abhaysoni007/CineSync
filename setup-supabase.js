/**
 * Script to apply Supabase migrations from command line
 * 
 * Usage: 
 * npm install @supabase/supabase-js
 * node setup-supabase.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase configuration
const SUPABASE_URL = 'https://uxxlqpucnkhovnppsuod.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eGxxcHVjbmtob3ZucHBzdW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Nzk4MDcsImV4cCI6MjA2MzE1NTgwN30.KYFzw01frLJbeWFKLdpCZwKuGYHjhGG2jKvKbugRldU'

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Run the migrations
const runMigration = async () => {
  try {
    console.log('🚀 Applying migrations to Supabase...')
    
    // First, enable UUID extension if needed
    console.log('Enabling UUID extension...')
    const { error: extensionError } = await supabase.rpc('create_uuid_extension')
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.error('Failed to enable UUID extension:', extensionError)
      return
    }
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20240518000000_create_cinesync_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL by semicolons to execute each statement separately
    const sqlStatements = migrationSQL.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute...`)
    
    // Execute each statement
    let failures = 0
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i]
      const { error } = await supabase.rpc('run_sql', { query: sql })
      
      if (error) {
        console.error(`Failed to execute statement ${i + 1}:`, error)
        failures++
        
        // Don't stop on errors about existing tables/constraints
        if (!error.message.includes('already exists')) {
          console.log(`Continuing with next statement...`)
        }
      } else {
        console.log(`Successfully executed statement ${i + 1}`)
      }
    }
    
    if (failures > 0) {
      console.log(`Completed with ${failures} failures. Some SQL statements failed, but tables may still be created.`)
    } else {
      console.log('✅ All migrations applied successfully!')
    }
    
    // Check if tables exist
    const { data, error } = await supabase.from('rooms').select('id').limit(1)
    if (error) {
      console.error('Failed to verify tables:', error)
    } else {
      console.log('Tables verified successfully!')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Add PostgreSQL function to run SQL from JS
const createSqlFunction = async () => {
  try {
    console.log('Creating helper SQL function...')
    
    const functionSQL = `
      CREATE OR REPLACE FUNCTION create_uuid_extension()
      RETURNS void AS $$
      BEGIN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      CREATE OR REPLACE FUNCTION run_sql(query text)
      RETURNS void AS $$
      BEGIN
        EXECUTE query;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    const { error } = await supabase.rpc('exec', { sql: functionSQL })
    
    if (error) {
      // Create the exec function first if it doesn't exist
      if (error.message.includes('function exec(text) does not exist')) {
        const createExec = `
          CREATE OR REPLACE FUNCTION exec(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
        
        const { error: execError } = await supabase.query(createExec)
        if (execError) {
          console.error('Failed to create exec function:', execError)
          return false
        }
        
        // Try again
        return await createSqlFunction()
      }
      
      console.error('Failed to create SQL functions:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to create SQL functions:', error)
    return false
  }
}

// Main function
const main = async () => {
  try {
    // Create SQL function first
    await createSqlFunction()
    
    // Run the migrations
    await runMigration()
    
    console.log('Setup complete! You can now use the CineSync app with Supabase.')
    process.exit(0)
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

// Run the script
main() 