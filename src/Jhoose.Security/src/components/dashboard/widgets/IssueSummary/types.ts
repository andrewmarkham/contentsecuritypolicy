export type IssueItem = {
    url: string, 
    name: string, 
    count: number
}

export type IssueMetric = {
    time: string, 
    value: number, 
    metric: string
}

export type Dashboard = {
    query?: {
        title: string;
        from: string;
        to: string;
        metric: "browser" | "directive" | "page";
    },
    total?: number;
    topPages?: IssueItem[];
    topDirectives?: IssueItem[];
    errors?: IssueMetric[];
}