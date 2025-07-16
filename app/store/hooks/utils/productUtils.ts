export function withLowercaseName<T extends { name?: string }>(data: T) {
  return data.name ? { ...data, nameLowercase: data.name.toLowerCase() } : { ...data, nameLowercase: undefined };
}
