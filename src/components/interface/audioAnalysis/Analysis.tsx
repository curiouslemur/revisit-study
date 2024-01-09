/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Button, Center, Group, Stack, Text } from '@mantine/core';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedState, useDebouncedValue, useResizeObserver } from '@mantine/hooks';
import { useStorageEngine } from '../../../store/storageEngineHooks';
import { useAsync } from '../../../store/hooks/useAsync';
import { StorageEngine } from '../../../storage/engines/StorageEngine';
import { AllTasksTimeline } from './AllTasksTimeline';
import { SingleTaskTimeline } from './SingleTaskTimeline';

import {Registry, initializeTrrack} from '@trrack/core';
import { deepCopy } from '../../../utils/deepCopy';
import { useEvent } from '../../../store/hooks/useEvent';

// import WaveSurfer from 'wavesurfer.js'; 

import { WaveForm, useWavesurfer} from 'wavesurfer-react';
import WaveSurferContext from 'wavesurfer-react/dist/contexts/WaveSurferContext';

import { createPortal } from 'react-dom';
export interface TranscribedAudioSnippet {
    alternatives: {confidence: number, transcript: string}[]
    languageCode: string;
    resultEndTime: string;
}
export interface TranscribedAudio {
    results: TranscribedAudioSnippet[]
}

function getParticipantData(trrackId: string | undefined, storageEngine: StorageEngine | undefined) {
    if(storageEngine) {
        return storageEngine.getParticipantData(trrackId);
    }
}


