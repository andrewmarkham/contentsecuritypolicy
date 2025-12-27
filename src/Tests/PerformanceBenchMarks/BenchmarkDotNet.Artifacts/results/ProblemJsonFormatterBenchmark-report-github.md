```

BenchmarkDotNet v0.15.4, macOS 26.2 (25C56) [Darwin 25.2.0]
Apple M1 Pro, 1 CPU, 10 logical and 10 physical cores
.NET SDK 10.0.100
  [Host]     : .NET 8.0.0 (8.0.0, 8.0.23.53103), Arm64 RyuJIT armv8.0-a
  DefaultJob : .NET 8.0.0 (8.0.0, 8.0.23.53103), Arm64 RyuJIT armv8.0-a


```
| Method                               | Mean     | Error    | StdDev   | Ratio | Gen0      | Gen1     | Gen2    | Allocated | Alloc Ratio |
|------------------------------------- |---------:|---------:|---------:|------:|----------:|---------:|--------:|----------:|------------:|
| ReportApiStreamReaderBenchmarkLegacy | 22.93 ms | 0.166 ms | 0.139 ms |  1.00 | 2406.2500 | 156.2500 | 62.5000 |   14.1 MB |        1.00 |
| ReportApiStreamReaderBenchmark       | 11.43 ms | 0.039 ms | 0.031 ms |  0.50 | 1000.0000 |  15.6250 |       - |   6.03 MB |        0.43 |
| NativeSerializationBenchmark         | 11.10 ms | 0.117 ms | 0.103 ms |  0.48 | 1421.8750 | 265.6250 |       - |   8.52 MB |        0.60 |
