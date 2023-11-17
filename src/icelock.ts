export type Icelock = {
    iced: any;
    freeze: () => void;
    unfreeze: () => void;
};

export function icelock(obj: any): Icelock {
    if (obj === null) {
        throw new Error('Cannot freeze null.');
    }

    let isFrozen = true;

    const handlers = {
        'object': {
            set(target: Record<string, unknown>, key: string, value: unknown) {
                if (isFrozen) {
                    throw new Error(`Cannot set ${key}, object is frozen.`);
                }
                return Reflect.set(target, key, value);
            },
            deleteProperty(target: Record<string, unknown>, key: string) {
                if (isFrozen) {
                    throw new Error(`Cannot delete ${key}, object is frozen.`);
                }
                return Reflect.deleteProperty(target, key);
            },
        },
        'map': {
            get(target: any, prop: any): any {
                if (prop === "set" && isFrozen) {
                    return (key: any) => {
                        throw new Error(`Cannot set ${key}, map is frozen.`);
                    };
                } else if (prop === "delete" && isFrozen) {
                    return (key: any) => {
                        throw new Error(`Cannot delete ${key}, map is frozen.`);
                    };
                } else if (prop === "clear" && isFrozen) {
                    return () => {
                        throw new Error(`Cannot clear map, map is frozen.`);
                    };
                } else if (typeof target[prop] as unknown as any === "function") {
                    return (...args: any[]) => {
                        return target[prop](...args);
                    }
                } else {
                    return target[prop];
                }
            },
        },
        'array': {
            get(target: any[], prop: any): any {
                if (prop === "push" && isFrozen) {
                    return (value: any) => {
                        throw new Error(`Cannot push ${value}, array is frozen.`);
                    };
                } else if (prop === "pop" && isFrozen) {
                    return () => {
                        throw new Error(`Cannot pop, array is frozen.`);
                    };
                } else if (prop === "splice" && isFrozen) {
                    return (start: number, deleteCount: number) => {
                        throw new Error(`Cannot splice ${start}, ${deleteCount}, array is frozen.`);
                    };
                } else if (typeof target[prop] === "function") {
                    return (...args: any[]) => {
                        return target[prop](...args);
                    }
                } else {
                    return target[prop];
                }
            },
            set(target: any[], key: string, value: unknown) {
                if (isFrozen) {
                    throw new Error(`Cannot set ${key}, array is frozen.`);
                }
                return Reflect.set(target, key, value);
            },
        },
        'set': {
            get(target: any, prop: any): any {
                if (prop === "add" && isFrozen) {
                    return (value: any) => {
                        throw new Error(`Cannot add ${value}, set is frozen.`);
                    };
                } else if (prop === "delete" && isFrozen) {
                    return (key: any) => {
                        throw new Error(`Cannot delete ${key}, set is frozen.`);
                    };
                } else if (prop === "clear" && isFrozen) {
                    return () => {
                        throw new Error(`Cannot clear set, set is frozen.`);
                    };
                } else if (typeof target[prop] === "function") {
                    return (...args: any[]) => {
                        return target[prop](...args);
                    };
                } else {
                    return target[prop];
                }
            }
        },
    };

    let iced;
    if (obj instanceof Map) {
        iced = new Proxy(obj as unknown as Map<any, any>, handlers['map']);
    } else if (Array.isArray(obj)) {
        iced = new Proxy(obj as unknown as any[], handlers['array']);
    } else if (obj instanceof Set) {
        iced = new Proxy(obj as unknown as Set<any>, handlers['set']);
    } else if (obj instanceof Object) {
        iced = new Proxy(obj, handlers['object']);
    }

    return {
        iced,
        freeze: () => { isFrozen = true; },
        unfreeze: () => { isFrozen = false; }
    };
}

