import nlp from 'npm:compromise'

const lexicons = nlp.model().one.lexicon;
const stopwords: Array<string> = [
    'the',
    'a',
    'am',
    'was',
    'has',
    'is'
]

for(let word in lexicons) {
  if(Array.isArray(lexicons[word])) {
    if(lexicons[word].includes("Conjunction") || lexicons[word].includes("Preposition") || lexicons[word].includes("Pronoun")) {
      stopwords.push(word.toLowerCase());
    }
  } else {
    if(lexicons[word].match("Conjunction") || lexicons[word].match("Preposition") || lexicons[word].match("Pronoun")) {
      stopwords.push(word.toLowerCase());
    }
  }
}

export const importantWords = (text: string) => {
    const doc = nlp(text)
    const importantWords = doc.docs.flat()
    .filter(chunk => ['Noun', 'Verb'].includes(chunk.chunk!) && !stopwords.includes(chunk.text.toLowerCase()))
    .map(chunk => chunk.text)

    return importantWords.join(' ')
}