function copyStyles(sourceDoc: any, targetDoc: any) {
    Array.from(sourceDoc.styleSheets).forEach((styleSheet: any) => {

      if (styleSheet.cssRules) { // for <style> elements
        const newStyleEl = sourceDoc.createElement('style');
  
        Array.from(styleSheet.cssRules).forEach((cssRule: any) => {
          // write the text of each rule into the body of the style element
          newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
        });

        targetDoc.head.appendChild(newStyleEl);
      } else if (styleSheet.href) { // for <link> elements loading CSS from a URL
        const newLinkEl = sourceDoc.createElement('link');
  
        newLinkEl.rel = 'stylesheet';
        newLinkEl.href = styleSheet.href;
        targetDoc.head.appendChild(newLinkEl);
      }
    });
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Analysis({setProvState} : {setProvState: (state: any) => void}) {
    const {trrackId, trialName, studyId} = useParams();

    const navigate = useNavigate();

    const location = useLocation();

    const { storageEngine } = useStorageEngine();

    const [ref, {width}] = useResizeObserver();

    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [currentNode, setCurrentNode] = useState<string | null>(null);

    const [transcription, setTranscription] = useState<TranscribedAudio | null>(null);
    const [currentShownTranscription, setCurrentShownTranscription] = useState<number | null>(null);
    const {value: participant, status } = useAsync(getParticipantData, [trrackId, storageEngine]);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [playTime, setPlayTime] = useState<number>(0);
    
    useEffect(() => {
        if(selectedTask) {
            const splitArr = location.pathname.split('/');

            setCurrentNode(null);
            splitArr[splitArr.length - 1] = selectedTask;
            navigate(splitArr.join('/'));
        }
    }, [location.pathname, navigate, selectedTask]);

    // Create an instance of trrack to ensure getState works, incase the saved state is not a full state node. 
    useEffect(() => {
        if(currentNode && selectedTask && participant) {

            const reg = Registry.create();
    
            const trrack = initializeTrrack({registry: reg, initialState: {} });

            if(participant.answers[selectedTask].provenanceGraph) {
                trrack.importObject(deepCopy(participant.answers[selectedTask].provenanceGraph!));

                const state = trrack.getState(trrack.graph.backend.nodes[currentNode]);
    
                setProvState(state);
            }
        }
        else {
            setProvState(null);
        }
    }, [currentNode, participant, selectedTask, setProvState]);


    const handleWSMount = useCallback(
        (waveSurfer: any) => {
          if (waveSurfer) {
            storageEngine?.getAudio(trrackId!).then((url) => {
                if(waveSurfer) {
                    waveSurfer.load(url);
                    setCurrentShownTranscription(0);
                }
                
            });
          }
        },
        [storageEngine, trrackId]
    );

    const containerEl = useMemo(() => document.createElement('div'), []);

    const waveSurferDiv = useRef(null);

    const wavesurfer = useWavesurfer({ container: waveSurferDiv.current, plugins: [], onMount: handleWSMount });

    const _setPlayTime = useCallback((n: number, percent: number) => {
        setPlayTime(n);
        
        if(wavesurfer && percent) {
            console.log(percent);
            wavesurfer?.seekTo(percent);
        }
    }, [wavesurfer]);

    const _setIsPlaying = useCallback((b: boolean) => {
        setIsPlaying(b);
        
        if(wavesurfer) {
            b ? wavesurfer.play() : wavesurfer.pause();
        }
    }, [wavesurfer]);

    useEffect(() => {
        if(studyId && trialName && trrackId) {
            storageEngine?.getTranscription(trrackId).then((data) => {
                setTranscription(JSON.parse(data));
            });
        }
    }, [storageEngine, studyId, trialName, trrackId]);

    const timeUpdateCallback = useEvent<(t: number) => void, any>((time: number) => {
        if(transcription && currentShownTranscription !== null) {
            const tempTime = transcription.results[currentShownTranscription].resultEndTime;

            const numTime = +tempTime.slice(0, tempTime.length - 2);

            if(time > numTime && currentShownTranscription !== transcription.results.length - 1) {
                setCurrentShownTranscription(currentShownTranscription + 1);
            }
            
        }

        setPlayTime(time * 1000);
    });

    useEffect(() => {
        
        if(wavesurfer) {
            wavesurfer.on('interaction', () => {
                wavesurfer.play();
                setCurrentShownTranscription(0);
            });

            wavesurfer.on('timeupdate', timeUpdateCallback);
        }
    }, [timeUpdateCallback, wavesurfer]);

    useEffect(() => {
        const externalWindow = window.open(
            'about:blank',
            'newWin',
            `width=2000,height=700,left=${window.screen.availWidth / 3 -
                200},top=${window.screen.availHeight / 3 - 150}`
            )!;
    
        externalWindow.document.body.appendChild(containerEl);
        copyStyles(document, externalWindow?.document);

        return () => {
          externalWindow.close();
        };
      }, []);

    const children = useMemo(() =>{
        return <Stack ref={ref} style={{width: '100%'}} spacing={0}>
        {status === 'success' && participant ? <AllTasksTimeline selectedTask={selectedTask} setSelectedTask={setSelectedTask} participantData={participant} width={width} height={50}/> : null}
        {status === 'success' && participant ? <SingleTaskTimeline setSelectedTask={setSelectedTask} playTime={playTime} setPlayTime={_setPlayTime} isPlaying={isPlaying} setIsPlaying={_setIsPlaying} currentNode={currentNode} setCurrentNode={setCurrentNode} selectedTask={selectedTask} participantData={participant} width={width} height={50}/> : null}
        <Box ref={waveSurferDiv} style={{width: '100%'}}>

        <WaveSurferContext.Provider value={wavesurfer}>
            <WaveForm id="waveform"/>
        </WaveSurferContext.Provider>
        </Box>
        <Group style={{width: '100%', height: '100px'}} align="center" position='center'>
            <Center>
                <Text color='dimmed' size={20} style={{width: '100%'}}>
                    {transcription && currentShownTranscription !== null ? transcription.results[currentShownTranscription].alternatives[0].transcript : ''}
                </Text>
            </Center>
        </Group>
        <Group>
            <Button onClick={() => _setIsPlaying(true)}>Play</Button>
            <Button onClick={() => _setIsPlaying(false)}>Pause</Button>
            <Text>{new Date(playTime).toLocaleString()}</Text>
        </Group>
    </Stack>;
    }, [_setIsPlaying, _setPlayTime, currentNode, currentShownTranscription, isPlaying, participant, playTime, ref, selectedTask, status, transcription, wavesurfer, width]);

    return <div>

            {/* {children} */}
        {createPortal(<div>{children}</div>, containerEl)}
    </div>;
}
  