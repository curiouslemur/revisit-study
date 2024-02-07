import {sanitizeStringForUrl} from '../utils/sanitizeStringForUrl';
import {GlobalConfig} from '../parser/types';
import {parseStudyConfig} from '../parser/parser';


async function fetchStudyConfig(configLocation: string, configKey: string, dataBasePrefix:string) {
    const config = await (await fetch(`${dataBasePrefix}${configLocation}`)).text();
    return parseStudyConfig(config, configKey);
}
export const getConfig = async (studyId:string, globalConfig:GlobalConfig, databaseSection:string = '/') => {
    const configKey = globalConfig.configsList.find(
        (c) => sanitizeStringForUrl(c) === studyId
    );
    if(!configKey) return;
    const configJSON = globalConfig.configs[configKey];
    return await fetchStudyConfig(`${configJSON.path}`, configKey, databaseSection);

};

export function toDisplayData(milliseconds:number) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = ((milliseconds % (1000 * 60)) / 1000).toFixed(0);
    return minutes>0 ? minutes + 'm ' + seconds + 's' : seconds + 's';
}


