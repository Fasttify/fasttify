/**
 * Utilidad para inyectar CSS y JS en el HTML renderizado
 * @param html - El HTML a inyectar los assets
 * @param assetCollector - El collector de assets
 * @returns El HTML con los assets inyectados
 */
export function injectAssets(html: string, assetCollector: any): string {
  let finalHtml = html;
  const css = assetCollector.getCombinedCss();
  const js = assetCollector.getCombinedJs();

  if (css) {
    const styleTag = `<style data-fasttify-assets="true">${css}</style>`;
    finalHtml = finalHtml.includes('</head>')
      ? finalHtml.replace('</head>', `${styleTag}</head>`)
      : finalHtml + styleTag;
  }

  if (js) {
    const scriptTag = `<script data-fasttify-assets="true">${js}</script>`;
    finalHtml = finalHtml.includes('</body>')
      ? finalHtml.replace('</body>', `${scriptTag}</body>`)
      : finalHtml + scriptTag;
  }

  return finalHtml;
}
