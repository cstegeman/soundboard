import fs from 'node:fs';
import NodeID3 from 'node-id3';

const OUTPUT = './public';
const INPUT = './public/audio';

type Entry =
  { title?: string; name: string } | { title?: string; category: string; sounds: Entry[] };

const getAllFiles = function (dirPath: string): Entry[] {
  const files = fs.readdirSync(dirPath);

  return files.map(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      return {
        title: getFileCategory(`${dirPath}/${file}`),
        category: file,
        sounds: getAllFiles(dirPath + '/' + file)
      };
    }
    return {
      title: getFileTitle(`${dirPath}/${file}`),
      name: file
    };
  });
};

/**
 */
function getFileTitle(file: string) {
  const tags = NodeID3.read(file);

  return tags.title;
}

/**
 */
function getFileCategory(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  let i = 0;
  let found = false;
  let category = '';

  while (i < files.length && !found) {
    const file = files[i];
    if (!fs.statSync(dirPath + '/' + file).isDirectory()) {
      const tags = NodeID3.read(dirPath + '/' + file);

      category = tags.album ?? '';
      found = true;
    }
    i++;
  }

  return category;
}

const result = getAllFiles(INPUT);

fs.writeFileSync(OUTPUT + '/sounds.json', JSON.stringify(result, null, 2));

console.log('All done!');
