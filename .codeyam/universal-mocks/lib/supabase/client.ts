export function createClient() {
  return {
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: null as null }, error: null as null }),
      getSession: () =>
        Promise.resolve({
          data: { session: null as null },
          error: null as null,
        }),
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null as null, session: null as null },
          error: null as null,
        }),
      signUp: () =>
        Promise.resolve({
          data: { user: null as null, session: null as null },
          error: null as null,
        }),
      signOut: () => Promise.resolve({ error: null as null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () =>
        Object.assign(
          Promise.resolve({ data: [] as never[], error: null as null }),
          {
            order: () =>
              Promise.resolve({ data: [] as never[], error: null as null }),
            eq: () =>
              Object.assign(
                Promise.resolve({ data: [] as never[], error: null as null }),
                {
                  single: () =>
                    Promise.resolve({
                      data: null as null,
                      error: null as null,
                    }),
                },
              ),
            single: () =>
              Promise.resolve({ data: null as null, error: null as null }),
          },
        ),
      insert: () =>
        Object.assign(
          Promise.resolve({ data: null as null, error: null as null }),
          {
            select: () =>
              Promise.resolve({ data: [] as never[], error: null as null }),
          },
        ),
      update: () =>
        Object.assign(
          Promise.resolve({ data: null as null, error: null as null }),
          {
            eq: () =>
              Promise.resolve({ data: null as null, error: null as null }),
          },
        ),
      delete: () =>
        Object.assign(
          Promise.resolve({ data: null as null, error: null as null }),
          {
            eq: () =>
              Promise.resolve({ data: null as null, error: null as null }),
          },
        ),
      eq: () =>
        Object.assign(
          Promise.resolve({ data: [] as never[], error: null as null }),
          {
            single: () =>
              Promise.resolve({ data: null as null, error: null as null }),
          },
        ),
    }),
  } as any;
}

export const DEMO_USER = {
  email: 'demo@workouttracker.com',
  password: 'demo123456',
};
