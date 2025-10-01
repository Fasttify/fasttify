import { TextField } from '@shopify/polaris';

export function DescriptionEditor({
  initialValue = '',
  onChange,
}: {
  initialValue?: string;
  onChange: (content: string) => void;
}) {
  return (
    <TextField
      label="Descripción"
      value={initialValue}
      onChange={onChange}
      multiline={4}
      placeholder="Ingresa la descripción de la colección..."
      helpText="Describe los productos que incluye esta colección"
      autoComplete="off"
      labelHidden
      maxHeight="400px"
    />
  );
}
