import { fail } from './model.ts';
// RFC-style quoted fields, escaped quotes, CRLF, BOM and strict malformed quote handling.
let runtimeParser: ((input: string) => string[][]) | undefined;
export function setCsvParser(parser: (input: string) => string[][]) {
    runtimeParser = parser;
}
export function parseCsv(input: string): string[][] {
    const limit = Number(process.env.CSV_MAX_BYTES ?? 5242880);
    if (Buffer.byteLength(input, 'utf8') > limit) {
        fail('CSV exceeds configured upload size');
    }
    if (runtimeParser) {
        try {
            return runtimeParser(input);
        }
        catch {
            fail('Malformed CSV input');
        }
    }
    const s = input.replace(/^\uFEFF/, '');
    const rows: string[][] = [];
    let row: string[] = [], field = '', quoted = false, closed = false;
    const emit = () => {
        row.push(field);
        field = '';
        closed = false;
    };
    const end = () => {
        emit();
        rows.push(row);
        row = [];
    };
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (quoted) {
            if (c === '"') {
                if (s[i + 1] === '"') {
                    field += '"';
                    i++;
                }
                else {
                    quoted = false;
                    closed = true;
                }
            }
            else {
                field += c;
            }
            continue;
        }
        if (c === '"') {
            if (field || closed) {
                fail('Malformed CSV quote');
            }
            quoted = true;
        }
        else if (c === ',') {
            emit();
        }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && s[i + 1] === '\n') {
                i++;
            }
            end();
        }
        else {
            if (closed) {
                fail('Unexpected text after quoted field');
            }
            field += c;
        }
    }
    if (quoted) {
        fail('Unclosed CSV quote');
    }
    if (field || row.length || closed) {
        end();
    }
    return rows;
}
