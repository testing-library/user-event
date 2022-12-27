expect.extend({
    toMatchInlineSnapshot,
    toThrowErrorMatchingInlineSnapshot,
})

export function toMatchInlineSnapshot(
    actual,
    expected,
) {
    const normalizedActual = stripAddedLinebreaks(stripAddedIndentation(actual.snapshot ?? actual))
    const normalizedExpected = stripAddedLinebreaks(stripAddedIndentation(expected))

    return {
        pass: normalizedActual === normalizedExpected,
        message: () => [
            this.utils.matcherHint('toMatchInlineSnapshot', undefined, undefined, {
                isNot: this.isNot,
                promise: this.promise,
            }),
            '',
            this.utils.diff(normalizedExpected, normalizedActual, {expand: this.expand}),
        ].join('\n'),
    }
}

export function toThrowErrorMatchingInlineSnapshot(
    callback,
    expected,
) {
    let didThrow = false, actual = undefined
    try {
        callback()
    } catch (e) {
        didThrow = true
        actual = e
    }

    const normalizedActual = didThrow && stripAddedLinebreaks(stripAddedIndentation(typeof actual === 'object' && 'message' in actual ? actual.message : String(actual)))
    const normalizedExpected = stripAddedLinebreaks(stripAddedIndentation(expected))

    return {
        pass: this.isNot === !didThrow && normalizedActual === normalizedExpected,
        message: () => [
            this.utils.matcherHint('toMatchInlineSnapshot', undefined, undefined, {
                isNot: this.isNot,
                promise: this.promise,
            }),
            '',
            didThrow
                ? this.utils.diff(normalizedExpected, normalizedActual, { expand: this.expand })
                : '[Did not throw]',
        ].join('\n'),
    }
}

function stripAddedLinebreaks(normalizedSnapshot) {
    return normalizedSnapshot.startsWith('\n') && normalizedSnapshot.endsWith('\n')
        ? normalizedSnapshot.substring(1, normalizedSnapshot.length - 1)
        : normalizedSnapshot
}

const INDENTATION_REGEX = /^([^\S\n]*)\S/m;

function stripAddedIndentation(inlineSnapshot) {
    // Find indentation if exists.
    const match = inlineSnapshot.match(INDENTATION_REGEX)
    if (!match || !match[1]) {
        // No indentation.
        return inlineSnapshot
    }

    const indentation = match[1]
    const lines = inlineSnapshot.split('\n')
    if (lines.length <= 2) {
        // Must be at least 3 lines.
        return inlineSnapshot
    }

    if (lines[0].trim() !== '' || lines[lines.length - 1].trim() !== '') {
        // If not blank first and last lines, abort.
        return inlineSnapshot
    }

    for (let i = 1; i < lines.length - 1; i++) {
        if (lines[i] !== '') {
            if (lines[i].indexOf(indentation) !== 0) {
                // All lines except first and last should either be blank or have the same
                // indent as the first line (or more). If this isn't the case we don't
                // want to touch the snapshot at all.
                return inlineSnapshot
            }

            lines[i] = lines[i].substring(indentation.length)
        }
    }

    // Last line is a special case because it won't have the same indent as others
    // but may still have been given some indent to line up.
    lines[lines.length - 1] = ''

    // Return inline snapshot, now at indent 0.
    inlineSnapshot = lines.join('\n')
    return inlineSnapshot
}
