import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Toaster
    position="top-right"
    toastOptions={{
        duration:3000
    }}
/>
      <AppRoutes />
    </>
  );
}

export default App;