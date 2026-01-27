import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  supabase: SupabaseClient;
  request: NextRequest;
}

type AuthenticatedHandler = (context: AuthContext) => Promise<NextResponse>;

/**
 * Higher-order function that wraps an API route handler with authentication.
 * Automatically handles Supabase auth check and returns 401 if not authenticated.
 *
 * @example
 * export const POST = withAuth(async ({ user, supabase, request }) => {
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ userId: user.id });
 * });
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Non autorisé. Veuillez vous connecter.' },
          { status: 401 }
        );
      }

      return await handler({ user, supabase, request });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  };
}

/**
 * Same as withAuth but for GET requests that don't need request parameter
 */
type AuthenticatedGetHandler = (context: Omit<AuthContext, 'request'>) => Promise<NextResponse>;

export function withAuthGet(handler: AuthenticatedGetHandler) {
  return async (): Promise<NextResponse> => {
    try {
      const supabase = await createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Non autorisé. Veuillez vous connecter.' },
          { status: 401 }
        );
      }

      return await handler({ user, supabase });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  };
}
