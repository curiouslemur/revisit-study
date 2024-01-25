import { useMemo } from 'react';
import * as d3 from 'd3';
import { ParticipantData } from '../../../storage/types';
import { SingleTask } from './SingleTask';
import { SingleTaskLabelLines } from './SingleTaskLabelLines';

const margin = {left: 5, top: 0, right: 5, bottom: 0};

const LABEL_GAP = 25;
const CHARACTER_SIZE = 8;

export function AllTasksTimeline({participantData, width, height, setSelectedTask, selectedTask, maxDuration} : {participantData: ParticipantData, width: number, height: number, setSelectedTask: (task: string | null) => void, selectedTask: string | null, maxDuration?: number}) {
    const xScale = useMemo(() => {
        const allStartTimes = Object.values(participantData.answers).map((answer) => [answer.startTime, answer.endTime]).flat();

        const extent = d3.extent(allStartTimes) as [number, number];

        const scale = d3.scaleLinear([margin.left, width + margin.left + margin.right]).domain(maxDuration ? [extent[0], extent[0] + maxDuration] : extent);

        return scale;
    }, [maxDuration, participantData.answers, width]);

    const tasks = useMemo(() => {
        let currentHeight = 0;

        const sortedEntries = Object.entries(participantData.answers).sort((a, b) => {
            return a[1].startTime - b[1].startTime;
        });

        return sortedEntries.map((entry, i) => {
            const [name, answer] = entry;

            const prev = i > 0 ? sortedEntries[i - currentHeight - 1] : null;

            if(prev && prev[0].length * CHARACTER_SIZE + xScale(prev[1].startTime) > xScale(answer.startTime)){
                currentHeight += 1;
            }
            else {
                currentHeight = 0;
            }

            return (
                <g>                
                    <SingleTask labelHeight={currentHeight * LABEL_GAP} key={name} isSelected={selectedTask === name} setSelectedTask={setSelectedTask} answer={answer} height={height} name={name} xScale={xScale}></SingleTask>
                </g>
            );
        });
    }, [height, participantData.answers, selectedTask, setSelectedTask, xScale]);

    const lines = useMemo(() => {
        let currentHeight = 0;

        const sortedEntries = Object.entries(participantData.answers).sort((a, b) => {
            return a[1].startTime - b[1].startTime;
        });

        return sortedEntries.map((entry, i) => {
            const [name, answer] = entry;

            const prev = i > 0 ? sortedEntries[i - currentHeight - 1] : null;

            if(prev && prev[0].length * CHARACTER_SIZE + xScale(prev[1].startTime) > xScale(answer.startTime)){
                currentHeight += 1;
            }
            else {
                currentHeight = 0;
            }

            return (
                <g>                
                    <SingleTaskLabelLines labelHeight={currentHeight * LABEL_GAP} key={name} isSelected={selectedTask === name} setSelectedTask={setSelectedTask} answer={answer} height={height} name={name} xScale={xScale}></SingleTaskLabelLines>
                </g>
            );
        });
    }, [height, participantData.answers, selectedTask, setSelectedTask, xScale]);

    return <svg style={{width, height, overflow: 'visible'}}>
        {lines}
        {tasks}
    </svg>;
}
  