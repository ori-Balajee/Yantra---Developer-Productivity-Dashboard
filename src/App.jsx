import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TimeTracker } from './components/TimeTracker';
import { DailyLogManager } from './components/DailyLogManager';
import { CodeSnippetManager } from './components/CodeSnippetManager';
import { ProjectManager } from './components/ProjectManager';
import { mongoClient } from './lib/mongodbClient';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [snippets, setSnippets] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s, l, sn] = await Promise.all([
        mongoClient.getProjects(),
        mongoClient.getSessions(),
        mongoClient.getLogs(),
        mongoClient.getSnippets(),
      ]);
      setProjects(p);
      setSessions(s);
      setLogs(l);
      setSnippets(sn);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500">Loading your data...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard sessions={sessions} projects={projects} logs={logs} onRefresh={handleRefresh} />;
      case 'tracker':
        return <TimeTracker projects={projects} sessions={sessions} onDataRefresh={handleRefresh} />;
      case 'logs':
        return <DailyLogManager logs={logs} onDataRefresh={handleRefresh} />;
      case 'snippets':
        return <CodeSnippetManager snippets={snippets} onDataRefresh={handleRefresh} />;
      case 'projects':
        return <ProjectManager projects={projects} onDataRefresh={handleRefresh} />;
      default:
        return <Dashboard sessions={sessions} projects={projects} logs={logs} onRefresh={handleRefresh} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;