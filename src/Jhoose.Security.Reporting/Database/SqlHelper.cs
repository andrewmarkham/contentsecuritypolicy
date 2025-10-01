using System.Data;

using Jhoose.Security.Core.Configuration;

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Jhoose.Security.Reporting.Database
{
    public class SqlHelper(ILogger<SqlHelper> logger, IOptions<ReportingOptions> options) : ISqlHelper
    {
        private readonly ILogger<SqlHelper> logger = logger;
        private readonly ReportingOptions options = options.Value;

        public async Task<int> ExecuteNonQuery(string sqlCommand, params SqlParameter[] parameters)
        {
            try
            {
                using var connection = new SqlConnection(options.ConnectionString);
                connection.Open();
                using var command = new SqlCommand(sqlCommand, connection);

                command.Parameters.AddRange(parameters);
                return await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while executing non query");
                return -1;
            }
        }

        public async Task<T?> ExecuteScalar<T>(string sqlCommand, params SqlParameter[] parameters)
        {
            try
            {
                using var connection = new SqlConnection(options.ConnectionString);
                connection.Open();
                using var command = new SqlCommand(sqlCommand, connection);

                command.Parameters.AddRange(parameters);
                var result = await command.ExecuteScalarAsync();
                return (T?)result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while executing non query");
                return default;
            }
        }

        public async Task<T?> ExecuteReader<T>(string sqlCommand, IEnumerable<SqlParameter>? parameters, Func<SqlDataReader, T>? readerAction = null)
        {
            T? results = default;

            try
            {
                using var connection = new SqlConnection(options.ConnectionString);
                connection.Open();
                using var command = new SqlCommand(sqlCommand, connection);

                foreach (var parameter in parameters ?? [])
                {
                    command.Parameters.Add(parameter);
                }

                var reader = await command.ExecuteReaderAsync();

                if (readerAction is not null)
                    results = readerAction(reader);

                reader.Close();

                return results ?? default;

            }
            catch (SqlException ex)
            {
                logger.LogError(ex, "SQL Exception while executing reader");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while executing reader");
            }

            return results;
        }

        public async Task<int> ExecuteStoredProcedure<T>(string storedProcedureName,
                                                      IEnumerable<SqlParameter> parameters,
                                                      Func<SqlDataReader, T>? readerAction = null,
                                                      int defaultReturnValue = -1)
        {
            var value = defaultReturnValue;
            try
            {
                using var connection = new SqlConnection(options.ConnectionString);

                var command = new SqlCommand(storedProcedureName, connection)
                {
                    CommandType = CommandType.StoredProcedure

                };

                foreach (var parameter in parameters)
                {
                    command.Parameters.Add(parameter);
                }

                command.Parameters.Add("@returnValue", SqlDbType.Int).Direction = ParameterDirection.ReturnValue;

                command.Connection.Open();
                var reader = await command.ExecuteReaderAsync();

                if (readerAction is not null)
                    readerAction(reader);

                reader.Close();
                value = (int)command.Parameters["@returnValue"].Value;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while running stored procedure");
            }

            return value;
        }

        public SqlParameter CreateParameter<T>(string parameterName, DbType dbType, T value)
        {
            var parameter = new SqlParameter
            {
                ParameterName = parameterName,
                DbType = dbType,
                Direction = ParameterDirection.Input,
                Value = value
            };

            return parameter;
        }
    }
}