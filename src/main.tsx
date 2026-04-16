import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css'
import { initializeDefaultAdmin } from './lib/localDb'

// Initialize default admin user before rendering the app
initializeDefaultAdmin().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch(error => {
  console.error('Failed to initialize admin user:', error);
  // Render app anyway
  createRoot(document.getElementById("root")!).render(<App />);
});
