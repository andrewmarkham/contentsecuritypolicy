```

BenchmarkDotNet v0.15.4, macOS 26.3 (25D125) [Darwin 25.3.0]
Apple M1 Pro, 1 CPU, 10 logical and 10 physical cores
.NET SDK 10.0.100
  [Host]     : .NET 8.0.0 (8.0.0, 8.0.23.53103), Arm64 RyuJIT armv8.0-a
  DefaultJob : .NET 8.0.0 (8.0.0, 8.0.23.53103), Arm64 RyuJIT armv8.0-a


```
| Method                               | Mean     | Error    | StdDev   | Ratio | Gen0      | Gen1     | Gen2    | Allocated | Alloc Ratio |
|------------------------------------- |---------:|---------:|---------:|------:|----------:|---------:|--------:|----------:|------------:|
| ReportApiStreamReaderBenchmarkLegacy | 22.97 ms | 0.249 ms | 0.221 ms |  1.00 | 2375.0000 | 156.2500 | 31.2500 |  14.13 MB |        1.00 |
| ReportApiStreamReaderBenchmark       | 11.28 ms | 0.069 ms | 0.057 ms |  0.49 | 1000.0000 |        - |       - |   6.03 MB |        0.43 |
| NativeSerializationBenchmark         | 11.08 ms | 0.066 ms | 0.058 ms |  0.48 | 1421.8750 |        - |       - |   8.52 MB |        0.60 |
