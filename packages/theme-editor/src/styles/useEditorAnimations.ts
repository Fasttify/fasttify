import { useAnimation } from '../providers/AnimationProvider';

export const useEditorAnimations = () => {
  const { getAnimationClasses } = useAnimation();

  return {
    // Animación principal del contenedor
    container: getAnimationClasses({
      duration: 500,
      direction: 'bottom',
      distance: 4,
      easing: 'out',
    }),

    // Animación del header
    header: getAnimationClasses({
      duration: 300,
      direction: 'top',
      distance: 2,
      easing: 'out',
    }),

    // Animación de las tabs
    tabs: getAnimationClasses({
      duration: 400,
      direction: 'top',
      distance: 1,
      easing: 'out',
      delay: 100,
    }),

    // Animación del sidebar
    sidebar: getAnimationClasses({
      duration: 600,
      direction: 'left',
      distance: 4,
      easing: 'out',
      delay: 300,
    }),

    // Animación del área principal
    mainArea: getAnimationClasses({
      duration: 600,
      direction: 'right',
      distance: 4,
      easing: 'out',
      delay: 400,
    }),

    // Animación de elementos de lista (para el file tree)
    listItem: (index: number) =>
      getAnimationClasses({
        duration: 300,
        direction: 'left',
        distance: 2,
        easing: 'out',
        delay: 500 + index * 50,
      }),

    // Animación de tabs individuales
    tabItem: (index: number) =>
      getAnimationClasses({
        duration: 200,
        direction: 'top',
        distance: 1,
        easing: 'out',
        delay: 200 + index * 30,
      }),
  };
};
