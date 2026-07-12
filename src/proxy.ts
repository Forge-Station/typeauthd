import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { Logger } from './logging';

/**
 * Routes ALL outbound native `fetch` (i.e. the Discord API calls in
 * web/helpers.ts) through an HTTP proxy when HTTPS_PROXY / ALL_PROXY is set.
 *
 * Needed on hosts where discord.com is not reachable directly — the traffic is
 * sent into a local xray tunnel (its HTTP inbound). Postgres/sqlite do not use
 * fetch, so the database connection stays direct and is unaffected.
 *
 * No proxy env set => nothing changes, requests go out directly.
 */
export function setupOutboundProxy(): void {
    const proxyUrl =
        process.env.HTTPS_PROXY ||
        process.env.https_proxy ||
        process.env.ALL_PROXY ||
        process.env.all_proxy;

    if (!proxyUrl) {
        return;
    }

    setGlobalDispatcher(new ProxyAgent(proxyUrl));
    Logger.get().info(`Outbound HTTP (fetch) routed through proxy: ${proxyUrl}`);
}