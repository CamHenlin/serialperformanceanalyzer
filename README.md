# serialperformanceanalyzer

Very much a WIP but is useful if you are trying to add performance analysis to a Retro68 application on a classic Macintosh or emulator, where running gdb and some sort of better analysis might be an option. Otherwise you end up doing this in C code on the machine which can cumbersome to print out an analyze. More in depth instructions on how this library can be used are available [here](https://henlin.net/2021/12/21/Profiling-your-Retro68-application/)

Options:
- Can be run tailing a flat file by specifiying `process.env.FILE_PATH`
- Can be run using serial by specifiying `process.env.SERIAL`

Sending profiling messages:
- `PROFILE_START x` - starts tracking `x`
- `PROFILE_END x` - stops tracking `x`. Measures and stores how long `x` took to run
- `PROFILE_COMPLETE` - analyzes all profile data and prints it out in 3 charts

3 charts:
- Most total time spent in each profile mark overall
- Longest individual profile mark
- Time spent in each profile mark
