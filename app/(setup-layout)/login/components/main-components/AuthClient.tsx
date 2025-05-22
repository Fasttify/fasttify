import { AuthForm } from '@/app/(setup-layout)/login/components/main-components/AuthForm'
import ImageSlider from '@/app/(setup-layout)/login/components/main-components/ImageSlider'

const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <ImageSlider />
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
          <AuthForm />
        </div>
      </div>
    </>
  )
}

export default LoginPage
