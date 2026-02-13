---
paths:
  - 'components/*-form.tsx'
  - 'components/workout-form.tsx'
  - 'components/goal-form.tsx'
  - 'components/todo-form.tsx'
---

# Form Component Pattern

- All forms are client components (`"use client"`) with shared structure
- State management: Local `formData` object updated via `setFormData`
- Standard props: `{ onClose, onSave, [entity]? }` for create/edit modes
- Submit flow: Validate → `createClient()` → `.from(table).insert()` or `.update()` → call `onSave()` → `onClose()`
- Forms use shadcn/ui components (Input, Select, Textarea) with custom styling from `lib/styles`
