import { getNextKeyDef } from "type/getNextKeyDef"
import { defaultKeyMap } from "type/keyMap"
import { modernTypeOptions } from "type/types"

const options: modernTypeOptions = {
    keyboardMap: defaultKeyMap,
    autoModify: false,
    delay: 123,
    skipAutoClose: false,
}

test('reference key per code', () => {
    expect(getNextKeyDef('[ControlLeft]foo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: 'Control',
            code: 'ControlLeft',
        }),
    }))
})

test('reference key per key', () => {
    expect(getNextKeyDef('{Control}foo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: 'Control',
            code: 'ControlLeft',
        }),
    }))
})

test('reference per legacy modifier', () => {
    expect(getNextKeyDef('{ctrl}foo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: 'Control',
            code: 'ControlLeft',
        }),
    }))
})

test('reference per printable character', () => {
    expect(getNextKeyDef('afoo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: 'a',
            code: 'KeyA',
        }),
    }))
})

test('reference bracket as printable character', () => {
    expect(getNextKeyDef('{{foo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: '{',
            code: 'Unknown',
        }),
    }))
    expect(getNextKeyDef('[[foo', options)).toEqual(expect.objectContaining({
        keyDef: expect.objectContaining({
            key: '[',
            code: 'Unknown',
        }),
    }))
})

test('release previously pressed key', () => {
    expect(getNextKeyDef('{Control}foo', options)).toEqual(expect.objectContaining({
        releasePrevious: false,
    }))
    expect(getNextKeyDef('{/Control}foo', options)).toEqual(expect.objectContaining({
        releasePrevious: true,
    }))
    expect(getNextKeyDef('[/ControlLeft]foo', options)).toEqual(expect.objectContaining({
        releasePrevious: true,
    }))
})

test('keep key pressed', () => {
    expect(getNextKeyDef('{Control}foo', options)).toEqual(expect.objectContaining({
        releaseSelf: true,
    }))
    expect(getNextKeyDef('{Control>}foo', options)).toEqual(expect.objectContaining({
        releaseSelf: false,
    }))
    expect(getNextKeyDef('[ControlLeft>]foo', options)).toEqual(expect.objectContaining({
        releaseSelf: false,
    }))    
})

test('autopress legacy modifiers', () => {
    expect(getNextKeyDef('{ctrl}foo', options)).toEqual(expect.objectContaining({
        releaseSelf: false,
    }))
    expect(getNextKeyDef('{ctrl/}foo', options)).toEqual(expect.objectContaining({
        releaseSelf: true,
    }))
})
