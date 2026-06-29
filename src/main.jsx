import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Layout } from './components/Layout.jsx';
import { ProjectManager } from './components/ProjectManager.jsx';

createRoot(document.getElementById('root')).render(
  <ProjectManager />
);
