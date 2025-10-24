export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If the image is already a complete URL, return it as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If the image starts with /, treat it as a relative path to fasttify.com
  if (src.startsWith('/')) {
    const baseUrl = 'https://cdn.fasttify.com/assets/b';
    const qualityParam = quality ? `&q=${quality}` : '';
    const widthParam = `?w=${width}`;
    const result = `${baseUrl}${src}${widthParam}${qualityParam}`;

    return result;
  }

  // For other paths, return them as is
  return src;
}
