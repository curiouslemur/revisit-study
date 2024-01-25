import { ProvenanceGraph } from '@trrack/core/graph/graph-slice';
import { StudyConfig } from '../parser/types';
import { StudyStore } from './store';

export type RootState = ReturnType<StudyStore['store']['getState']>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrrackedProvenance = ProvenanceGraph<any, any>;

export type ValidationStatus = { valid: boolean, values: object }
export type TrialValidation = Record<
  string,
  {
    aboveStimulus: ValidationStatus;
    belowStimulus: ValidationStatus;
    sidebar: ValidationStatus;
    provenanceGraph?: TrrackedProvenance;
  }
>;

export interface StoredAnswer {
  answer: Record<string, Record<string, unknown>>;
  startTime: number;
  endTime: number;
  correctAnswer?: Record<string, Record<string, unknown>>;
  provenanceGraph?: TrrackedProvenance,
}

export interface StimulusParams<T, S = never> {
  parameters: T;
  provenanceState?: S;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAnswer: ({ status, provenanceGraph, answers }: { status: boolean, provenanceGraph?: TrrackedProvenance, answers: Record<string, any> }) => void
}


export interface StoreState {
  studyId: string;
  isRecording: boolean;
  answers: Record<string, StoredAnswer>;
  sequence: string[]
  config: StudyConfig;
  showAdmin: boolean;
  showHelpText: boolean;
  trialValidation: TrialValidation;
  iframeAnswers: string[];
}
