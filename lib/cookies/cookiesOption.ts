export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
};
