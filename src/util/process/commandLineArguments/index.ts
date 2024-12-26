const commandLineArguments = process.argv.slice(2);
export const inputFile = commandLineArguments[0]
export const commandLineFlags = new Map<string, string>()

for (let index = 0; index < commandLineArguments.length - 1; index++) {
	if (commandLineArguments[index + 1].startsWith("--")) {
		let flagName = commandLineArguments[index + 1].slice(2)
		let flagValue = commandLineArguments[index + 2]

		if (flagName.indexOf("=") !== -1) {
			const flag = flagName;
			flagName = flag.slice(0, flag.indexOf("="))
			flagValue = flag.slice(flag.indexOf("=") + 1)
		}
	
		commandLineFlags.set(flagName, flagValue)
	}
}