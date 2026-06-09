import { useUI } from "./context/UIContext";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  // Pulling the dynamic font preference from your Context API
  const { font } = useUI();

  return (
    <div className={`min-h-screen bg-primary text-primary transition-colors duration-200 ${font}`}>
      {/* The router handles injecting the correct page right here */}
      <AppRoutes />
    </div>
  );
}

export default App;