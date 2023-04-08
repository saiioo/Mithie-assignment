const fs = require('fs');

class Indexer {
  constructor(inputFiles, excludeWordsFile, outputFile) {
    this.inputFiles = inputFiles;
    this.excludeWordsFile = excludeWordsFile;
    this.outputFile = outputFile;
    this.fileContents = {};
    this.excludedWords = new Set();
    this.index = {};
  }

  readFiles() {
    // Read the exclude-words file and store the excluded words in a Set
    const excludeWords = fs.readFileSync(this.excludeWordsFile, 'utf-8');
    const excludeWordsArr = excludeWords.split('\n');
    for (const word of excludeWordsArr) {
      this.excludedWords.add(word.trim());
    }

    // Read the input files and store the contents in memory
    for (const file of this.inputFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const words = content.split(/\s+/);
      const filteredWords = words.filter((word) => !this.excludedWords.has(word));
      this.fileContents[file] = filteredWords;
    }
  }

  createIndex() {
    // Iterate over the words in each file and create the index
    for (const file in this.fileContents) {
      const words = this.fileContents[file];
      const pageNo = parseInt(file.replace('Page', '').replace('.txt', ''));
      for (const word of words) {
        if (this.index[word]) {
          this.index[word].add(pageNo);
        } else {
          this.index[word] = new Set([pageNo]);
        }
      }
    }
  }

  writeIndexToFile() {
    // Sort the keys of the index in alphabetical order
    const sortedKeys = Object.keys(this.index).sort();
    const outputStream = fs.createWriteStream(this.outputFile);

    // Write the index to the output file in the specified format
    for (const key of sortedKeys) {
      const pageNos = Array.from(this.index[key]).sort().join(',');
      outputStream.write(`${key} : ${pageNos}\n`);
    }
    outputStream.close();
  }

  run() {
    this.readFiles();
    this.createIndex()
    this.writeIndexToFile();
  }
}

// Example usage:
const inputFiles = ['Page1.txt', 'Page2.txt', 'Page3.txt'];
const excludeWordsFile = 'exclude-words.txt';
const outputFile = 'index.txt';

const indexer = new Indexer(inputFiles, excludeWordsFile, outputFile);
indexer.run();