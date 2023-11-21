export type Icelock = {
    iced: any;
    freeze: () => void;
    unfreeze: () => void;
};

export type IcelockOptions = {
    isFrozen?: boolean;
}

export function icelock(obj: any, options: IcelockOptions = { isFrozen: true }): Icelock {
    if (obj === null) {
        throw new Error('Cannot freeze null.');
    }

    let isFrozen = options.isFrozen;

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

    let iced: any;
    let freezes: any[] = [];
    let unfreezes: any[] = [];
    if (obj instanceof Map) {
        const icedMap = Array.from(obj.entries()).reduce((acc: any, [key, value]) => {
            let icedValue: any;
            if (value instanceof Map || value instanceof Set || Array.isArray(value) || value instanceof Object) {
                const { iced, freeze, unfreeze } = icelock(value);
                icedValue = iced;
                freezes.push(freeze);
                unfreezes.push(unfreeze);
            }
            acc.set(key, icedValue || value);
            return acc;
        }, new Map());
        iced = new Proxy(icedMap, handlers['map']);
    } else if (Array.isArray(obj)) {
        const icedArray = obj.reduce((acc: any, value: any, index: number) => {
            let icedValue: any;
            if (value instanceof Map || value instanceof Set || Array.isArray(value) || value instanceof Object) {
                const { iced, freeze, unfreeze } = icelock(value);
                icedValue = iced;
                freezes.push(freeze);
                unfreezes.push(unfreeze);
            }
            acc[index] = icedValue || value;
            return acc;
        }, []);
        iced = new Proxy(icedArray, handlers['array']);
    } else if (obj instanceof Set) {
        const icedSet = Array.from(obj.values()).reduce((acc: any, value: any) => {
            let icedValue: any;
            if (value instanceof Map || value instanceof Set || Array.isArray(value) || value instanceof Object) {
                const { iced, freeze, unfreeze } = icelock(value);
                icedValue = iced;
                freezes.push(freeze);
                unfreezes.push(unfreeze);
            }
            acc.add(icedValue || value);
            return acc;
        }, new Set());
        iced = new Proxy(icedSet, handlers['set']);
    } else if (obj instanceof Object) {
        const icedObj: any = Object.entries(obj).reduce((acc: any, [key, value]) => {
            let icedValue: any;
            if (value instanceof Map || value instanceof Set || Array.isArray(value) || value instanceof Object) {
                const { iced, freeze, unfreeze } = icelock(value);
                icedValue = iced;
                freezes.push(freeze);
                unfreezes.push(unfreeze);
            }
            acc[key] = icedValue || value;
            return acc;
        }, {});
        iced = new Proxy(icedObj, handlers['object']);
    }

    return {
        iced,
        freeze: () => { 
            isFrozen = true; 
            freezes.forEach(freeze => freeze());
        },
        unfreeze: () => { 
            isFrozen = false;
            unfreezes.forEach(unfreeze => unfreeze());
        }
    };
}

