const NEXUS_API_BASE_URL = 'https://api.entropianexus.com';
const _encodeURI = (href: string) => href.replace(/\(/g, '%28').replace(/\)/g, '%29');
const nexusApiUrl = (href: string) => href && _encodeURI(new URL(href, NEXUS_API_BASE_URL).href);
const nexusWwwUrl = (href: string) => href && new URL(href.replace(/ /g, '~'), 'https://entropianexus.com').href;

export {
    NEXUS_API_BASE_URL,
    nexusApiUrl,
    nexusWwwUrl
}