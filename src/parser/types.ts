interface StudyMetadata {
  title: string;
  version: string;
  author: string[];
  date: Date;
  description?: string;
  organization?: string[];
  contactEmail: string;
  helpTextPath?: string;
  logoPath: string;
  withProgressBar: boolean;
}

export interface StudyComponent {
  type:
    | "consent"
    | "training"
    | "practice"
    | "attention-test"
    | "trials"
    | "survey"
    | "end";
}

interface StudyComponents {
  [key: string]: StudyComponent;
}

export interface ConsentComponent extends StudyComponent {
  path: string;
  signatureRequired: boolean;
}

export interface TrainingComponent extends StudyComponent {
    response: Response;
    order: string[];
    trials: { [key: string]: Trial };
}

interface PracticeComponent extends StudyComponent {
  // TODO
}

interface AttentionComponent extends StudyComponent {
  // TODO
}

export interface TrialsComponent extends StudyComponent {
  response: Response;
  order: string[];
  trials: { [key: string]: Trial };
}

export interface Trial {
  description: string;
  instruction: string;
  stimulus: Stimulus;
  responses: Response[];
  answers?: Answer[];
}

interface Stimulus {
  type: "react-component" | "image" | "javascript" | "website";
  path?: string;
  parameters?: { [key: string]: any };
}

// Add types for stimulus

export interface Option {
  label: string;
  value: string;
}
export interface Response {
  id: string;
  prompt: string;
  type:
    | "numerical"
    | "short-text"
    | "long-text"
    | "likert"
    | "dropdown"
    | "slider"
    | "radio";
  desc: string;
  required: boolean;
  options?: Option[];
}

export interface Responses {
  questions: Response[];
}

// Add types for response

export interface Answer {
  id: string;
  answer: any;
  "acceptable-low"?: number;
  "acceptable-high"?: number;
  "answer-callback"?: string;
  "answer-regex"?: string;
}

// Add types for answers

export interface StudyConfig {
  "config-version": number;
  "study-metadata": StudyMetadata;
  components: StudyComponents;
  sequence: string[];
}
