import { getBible } from "./getBible.ts"
import { walk } from "https://deno.land/std@0.170.0/fs/walk.ts";
import { importantWords } from "./nlp.ts";
import {
    ImageMagick,
    IMagickImage,
    initialize,
    MagickFormat,
    MagickGeometry,
    MorphologySettings,
    Percentage,
} from "https://deno.land/x/imagemagick_deno/mod.ts";
  
await initialize(); // make sure to initialize first!

const bible = await getBible()
const standardPattern = new RegExp(/^\d*\.\d*$/, 'm')
const multiPattern = new RegExp(/^\d*\.\d*-\d*$/, 'm')
const subVersePattern = new RegExp(/^\d*\.\d*[a-z]$/, 'm')
const multiSubVersePattern = new RegExp(/^\d*\.\d*-\d*[a-z]$/, 'm')

const bookNames = new Set()

const bookNameReplacements: { [key: string]: string } = {
    'Heb': 'Hebrews'
}

export const createImages = async () => {
    const images = []

    for await (const walkEntry of walk(Deno.cwd())) {
        if (walkEntry.isFile) {
            if (walkEntry.name.endsWith('.tif')) {
                const name = walkEntry.name
                    .replace('.tif', '')
    
                const reference = name.replace('.alternative', '').split(' ').pop()!
    
                if (reference) {
                    const isStandardPattern = standardPattern.test(reference)
                    const isMultiPattern = multiPattern.test(reference)
                    const isSubVersePattern = subVersePattern.test(reference)
                    const isMultiSubVersePattern = multiSubVersePattern.test(reference)
    
                    if (!isStandardPattern && !isMultiPattern && !isSubVersePattern && !isMultiSubVersePattern) {
                        continue
                    }
    
                    if (name.includes('alternative')) continue

                    let book = name.replace('.alternative', '').replace(reference, '').trim()
    
                    if (book in bookNameReplacements) {
                        book = bookNameReplacements[book]
                    }
    
                    bookNames.add(book)
    
                    let text = ''

                    const filename = `${book.replaceAll(' ', '-')}-${reference}.png`

                    const imageData: Uint8Array = await Deno.readFile(walkEntry.path)

                    await ImageMagick.read(imageData, async (img: IMagickImage) => {
                        img.morphology(new MorphologySettings(12, 'Diamond:2x2'))

                        img.resize(new MagickGeometry('1000'))

                        await img.write(
                            MagickFormat.Png,
                            (data: Uint8Array) => Deno.writeFile('./assets/' + filename, data),
                        );
                    });

                    const image: {
                        name: string,
                        book: string,
                        chapter?: number,
                        text?: string,
                        words?: string,
                        filename: string
                        verseNumber1?: number,
                        verseNumber2?: number,
                    } = {
                        name,
                        book,
                        filename 
                    }
    
                    if (isStandardPattern || isSubVersePattern) {
                        const [chapterNumber, verseNumber] = reference.split('.')

                        image.chapter = parseInt(chapterNumber)
                        image.verseNumber1 = parseInt(verseNumber)
                        image.verseNumber2 = parseInt(verseNumber)

                        text = bible.get(book).get(parseInt(chapterNumber).toString()).get(parseInt(verseNumber).toString())
                    }
    
                    if (isMultiPattern || isMultiSubVersePattern) {
                        const [chapterNumber, verseNumber1, verseNumber2] = reference.split(/\.|-/g)
    
                        image.chapter = parseInt(chapterNumber)
                        image.verseNumber1 = parseInt(verseNumber1)
                        image.verseNumber2 = parseInt(verseNumber2)

                        for (let i = parseInt(verseNumber1); i <= parseInt(verseNumber2); i++) {
                            text += bible.get(book).get(chapterNumber).get(i.toString()) + '\n'
                        }
                    }

                    image.text = text
                    image.words = importantWords(text)
    
                    images.push(image)
                }
            }
        }
    }

    return images
}