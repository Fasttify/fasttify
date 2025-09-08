export const getLanguage = (fileType: string) => {
  switch (fileType) {
    case 'liquid':
      return 'html'; // Monaco no tiene soporte nativo para Liquid
    case 'css':
      return 'css';
    case 'js':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    default:
      return 'plaintext';
  }
};
