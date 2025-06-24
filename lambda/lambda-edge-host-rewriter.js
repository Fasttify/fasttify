exports.handler = async event => {
  const request = event.Records[0].cf.request
  const headers = request.headers

  // Preservar el dominio original en un header personalizado
  headers['x-original-host'] = [
    {
      key: 'x-original-host',
      value: headers.host[0].value,
    },
  ]

  // Reemplazar el Host header con el dominio de Amplify
  headers.host = [
    {
      key: 'Host',
      value: 'fasttify.com',
    },
  ]

  return request
}
