export const calculateBackoff = (base, attempts) => {
    return Math.pow(base, attempts) * 1000;
};