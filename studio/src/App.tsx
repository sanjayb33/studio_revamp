import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import PipelineBuilder from '@/pages/PipelineBuilder';
import PipelineView from '@/pages/PipelineView';
import PipelineList from '@/pages/PipelineList';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pipeline/new" element={<PipelineBuilder />} />
          <Route path="pipeline/:id" element={<PipelineView />} />
          <Route path="pipelines" element={<PipelineList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
