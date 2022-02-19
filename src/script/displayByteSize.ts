export const displayByteSize = (bytes: number, precision = 4): string => {
  if (bytes > 1024) {
    if (bytes > 1048576) {
      return `${(bytes / 1048576).toPrecision(precision)} MiB`;
    } else {
      return `${(bytes / 1024).toPrecision(precision)} KiB`;
    }
  } else {
    return `${bytes.toPrecision(precision)} B`;
  }
};
