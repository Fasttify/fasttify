import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { formFields } from "@/app/login/components/formFieldsConfig";
import { Footer } from "@/app/landing/components/Footer";
import ImageSlider from "@/app/login/components/ImageSlider";

const LoginPage = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50 to-violet-50">
        <ImageSlider />
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
          {/* Mobile-only title */}
          <h1 className="text-2xl font-bold text-purple-900 mb-2 lg:hidden mt-26">
            Bienvenido a
          </h1>
          <h2 className="text-xl font-bold text-purple-800 lg:hidden text-center">
            Fastiffy
          </h2>
          <br />
          {/* Authenticator container with refined background */}
          <div className="w-full max-w-xl">
            <div className="bg-transparent lg:bg-white/80 lg:backdrop-blur-sm lg:rounded-2xl lg:px-12 lg:py-10 lg:shadow-[0_8px_32px_rgba(147,51,234,0.08)] lg:border lg:border-purple-100">
              <Authenticator formFields={formFields} />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="hidden lg:block absolute -top-20 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-50" />
          <div className="hidden lg:block absolute -bottom-20 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent opacity-50" />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
