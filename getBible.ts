import { readLine } from "./readLine.ts"

export const getBible = async () => {
    const lineIterator = await readLine("bsb.txt")

    const books = new Map()
    
    for await (const line of lineIterator) {
        const [reference, text] = line.split('\t')
        const numbers = reference.split(' ').pop()
        const book = reference.replace(' ' + numbers, '')
        if (!book) continue
    
        const [chapterNumber, verseNumber] = numbers!.split(':')
        if (book && !books.has(book)) books.set(book, new Map())
        const chapters = books.get(book)
        if (!chapters.has(chapterNumber)) chapters.set(chapterNumber, new Map())
        const chapter = chapters.get(chapterNumber)
        chapter.set(verseNumber, text)
    }

    return books
}