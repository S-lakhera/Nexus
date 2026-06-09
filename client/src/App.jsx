import { useUI } from "./context/UIContext";

function App() {
  const { font } = useUI();

  return (
    <div className={`min-h-screen bg-primary text-primary transition-colors duration-200 ${font}`}>
      {/* Our React Router layout configurations will live here shortly */}
      <div className="p-10">
        <h1 className="text-3xl font-bold text-accent">Nexus System Active</h1>
        <p className="mt-2 text-sm text-gray-400">Typography is dynamically bound to: {font}</p>
      </div>
    </div>
  );
}

export default App;