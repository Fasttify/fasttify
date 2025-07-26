export const getCookieOptions = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    // Agregar dominio en producción si es necesario (no es necesario en local)
    ...(isProduction &&
      process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN,
      }),
  };
};

// Opciones específicas para cookies de carrito
export const getCartCookieOptions = () => {
  const isProduction = process.env.APP_ENV === 'production';

  return {
    httpOnly: false, // No usar httpOnly para cookies del carrito que necesitan ser accesibles desde JS
    secure: isProduction,
    sameSite: isProduction ? 'strict' : ('lax' as 'strict' | 'lax'),
    maxAge: 60 * 60 * 24 * 90, // 90 days para carritos
    path: '/',
    // Agregar dominio en producción si es necesario (no es necesario en local)
    ...(isProduction &&
      process.env.COOKIE_DOMAIN && {
        domain: process.env.COOKIE_DOMAIN,
      }),
  };
};
