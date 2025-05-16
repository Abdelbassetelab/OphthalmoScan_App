import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

type FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

/**
 * Server-side data fetching utility for Supabase
 * Inspired by the approach in the Todo app article
 * 
 * @param fetcher Function that accepts a Supabase client and returns a Promise
 * @param options Cache and revalidation options
 * @returns Result of the fetcher function
 */
export async function fetchData<T>(
  fetcher: (supabase: ReturnType<typeof createServerComponentClient<Database>>) => Promise<T>,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    return await fetcher(supabase);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
 * Wrapper for fetching a single row by ID with proper error handling
 * 
 * @param table Table name
 * @param id ID of the row to fetch
 * @param columns Columns to select (defaults to all)
 * @returns The fetched row or null if not found
 */
export async function fetchById<T = any>(
  table: string, 
  id: string,
  columns: string = '*'
): Promise<T | null> {
  return fetchData(async (supabase) => {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error for "row not found"
        return null;
      }
      throw error;
    }
    
    return data as T;
  });
}

/**
 * Client-side mutation utility for Supabase data
 * Use this for operations that modify data
 * 
 * @param mutationFn Function that accepts a Supabase client and returns a Promise
 * @returns Result of the mutation function
 */
export async function mutateData<T>(
  mutationFn: (supabase: ReturnType<typeof createClientComponentClient<Database>>) => Promise<T>
): Promise<T> {
  try {
    const supabase = createClientComponentClient<Database>();
    return await mutationFn(supabase);
  } catch (error) {
    console.error('Error in data mutation:', error);
    throw error;
  }
}

/**
 * Utility function for inserting data with proper error handling
 * 
 * @param table Table name
 * @param data Data to insert
 * @returns The inserted data or null on error
 */
export async function insertData<T = any>(
  table: string,
  data: any
): Promise<T | null> {
  return mutateData(async (supabase) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
    
    return result as T;
  });
}

/**
 * Utility function for updating data with proper error handling
 * 
 * @param table Table name
 * @param id ID of the row to update
 * @param data Data to update
 * @returns The updated data or null on error
 */
export async function updateData<T = any>(
  table: string,
  id: string,
  data: any
): Promise<T | null> {
  return mutateData(async (supabase) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    
    return result as T;
  });
}

/**
 * Utility function for deleting data with proper error handling
 * 
 * @param table Table name
 * @param id ID of the row to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteData(
  table: string,
  id: string
): Promise<boolean> {
  return mutateData(async (supabase) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
    
    return true;
  });
}