// ================================
// # Script purpose: 
//   By intaking the emoji test file and matching on it with regex, produce a file
//   with all of the emoji names. It is an alternative to the bash script available
//   directly on the inside of SerenityOS/Meta.
//
// # Why Deno and why Javascript?
//   It was originally started as a Nushell script. However I couldn't figure out
//   a good way to parse all of the stuff inside of the file in a good easy and 
//   fast way. 
//
// ================================


// Get arguments.
const { args } = Deno;

if (args.length < 3) {
    console.log("Usage: deno run generate-emoji-txt.ts <input emoji-test.txt file> <emoji image directory> <output path> --allow-read --allow-write \n");
    console.log("Information:");
    console.log("   emoji-test.txt        - file containing a list of all emojis.");
    console.log("   Emoji Image Directory - The directory with new emojis.");
    console.log("   Output path           - Path to where you want to put the txt file containing the emojis. \n");
    console.log("Example:");
    console.log("   deno run generate-emoji-txt.ts emoji-test.txt ./emojis output.txt --allow-read --allow-write ")
}

const InputFile = args[0];
const EmojiDirectory = args[1]; 
const OutputPath = args[2]; 

// This regex parses through the txt file and gets rid of
// useless headers and stuff we won't need.
const TrimRegex = RegExp("(^#+.*)\n*", "gm");

const RemoveWhitespaceRegex = RegExp("^ *\n *", "gm");

const TextFile = await Deno.readTextFile(InputFile);
// Trims all of the "fat"
const TrimmedTextFile = TextFile.replaceAll(TrimRegex, "").replaceAll(RemoveWhitespaceRegex, "");


const clean_array: string[] = [];
TrimmedTextFile.split("\n").forEach((line) =>
    line.split(";").forEach((deline) =>
        clean_array.push(deline.trim())
    )
);


const emoji_unicode_map: Map<string, string> = new Map();

for (let i = 0; i < clean_array.length; i += 2) {
    emoji_unicode_map.set(clean_array[i], clean_array[i + 1])
}


const UnicodeToEmoji = (unicode_list: Array<string>, unicode_map: Map<string, string>) => {
    const output = [];
    //const hashtag_list = [];
    for (let i = 0; i < unicode_list.length; i++) {
        const value = unicode_list[i].trim();
        //hashtag_list.push(value.search(/#/));
        output.push(`${value} ${unicode_map.get(value)} \n`);
    }
    return output;
}

const fileNames: string[] = [];
for await (const dirEntry of Deno.readDir(EmojiDirectory)) {
  
  if (dirEntry.isFile) {
  
    fileNames.push(dirEntry.name);
  
  }
  
}

const cleanNames = [];
for (const file_name of fileNames) {
    cleanNames.push(file_name.replaceAll(/\.png/gm, "").replaceAll(/\_/gm, " ").replaceAll(/U\+/gm, ""))
}

const output = UnicodeToEmoji(cleanNames, emoji_unicode_map);

const output_file = new TextEncoder().encode(output.join(""))

await Deno.writeFile(OutputPath, output_file)
// const trihard = Object.fromEntries(emoji_unicode_map)

// const output_file = new TextEncoder().encode(JSON.stringify(trihard));

// await Deno.writeFile("output.json", output_file)

