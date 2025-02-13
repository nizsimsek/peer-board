import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Welcome from "@/pages/welcome";
import { LangProvider } from "./components/lang-provider";
import Room from "./pages/room";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LangProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </LangProvider>
  </BrowserRouter>
);
