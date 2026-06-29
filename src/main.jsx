import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Layout } from './components/Layout.jsx';
import { ProjectManager } from './components/ProjectManager.jsx';
import {Dashboard} from './components/Dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <App/>
);
