import { Suspense } from 'react';
import ResponseBlock from '../components/response/ResponseBlock';
import IframeController from './IframeController';
import ImageController from './ImageController';
import ReactComponentController from './ReactComponentController';
import MarkdownController from './MarkdownController';
import { useStudyConfig } from '../store/hooks/useStudyConfig';
import { useCurrentStep } from '../routes';
import { useComponentStatus } from '../store/hooks/useComponentStatus';
import { TrialProvenanceContext, createTrialProvenance } from '../store/trialProvenance';
import ReactMarkdownWrapper from '../components/ReactMarkdownWrapper';
import { isPartialComponent } from '../parser/parser';
import merge from 'lodash/merge';
import { IndividualComponent } from '../parser/types';

// current active stimuli presented to the user
export default function ComponentController() {
  // Get the config for the current step
  const studyConfig = useStudyConfig();
  const step = useCurrentStep();
  const stepConfig = studyConfig.components[step];

  const trialProvenance = createTrialProvenance();
  
  // If we have a trial, use that config to render the right component else use the step
  const status = useComponentStatus();

  const currentConfig = isPartialComponent(stepConfig) && studyConfig.baseComponents ? merge({}, studyConfig.baseComponents?.[stepConfig.baseComponent], stepConfig) as IndividualComponent : stepConfig as IndividualComponent;

  const instruction = (currentConfig.instruction || '');
  const instructionLocation = currentConfig.instructionLocation;
  const instructionInSideBar = studyConfig.uiConfig.sidebar && (instructionLocation === 'sidebar' || instructionLocation === undefined);

  return (
    <>
      <TrialProvenanceContext.Provider value={trialProvenance}>
        {instructionLocation === 'aboveStimulus' && <ReactMarkdownWrapper text={instruction} />}
        <ResponseBlock
          status={status}
          config={currentConfig}
          location="aboveStimulus"
        />

        <Suspense key={step} fallback={<div>Loading...</div>}>
          {currentConfig.type === 'markdown' && <MarkdownController path={currentConfig.path || ''} />}
          {currentConfig.type === 'website' && <IframeController path={currentConfig.path || ''} parameters={currentConfig.parameters} />}
          {currentConfig.type === 'image' && 
            <ImageController
              path={currentConfig.path}
              style={currentConfig.style}
            />}
          {currentConfig.type === 'react-component' &&
            <ReactComponentController path={currentConfig.path || ''} parameters={currentConfig.parameters} trialId={step}/>
          }
        </Suspense>

        {(instructionLocation === 'belowStimulus' || (instructionLocation === undefined && !instructionInSideBar)) && <ReactMarkdownWrapper text={instruction} />}
        <ResponseBlock
          status={status}
          config={currentConfig}
          location="belowStimulus"
        />
      </TrialProvenanceContext.Provider>
    </>
  );
}
