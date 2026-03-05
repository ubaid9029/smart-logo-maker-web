"use client"; // Ye zaroori hai
import { Provider } from "react-redux";
import { store } from "@/store/index"; // Path apne store ke mutabiq check kar lein

export function Providers({ children }
  : { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}