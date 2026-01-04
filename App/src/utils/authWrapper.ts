export const authWrapper = <T extends (...args: any[]) => Promise<any>>(handler: T) => { //This first line make sure that the handler is async
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => { //this returns the wrapper function

        // ...args: Parameters<T> allows any arguments to be used in the route api function.
        // Promise<ReturnType<T>> correctly types the async return.

        return handler(...args) as Promise<ReturnType<T>>; //this returns the result of the handler
    };
};
