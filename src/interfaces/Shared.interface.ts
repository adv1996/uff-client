export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type WithPrefix<T extends string> = `${T}${string}`;
