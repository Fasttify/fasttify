'use client';

import { Icon, Button, Autocomplete } from '@shopify/polaris';
import { SearchIcon, ChevronDownIcon, ExternalIcon, MaximizeIcon, XIcon } from '@shopify/polaris-icons';
import { useState, useCallback, useMemo } from 'react';
import { useConversationHistoryContext } from '../context/ConversationHistoryContext';

interface ConversationOption {
  label: string;
  value: string;
  timestamp?: string;
  category?: 'today' | 'yesterday' | 'this-week' | 'older';
}

interface ChatHeaderProps {
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => void;
  onClose?: () => void;
  conversations?: ConversationOption[];
  loading?: boolean;
  conversationName?: string | null;
}

export function ChatHeader({
  onConversationSelect,
  onNewConversation,
  onClose,
  conversations = [],
  loading = false,
  conversationName,
}: ChatHeaderProps) {
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Usar el contexto de historial de conversaciones
  const {
    conversations: historyConversations,
    loading: historyLoading,
    refreshConversations,
  } = useConversationHistoryContext();

  // Opciones del autocomplete basadas en las conversaciones del historial
  const options = useMemo(() => {
    const allConversations = [...conversations, ...historyConversations];

    if (!inputValue.trim()) {
      return allConversations.slice(0, 5); // Mostrar solo las 5 más recientes cuando no hay búsqueda
    }

    return allConversations.filter((conversation) =>
      conversation.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [conversations, historyConversations, inputValue]);

  const handleSelectionChange = useCallback(
    (selected: string[]) => {
      const selectedId = selected[0];
      setSelectedConversation(selectedId);
      setInputValue('');

      if (selectedId && onConversationSelect) {
        onConversationSelect(selectedId);
        setShowDropdown(false);
      }
    },
    [onConversationSelect]
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleNewConversation = useCallback(() => {
    // Refrescar el historial después de crear una nueva conversación
    refreshConversations();
    onNewConversation?.();
  }, [onNewConversation, refreshConversations]);

  const handleDropdownToggle = useCallback(() => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setInputValue('');
    }
  }, [showDropdown]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Header principal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 0',
        }}>
        {/* Nombre de conversación actual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="tertiary" size="slim" icon={ChevronDownIcon} onClick={handleDropdownToggle}>
            {conversationName || 'Nueva conversación'}
          </Button>
        </div>

        {/* Iconos de acción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="tertiary" icon={ExternalIcon} onClick={handleNewConversation} size="slim" />
          <Button variant="tertiary" icon={MaximizeIcon} size="slim" />
          <Button variant="tertiary" icon={XIcon} size="slim" onClick={onClose} />
        </div>
      </div>

      {/* Autocomplete de Polaris */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid var(--p-color-border-subdued)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginTop: '4px',
          }}>
          <div style={{ padding: '8px' }}>
            <Autocomplete
              options={options}
              selected={selectedConversation ? [selectedConversation] : []}
              onSelect={handleSelectionChange}
              textField={
                <Autocomplete.TextField
                  onChange={handleInputChange}
                  label="Buscar conversación"
                  labelHidden
                  placeholder="Buscar"
                  value={inputValue}
                  prefix={<Icon source={SearchIcon} tone="subdued" />}
                  loading={loading}
                  autoComplete="off"
                />
              }
              loading={loading || historyLoading}
              allowMultiple={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
