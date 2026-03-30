"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "react-hot-toast";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </Provider>
  );
}