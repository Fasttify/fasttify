import { Footer } from "@/app/landing/components/Footer";
import { AuthForm } from "@/app/login/AuthForm";
import ImageSlider from "@/app/login/components/ImageSlider";

const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen">
        <ImageSlider />
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
          <AuthForm />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
