declare module 'newsapi' {
    export default class NewsAPI {
        constructor(apiKey: string);
        v2: {
            everything(params: any): Promise<any>;
            topHeadlines(params: any): Promise<any>;
        };
    }
}
