import { Box, Navbar, NavLink, Text } from '@mantine/core';
import { IconZoomQuestion, IconLayoutDashboard, IconChevronRight, IconBrowserPlus } from '@tabler/icons-react';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
// import { useNavigate } from 'react-router-dom';
// import { StateContext } from '../../StateProvider';

export default function AppNav() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    const onClickLink = (tab:string) => {
        setActiveTab(tab);
        navigate(`/analysis/${tab}`);


    };

    return (
        <Navbar width={{ base: 230 }} style={{ zIndex: 0 }}>

                <Navbar.Section p="xl">
                    <Box w={200}>

                        <NavLink
                            active={activeTab === 'dashboard'}
                            onClick={() => onClickLink('dashboard')}
                            label={<Text fz="lg"> Dashboard </Text>}
                            icon={<IconLayoutDashboard size="2rem" stroke={1.5} color="#4287f5" />}
                            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                        />
                        <NavLink
                            active={activeTab === 'browser'}
                            onClick={() => onClickLink('browser')}
                            label={<Text fz="lg"> Browser </Text>}
                            icon={<IconBrowserPlus size="2rem" stroke={1.5} color="#4287f5"  />}
                            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                        />


                        <NavLink
                          active={activeTab === 'about'}
                          onClick={() => onClickLink('about')}
                          label={<Text fz="lg"> About </Text>}
                          icon={<IconZoomQuestion size="2rem" stroke={1.5} color="#4287f5"  />}
                          rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                        />
                    </Box>
                </Navbar.Section>


        </Navbar>
    );
}
