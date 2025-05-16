import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    console.log('[Supabase Schema Test] Checking database schema and permissions...');
    
    // First, check if we can access the users table
    const { data: userColumns, error: userColumnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    // Try to get some basic policy information
    let policiesData = null;
    let policiesError = null;
    
    try {
      // Attempt to get policies - wrapped in try/catch instead of using .catch()
      const { data, error } = await supabase.rpc(
        'execute_sql',
        { 
          query: `
            SELECT schemaname, tablename, policyname, permissive, roles, cmd 
            FROM pg_policies 
            WHERE tablename = 'users'
          `
        }
      );
      policiesData = data;
      policiesError = error ? error.message : null;
    } catch (err) {
      policiesError = "RPC execute_sql not available";
    }
    
    // Fall back to basic table information
    const { data: tableInfo, error: tableInfoError } = await supabase
      .from('users')
      .select('id')
      .limit(0);

    return NextResponse.json({
      success: true,
      userColumns: {
        data: userColumns,
        error: userColumnsError ? userColumnsError.message : null
      },
      policies: {
        data: policiesData,
        error: policiesError
      },
      tableInfo: {
        data: tableInfo ? "Table exists" : null,
        error: tableInfoError ? tableInfoError.message : null
      }
    });
  } catch (error) {
    console.error('[Supabase Schema Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}