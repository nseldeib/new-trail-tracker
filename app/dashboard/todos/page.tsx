"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { TodosView } from "@/components/todos-view"

export default function TodosPage() {
  return (
    <DashboardLayout>
      <TodosView />
    </DashboardLayout>
  )
}
