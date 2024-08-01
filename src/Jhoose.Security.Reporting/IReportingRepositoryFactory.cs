namespace Jhoose.Security.Reporting;

public interface IReportingRepositoryFactory
{
    IReportingRepository? GetReportingRepository();
}
