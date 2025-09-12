export const getLanguage = (fileType: string) => {
  switch (fileType) {
    case 'liquid':
      return 'html';
    case 'css':
      return 'css';
    case 'javascript':
      return 'javascript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    default:
      return 'plaintext';
  }
};
