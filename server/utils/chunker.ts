// utils/chunker.ts

// Break an array into chunks of a given size
export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  return arr.reduce((acc: T[][], _, i) => {
    if (i % size === 0) acc.push(arr.slice(i, i + size));
    return acc;
  }, []);
};
