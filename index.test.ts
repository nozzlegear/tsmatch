import { match, withCase } from './index';

test("Matches raw value 5", () => {
    const input = 5;
    let matchedFour = false;
    let matchedFive = false;

    const result = match(input, [
        withCase(4, val => {
            matchedFour = true;

            return val
        }),
        withCase(5, val => {
            matchedFive = true;

            return val
        })
    ])

    expect(result).toBe(input);
    expect(matchedFive).toBe(true);
    expect(matchedFour).toBe(false);
})

test("Matches raw string value", () => {
    const input = "hello world";
    let matchedFirst = false;
    let matchedSecond = false;

    const result = match(input, [
        withCase("foo", val => {
            matchedFirst = true;

            return val
        }),
        withCase("hello world", val => {
            matchedSecond = true;

            return val
        })
    ])

    expect(result).toBe(input);
    expect(matchedFirst).toBe(false);
    expect(matchedSecond).toBe(true);
})

test("Matches true value", () => {
    const input = true

    const result = match<string | boolean>(input, [
        withCase("foo", val => val),
        withCase(false, val => val),
        withCase(true, val => val)
    ])

    expect(result).toBe(input)
})

test("Matches false value", () => {
    const input = false

    const result = match<string | boolean>(input, [
        withCase("foo", val => val),
        withCase(false, val => val),
        withCase(true, val => val)
    ])

    expect(result).toBe(input)
})

test("Returns manipulated result", () => {
    const input = 5

    const doubled = match<number>(input, [
        withCase("foo", val => val + val),
        withCase(4, val => val + val),
        withCase(5, val => val + val)
    ])

    expect(doubled).toBe(input + input);
})

test("Only matches one case", () => {
    const input = 5
    const expected = 20

    const result = match<number>(input, [
        withCase(5, val => expected),
        withCase(5, val => val)
    ])

    expect(result).toBe(expected);
})

test("Matches generic when case", () => {
    const input = 117

    const result = match<number | string>(input, [
        withCase(val => val > 200 && val < 225, val => "incorrect"),
        withCase(val => val > 100 && val < 125, val => val),
    ])

    expect(result).toBe(input)
})

test("Matches value with a when case", () => {
    const input = "browser";
    const expected = "found expected case";
    const neverTrue = () => 1 > 2;
    const alwaysTrue = () => 2 > 1;

    const result = match(input, [
        withCase("server", neverTrue, _ => "first case"),
        withCase("server", alwaysTrue, _ => "second case"),
        withCase("browser", neverTrue, _ => "third case"),
        withCase("browser", alwaysTrue, _ => expected)
    ])

    expect(result).toBe(expected);
})

test("Matches fallthrough case", () => {
    const input = 117

    const result = match<number>(input, [
        withCase(5, val => 5),
        withCase(10, val => 10),
        withCase(val => val)
    ])

    expect(result).toBe(input)
})

test("Matches string type case", () => {
    const input = "hello world"
    const expected = "string found"

    const result = match<string>(input, [
        withCase("number", val => "number found"),
        withCase("string", val => expected),
        withCase("object", val => "object found"),
        withCase("array", val => "array found"),
        withCase("boolean", val => "boolean found"),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected)
})

test("Matches number type case", () => {
    const input = 5
    const expected = "number found"

    const result = match<string>(input, [
        withCase("number", val => expected),
        withCase("string", val => "string found"),
        withCase("object", val => "object found"),
        withCase("array", val => "array found"),
        withCase("boolean", val => "boolean found"),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected)
})

test("Matches object type case", () => {
    const input = { hello: "world" }
    const expected = "object found"

    const result = match<string>(input, [
        withCase("number", val => "number found"),
        withCase("string", val => "string found"),
        withCase("object", val => expected),
        withCase("array", val => "array found"),
        withCase("boolean", val => "boolean found"),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected)
})

test("Matches array type case", () => {
    const input = [0, 1, 2]
    const expected = "array found"

    const result = match<string>(input, [
        withCase("number", val => "number found"),
        withCase("string", val => "string found"),
        withCase("object", val => "object found"),
        withCase("array", val => expected),
        withCase("boolean", val => "boolean found"),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected)
})

test("Matches boolean type case", () => {
    const input = true
    const expected = "boolean found"

    const result = match<string>(input, [
        withCase("number", val => "number found"),
        withCase("string", val => "string found"),
        withCase("object", val => "object found"),
        withCase("array", val => "array found"),
        withCase("boolean", val => expected),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected)
})

test("Matches type case with a when check", () => {
    const input = "hello world this is a string"
    const expected = "hello string found"

    const result = match<string>(input, [
        withCase("string", val => val.indexOf("hello") === 0, val => expected),
        withCase("string", val => val.indexOf("foo") === 0, val => val),
        withCase(val => "fell through")
    ])

    expect(result).toBe(expected);
})

test("Throws error when no match is found", () => {
    function execute() {
        match("hello world", [
            withCase(5, val => "Found 5"),
            withCase("hello", val => "Found hello")
        ])
    }

    expect(execute).toThrow()
})

test("Catch-all in first position stops execution of other cases", () => {
    const input = "hello world";
    let changed = false;

    match(input, [
        withCase(val => val),
        withCase(input, val => changed = true)
    ])

    expect(changed).toBe(false);
})

test.skip("Should match object properties", () => {
    const input = { hello: "world", foo: "bar" }
    const expected = "found expected case"

    const result = match(input, [
        withCase({ hello: "world" }, val => "Matched partial hello:world object"),
        withCase({ hello: "world", foo: "baz" }, val => "Matched hello:world foo:baz object"),
        withCase({ hello: "world", foo: "bar" }, val => expected)
    ])

    expect(result).toBe(expected)
})

test.skip("Should match object properties with a when check", () => {
    const input = { hello: "world", foo: "bar", baz: 5 };
    const expected = "found expected case"

    const result = match(input, [
        withCase({ hello: "world" }, val => "first case"),
        withCase({ hello: "world", foo: "bar" }, val => (val as any).baz === 4, val => "second case"),
        withCase({ hello: "world", foo: "bar" }, val => (val as any).baz === 5, val => expected)
    ])

    expect(result).toBe(expected)
})

test.skip("Should only match given case properties and disregard extras", () => {
    const input = { hello: "world", foo: "bar", baz: 5 };
    const expected = "found expected case"

    const result = match(input, [
        withCase({ hello: "world", foo: "bar", baz: 10 }, val => "first case"),
        withCase({ hello: "world", foo: "bar" }, val => expected)
    ])

    expect(result).toBe(expected)
})

test.skip("Should match array entries", () => {
    const input = [0, 2, 4, 6]
    const expected = "found expected case"

    const result = match(input, [
        withCase([1, 3, 5], val => "first case"),
        withCase([0, 3, 5], val => "second case"),
        withCase([0, 2, 4, 6], val => expected)
    ])

    expect(result).toBe(expected);
})

test.skip("Should match array entries with a when check", () => {
    const input = [0, 2, 4, 6]
    const expected = "found expected case"

    const result = match(input, [
        withCase([0, 2, 4, 6], val => val.every(x => x % 2 !== 0), val => "first case"),
        withCase([0, 2, 4, 6], val => val.every(x => x % 2 === 0), val => expected)
    ])

    expect(result).toBe(expected)
})

test.skip("Should only match given array entries and disregard extras", () => {
    const input = [0, 2, 4, 6]
    const expected = "found expected case"

    const result = match(input, [
        withCase([0, 2, 4], val => expected)
    ])

    expect(result).toBe(expected);
})