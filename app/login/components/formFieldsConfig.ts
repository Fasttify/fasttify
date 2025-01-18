export const formFields = {
  signUp: {
    email: {
      order: 1,
      isRequired: true,
    },
    preferred_username: {
      order: 2,
      placeholder: "Ingrese su nombre de usuario aquí",
      label: "Nombre de usuario",
      isRequired: true,
    },
    password: {
      order: 3,
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      isRequired: true,
    },
  },
};
