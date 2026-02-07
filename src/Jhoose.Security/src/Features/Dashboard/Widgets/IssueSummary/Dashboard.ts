import type { IssueItem } from './IssueItem';
import type { IssueMetric } from './IssueMetric';

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
