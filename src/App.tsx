import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import ConfigSwitcher from './components/ConfigSwitcher';
import { Shell } from './components/Shell';
import { parseGlobalConfig, parseStudyConfig } from './parser/parser';
import { GlobalConfig, Nullable, StudyConfig } from './parser/types';

export const PREFIX = import.meta.env.PROD
  ? import.meta.env.VITE_BASE_PATH
  : '/';

async function fetchGlobalConfigArray() {
  const globalFile = await fetch(`${PREFIX}configs/global.hjson`);
  const configs = await globalFile.text();
  return parseGlobalConfig(configs);
}

async function fetchStudyConfigs(globalConfig: GlobalConfig) {
  const studyConfigs: { [key: string]: StudyConfig } = {};
  const urls = globalConfig.configsList.map(
    (configId) => `${PREFIX}${globalConfig.configs[configId].path}`
  );

  const res = await Promise.all(urls.map((u) => fetch(u)))
    .then((responses) => Promise.all(responses.map((res) => res.text())))
    .then((responses) =>
      Promise.all(responses.map((res, idx) => parseStudyConfig(res, globalConfig.configsList[idx])))
    );
  
  globalConfig.configsList.forEach((configId, idx) => {
    studyConfigs[configId] = res[idx];
  });
  return studyConfigs;
}

export function AppShellDemo() {
  const [globalConfig, setGlobalConfig] =
    useState<Nullable<GlobalConfig>>(null);

  const [studyConfigs, setStudyConfigs] = useState<{
    [key: string]: StudyConfig;
  }>({});


  useEffect(() => {
    console.log('fetching');
    fetchGlobalConfigArray().then((gc) => {
      setGlobalConfig(gc);
      fetchStudyConfigs(gc).then((sc) => {
        setStudyConfigs(sc);
      });
    });
  }, []);


  return globalConfig ? (
    <BrowserRouter basename={PREFIX}>
      <Routes>
        <Route
          path="/"
          element={
            <ConfigSwitcher
              globalConfig={globalConfig}
              studyConfigs={studyConfigs}
            />
          }
        />
        <Route
          path="/:studyId/*"
          element={<ShellWrapper globalConfig={globalConfig} />}
        />
      </Routes>
    </BrowserRouter>
  ) : null;
}

function ShellWrapper(props: any) {
  const { studyId } = useParams();

  return <Shell key={studyId} {...props} />;
}
