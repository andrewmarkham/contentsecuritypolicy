using System.Data;
using Microsoft.Data.SqlClient;

namespace Jhoose.Security.Reporting.Database
{
    public interface ISqlHelper
    {
        public Task<int> ExecuteNonQuery(string sqlCommand, params SqlParameter[] parameters);
        public Task<T?> ExecuteReader<T>(string sqlCommand,
            IEnumerable<SqlParameter>? parameters,
            Func<SqlDataReader, T>? readerAction = null);

        public Task<int> ExecuteStoredProcedure<T>(string storedProcedureName,
                                                      IEnumerable<SqlParameter> parameters,
                                                      Func<SqlDataReader, T>? readerAction = null,
                                                      int defaultReturnValue = -1);

        Task<T?> ExecuteScalar<T>(string sqlCommand, params SqlParameter[] parameters);

        public SqlParameter CreateParameter<T>(string parameterName, DbType dbType, T value);
        //public SqlParameter CreateParameter(string parameterName, DbType dbType, int size);
    }
}


