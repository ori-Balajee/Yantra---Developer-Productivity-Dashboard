import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Layout } from './components/Layout.jsx';

createRoot(document.getElementById('root')).render(
  <Layout />
);
