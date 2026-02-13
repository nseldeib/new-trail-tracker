---
paths:
  - 'app/dashboard/**/*.tsx'
---

# Protected Route Pattern

- All dashboard pages must be client components that check auth
- Pattern: `const { user, loading: authLoading } = useAuth()` + `useRouter()`
- In `useEffect`: Check `if (!user) router.push("/auth/signin")`
- Show `<LoadingScreen>` while `authLoading` or `loading` state is true
- Middleware handles session refresh globally (no additional auth checks needed in middleware)
