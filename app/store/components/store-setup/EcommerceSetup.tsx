import { useState, useEffect } from 'react'
import { X, Check, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Task, defaultStoreTasks } from '@/app/store/components/store-setup/StoreSetup-tasks'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useParams, usePathname } from 'next/navigation'
import { getStoreId } from '@/utils/store-utils'
import { useUserStoreData } from '@/app/(setup-layout)/first-steps/hooks/useUserStoreData'
import { PricingDrawer } from '@/app/store/components/store-setup/PricingDrawer'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'
import useStoreDataStore from '@/context/core/storeDataStore'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export function EcommerceSetup() {
  const [tasks, setTasks] = useState<Task[]>(defaultStoreTasks)
  const [expandedTaskId, setExpandedTaskId] = useState<string>('task-1')
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const { updateUserStore } = useUserStoreData()

  const { currentStore } = useStoreDataStore()

  const storeId = getStoreId(params, pathname)

  useEffect(() => {
    if (currentStore?.onboardingData) {
      try {
        const onboardingData =
          typeof currentStore.onboardingData === 'string'
            ? JSON.parse(currentStore.onboardingData)
            : currentStore.onboardingData

        if (onboardingData.completedTasks) {
          setTasks(
            tasks.map(task => ({
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

  const toggleTaskCompletion = async (taskId: number, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!currentStore || updatingTaskId !== null) return

    // Set the task as updating
    setUpdatingTaskId(taskId)

    // Update local state first
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)

    try {
      // Prepare data for update
      const completedTaskIds = updatedTasks.filter(task => task.completed).map(task => task.id)

      // Convert to JSON string to ensure proper format
      const onboardingDataString = JSON.stringify({
        completedTasks: completedTaskIds,
        lastUpdated: new Date().toISOString(),
      })

      // Check if all tasks are completed
      const allCompleted = updatedTasks.every(task => task.completed)

      // Update in database
      await updateUserStore({
        storeId: currentStore.storeId,
        onboardingData: onboardingDataString,
        onboardingCompleted: allCompleted,
      })
    } catch (error) {
      console.error('Error updating task state:', error)

      // Revert changes on error
      setTasks(
        tasks.map(task => (task.id === taskId ? { ...task, completed: !task.completed } : task))
      )
    } finally {
      // Remove updating state
      setUpdatingTaskId(null)
    }
  }

  const completedTasksCount = tasks.filter(task => task.completed).length

  return (
    <div className="p-3 max-w-5xl mx-auto bg-gray-100 mt-8 ">
      {/* Header banner */}
      <div className="mb-3 rounded-lg bg-[#2a2a2a] p-2 text-white flex justify-between items-center">
        <div className="text-xs sm:text-sm">
          Suscríbete a un plan y obtén 3 meses a solo $1 al mes en Fasttify
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-6 md:h-7 bg-white text-black hover:bg-gray-100 border-none text-xs px-2 md:px-3"
            onClick={() => setIsPricingOpen(true)}
          >
            <span className="hidden md:inline">Ver planes</span>
            <span className="md:hidden">Planes</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-black hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div>
        <div className="mb-3">
          <h1 className="text-xl font-medium text-gray-800">
            ¡Pon en marcha tu tienda con Fasttify!
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Usa esta guía para configurar tu tienda y empezar a vender en minutos. A medida que
            crezcas, te daremos consejos y recomendaciones para mejorar tu negocio.
          </p>
        </div>

        {/* Setup guide card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Progress indicator */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-600 text-xs">
                {completedTasksCount} de {tasks.length} pasos completados
              </span>
              <span className="text-xs font-medium text-gray-700">
                {Math.round((completedTasksCount / tasks.length) * 100)}%
              </span>
            </div>
            <Progress value={(completedTasksCount / tasks.length) * 100} className="h-1.5" />
          </div>

          {/* Guide content */}
          <div className="p-3">
            <h2 className="text-base font-medium text-gray-800 mb-1">Configura tu tienda</h2>
            <p className="text-gray-600 text-xs mb-3">
              Sigue estos pasos para dejar lista tu tienda y comenzar a vender.
            </p>

            {/* Task list using Accordion */}
            <Accordion
              type="single"
              collapsible
              value={expandedTaskId}
              onValueChange={setExpandedTaskId}
              className="space-y-2"
            >
              {tasks.map(task => (
                <AccordionItem
                  key={task.id}
                  value={`task-${task.id}`}
                  className="border rounded-lg overflow-hidden transition-all duration-200 shadow-sm data-[state=open]:border-gray-300 data-[state=closed]:border-gray-200"
                >
                  <div className="flex items-center gap-3 p-2">
                    <div
                      role="button"
                      tabIndex={0}
                      className={`h-4 w-4 rounded-full ${task.completed ? 'bg-green-500 border-green-500' : 'border border-gray-300 bg-white'} flex-shrink-0 flex items-center justify-center cursor-pointer`}
                      onClick={e => toggleTaskCompletion(task.id, e)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleTaskCompletion(task.id, e as unknown as React.MouseEvent)
                        }
                      }}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {updatingTaskId === task.id ? (
                        <Loader2 className="h-3 w-3 text-white animate-spin" />
                      ) : (
                        task.completed && <Check className="h-3 w-3 text-white" />
                      )}
                    </div>

                    <AccordionTrigger className="hover:no-underline flex-1 p-0">
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-sm text-gray-800">{task.title}</h3>
                      </div>
                    </AccordionTrigger>
                  </div>

                  <AccordionContent className="px-9 pb-3 pt-1 ">
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                      <div className="flex-1">
                        <p className="text-gray-600 text-xs">
                          {task.description}{' '}
                          {task.learnMoreLink && (
                            <Link
                              href={task.learnMoreLink}
                              className="text-blue-600 hover:underline inline-flex items-center"
                            >
                              Aprende más
                              <ExternalLink className="h-3 w-3 ml-0.5" />
                            </Link>
                          )}
                        </p>

                        {task.actions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {task.actions?.primary && (
                              <Button
                                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-md px-3 py-1 text-xs h-auto"
                                asChild
                              >
                                <Link
                                  href={
                                    task.actions.primary.getHref && storeId
                                      ? task.actions.primary.getHref(storeId)
                                      : task.actions.primary.href || '#'
                                  }
                                >
                                  {task.actions.primary.text}
                                </Link>
                              </Button>
                            )}
                            {task.actions?.secondary && (
                              <Button
                                variant="ghost"
                                className="text-gray-700 hover:bg-gray-100 px-3 py-1 text-xs h-auto"
                                asChild
                              >
                                <Link
                                  href={
                                    task.actions.secondary.getHref && storeId
                                      ? task.actions.secondary.getHref(storeId)
                                      : task.actions.secondary.href || '#'
                                  }
                                >
                                  {task.actions.secondary.text}
                                </Link>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {task.imageUrl && (
                        <div className="md:block">
                          <div className="bg-white p-2 rounded-md border border-gray-200 w-[140px] h-[100px] overflow-hidden shadow-sm">
                            <Image
                              src={task.imageUrl}
                              width={140}
                              height={100}
                              alt={`Ilustración para ${task.title}`}
                              className="object-cover w-full h-full rounded"
                              priority
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <PricingDrawer open={isPricingOpen} onOpenChange={setIsPricingOpen} />
          </div>
        </div>
      </div>
    </div>
  )
}
