using System;

namespace Jhoose.Security.Reporting.Models.Dashboard
{
    public class DashboardQuery {
        public string Type { get; set; } = string.Empty;
        public string Timeframe { get; set; } = string.Empty;
        
        public string Title { get; set; } = string.Empty;
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }
}
