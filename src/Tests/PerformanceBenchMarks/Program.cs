// See https://aka.ms/new-console-template for more information
//using System.Diagnostics;

/*
using BenchmarkDotNet.Configs;
using BenchmarkDotNet.Running;

BenchmarkSwitcher.FromAssembly(typeof(Program).Assembly).Run(args, new DebugInProcessConfig());
*/
    Console.WriteLine("Hello, World!");

    //Debugger.Launch();
    //var f = new ProblemJsonFormatterBenchmark();
    //await f.ReportApiStreamReaderBenchmark();
    BenchmarkDotNet.Running.BenchmarkRunner.Run<ProblemJsonFormatterBenchmark>();