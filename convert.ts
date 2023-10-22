import { stringify } from "https://deno.land/std@0.202.0/csv/mod.ts";
import { createImages } from "./createImages.ts";

const csv = stringify(await createImages(), {
    columns: [
        'book',
        'chapter',
        'verseNumber1',
        'verseNumber2',
        'text',
        'filename'
    ]
})

Deno.writeTextFileSync('./output.csv', csv)