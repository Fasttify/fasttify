import { BlockStack, Text } from '@shopify/polaris'
import { SetupTaskItem } from './SetupTaskItem'
import type { Task } from '@/app/store/components/store-setup/utils/StoreSetup-tasks'

interface SetupTaskListProps {
  tasks: Task[]
  storeId: string
  expandedTaskId: string
  updatingTaskId: number | null
  onToggleExpand: (taskId: string) => void
  onToggleComplete: (taskId: number, event: React.MouseEvent) => void
}

export function SetupTaskList({
  tasks,
  storeId,
  expandedTaskId,
  updatingTaskId,
  onToggleExpand,
  onToggleComplete,
}: SetupTaskListProps) {
  return (
    <BlockStack gap="400">
      <div>
        <Text as="h2" variant="headingMd">
          Configura tu tienda
        </Text>
        <Text as="p" tone="subdued" variant="bodySm">
          Sigue estos pasos para dejar lista tu tienda y comenzar a vender.
        </Text>
      </div>
      <BlockStack gap="200">
        {tasks.map(task => (
          <SetupTaskItem
            key={task.id}
            task={task}
            storeId={storeId}
            isExpanded={expandedTaskId === `task-${task.id}`}
            isUpdating={updatingTaskId === task.id}
            onToggleExpand={() => onToggleExpand(`task-${task.id}`)}
            onToggleComplete={event => onToggleComplete(task.id, event)}
          />
        ))}
      </BlockStack>
    </BlockStack>
  )
}
