import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { Page, LegacyCard, BlockStack } from '@shopify/polaris'
import type { Task } from '@/app/store/components/store-setup/utils/StoreSetup-tasks'
import { defaultStoreTasks } from '@/app/store/components/store-setup/utils/StoreSetup-tasks'

import { getStoreId } from '@/utils/store-utils'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { PricingDrawer } from '@/app/store/components/store-setup/components/PricingDrawer'
import { configureAmplify } from '@/lib/amplify-config'
import { Box } from '@shopify/polaris'
import useStoreDataStore from '@/context/core/storeDataStore'

// Import new components
import { SetupAdBanner } from '@/app/store/components/store-setup/components/ecommerce-setup-parts/SetupAdBanner'
import { SetupHeader } from '@/app/store/components/store-setup/components/ecommerce-setup-parts/SetupHeader'
import { SetupProgress } from '@/app/store/components/store-setup/components/ecommerce-setup-parts/SetupProgress'
import { SetupTaskList } from '@/app/store/components/store-setup/components/ecommerce-setup-parts/SetupTaskList'

configureAmplify()

export function EcommerceSetup() {
  const [tasks, setTasks] = useState<Task[]>(defaultStoreTasks)
  const [expandedTaskId, setExpandedTaskId] = useState<string>('task-1')
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const { updateUserStore } = useUserStoreData()

  const { currentStore } = useStoreDataStore()

  const storeId = getStoreId(params, pathname) || ''

  useEffect(() => {
    if (currentStore?.onboardingData) {
      try {
        const onboardingData =
          typeof currentStore.onboardingData === 'string'
            ? JSON.parse(currentStore.onboardingData)
            : currentStore.onboardingData

        if (onboardingData.completedTasks) {
          setTasks(
            defaultStoreTasks.map(task => ({
              ...task,
              completed: onboardingData.completedTasks.includes(task.id),
            }))
          )
        }
      } catch (error) {
        console.error('Error parsing onboarding data:', error)
      }
    }
  }, [currentStore])

  const toggleTaskCompletion = async (taskId: number) => {
    if (!currentStore || updatingTaskId !== null) return

    setUpdatingTaskId(taskId)

    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)

    try {
      const completedTaskIds = updatedTasks.filter(task => task.completed).map(task => task.id)
      const onboardingDataString = JSON.stringify({
        completedTasks: completedTaskIds,
        lastUpdated: new Date().toISOString(),
      })
      const allCompleted = updatedTasks.every(task => task.completed)

      await updateUserStore({
        storeId: currentStore.storeId,
        onboardingData: onboardingDataString,
        onboardingCompleted: allCompleted,
      })
    } catch (error) {
      console.error('Error updating task state:', error)
      setTasks(tasks)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const completedTasksCount = tasks.filter(task => task.completed).length

  return (
    <Page>
      <BlockStack gap="400">
        <SetupAdBanner onActionClick={() => setIsPricingOpen(true)} />
        <SetupHeader />

        <LegacyCard>
          <SetupProgress completedTasks={completedTasksCount} totalTasks={tasks.length} />
          <Box padding="400">
            <SetupTaskList
              tasks={tasks}
              storeId={storeId}
              expandedTaskId={expandedTaskId}
              updatingTaskId={updatingTaskId}
              onToggleExpand={setExpandedTaskId}
              onToggleComplete={(taskId: number) => toggleTaskCompletion(taskId)}
            />
          </Box>
        </LegacyCard>

        <PricingDrawer open={isPricingOpen} onOpenChange={setIsPricingOpen} />
      </BlockStack>
    </Page>
  )
}
