// Simple validators
export const isValidId = (id: any): boolean => {
    if (!id) return false;
    const num = Number(id);
    return !isNaN(num) && num > 0;
};
