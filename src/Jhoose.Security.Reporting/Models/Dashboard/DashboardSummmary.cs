namespace Jhoose.Security.Reporting.Models.Dashboard
{
    public class DashboardSummary
    {
        public DashboardSummary()
        {
            Query = new DashboardQuery();
            Total = 0;
            TopPages = [];
            TopDirectives = [];
            Errors = [];
        }

        public DashboardQuery Query { get; set; }
        public int Total { get; set; }
        public List<DashboardIssue> TopPages { get; set; }
        public List<DashboardIssue> TopDirectives { get; set; }
        public List<DashboardGraphItem> Errors { get; set; }
    }
}
