import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import PipelineBuilder from '@/pages/PipelineBuilder';
import PipelineView from '@/pages/PipelineView';
import PipelineList from '@/pages/PipelineList';
import Connectors from '@/pages/Connectors';
import KnowledgeGraph from '@/pages/KnowledgeGraph';
import Solutions from '@/pages/Solutions';
import Configuration from '@/pages/Configuration';
import Templates from '@/pages/Templates';
import SplashScreen from '@/components/SplashScreen';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pipelines" element={<PipelineList />} />
          <Route path="templates" element={<Templates />} />
          <Route path="pipeline/new" element={<PipelineBuilder />} />
          <Route path="pipeline/:id" element={<PipelineView />} />
          <Route path="connectors" element={<Connectors />} />
          <Route path="knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="configuration" element={<Configuration />} />
          {/* Legacy */}
          <Route path="settings" element={<Configuration />} />
        </Route>
      </Routes>
      </HashRouter>
    </>
  );
}
