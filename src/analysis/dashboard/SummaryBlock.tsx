import React, {useEffect, useState} from 'react';
import Loading from '../components/basics/Loading';
import {Box, Grid, Text} from '@mantine/core';
import {FirebaseStorageEngine} from '../../storage/engines/FirebaseStorageEngine';
import {ParticipantData} from '../../storage/types';
import {SummaryBlockProps} from '../types';
import SummaryPanel from './SummaryPanel';
import {getConfig} from '../utils';


export function SummaryBlock(props: SummaryBlockProps) {
    const { globalConfig, databaseSection } = props;
    const [loading, setLoading] = useState(false);
    const [expData, setExpData] = useState<Record<string, ParticipantData[]>>({});
    const studyIds = globalConfig.configsList;


    // const storageEngine = new FirebaseStorageEngine();




    useEffect(() => {

        const init = async () => {
            setLoading(true);
            const allData:Record<string, ParticipantData[]> = {};

            const fetchData = async (studyId:string) => {
                const storageEngine = new FirebaseStorageEngine();
                const config = await getConfig(studyId, globalConfig, databaseSection);
                if(!config || !storageEngine) return;
                await storageEngine.connect();
                await storageEngine.initializeStudyDb(studyId, config);
                allData[studyId] = await storageEngine.getAllParticipantsData();
            };

            const fetchAllData = async () => {
                // const studyIds = ['html-demo'];
                const promises = studyIds.map((studyId) => fetchData(studyId));
                try {
                    // Use Promise.all to wait for all promises to resolve
                    await Promise.all(promises);
                    console.log('All data fetched successfully');
                    setExpData(allData);
                    setLoading(false);


                } catch (error) {
                    console.error('Error fetching data:', error);
                    setLoading(false);


                }
            };
            await fetchAllData();
        };
        init();


    }, []);


    return (
        <>
            <Box>
                <Text mt={20} mb={20} fw={700} >Total Record: </Text>
                <Grid>
                    {studyIds.map((studyID:string) =>
                        <Grid.Col md={12} xl={6}>
                        <SummaryPanel  studyId={studyID} data={expData[studyID]} />
                    </Grid.Col>)}
                    <Loading isLoading={loading} />
                </Grid>
            </Box>
        </>
    );
}
