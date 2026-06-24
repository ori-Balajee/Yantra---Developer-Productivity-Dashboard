import React, { useState } from 'react'
import { CodeSnippetManager } from './components/CodeSnippetManager'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [snippets, setSnippets] = useState([]);

  
  return (
    <div>App</div>
  )
}

export default App