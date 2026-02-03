using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

using Microsoft.Data.SqlClient;

namespace Jhoose.Security.Features.Database;

public interface ISqlHelper
{
    Task<int> ExecuteNonQuery(string sqlCommand, params SqlParameter[] parameters);
    Task<T?> ExecuteReader<T>(string sqlCommand,
        IEnumerable<SqlParameter>? parameters,
        Func<SqlDataReader, T>? readerAction = null);

    Task<T?> ExecuteStoredProcedure<T>(string storedProcedureName,
                                                  IEnumerable<SqlParameter> parameters,
                                                  Func<SqlDataReader, T>? readerAction = null);

    Task<T?> ExecuteScalar<T>(string sqlCommand, params SqlParameter[] parameters);

    SqlParameter CreateParameter<T>(string parameterName, SqlDbType dbType, T value);
    //public SqlParameter CreateParameter(string parameterName, DbType dbType, int size);
}