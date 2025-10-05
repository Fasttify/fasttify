exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  headers['x-original-host'] = [
    {
      key: 'x-original-host',
      value: headers.host[0].value,
    },
  ];

  headers.host = [
    {
      key: 'Host',
      value: 'main.d1wc36cp4amanq.amplifyapp.com',
    },
  ];

  return request;
};
