import type { Task } from '@/app/store/components/store-setup/utils/StoreSetup-tasks';
import {
  Box,
  Button,
  Collapsible,
  Icon,
  InlineStack,
  Spinner,
  Text,
  Link as PolarisLink,
  BlockStack,
  ButtonGroup,
} from '@shopify/polaris';
import { CheckIcon, ExternalIcon, ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons';
import Image from 'next/image';

interface SetupTaskItemProps {
  task: Task;
  storeId: string;
  isExpanded: boolean;
  isUpdating: boolean;
  onToggleExpand: () => void;
}

export function SetupTaskItem({ task, storeId, isExpanded, isUpdating, onToggleExpand }: SetupTaskItemProps) {
  const checkmarkMarkup = (
    <div
      className={`h-5 w-5 rounded-full ${task.completed ? 'bg-green-500 border-green-500' : 'border border-gray-300 bg-white'} flex-shrink-0 flex items-center justify-center`}
      aria-label={task.completed ? 'Task completed' : 'Task not completed'}>
      {isUpdating ? <Spinner size="small" /> : task.completed && <Icon source={CheckIcon} />}
    </div>
  );

  const primaryAction = task.actions?.primary;
  const secondaryAction = task.actions?.secondary;

  return (
    <Box background="bg-surface" borderWidth="025" borderColor="border" borderRadius="200" shadow="200">
      <button
        type="button"
        onClick={onToggleExpand}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <Box padding="400">
          <InlineStack gap="300" blockAlign="center" wrap={false}>
            {checkmarkMarkup}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <Text as="p" variant="bodyMd" fontWeight="medium">
                {task.title}
              </Text>
            </div>
            <Icon source={isExpanded ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
          </InlineStack>
        </Box>
      </button>

      <Collapsible
        open={isExpanded}
        id={`task-content-${task.id}`}
        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
        expandOnPrint>
        <Box padding="400" paddingBlockStart="0">
          <InlineStack gap="300" blockAlign="start" wrap={false}>
            <Box width="20px" />
            <div style={{ flex: 1 }}>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">
                  {task.description}{' '}
                  {task.learnMoreLink && (
                    <PolarisLink url={task.learnMoreLink} external>
                      Aprende más <Icon source={ExternalIcon} />
                    </PolarisLink>
                  )}
                </Text>
                <ButtonGroup>
                  {primaryAction && (
                    <Button
                      variant="primary"
                      url={primaryAction.getHref && storeId ? primaryAction.getHref(storeId) : primaryAction.href}>
                      {primaryAction.text}
                    </Button>
                  )}
                  {secondaryAction && (
                    <Button
                      url={
                        secondaryAction.getHref && storeId ? secondaryAction.getHref(storeId) : secondaryAction.href
                      }>
                      {secondaryAction.text}
                    </Button>
                  )}
                </ButtonGroup>
              </BlockStack>
            </div>
            {task.imageUrl && (
              <Box borderRadius="100" shadow="200" width="140px">
                <Image
                  src={task.imageUrl}
                  width={140}
                  height={100}
                  alt={`Ilustración para ${task.title}`}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Box>
            )}
          </InlineStack>
        </Box>
      </Collapsible>
    </Box>
  );
}
