function handler(event) {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Solo bloquear si es acceso directo a templates
  if (uri.startsWith('/templates/')) {
    // Verificar si viene de tu API (por headers personalizados)
    const userAgent = request.headers['user-agent']?.[0]?.value || '';
    const apiSource = request.headers['x-api-source']?.[0]?.value || '';

    // Permitir si viene de tu API (Fasttify server)
    if (userAgent.includes('Fasttify-API') || apiSource === 'fasttify-server') {
      return request; // Permitir acceso desde tu API
    }

    // Bloquear acceso directo del navegador
    return {
      statusCode: 403,
      statusDescription: 'Forbidden',
      body: 'Direct access to template files is not allowed. Use the API endpoints instead.',
      headers: {
        'content-type': [{ value: 'text/plain' }],
      },
    };
  }

  // Permitir todo lo demás
  return request;
}
