export interface Match {
    matches: boolean;
    giveValue: (value: any) => any
}

export type TryMatch = (givenValue: any) => Match
export type OnMatch<T> = (matchedValue: T) => any
export type CheckForMatch<T> = (potentialMatchedValue: T) => boolean
type TypeString = "string" | "object" | "array" | "number" | "boolean" | "function"
type RawValue = string | object | any[] | number | boolean | undefined | null

function isTypeString(value: TypeString | any): value is TypeString {
    switch (value as TypeString) {
        case "array":
        case "boolean":
        case "number":
        case "object":
        case "string":
        case "function":
            return true;

        default:
            return false;
    }
}

function matchTypeString(expectedType: TypeString, givenValue: any) {
    // Because an array returns object, we must specifically test that givenValue is not an array when expectedType is object
    const isArray = Array.isArray(givenValue);

    switch (expectedType) {
        case "array":
            return isArray;

        case "object":
            return typeof (givenValue) === "object" && isArray === false

        default:
            return typeof (givenValue) === expectedType
    }
}

function matchValue(expectedValue: RawValue, givenValue: any) {
    // TODO: If the firstArg is an object we should check that all of its properties matches the given value.
    // TODO: If the firstArg is an array, we should check that all of its entries match the given value's entries.
    return expectedValue === givenValue;
}

export function match<T>(value: any, withThis: TryMatch[]): T {
    const match = withThis.reduce<Match | undefined>((match, tryMatch) => {
        if (match) {
            return match
        }

        const output = tryMatch(value);

        return output.matches ? output : undefined;
    }, undefined)

    if (!match) {
        throw new Error(`No match found for value "${value}".`)
    }

    return match.giveValue(value);
}

export function withCase(onMatch: OnMatch<any>): TryMatch
export function withCase(when: CheckForMatch<any>, onMatch: OnMatch<any>): TryMatch

export function withCase<T>(onMatch: OnMatch<T>): TryMatch
export function withCase<T>(when: CheckForMatch<any>, onMatch: OnMatch<T>): TryMatch

export function withCase<T>(value: T, onMatch: OnMatch<T>): TryMatch
export function withCase<T>(value: T, when: CheckForMatch<T>, onMatch: OnMatch<T>): TryMatch

export function withCase(value: false, onMatch: OnMatch<false>): TryMatch
export function withCase(value: false, when: CheckForMatch<false>, onMatch: OnMatch<false>): TryMatch

export function withCase(value: true, onMatch: OnMatch<true>): TryMatch
export function withCase(value: true, when: CheckForMatch<true>, onMatch: OnMatch<true>): TryMatch

export function withCase(value: "string", onMatch: OnMatch<string>): TryMatch
export function withCase(value: "string", when: CheckForMatch<string>, onMatch: OnMatch<string>): TryMatch

export function withCase(value: "number", onMatch: OnMatch<number>): TryMatch
export function withCase(value: "number", when: CheckForMatch<number>, onMatch: OnMatch<number>): TryMatch

export function withCase(value: "object", onMatch: OnMatch<object>): TryMatch
export function withCase(value: "object", when: CheckForMatch<object>, onMatch: OnMatch<object>): TryMatch

export function withCase(value: "boolean", onMatch: OnMatch<boolean>): TryMatch
export function withCase(value: "boolean", when: CheckForMatch<boolean>, onMatch: OnMatch<boolean>): TryMatch

export function withCase(value: "array", onMatch: OnMatch<any[]>): TryMatch
export function withCase(value: "array", when: CheckForMatch<any[]>, onMatch: OnMatch<any[]>): TryMatch
export function withCase<T>(value: "array", onMatch: OnMatch<T[]>): TryMatch
export function withCase<T>(value: "array", when: CheckForMatch<T[]>, onMatch: OnMatch<T[]>): TryMatch

// function withCase<T>(when: (potentialMatchedValue: any) => potentialMatchedValue is T, onMatch: OnMatch<T>): TryMatch

export function withCase(...args: any[]): TryMatch {
    if (args.length === 0) {
        throw new Error(`when function expects at least one argument.`)
    }

    const firstArg: OnMatch<any> | CheckForMatch<any> | TypeString | RawValue = args[0];

    if (args.length === 1) {
        if (typeof (firstArg) !== "function") {
            throw new Error(`"when" function was given only one argument. Expected that argument to be an OnMatch callback function.`)
        }

        const onMatch: OnMatch<any> = firstArg

        // Catch-all match has no condition and will always match
        return (givenValue: any) => ({ matches: true, giveValue: onMatch })
    }

    const secondArg: OnMatch<any> | CheckForMatch<any> = args[1];

    if (args.length === 2) {
        // Second arg will be an OnMatch handler.
        const onMatch: OnMatch<any> = secondArg;

        if (typeof (firstArg) === "function") {
            // First arg is a CheckForMatch handler.
            const checkMatch: CheckForMatch<any> = firstArg

            return (givenValue: any) => ({ matches: checkMatch(givenValue), giveValue: onMatch })
        }

        const value = firstArg;

        if (isTypeString(value)) {
            return (givenValue: any) => ({ matches: matchTypeString(value, givenValue), giveValue: onMatch })
        }

        // FirstArg is a value that should be checked for equality with the given value.
        return (givenValue: any) => ({ matches: matchValue(value, givenValue), giveValue: onMatch });
    }

    // FirstArg is going to be a value or type string. SecondArg is going to be a CheckForMatch handler. ThirdArg is an OnMatch handler
    const value: TypeString | RawValue = firstArg;
    const checkMatch: CheckForMatch<any> = secondArg;
    const onMatch: OnMatch<any> = args[2];

    return (givenValue: any) => ({
        matches: (isTypeString(value) ? matchTypeString(value, givenValue) : matchValue(value, givenValue)) && checkMatch(givenValue),
        giveValue: onMatch
    })
}