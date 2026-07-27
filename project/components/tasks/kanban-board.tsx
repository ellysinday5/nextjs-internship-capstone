"use client"

import { useState } from "react"

// TODO: Task 5.1 - Design responsive Kanban board layout
// TODO: Task 5.2 - Implement drag-and-drop functionality with dnd-kit

/*
TODO: Implementation Notes for Interns:

This is the main Kanban board component that should:
- Display columns (lists) horizontally
- Allow drag and drop of tasks between columns
- Support adding new tasks and columns
- Handle real-time updates
- Be responsive on mobile

Key dependencies to install:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

Features to implement:
- Drag and drop tasks between columns
- Drag and drop to reorder tasks within columns
- Add new task button in each column
- Add new column functionality
- Optimistic updates (Task 5.4)
- Real-time persistence (Task 5.5)
- Mobile responsive design
- Loading states
- Error handling

State management:
- Use Zustand store for board state (Task 5.3)
- Implement optimistic updates
- Handle conflicts with server state
*/

const initialColumns = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Design homepage mockup",
        description: "Create initial design concepts",
        priority: "high",
        assignee: "John Doe",
      },
      {
        id: "2",
        title: "Research competitors",
        description: "Analyze competitor websites",
        priority: "medium",
        assignee: "Jane Smith",
      },
      {
        id: "3",
        title: "Define user personas",
        description: "Create detailed user personas",
        priority: "low",
        assignee: "Mike Johnson",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Develop navigation component",
        description: "Build responsive navigation",
        priority: "high",
        assignee: "Sarah Wilson",
      },
      {
        id: "5",
        title: "Content strategy",
        description: "Plan content structure",
        priority: "medium",
        assignee: "Tom Brown",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    tasks: [
      {
        id: "6",
        title: "Logo design options",
        description: "Present logo variations",
        priority: "high",
        assignee: "Lisa Davis",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "7",
        title: "Project kickoff meeting",
        description: "Initial team meeting completed",
        priority: "medium",
        assignee: "John Doe",
      },
      {
        id: "8",
        title: "Requirements gathering",
        description: "Collected all requirements",
        priority: "high",
        assignee: "Jane Smith",
      },
    ],
  },
]

export function KanbanBoard({ projectId }: { projectId: string }) {
  const [columns, setColumns] = useState(initialColumns)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <div className="text-center text-payne's_gray-500 dark:text-french_gray-400">
        <h3 className="text-lg font-semibold mb-2">TODO: Implement Kanban Board</h3>
        <p className="text-sm mb-4">Project ID: {projectId}</p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            📋 This will be the main interactive Kanban board with drag-and-drop functionality
          </p>
        </div>
      </div>
    </div>
  )
}
